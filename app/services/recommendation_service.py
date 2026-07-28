"""Recommendation service — pure filter-based vehicle matching (no AI).

The AI recommendation layer sits in agent_orchestrator; this service is the
deterministic engine that both the REST endpoint and the agent consume.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vehicle import VehicleMaster
from app.schemas.profile import RecommendationIn


_PROFILE_FIELDS = [
    "intent", "budget_min", "budget_max", "city", "is_delhi_ncr",
    "daily_km", "preferred_categories", "charging_preference",
    "finance_pref", "emi_comfort", "housing_type", "parking_socket_access",
    "family_size",
]

_REQUIRED_FIELDS = ["budget_max", "preferred_categories", "daily_km"]


def profile_completion(profile_data: dict[str, Any]) -> tuple[int, list[str]]:
    """Return (percent, missing_fields) for a user profile dict."""
    missing = [f for f in _PROFILE_FIELDS if not profile_data.get(f)]
    filled = len(_PROFILE_FIELDS) - len(missing)
    pct = round(filled / len(_PROFILE_FIELDS) * 100)
    return pct, missing


async def get_recommendations(
    *, db: AsyncSession, payload: RecommendationIn, limit: int = 10
) -> tuple[list[VehicleMaster], list[str]]:
    """Return (shortlist, assumptions) based on profile filters."""
    assumptions: list[str] = []

    filters: list[Any] = [VehicleMaster.is_empanelled.is_(True)]

    # Budget
    if payload.budget_max:
        filters.append(VehicleMaster.price <= payload.budget_max)
    else:
        assumptions.append("No budget specified — showing all empanelled models")

    # Category
    if payload.preferred_categories:
        filters.append(VehicleMaster.category.in_(payload.preferred_categories))
    else:
        assumptions.append("No vehicle category preference — including all categories")

    # Range vs daily km (add 20% buffer)
    if payload.daily_km:
        min_range = int(payload.daily_km * 1.2)
        filters.append(VehicleMaster.range_km >= min_range)
        if min_range > 0:
            assumptions.append(
                f"Showing vehicles with ≥{min_range} km range (daily_km × 1.2 buffer)"
            )

    stmt = (
        select(VehicleMaster)
        .where(and_(*filters))
        .order_by(VehicleMaster.price)
        .limit(limit)
    )
    result = await db.execute(stmt)
    shortlist = list(result.scalars().all())

    if not shortlist:
        assumptions.append("No exact matches — consider widening budget or category")

    return shortlist, assumptions
