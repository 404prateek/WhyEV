"""EV Charging Stations FastAPI Router for WhyEV."""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Sequence
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.charging import ChargingStation, Connector, CrowdsourcedCheckin, ReliabilityScore, StationReview
from app.schemas.charging import CheckinRequest, CheckinResponse, IngestionRequest, StationDataSchema
from app.services.ingestion_service import (
    fetch_and_ingest_google_places,
    fetch_and_ingest_openchargemap,
    fetch_and_ingest_openstreetmap,
    seed_from_json,
)
from app.services.reliability_service import recompute_and_upsert_reliability


router = APIRouter(tags=["Charging Stations"])




async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates distance in kilometers between two lat/lng coordinates."""
    r = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def _map_station_to_schema(
    st: ChargingStation,
    distance_km: float,
    radius_km: float,
) -> StationDataSchema:
    rel = st.reliability_score_rel
    rel_score = rel.reliability_score if rel else 85
    rel_label = rel.label if rel else "working"

    connectors_list = []
    max_kw = 0.0
    is_fast = False
    total_avail = 0
    total_guns = 0

    for c in st.connectors:
        p_kw = c.power_kw or 30.0
        if p_kw > max_kw:
            max_kw = p_kw
        if p_kw >= 50.0:
            is_fast = True
        total_guns += c.total_guns
        total_avail += c.available_guns
        connectors_list.append(
            {
                "type": c.type,
                "total": c.total_guns,
                "available": c.available_guns,
                "busy": max(0, c.total_guns - c.available_guns),
                "broken": 0,
                "power_kw": p_kw,
            }
        )

    if not connectors_list:
        connectors_list = [
            {"type": "CCS2", "total": 2, "available": 1, "busy": 1, "broken": 0, "power_kw": 60.0}
        ]
        max_kw = 60.0
        is_fast = True

    # Calculate Ranking Score (Part 5 Architecture Document)
    distance_score = max(0.0, min(1.0, 1.0 - (distance_km / max(1.0, radius_km))))
    rel_norm = rel_score / 100.0
    rating_norm = (st.rating or 4.0) / 5.0
    avail_norm = (total_avail / max(1, total_guns)) if total_guns > 0 else 0.5

    final_score = (
        0.35 * distance_score
        + 0.30 * rel_norm
        + 0.20 * rating_norm
        + 0.15 * avail_norm
    )

    # Build Recent Timeline from Check-ins
    timeline_entries = []
    now = datetime.now(timezone.utc)

    for chk in sorted(st.checkins, key=lambda x: x.created_at or now, reverse=True)[:5]:
        created = chk.created_at or now
        mins_ago = int((now - created.astimezone(timezone.utc)).total_seconds() / 60.0)
        time_label = f"{mins_ago} mins ago" if mins_ago < 60 else f"{round(mins_ago / 60)} hrs ago"
        timeline_entries.append(
            {
                "id": str(chk.id),
                "status": chk.status,
                "timeAgo": time_label,
                "reporterType": "Verified EV Driver",
                "note": chk.note,
            }
        )

    if not timeline_entries:
        timeline_entries = [
            {
                "id": "t-default",
                "status": rel_label,
                "timeAgo": "15 mins ago",
                "reporterType": "WhyEV Verified Signal",
                "note": "Automated status check",
            }
        ]

    # Map status label for UI compatibility
    ui_status = rel_label
    if ui_status == "likely_not_working":
        ui_status = "broken"

    # Locality extraction
    address_parts = (st.address or "").split(",")
    locality = address_parts[-2].strip() if len(address_parts) >= 2 else (st.name or "Delhi NCR")

    return StationDataSchema(
        id=str(st.id),
        name=st.name,
        operator=st.operator or "Unknown Operator",
        lat=float(st.latitude),
        lng=float(st.longitude),
        address=st.address or st.name,
        locality=locality,
        status=ui_status,
        confidencePct=rel_score,
        reportCount=len(st.checkins) + len(st.reviews),
        lastVerifiedMinutesAgo=15,
        isFast=is_fast,
        maxPowerKw=max_kw,
        pricing={"type": "per_kwh", "rate": st.price_per_unit or 18.0},
        operatingHours=st.operating_hours or "24/7",
        connectors=connectors_list,
        amenities=["Restroom", "Café", "Wi-Fi", "Parking"],
        photos=["https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop"],
        timeline=timeline_entries,
        distanceKm=round(distance_km, 2),
        finalScore=round(final_score, 3),
    )


@router.get("/charging/stations/nearby", response_model=list[StationDataSchema])
@router.get("/stations/nearby", response_model=list[StationDataSchema])
async def get_nearby_stations(

    lat: float = Query(28.6139, description="Center latitude"),
    lng: float = Query(77.2090, description="Center longitude"),
    radius_km: float = Query(25.0, description="Search radius in kilometers"),
    city: str | None = Query(None, description="City filter"),
    connector_type: str | None = Query(None, description="Connector type filter (CCS2, Type 2, CHAdeMO, GB/T, 15A Plug)"),
    operator: str | None = Query(None, description="Operator filter"),
    status_filter: str | None = Query(None, description="Status filter: all | working_only | working_risky"),
    fast_only: bool = Query(False, description="Filter for fast chargers (>=50kW)"),
    available_only: bool = Query(False, description="Filter for chargers with available guns"),
    db: AsyncSession = Depends(get_db),
) -> list[StationDataSchema]:
    """
    Get EV Charging stations within radius, ranked by distance, reliability score, rating & live availability.
    Auto-seeds DB from delhi ncr ev stations.json if database is empty.
    """
    # Auto-seed if empty
    check_stmt = select(ChargingStation).limit(1)
    res = await db.execute(check_stmt)
    if not res.scalar_one_or_none():
        await seed_from_json(db)

    query = select(ChargingStation).options(
        selectinload(ChargingStation.connectors),
        selectinload(ChargingStation.reliability_score_rel),
        selectinload(ChargingStation.checkins),
        selectinload(ChargingStation.reviews),
    )

    if city and city.lower() != "all":
        query = query.where(ChargingStation.city.ilike(f"%{city}%"))

    result = await db.execute(query)
    stations: Sequence[ChargingStation] = result.scalars().all()

    items: list[StationDataSchema] = []
    for st in stations:
        dist = haversine_distance(lat, lng, st.latitude, st.longitude)
        if dist > radius_km:
            continue

        item = _map_station_to_schema(st, dist, radius_km)

        # Filters
        if fast_only and not item.isFast:
            continue

        if available_only and not any(c.available > 0 for c in item.connectors):
            continue

        if connector_type and connector_type.lower() != "all":
            if not any(c.type.lower() == connector_type.lower() for c in item.connectors):
                continue

        if operator and operator.lower() != "all":
            if operator.lower() not in item.operator.lower():
                continue

        if status_filter == "working_only" and item.status != "working":
            continue

        if status_filter == "working_risky" and item.status not in ["working", "risky"]:
            continue

        items.append(item)

    # Sort by final score descending
    items.sort(key=lambda x: (x.finalScore or 0.0), reverse=True)
    return items


@router.get("/charging/stations/{station_id}", response_model=StationDataSchema)
@router.get("/stations/{station_id}", response_model=StationDataSchema)
async def get_station_by_id(
    station_id: str,
    db: AsyncSession = Depends(get_db),
) -> StationDataSchema:
    """Get details for a specific charging station by UUID string."""
    try:
        st_uuid = uuid.UUID(station_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid station UUID")

    query = (
        select(ChargingStation)
        .where(ChargingStation.id == st_uuid)
        .options(
            selectinload(ChargingStation.connectors),
            selectinload(ChargingStation.reliability_score_rel),
            selectinload(ChargingStation.checkins),
            selectinload(ChargingStation.reviews),
        )
    )
    res = await db.execute(query)
    st = res.scalar_one_or_none()

    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charging station not found")

    return _map_station_to_schema(st, 0.0, 10.0)


@router.post("/charging/stations/{station_id}/checkin", response_model=CheckinResponse)
@router.post("/stations/{station_id}/checkin", response_model=CheckinResponse)
async def submit_station_checkin(

    station_id: str,
    req: CheckinRequest,
    db: AsyncSession = Depends(get_db),
) -> CheckinResponse:
    """Submit user check-in ('Was this charger working?') and recalculate reliability score."""
    try:
        st_uuid = uuid.UUID(station_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid station UUID")

    st_stmt = select(ChargingStation).where(ChargingStation.id == st_uuid)
    res = await db.execute(st_stmt)
    st = res.scalar_one_or_none()

    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charging station not found")

    chk = CrowdsourcedCheckin(
        station_id=st.id,
        user_id=req.user_id or "anonymous_driver",
        status=req.status,
        note=req.note,
    )
    db.add(chk)
    await db.commit()

    # Recalculate Reliability Score
    updated_rel = await recompute_and_upsert_reliability(db, str(st.id))

    return CheckinResponse(
        success=True,
        station_id=str(st.id),
        new_reliability_score=updated_rel.reliability_score,
        new_status=updated_rel.label,
        message=f"Check-in recorded! Updated station reliability score to {updated_rel.reliability_score}/100.",
    )


@router.post("/admin/ingest/stations")
async def trigger_station_ingestion(
    req: IngestionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Admin trigger to ingest charging stations from seed dataset, OpenChargeMap, OpenStreetMap & Google Places."""
    json_count = await seed_from_json(db)
    ocm_count = await fetch_and_ingest_openchargemap(db, req.lat, req.lng, req.radius_km)
    osm_count = await fetch_and_ingest_openstreetmap(db, req.lat, req.lng, req.radius_km)
    gp_count = await fetch_and_ingest_google_places(db, req.lat, req.lng, req.radius_km)
    total = json_count + ocm_count + osm_count + gp_count
    return {
        "status": "success",
        "json_seeded_count": json_count,
        "openchargemap_ingested_count": ocm_count,
        "openstreetmap_ingested_count": osm_count,
        "google_places_ingested_count": gp_count,
        "total_added": total,
    }

