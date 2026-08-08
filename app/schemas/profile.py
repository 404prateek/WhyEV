"""Pydantic schemas for profile and recommendation endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, model_validator


class ProfilePatchIn(BaseModel):
    intent: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    city: str | None = None
    is_delhi_ncr: bool | None = None
    daily_km: int | None = None
    housing_type: str | None = None
    parking_socket_access: str | None = None
    family_size: str | None = None
    preferred_categories: list[str] | None = None
    charging_preference: str | None = None
    finance_pref: str | None = None
    emi_comfort: int | None = None

    model_config = {"extra": "forbid"}


class ProfileOut(BaseModel):
    user_id: uuid.UUID
    intent: str | None
    budget_min: int | None
    budget_max: int | None
    city: str | None
    is_delhi_ncr: bool | None
    daily_km: int | None
    housing_type: str | None
    parking_socket_access: str | None
    family_size: str | None
    preferred_categories: list[str] | None
    charging_preference: str | None
    finance_pref: str | None
    emi_comfort: int | None
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProfileCompletionOut(BaseModel):
    percent: int
    missing_fields: list[str]


# ---------------------------------------------------------------------------
# Vehicle
# ---------------------------------------------------------------------------

class VehicleOut(BaseModel):
    id: uuid.UUID
    make: str | None
    model: str | None
    category: str | None
    price: int | None
    range_km: int | None
    is_empanelled: bool
    specs: dict[str, Any] | None

    model_config = {"from_attributes": True}


class RecommendationIn(BaseModel):
    """Accepts the full user profile payload or a partial snapshot."""
    intent: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    city: str | None = None
    is_delhi_ncr: bool | None = None
    daily_km: int | None = None
    preferred_categories: list[str] | None = None
    charging_preference: str | None = None
    finance_pref: str | None = None
    emi_comfort: int | None = None
    trade_in_ice: bool | None = None  # True = user has ICE vehicle to trade in (scrappage bonus applies)


class RecommendationOut(BaseModel):
    """Legacy schema — kept for backward compatibility."""
    shortlist: list[VehicleOut]
    assumptions: list[str]


class LeadSummaryOut(BaseModel):
    """Minimal lead info returned inline with a recommendation response."""
    id: uuid.UUID
    vehicle_id: uuid.UUID | None
    status: str
    lead_quality_score: int | None

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    """
    Extended response for POST /recommendations.

    Backward-compatible: `shortlist` and `assumptions` keys are preserved.
    New keys `recommendation_id` and `leads_created` are added when the user
    is authenticated and lead creation succeeded.
    """
    # Core recommendation output (unchanged shape — frontend already reads these)
    shortlist: list[dict[str, Any]]
    assumptions: list[str]

    # Pipeline output (None for unauthenticated requests or on pipeline error)
    recommendation_id: uuid.UUID | None = None
    leads_created: list[LeadSummaryOut] = []
