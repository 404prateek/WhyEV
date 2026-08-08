"""Recommendations and vehicle catalogue router."""
from __future__ import annotations

import uuid

import structlog
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.dialects.postgresql import UUID

from app.core.deps import CurrentUserObj, CurrentUserOptional, DBSession
from app.models.vehicle import VehicleMaster
from app.schemas.profile import (
    LeadSummaryOut,
    RecommendationIn,
    RecommendationOut,
    RecommendationResponse,
    VehicleOut,
)
from app.services.recommendation_service import get_recommendations
from app.services.lead_pipeline_service import create_recommendation_with_leads

log = structlog.get_logger(__name__)

router = APIRouter()


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_vehicle_recommendations(
    body: RecommendationIn, user: CurrentUserOptional, db: DBSession
) -> RecommendationResponse:
    """
    Core recommendation endpoint.

    Behavior by auth state:
    - Authenticated:   runs filter → saves profile → saves recommendation → creates leads
    - Unauthenticated: runs filter only → returns shortlist (no persistence)

    The response shape is identical in both cases; `recommendation_id` and
    `leads_created` are None/[] for unauthenticated sessions.
    """
    # --- Step 1: Get vehicle shortlist (unchanged logic) ---
    enriched_shortlist, raw_vehicles, assumptions = await get_recommendations(
        db=db, payload=body
    )

    # --- Step 2: Lead pipeline (authenticated users only) ---
    recommendation_id: uuid.UUID | None = None
    leads_created: list[LeadSummaryOut] = []

    if user is not None:
        try:
            recommendation, leads = await create_recommendation_with_leads(
                db=db,
                user_id=user.id,
                payload=body,
                shortlist=enriched_shortlist,
                assumptions=assumptions,
            )
            recommendation_id = recommendation.id
            leads_created = [LeadSummaryOut.model_validate(lead) for lead in leads]
            log.info(
                "lead_pipeline.success",
                user_id=str(user.id),
                recommendation_id=str(recommendation.id),
                leads_count=len(leads),
            )
        except Exception as exc:
            # Pipeline failure must NOT break the recommendation response.
            # Log and continue — the user still sees their shortlist.
            log.error(
                "lead_pipeline.error",
                user_id=str(user.id),
                error=str(exc),
                exc_info=True,
            )

    return RecommendationResponse(
        shortlist=enriched_shortlist,
        assumptions=assumptions,
        recommendation_id=recommendation_id,
        leads_created=leads_created,
    )


@router.get("/vehicles/{vehicle_id}", response_model=VehicleOut)
@router.get("/recommendations/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(vehicle_id: uuid.UUID, user: CurrentUserOptional, db: DBSession) -> VehicleOut:
    stmt = select(VehicleMaster).where(VehicleMaster.id == vehicle_id)
    result = await db.execute(stmt)
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return VehicleOut.model_validate(vehicle)


@router.get("/vehicles", response_model=list[VehicleOut])
async def list_vehicles(
    user: CurrentUserOptional,
    db: DBSession,
    category: str | None = Query(None),
    budget_max: int | None = Query(None),
    empanelled: bool | None = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
) -> list[VehicleOut]:
    filters = []
    if category:
        filters.append(VehicleMaster.category == category)
    if budget_max:
        filters.append(VehicleMaster.price <= budget_max)
    if empanelled is not None:
        filters.append(VehicleMaster.is_empanelled.is_(empanelled))

    stmt = (
        select(VehicleMaster)
        .where(and_(*filters) if filters else True)
        .order_by(VehicleMaster.price)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return [VehicleOut.model_validate(v) for v in result.scalars().all()]
