"""Location persistence router.

Provides:
  POST  /api/v1/locations      — save a single explicit 'Locate Me' coordinate pair
  GET   /api/v1/admin/user-locations — admin-only listing of recent location records
"""
from __future__ import annotations

import uuid
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import (
    AdminUser,
    CurrentUserOptional,
    DBSession,
)
from app.models.location import UserLocation
from app.models.user import User
from app.schemas.location import LocationCreateIn, LocationRecordOut, LocationSaveResponse

router = APIRouter(tags=["Location"])

log = structlog.get_logger(__name__)


@router.post(
    "/locations",
    response_model=LocationSaveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save user location from an explicit 'Locate Me' action",
)
async def save_user_location(
    body: LocationCreateIn,
    db: DBSession,
    current_user: CurrentUserOptional,
) -> LocationSaveResponse:
    """
    Persist GPS coordinates obtained after the user explicitly grants browser
    location permission and clicks 'Locate Me'.

    - Coordinates are validated by the request schema (lat -90/90, lng -180/180, accuracy ≥0).
    - user_id is NULL for unauthenticated requests (anonymous Locate Me clicks).
    - The guest sentinel UUID (00000000-…) is treated as anonymous — stored as NULL.
    - Returns only { "success": true }. No coordinates are echoed back.
    - Does NOT implement watchPosition or continuous tracking.
    """
    # The guest user is a shared sentinel — treat as anonymous
    GUEST_UUID = uuid.UUID("00000000-0000-0000-0000-000000000000")
    resolved_user_id: Optional[uuid.UUID] = None

    if current_user and current_user.id != GUEST_UUID:
        resolved_user_id = current_user.id

    record = UserLocation(
        user_id=resolved_user_id,
        latitude=body.latitude,
        longitude=body.longitude,
        accuracy_meters=body.accuracy_meters,
    )
    db.add(record)
    # Flush is handled by get_db dependency on commit
    await db.flush()

    log.info(
        "location.saved",
        user_id=str(resolved_user_id) if resolved_user_id else "anonymous",
        lat=body.latitude,
        lng=body.longitude,
        accuracy=body.accuracy_meters,
    )

    return LocationSaveResponse(success=True)


@router.get(
    "/admin/user-locations",
    response_model=list[LocationRecordOut],
    summary="Admin — list recent user location records",
)
async def admin_list_user_locations(
    admin_id: AdminUser,
    db: DBSession,
    limit: int = 50,
    offset: int = 0,
) -> list[LocationRecordOut]:
    """
    Admin-only endpoint. Returns the most recent location records.
    Only accessible to users with role='admin' (enforced by AdminUser dependency).
    Each record contains: id, user_id, latitude, longitude, accuracy_meters, created_at.
    """
    stmt = (
        select(UserLocation)
        .order_by(UserLocation.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [LocationRecordOut.model_validate(r) for r in rows]
