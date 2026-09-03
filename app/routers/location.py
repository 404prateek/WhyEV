"""Location persistence router.

Provides:
  POST  /api/v1/locations      — save a single explicit 'Locate Me' coordinate pair
  GET   /api/v1/admin/user-locations — admin-only listing of recent location records

Architecture note — dual-path INSERT:
  1. Primary path: SQLAlchemy → PostgreSQL (Supabase direct or pooler)
  2. Fallback path: Supabase REST API via service-role key (httpx)

The fallback is necessary because on Render's free tier, outbound connections
to db.xxx.supabase.co:5432 may be blocked by network policy. The Supabase REST
API (https://xxx.supabase.co/rest/v1/...) works through HTTPS on port 443,
which is always allowed.

Security:
  - Service-role key is used SERVER-SIDE ONLY (in this file, never frontend).
  - RLS remains enabled; service_role bypasses it by design (Supabase spec).
  - No JWT or token is logged.
  - No user_id from path/query — only from the validated JWT dependency.
"""
from __future__ import annotations

import asyncio
import uuid
from typing import Optional

import httpx
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
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

# ---------------------------------------------------------------------------
# Supabase REST API helper — fallback path when SQLAlchemy DB is unreachable
# ---------------------------------------------------------------------------

_SUPABASE_REST_TIMEOUT = 8.0  # seconds


async def _insert_via_supabase_rest(
    latitude: float,
    longitude: float,
    accuracy_meters: Optional[float],
    user_id: Optional[uuid.UUID],
) -> bool:
    """
    Insert a location record directly via the Supabase REST API.

    Uses the service-role key (server-side only) so RLS is bypassed cleanly.
    Returns True on success, False on any failure.

    The service-role key is read from SUPABASE_SERVICE_ROLE_KEY env var.
    If the key is not configured, this path is skipped and False is returned.

    SECURITY: The service-role key is NEVER logged, echoed, or returned to the client.
    """
    service_key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not service_key:
        log.warning(
            "[locations] supabase_rest_fallback_skipped",
            reason="SUPABASE_SERVICE_ROLE_KEY not configured on this environment",
        )
        return False

    supabase_url = settings.SUPABASE_URL.rstrip("/")
    endpoint = f"{supabase_url}/rest/v1/user_locations"

    payload: dict = {
        "latitude": latitude,
        "longitude": longitude,
    }
    if accuracy_meters is not None and accuracy_meters >= 0:
        payload["accuracy_meters"] = accuracy_meters
    if user_id is not None:
        payload["user_id"] = str(user_id)
    # user_id omitted → NULL in Supabase (anonymous record)

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",  # Don't return the inserted row (saves bandwidth)
    }
    # Do NOT log headers — they contain the service-role key

    try:
        async with httpx.AsyncClient(timeout=_SUPABASE_REST_TIMEOUT) as client:
            resp = await client.post(endpoint, json=payload, headers=headers)

        if resp.status_code in (200, 201):
            log.info(
                "[locations] supabase_rest_insert_ok",
                user_id=str(user_id) if user_id else "anonymous",
                http_status=resp.status_code,
            )
            return True
        else:
            # Log status and safe portion of body (no credentials in body)
            body_preview = resp.text[:200] if resp.text else "(empty)"
            log.error(
                "[locations] supabase_rest_insert_failed",
                http_status=resp.status_code,
                body_preview=body_preview,
            )
            return False

    except httpx.TimeoutException:
        log.error("[locations] supabase_rest_timeout", timeout_s=_SUPABASE_REST_TIMEOUT)
        return False
    except Exception as exc:
        log.error("[locations] supabase_rest_error", error=str(exc))
        return False


# ---------------------------------------------------------------------------
# Primary route
# ---------------------------------------------------------------------------

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

    Insert strategy:
      1. Try SQLAlchemy (SQLite fallback or PostgreSQL if reachable).
      2. On DB failure, fall back to Supabase REST API (server-side service-role key).
      3. If both fail, return HTTP 503 — do NOT silently discard the record.
    """
    log.info("[locations] request_received")

    # Resolve user_id — guest sentinel treated as anonymous
    GUEST_UUID = uuid.UUID("00000000-0000-0000-0000-000000000000")
    resolved_user_id: Optional[uuid.UUID] = None

    if current_user and current_user.id != GUEST_UUID:
        resolved_user_id = current_user.id

    log.info(
        "[locations] authentication_completed",
        user_id=str(resolved_user_id) if resolved_user_id else "anonymous",
    )

    # ------------------------------------------------------------------
    # Path 1: SQLAlchemy insert (works when DB is reachable)
    # ------------------------------------------------------------------
    log.info("[locations] attempting_sqlalchemy_insert")
    sqlalchemy_ok = False

    try:
        # Quick connectivity probe: run a trivial query with a tight timeout.
        # This avoids hanging for 30+ seconds on a dead connection.
        async with asyncio.timeout(5.0):
            await db.execute(text("SELECT 1"))

        record = UserLocation(
            user_id=resolved_user_id,
            latitude=body.latitude,
            longitude=body.longitude,
            accuracy_meters=body.accuracy_meters,
        )
        db.add(record)
        await db.flush()
        # The get_db dependency commits on successful yield, so the row is
        # durable after this function returns.
        sqlalchemy_ok = True
        log.info(
            "[locations] sqlalchemy_insert_completed",
            user_id=str(resolved_user_id) if resolved_user_id else "anonymous",
            lat=body.latitude,
            lng=body.longitude,
        )

    except asyncio.TimeoutError:
        log.warning("[locations] sqlalchemy_connectivity_probe_timeout — trying REST fallback")
        await db.rollback()
    except Exception as exc:
        log.warning(
            "[locations] sqlalchemy_insert_failed",
            error_type=type(exc).__name__,
            error=str(exc)[:200],  # truncate — no sensitive info expected but be safe
        )
        try:
            await db.rollback()
        except Exception:
            pass

    if sqlalchemy_ok:
        return LocationSaveResponse(success=True)

    # ------------------------------------------------------------------
    # Path 2: Supabase REST API fallback
    # ------------------------------------------------------------------
    log.info("[locations] attempting_supabase_rest_fallback")

    rest_ok = await _insert_via_supabase_rest(
        latitude=body.latitude,
        longitude=body.longitude,
        accuracy_meters=body.accuracy_meters,
        user_id=resolved_user_id,
    )

    if rest_ok:
        log.info("[locations] insert_completed_via_rest_fallback")
        return LocationSaveResponse(success=True)

    # ------------------------------------------------------------------
    # Both paths failed — return 503 so the client knows to retry
    # ------------------------------------------------------------------
    log.error(
        "[locations] all_insert_paths_failed",
        user_id=str(resolved_user_id) if resolved_user_id else "anonymous",
    )
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Location could not be saved: database temporarily unavailable. Please retry.",
    )


# ---------------------------------------------------------------------------
# Admin route
# ---------------------------------------------------------------------------

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
    try:
        stmt = (
            select(UserLocation)
            .order_by(UserLocation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        rows = result.scalars().all()
        return [LocationRecordOut.model_validate(r) for r in rows]
    except Exception as exc:
        log.error("[locations] admin_list_failed", error=str(exc)[:200])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve location records: database temporarily unavailable.",
        )
