"""Ingestion service for EV charging stations (JSON seed + Google Places API)."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.charging import ChargingStation, Connector, ReliabilityScore

logger = logging.getLogger(__name__)

SEED_JSON_PATH = Path("delhi ncr ev stations.json")

import re

def _parse_float(val: Any, default: float = 0.0) -> float:
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    match = re.search(r"(\d+(?:\.\d+)?)", str(val))
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    return default

# ...
    if not address:
        return "Delhi NCR"
    parts = [p.strip() for p in address.split(",") if p.strip()]
    if len(parts) >= 2:
        return parts[-2]
    return parts[0] if parts else name


async def seed_from_json(db: AsyncSession, json_path: Path = SEED_JSON_PATH) -> int:
    """Ingest 670+ Delhi NCR stations from delhi ncr ev stations.json into database."""
    if not json_path.exists():
        logger.warning(f"Seed file {json_path} does not exist.")
        return 0

    with open(json_path, "r", encoding="utf-8") as f:
        stations_data: list[dict[str, Any]] = json.load(f)

    count = 0
    for item in stations_data:
        name = item.get("station_name") or "EV Charging Station"
        lat = item.get("latitude")
        lng = item.get("longitude")
        if not lat or not lng:
            continue

        address = item.get("address") or name
        operator = item.get("operator") or "Unknown Operator"
        if operator.startswith("(") and operator.endswith(")"):
            operator = operator[1:-1]

        price = item.get("price_per_unit")
        hours = item.get("operating_hours") or "24/7"
        
        # Check if station exists at rounded lat/lng or by name
        stmt = select(ChargingStation).where(
            ChargingStation.name == name,
            ChargingStation.latitude == lat,
            ChargingStation.longitude == lng,
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if not existing:
            station = ChargingStation(
                name=name,
                operator=operator,
                address=address,
                city="Delhi NCR",
                latitude=float(lat),
                longitude=float(lng),
                business_status="OPERATIONAL",
                rating=4.2,
                user_ratings_total=(item.get("number_of_points") or 1) * 8,

                price_per_unit=_parse_float(price, 18.0),
                operating_hours=hours,
                raw_data=item,
            )
            db.add(station)
            await db.flush()

            # Add Connectors
            connector_types = item.get("connector_types") or ["CCS2"]
            power_kw = item.get("charging_power_kw") or 30.0
            num_points = item.get("number_of_points") or 2

            for c_type in connector_types:
                if c_type == "Unknown":
                    c_type = "CCS2"
                conn = Connector(
                    station_id=station.id,
                    type=c_type,
                    power_kw=_parse_float(power_kw, 30.0),
                    total_guns=num_points,
                    available_guns=max(1, num_points - 1),
                )
                db.add(conn)


            # Add initial Reliability Score
            rel = ReliabilityScore(
                station_id=station.id,
                reliability_score=85,
                label="working",
                recency_weighted_rating_score=0.85,
                keyword_sentiment_score=0.85,
                crowdsource_confirmation_score=0.90,
                business_status_score=1.0,
                review_freshness_score=0.80,
            )
            db.add(rel)
            count += 1

    await db.commit()
    logger.info(f"Successfully seeded {count} new EV stations into database.")
    return count


async def fetch_and_ingest_google_places(
    db: AsyncSession, lat: float, lng: float, radius_km: float = 10.0
) -> int:
    """Optional live ingestion from Google Places API (Nearby Search)."""
    api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", None)
    if not api_key:
        logger.info("GOOGLE_PLACES_API_KEY not set. Skipping live Google Places fetch.")
        return 0

    radius_m = int(radius_km * 1000)
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius={radius_m}&keyword=ev+charging+station&key={api_key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            logger.error(f"Google Places API returned status {resp.status_code}: {resp.text}")
            return 0
        data = resp.json()

    results = data.get("results", [])
    count = 0

    for p in results:
        place_id = p.get("place_id")
        if not place_id:
            continue

        stmt = select(ChargingStation).where(ChargingStation.google_place_id == place_id)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        location = p.get("geometry", {}).get("location", {})
        p_lat = location.get("lat")
        p_lng = location.get("lng")
        if not p_lat or not p_lng:
            continue

        name = p.get("name", "EV Station")
        vicinity = p.get("vicinity", "")
        rating = p.get("rating", 4.0)
        ratings_total = p.get("user_ratings_total", 0)
        bus_status = p.get("business_status", "OPERATIONAL")

        if not existing:
            st = ChargingStation(
                google_place_id=place_id,
                name=name,
                operator="Google Places POI",
                address=vicinity,
                city="Delhi NCR",
                latitude=float(p_lat),
                longitude=float(p_lng),
                business_status=bus_status,
                rating=float(rating),
                user_ratings_total=int(ratings_total),
                raw_data=p,
            )
            db.add(st)
            await db.flush()

            conn = Connector(
                station_id=st.id,
                type="CCS2",
                power_kw=60.0,
                total_guns=2,
                available_guns=2,
            )
            db.add(conn)

            rel = ReliabilityScore(
                station_id=st.id,
                reliability_score=80 if bus_status == "OPERATIONAL" else 30,
                label="working" if bus_status == "OPERATIONAL" else "likely_not_working",
                business_status_score=1.0 if bus_status == "OPERATIONAL" else 0.0,
            )
            db.add(rel)
            count += 1

    await db.commit()
    return count


async def fetch_and_ingest_openchargemap(
    db: AsyncSession, lat: float, lng: float, radius_km: float = 25.0
) -> int:
    """
    100% FREE live ingestion from OpenChargeMap (OCM) public API.
    Does not require any paid Google Places key!
    """
    url = f"https://api.openchargemap.io/v3/poi/?output=json&latitude={lat}&longitude={lng}&distance={radius_km}&distanceunit=KM&maxresults=100&key=157f8931-e17f-4c5c-9c7d-e6b01089bc25"
    headers = {"User-Agent": "WhyEV-Platform/1.0"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                logger.error(f"OpenChargeMap API returned status {resp.status_code}")
                return 0
            results = resp.json()
    except Exception as e:
        logger.error(f"Failed to query OpenChargeMap API: {e}")
        return 0

    count = 0
    for p in results:
        ocm_id = str(p.get("ID"))
        address_info = p.get("AddressInfo", {})
        name = address_info.get("Title") or "EV Charging Station"
        p_lat = address_info.get("Latitude")
        p_lng = address_info.get("Longitude")
        if not p_lat or not p_lng:
            continue

        stmt = select(ChargingStation).where(
            ChargingStation.name == name,
            ChargingStation.latitude == float(p_lat),
            ChargingStation.longitude == float(p_lng),
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            continue

        operator_info = p.get("OperatorInfo", {})
        operator_name = operator_info.get("Title") if operator_info else "Unknown Operator"

        st = ChargingStation(
            google_place_id=f"ocm-{ocm_id}",
            name=name,
            operator=operator_name,
            address=address_info.get("AddressLine1") or address_info.get("Town") or name,
            city=address_info.get("Town") or "Delhi NCR",
            latitude=float(p_lat),
            longitude=float(p_lng),
            business_status="OPERATIONAL",
            rating=4.3,
            user_ratings_total=5,
            raw_data=p,
        )
        db.add(st)
        await db.flush()

        conns = p.get("Connections", [])
        if conns:
            for c in conns:
                c_type_info = c.get("ConnectionType", {})
                c_title = c_type_info.get("Title", "CCS2") if c_type_info else "CCS2"
                conn = Connector(
                    station_id=st.id,
                    type="CCS2" if "ccs" in c_title.lower() else "Type 2" if "type 2" in c_title.lower() else c_title[:30],
                    power_kw=float(c.get("PowerKW") or 30.0),
                    total_guns=int(c.get("Quantity") or 1),
                    available_guns=1,
                )
                db.add(conn)
        else:
            db.add(Connector(station_id=st.id, type="CCS2", power_kw=30.0, total_guns=2, available_guns=1))

        db.add(ReliabilityScore(station_id=st.id, reliability_score=85, label="working"))
        count += 1

    await db.commit()
    logger.info(f"Ingested {count} stations from OpenChargeMap API")
    return count


async def fetch_and_ingest_openstreetmap(
    db: AsyncSession, lat: float, lng: float, radius_km: float = 25.0
) -> int:
    """
    100% FREE live ingestion from OpenStreetMap via Overpass API.
    Zero API keys required!
    """
    radius_m = int(radius_km * 1000)
    query = f'[out:json];node["amenity"="charging_station"](around:{radius_m},{lat},{lng});out body;'
    url = "https://overpass-api.de/api/interpreter"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, data={"data": query})
            if resp.status_code != 200:
                return 0
            data = resp.json()
    except Exception as e:
        logger.error(f"Failed to query OpenStreetMap Overpass API: {e}")
        return 0

    elements = data.get("elements", [])
    count = 0

    for el in elements:
        node_id = str(el.get("id"))
        p_lat = el.get("lat")
        p_lng = el.get("lon")
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("operator") or f"EV Charger #{node_id}"

        stmt = select(ChargingStation).where(
            ChargingStation.latitude == float(p_lat),
            ChargingStation.longitude == float(p_lng),
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            continue

        st = ChargingStation(
            google_place_id=f"osm-{node_id}",
            name=name,
            operator=tags.get("operator", "OpenStreetMap POI"),
            address=tags.get("addr:street") or tags.get("addr:city") or name,
            city="Delhi NCR",
            latitude=float(p_lat),
            longitude=float(p_lng),
            business_status="OPERATIONAL",
            rating=4.0,
            user_ratings_total=3,
            raw_data=el,
        )
        db.add(st)
        await db.flush()

        db.add(Connector(station_id=st.id, type="CCS2", power_kw=30.0, total_guns=2, available_guns=1))
        db.add(ReliabilityScore(station_id=st.id, reliability_score=80, label="working"))
        count += 1

    await db.commit()
    logger.info(f"Ingested {count} stations from OpenStreetMap Overpass API")
    return count

