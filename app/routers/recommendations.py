"""Recommendations and vehicle catalogue router."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.dialects.postgresql import UUID

from app.core.deps import CurrentUser, DBSession
from app.models.vehicle import VehicleMaster
from app.schemas.profile import RecommendationIn, RecommendationOut, VehicleOut
from app.services.recommendation_service import get_recommendations

router = APIRouter()


@router.post("/recommendations", response_model=RecommendationOut)
async def get_vehicle_recommendations(
    body: RecommendationIn, user_id: CurrentUser, db: DBSession
) -> RecommendationOut:
    shortlist, assumptions = await get_recommendations(db=db, payload=body)
    return RecommendationOut(
        shortlist=[VehicleOut.model_validate(v) for v in shortlist],
        assumptions=assumptions,
    )


@router.get("/vehicles/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(vehicle_id: uuid.UUID, user_id: CurrentUser, db: DBSession) -> VehicleOut:
    stmt = select(VehicleMaster).where(VehicleMaster.id == vehicle_id)
    result = await db.execute(stmt)
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return VehicleOut.model_validate(vehicle)


@router.get("/vehicles", response_model=list[VehicleOut])
async def list_vehicles(
    user_id: CurrentUser,
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
