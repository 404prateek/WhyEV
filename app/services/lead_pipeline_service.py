"""Lead pipeline service — atomic questionnaire → lead creation.

Called from POST /recommendations after get_recommendations() produces a shortlist.

Flow (single DB transaction via flush):
  1. UPSERT user_profiles  — save intake answers so profile reflects wizard state
  2. INSERT recommendation  — permanent record of this questionnaire run
  3. INSERT dealer_leads    — one per top vehicle (max 3), status='unassigned'

Design decisions:
  - dealer_id is NULL until admin assigns a dealer (unassigned queue)
  - consent_given_at is set to now() — wizard submission = implicit consent
  - lead_quality_score is a simple 0-100 heuristic; no ML required
  - If user already has an identical unassigned lead for a vehicle (idempotency),
    we skip creating a duplicate within the same session.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dealer import DealerLead
from app.models.recommendation import Recommendation
from app.models.user import UserProfile
from app.schemas.profile import RecommendationIn

# Maximum number of leads to auto-create per recommendation run
_MAX_LEADS_PER_RUN = 3


# ---------------------------------------------------------------------------
# Lead quality score heuristic
# ---------------------------------------------------------------------------

def _compute_lead_quality_score(payload: RecommendationIn) -> int:
    """
    Score 0–100 based on purchase intent signals from the intake form.

    Scoring breakdown:
      - Budget ≥ ₹10L       → +25 pts   (serious buyer)
      - Budget ≥ ₹5L        → +15 pts
      - daily_km ≥ 40       → +20 pts   (high usage → faster payback → high motivation)
      - daily_km ≥ 20       → +10 pts
      - trade_in_ice = True → +20 pts   (has existing vehicle = active replacement intent)
      - intent = 'buy_now'  → +20 pts
      - intent = 'research' → +5  pts
      - city = Delhi/NCR    → +15 pts   (subsidy-eligible → incentivised)
    """
    score = 0

    # Budget signal
    budget = payload.budget_max or 0
    if budget >= 1_000_000:
        score += 25
    elif budget >= 500_000:
        score += 15

    # Daily km signal
    daily_km = payload.daily_km or 0
    if daily_km >= 40:
        score += 20
    elif daily_km >= 20:
        score += 10

    # Trade-in signal (strong purchase intent)
    if payload.trade_in_ice:
        score += 20

    # Intent signal
    intent = (payload.intent or "").lower()
    if intent in ("buy_now", "buy"):
        score += 20
    elif intent == "research":
        score += 5

    # Location signal (Delhi NCR = subsidy eligible = motivated)
    city = (payload.city or "").lower()
    delhi_cities = {
        "delhi", "new delhi", "gurugram", "gurgaon", "noida",
        "faridabad", "ghaziabad", "greater noida",
    }
    if city in delhi_cities or payload.is_delhi_ncr:
        score += 15

    return min(score, 100)


# ---------------------------------------------------------------------------
# Profile UPSERT helper
# ---------------------------------------------------------------------------

async def _upsert_profile(
    db: AsyncSession, user_id: uuid.UUID, payload: RecommendationIn
) -> None:
    """Sync intake answers into user_profiles. Creates the row if missing."""
    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)

    # Only set fields that were actually provided in the payload (don't overwrite
    # existing profile fields with None from a partial questionnaire submission)
    field_map = {
        "budget_min": payload.budget_min,
        "budget_max": payload.budget_max,
        "city": payload.city,
        "is_delhi_ncr": payload.is_delhi_ncr,
        "daily_km": payload.daily_km,
        "preferred_categories": payload.preferred_categories,
        "charging_preference": payload.charging_preference,
        "finance_pref": payload.finance_pref,
        "emi_comfort": payload.emi_comfort,
        "intent": payload.intent,
    }
    for field, value in field_map.items():
        if value is not None:
            setattr(profile, field, value)

    await db.flush()


# ---------------------------------------------------------------------------
# Main pipeline function
# ---------------------------------------------------------------------------

async def create_recommendation_with_leads(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    payload: RecommendationIn,
    shortlist: list[dict[str, Any]],
    assumptions: list[str],
) -> tuple[Recommendation, list[DealerLead]]:
    """
    Atomic pipeline: profile UPSERT + recommendation INSERT + lead INSERT(s).

    Returns (recommendation, created_leads).
    All DB writes happen via flush within the session; the caller's session
    commit (via FastAPI dependency) finalises the transaction.

    Args:
        db:           Async SQLAlchemy session
        user_id:      Authenticated user's UUID
        payload:      The RecommendationIn intake payload
        shortlist:    Enriched vehicle dicts from get_recommendations()
        assumptions:  Assumption strings from get_recommendations()

    Returns:
        (Recommendation row, list of DealerLead rows created)
    """
    # --- Step 1: UPSERT user_profiles ---
    await _upsert_profile(db, user_id, payload)

    # --- Step 2: INSERT recommendation ---
    recommendation = Recommendation(
        user_id=user_id,
        payload=payload.model_dump(mode="json"),
        shortlist=shortlist,
        assumptions=assumptions,
    )
    db.add(recommendation)
    await db.flush()  # flush to get recommendation.id before creating leads

    # --- Step 3: INSERT dealer_leads (up to _MAX_LEADS_PER_RUN, unassigned) ---
    quality_score = _compute_lead_quality_score(payload)
    questionnaire_snapshot = payload.model_dump(mode="json")
    now = datetime.now(timezone.utc)
    created_leads: list[DealerLead] = []

    # Only create leads for the top N vehicles in the shortlist
    top_vehicles = shortlist[:_MAX_LEADS_PER_RUN]
    for vehicle_dict in top_vehicles:
        try:
            vehicle_id = uuid.UUID(str(vehicle_dict["id"]))
        except (KeyError, ValueError):
            continue  # skip if vehicle_id is malformed

        # Idempotency: skip if an unassigned lead for this vehicle already exists
        # in the same session (prevents duplicates on retry)
        existing_stmt = select(DealerLead).where(
            DealerLead.user_id == user_id,
            DealerLead.vehicle_id == vehicle_id,
            DealerLead.status == "unassigned",
        )
        existing_result = await db.execute(existing_stmt)
        if existing_result.scalar_one_or_none():
            continue  # already has an unassigned lead for this vehicle

        lead = DealerLead(
            user_id=user_id,
            dealer_id=None,          # unassigned — to be filled by admin/matching
            vehicle_id=vehicle_id,
            recommendation_id=recommendation.id,
            source_module="recommendation_flow",
            status="unassigned",
            questionnaire_snapshot=questionnaire_snapshot,
            lead_quality_score=quality_score,
            consent_given_at=now,    # implicit consent from wizard submission
        )
        db.add(lead)
        created_leads.append(lead)

    if created_leads:
        await db.flush()  # flush leads to get their IDs

    return recommendation, created_leads
