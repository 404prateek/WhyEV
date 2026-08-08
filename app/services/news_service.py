"""EV News Ingestion Service.

Architecture:
  1. Fetch from NewsData.io (primary). Fall back to Currents API if NewsData
     returns an error or quota is exhausted.
  2. Stage 1 - Keyword pre-filter (deterministic, zero-cost): every article
     is scored against a curated EV keyword list. Articles below
     settings.NEWS_KW_MIN_SCORE are discarded immediately.
  3. Stage 2 - Simplified rule-based relevance check: confirms the article
     is about Indian EV context (not generic global auto industry noise).
     NOTE: The research doc specifies embedding-similarity here. This
     implementation uses a deterministic rule set as a simplification —
     no curated reference embedding set exists in the repo yet. Plainly
     stated: Stage 2 in this pass is NOT full embedding-similarity scoring.
  4. Stage 3 - LLM classification via Groq (llama-3.1-8b-instant):
     articles that passed Stages 1 and 2 are batch-classified as
     'ev_relevant' | 'ambiguous' | 'rejected'. Only 'ev_relevant' articles
     are persisted. Ambiguous articles are discarded (fail-closed policy).
  5. Persist to news_articles table with deduplication on source_id.

Provider fallback logic:
  - Try NewsData.io first (NEWSDATA_API_KEY).
  - If key is empty, quota hit (402/429), or any HTTP error: fall back to
    Currents API (CURRENTS_API_KEY).
  - If both fail: return empty list and log a warning. The read endpoint
    continues to serve existing DB articles.
"""
from __future__ import annotations

import hashlib
import json
import logging
import re
import unicodedata
from datetime import datetime, timezone
from typing import Any

import httpx
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.groq_pool import get_groq_pool
from app.models.news import NewsArticle
from app.schemas.news import NewsIngestResult

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 1 — Keyword Pre-filter Vocabulary
# ---------------------------------------------------------------------------

# Tier-1: STRONG EV signals — any match gives high score
_TIER1_KW = [
    "electric vehicle", "ev ", " ev,", " ev.", "evs", "electric car", "electric suv",
    "battery electric", "bev", "plug-in", "plug in hybrid", "phev",
    "charging station", "fast charger", "fast charging", "dc fast", "ac charging", "ccs2",
    "type 2 charger", "ocm", "ev subsidy", "ev policy", "pm e-drive",
    "fame scheme", "fame ii", "delhi ev policy", "ev registration",
    "electric two-wheeler", "electric three-wheeler", "electric scooter",
    "electric bus", "electric truck", "electric fleet",
    "tata nexon ev", "tata curvv ev", "tata tigor ev",
    "mg zs ev", "mg windsor ev", "mg comet ev",
    "hyundai ioniq", "kia ev6", "kia ev9",
    "mahindra be", "mahindra be6", "mahindra xe3", "mahindra xuv400",
    "ola electric", "ather energy", "ather 450",
    "hero electric", "tvs iqube", "bajaj chetak",
    "battery swap", "battery as a service", "baas",
    "range anxiety", "kwh", "kilowatt hour", "kw charger",
    "ev adoption", "ev sales", "ev market", "ev infrastructure",
    "lithium battery", "lithium ion", "lifepo4", "nmc battery",
    "regenerative braking", "one pedal driving",
    "emps scheme", "electric mobility", "green mobility",
    "zero emission vehicle", "zev",
]

# Tier-2: CONTEXTUAL signals — Indian EV market context
_TIER2_KW = [
    "india ev", "indian ev", "delhi ncr", "maharashtra ev",
    "karnataka ev", "bengaluru ev", "pune ev",
    "tata motors", "mahindra electric", "maruti ev",
    "hyundai india", "kia india", "bmw india ev",
    "nitin gadkari", "ministry of road transport",
    "vahan", "rto electric", "road tax waiver",
    "bs-vi", "emission standard", "combustion replacement",
    "subsidy scheme", "state subsidy", "central subsidy",
    "oil import", "fossil fuel", "petrol alternative",
    "e-amrit", "amrit2", "eviitf",
]

# Tier-3: WEAK signals — may indicate relevance but not sufficient alone
_TIER3_KW = [
    "electric", "battery", "charge", "charging", "autonomous",
    "hybrid", "green energy", "renewable", "clean energy",
    "automobile", "automotive", "vehicle launch", "car launch",
    "auto expo", "bharat mobility",
]

# Negative signals — strong indicators of NOT EV content, penalise score
_NEGATIVE_KW = [
    "ice vehicle", "diesel car", "petrol car", "cng vehicle",
    "formula 1", "f1 race", "nascar", "rally racing",
    "vintage car", "classic car", "used car sale",
    "luxury yacht", "aviation fuel", "jet fuel",
]


def _normalise(text: str) -> str:
    """Lowercase + strip accents."""
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    return re.sub(r"[\u0300-\u036f]", "", text)


def keyword_score(title: str, description: str) -> int:
    """
    Stage 1 — deterministic keyword scoring.
    Returns an integer 0-100.
    """
    haystack = _normalise(f"{title} {description}")
    score = 0

    for kw in _TIER1_KW:
        if kw in haystack:
            score += 25  # strong EV signal
    for kw in _TIER2_KW:
        if kw in haystack:
            score += 10
    for kw in _TIER3_KW:
        if kw in haystack:
            score += 4
    for kw in _NEGATIVE_KW:
        if kw in haystack:
            score -= 15

    return max(0, min(100, score))


# ---------------------------------------------------------------------------
# Stage 2 — Simplified Rule-based India EV Context Check
# ---------------------------------------------------------------------------
# NOTE: The research doc specifies embedding-similarity at Stage 2 using a
# curated reference embedding set. No such set exists in this repo yet.
# This is a simplified deterministic approximation.  Stated plainly:
# full embedding-similarity scoring is NOT implemented in this pass.

_INDIA_EV_SIGNALS = [
    "india", "indian", "delhi", "mumbai", "bengaluru", "hyderabad", "pune",
    "chennai", "kolkata", "ncr", "maharashtra", "karnataka", "rajasthan",
    "tata", "mahindra", "ola electric", "ather", "tvs", "bajaj",
    "ministry", "government", "niti aayog", "fame", "emps",
    "rupee", "lakh", "crore", "rto", "vahan",
]


def passes_stage2(title: str, description: str, kw_score_val: int) -> bool:
    """
    Stage 2 — simplified India EV context check.
    Returns True if the article should proceed to Stage 3 LLM classification.
    Fail-closed: articles not clearly about Indian EV context are excluded.
    """
    # High Stage 1 score AND at least one India signal → pass directly
    if kw_score_val >= 60:
        haystack = _normalise(f"{title} {description}")
        for sig in _INDIA_EV_SIGNALS:
            if sig in haystack:
                return True
        # High kw_score but no India signal — still likely EV relevant globally;
        # include for Stage 3 to decide
        return kw_score_val >= 80

    # Moderate Stage 1 score — require India signal
    if kw_score_val >= settings.NEWS_KW_MIN_SCORE:
        haystack = _normalise(f"{title} {description}")
        for sig in _INDIA_EV_SIGNALS:
            if sig in haystack:
                return True

    return False


# ---------------------------------------------------------------------------
# Stage 3 — LLM Classification via Groq (llama-3.1-8b-instant)
# ---------------------------------------------------------------------------
# Reuses the existing Groq pool infrastructure from app/core/groq_pool.py.

_CLASSIFY_SYSTEM = (
    "You are an EV news classifier for a platform focused on Indian electric vehicles, "
    "EV policy, charging infrastructure, and EV market news. "
    "Classify the article title+summary strictly as one of: "
    "ev_relevant, ambiguous, or rejected. "
    "ev_relevant: clearly about EVs, EV policy, charging, or Indian EV ecosystem. "
    "ambiguous: mentions EVs but primarily about something else. "
    "rejected: not EV-related. "
    "Respond with ONLY the label — no explanation, no punctuation."
)


async def classify_article_llm(title: str, summary: str) -> str:
    """
    Stage 3 — classify via Groq llama-3.1-8b-instant.
    Returns: 'ev_relevant' | 'ambiguous' | 'rejected'
    Falls back to 'ev_relevant' if Groq pool is unavailable (all keys empty/cooling).
    """
    if not any([
        settings.GROQ_API_KEY,
        settings.GROQ_API_KEY_1,
        settings.GROQ_API_KEY_2,
        settings.GROQ_API_KEY_3,
    ]):
        # No Groq keys configured — skip LLM, trust Stages 1+2
        return "ev_relevant"

    try:
        pool = get_groq_pool()
        resp = await pool.chat_with_retry(
            model=settings.LLM_CLASSIFIER_MODEL,
            messages=[
                {"role": "system", "content": _CLASSIFY_SYSTEM},
                {"role": "user", "content": f"Title: {title}\nSummary: {summary or ''}"},
            ],
            max_tokens=5,
            temperature=0,
        )
        label = resp.choices[0].message.content.strip().lower()
        if label not in ("ev_relevant", "ambiguous", "rejected"):
            return "ev_relevant"  # fallback on unexpected output
        return label
    except Exception as exc:
        log.warning("news.llm_classify_failed", error=str(exc))
        # Fail-open on LLM error: trust Stages 1+2 filtering
        return "ev_relevant"


# ---------------------------------------------------------------------------
# Provider Adapters — NewsData.io and Currents API
# ---------------------------------------------------------------------------

def _make_source_id(provider: str, raw_id: str) -> str:
    return hashlib.sha256(f"{provider}:{raw_id}".encode()).hexdigest()[:64]


def _slugify(title: str) -> str:
    s = _normalise(title)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s[:200]


async def _fetch_newsdata(limit: int) -> list[dict[str, Any]]:
    """Fetch articles from NewsData.io. Returns raw normalised dicts."""
    if not settings.NEWSDATA_API_KEY:
        raise ValueError("NEWSDATA_API_KEY not configured")

    url = "https://newsdata.io/api/1/news"
    params = {
        "apikey": settings.NEWSDATA_API_KEY,
        "q": "electric vehicle OR EV subsidy OR charging station OR EV policy",
        "country": "in",
        "language": "en",
        "size": min(limit, 10),  # NewsData free tier max per request
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    articles = []
    for item in data.get("results", []):
        articles.append({
            "provider": "newsdata",
            "source_id": _make_source_id("newsdata", item.get("article_id", item.get("link", ""))),
            "title": item.get("title", ""),
            "summary": item.get("description") or item.get("content", "")[:500],
            "content_snippet": item.get("content", "")[:800],
            "image_url": item.get("image_url"),
            "article_url": item.get("link"),
            "author": (item.get("creator") or [""])[0] if isinstance(item.get("creator"), list) else item.get("creator"),
            "source_name": item.get("source_id") or item.get("source_name"),
            "published_at": item.get("pubDate"),
            "tags": item.get("keywords") or [],
        })
    return articles


async def _fetch_currents(limit: int) -> list[dict[str, Any]]:
    """Fetch articles from Currents API (fallback). Returns normalised dicts."""
    if not settings.CURRENTS_API_KEY:
        raise ValueError("CURRENTS_API_KEY not configured")

    url = "https://api.currentsapi.services/v1/search"
    params = {
        "apiKey": settings.CURRENTS_API_KEY,
        "keywords": "electric vehicle EV India charging",
        "language": "en",
        "country": "IN",
        "limit": min(limit, 20),
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    articles = []
    for item in data.get("news", []):
        articles.append({
            "provider": "currents",
            "source_id": _make_source_id("currents", item.get("id", item.get("url", ""))),
            "title": item.get("title", ""),
            "summary": item.get("description", "")[:500],
            "content_snippet": item.get("description", "")[:800],
            "image_url": item.get("image"),
            "article_url": item.get("url"),
            "author": item.get("author"),
            "source_name": None,
            "published_at": item.get("published"),
            "tags": item.get("category") or [],
        })
    return articles


# ---------------------------------------------------------------------------
# Category Mapper
# ---------------------------------------------------------------------------

_CATEGORY_RULES: list[tuple[list[str], str]] = [
    (["subsidy", "fame", "policy", "scheme", "emps", "waiver", "incentive", "tax"], "Policy & Subsidies"),
    (["launch", "unveil", "debut", "reveal", "model", "variant", "new ev"], "New Launches"),
    (["charger", "charging station", "infrastructure", "plug", "ocm", "grid"], "Charging Infra"),
    (["battery", "kwh", "range", "degradation", "chemistry", "lifepo4", "nmc"], "Battery Tech"),
    (["sales", "market", "growth", "adoption", "vahan", "registration", "q1", "q2"], "Market & Sales"),
]


def _assign_category(title: str, summary: str) -> str:
    haystack = _normalise(f"{title} {summary}")
    for kws, cat in _CATEGORY_RULES:
        if any(kw in haystack for kw in kws):
            return cat
    return "Industry News"


# ---------------------------------------------------------------------------
# Main Ingestion Function
# ---------------------------------------------------------------------------

async def ingest_news(db: AsyncSession) -> NewsIngestResult:
    """
    Run a full ingestion cycle: fetch → Stage1 → Stage2 → Stage3 → persist.
    Returns a result summary. Does NOT raise — caller should handle gracefully.
    """
    limit = settings.NEWS_INGEST_LIMIT
    raw_articles: list[dict[str, Any]] = []
    provider_used = "none"

    # Try NewsData.io first, fall back to Currents
    try:
        raw_articles = await _fetch_newsdata(limit)
        provider_used = "newsdata"
        log.info("news.fetch_ok", provider="newsdata", count=len(raw_articles))
    except Exception as exc:
        log.warning("news.newsdata_failed", error=str(exc))
        try:
            raw_articles = await _fetch_currents(limit)
            provider_used = "currents"
            log.info("news.fetch_ok", provider="currents", count=len(raw_articles))
        except Exception as exc2:
            log.error("news.both_providers_failed", error=str(exc2))
            return NewsIngestResult(
                fetched=0,
                passed_stage1=0,
                passed_stage3=0,
                stored=0,
                duplicates_skipped=0,
                provider_used="none",
            )

    fetched = len(raw_articles)
    stage1_passed: list[dict[str, Any]] = []
    stage2_passed: list[dict[str, Any]] = []

    # Stage 1 — keyword filter
    for art in raw_articles:
        score = keyword_score(art["title"], art.get("summary") or "")
        art["kw_score"] = score
        if score >= settings.NEWS_KW_MIN_SCORE:
            stage1_passed.append(art)

    log.info("news.stage1", fetched=fetched, passed=len(stage1_passed))

    # Stage 2 — India EV context check
    for art in stage1_passed:
        if passes_stage2(art["title"], art.get("summary") or "", art["kw_score"]):
            stage2_passed.append(art)

    log.info("news.stage2", passed=len(stage2_passed))

    # Stage 3 — LLM classification (Groq llama-3.1-8b-instant)
    stage3_passed: list[dict[str, Any]] = []
    for art in stage2_passed:
        label = await classify_article_llm(art["title"], art.get("summary") or "")
        art["llm_label"] = label
        if label == "ev_relevant":
            stage3_passed.append(art)

    log.info("news.stage3", passed=len(stage3_passed))

    # Persist — skip duplicates via source_id unique constraint
    stored = 0
    duplicates_skipped = 0

    existing_source_ids = set()
    if stage3_passed:
        all_source_ids = [a["source_id"] for a in stage3_passed]
        result = await db.execute(
            select(NewsArticle.source_id).where(NewsArticle.source_id.in_(all_source_ids))
        )
        existing_source_ids = {row[0] for row in result.all()}

    for art in stage3_passed:
        if art["source_id"] in existing_source_ids:
            duplicates_skipped += 1
            continue

        # Parse published_at safely
        pub_at: datetime | None = None
        if art.get("published_at"):
            try:
                pub_str = art["published_at"]
                if isinstance(pub_str, str):
                    # NewsData uses "YYYY-MM-DD HH:MM:SS", Currents uses ISO-8601
                    pub_str = pub_str.replace(" ", "T")
                    if not pub_str.endswith("Z") and "+" not in pub_str:
                        pub_str += "Z"
                    pub_at = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
            except Exception:
                pub_at = None

        category = _assign_category(art["title"], art.get("summary") or "")
        base_slug = _slugify(art["title"])
        slug = base_slug or art["source_id"][:60]

        article = NewsArticle(
            source_id=art["source_id"],
            provider=art["provider"],
            title=art["title"],
            slug=slug,
            summary=art.get("summary"),
            content_snippet=art.get("content_snippet"),
            image_url=art.get("image_url"),
            article_url=art.get("article_url"),
            author=art.get("author"),
            source_name=art.get("source_name"),
            category=category,
            kw_score=art["kw_score"],
            llm_label=art["llm_label"],
            tags=art.get("tags") or [],
            is_featured=art["kw_score"] >= 80,
            published_at=pub_at,
        )
        db.add(article)
        stored += 1

    try:
        await db.flush()
    except Exception as exc:
        await db.rollback()
        log.error("news.persist_failed", error=str(exc))
        return NewsIngestResult(
            fetched=fetched,
            passed_stage1=len(stage1_passed),
            passed_stage3=len(stage3_passed),
            stored=0,
            duplicates_skipped=duplicates_skipped,
            provider_used=provider_used,
        )

    log.info(
        "news.ingest_complete",
        fetched=fetched,
        stage1=len(stage1_passed),
        stage2=len(stage2_passed),
        stage3=len(stage3_passed),
        stored=stored,
        dupes=duplicates_skipped,
        provider=provider_used,
    )

    return NewsIngestResult(
        fetched=fetched,
        passed_stage1=len(stage1_passed),
        passed_stage3=len(stage3_passed),
        stored=stored,
        duplicates_skipped=duplicates_skipped,
        provider_used=provider_used,
    )


# ---------------------------------------------------------------------------
# TODO(news-integration): Phase 2 personalization features — NOT implemented
# ---------------------------------------------------------------------------
# The following are explicitly deferred per project scope rules:
#
# - news_preferences table: store per-user category weights
#   Expected API: GET /api/v1/news/preferences, POST /api/v1/news/preferences
#   Expected DB table(s): news_preferences
#
# - news_bookmarks table: persist user-saved articles
#   Expected API: POST /api/v1/news/bookmarks, DELETE /api/v1/news/bookmarks/{id}
#   Expected DB table(s): news_bookmarks
#
# - news_read_history table: track read events for personalised ranking
#   Expected API: POST /api/v1/news/read
#   Expected DB table(s): news_read_history
#
# - Personalised ranking: score articles by user category weight vector
#   Depends on: news_preferences + news_read_history tables
#
# - Full Stage 2 embedding-similarity: replace rule-based Stage 2 with
#   pgvector cosine similarity against curated reference embeddings.
#   Depends on: embedding generation infrastructure + reference corpus
