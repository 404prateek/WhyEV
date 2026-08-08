"""News feed router.

Endpoints:
  GET  /api/v1/news              — serve filtered, stored EV news articles
  POST /api/v1/news/ingest       — trigger an ingestion run (admin only)
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, status
from sqlalchemy import func, select

from app.core.deps import AdminUser, CurrentUser, DBSession
from app.models.news import NewsArticle
from app.schemas.news import NewsArticleOut, NewsIngestResult, NewsListResponse
from app.services.news_service import ingest_news

router = APIRouter()


@router.get("/news", response_model=NewsListResponse)
async def list_news(
    db: DBSession,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Articles per page"),
    category: str | None = Query(None, description="Filter by category name"),
    featured_only: bool = Query(False, description="Return only featured articles"),
) -> NewsListResponse:
    """
    Return paginated EV news articles that have passed the 3-stage filter pipeline
    and been persisted to the news_articles table.

    Articles are ordered by published_at DESC (newest first).
    Unauthenticated access is permitted — this is a public read endpoint.
    """
    # Base query: only serve articles labelled ev_relevant by Stage 3
    stmt = select(NewsArticle).where(
        (NewsArticle.llm_label == "ev_relevant") | (NewsArticle.llm_label.is_(None))
    )

    if category and category.lower() != "all":
        stmt = stmt.where(NewsArticle.category.ilike(f"%{category}%"))

    if featured_only:
        stmt = stmt.where(NewsArticle.is_featured.is_(True))

    # Total count for pagination metadata
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Paginated results
    stmt = (
        stmt.order_by(NewsArticle.published_at.desc(), NewsArticle.ingested_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    articles = result.scalars().all()

    return NewsListResponse(
        articles=[NewsArticleOut.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.post(
    "/news/ingest",
    response_model=NewsIngestResult,
    status_code=status.HTTP_200_OK,
    tags=["Admin"],
)
async def trigger_ingest(
    admin_id: AdminUser,
    db: DBSession,
) -> NewsIngestResult:
    """
    Manually trigger a news ingestion run. Admin-only.
    Fetches from NewsData.io (primary) / Currents API (fallback),
    runs the 3-stage filter, and persists new EV-relevant articles.

    In production, schedule this via cron or APScheduler instead of
    calling this endpoint manually.

    TODO(news-integration): Add APScheduler/celery periodic task to run
    ingest_news() automatically (e.g. every 6 hours).
    Expected: app/tasks/news_ingest_task.py
    """
    return await ingest_news(db)
