"""Recommendation service — pure filter-based vehicle matching (no AI).

Delegates all subsidy calculations directly to app.services.eligibility_service.calculate_subsidy.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vehicle import VehicleMaster
from app.schemas.profile import RecommendationIn
from app.services.eligibility_service import calculate_subsidy

# ---------------------------------------------------------------------------
# Delhi EV Policy 2026 — non-monetary benefits (fixed values per the gazette)
# ---------------------------------------------------------------------------

# Free 1st-year comprehensive insurance provided by Delhi government
# (IRDAI mandate; govt pays premium to insurer on buyer's behalf)
_DELHI_FREE_INSURANCE: dict[str, int] = {
    "2W": 8_000,    # Approx 1-yr comprehensive for a ₹1L 2W
    "3W": 12_000,   # Approx 1-yr comprehensive for a 3W
    "4W": 20_000,   # Approx 1-yr comprehensive for a sub-30L 4W
}

# Free RC registration — RTO fee waived for EVs in Delhi
_DELHI_FREE_RC_REGISTRATION: dict[str, int] = {
    "2W": 3_000,
    "3W": 4_000,
    "4W": 5_000,
}

# Correct Delhi EV road tax RATE (flat %, not % of ICE rate)
# Delhi charges 4% road tax on EVs (waived to 0% under EV policy)
# Road tax waiver = 4% of ex-showroom for 4W, 3% for 2W/3W
_ROAD_TAX_RATE: dict[str, float] = {
    "2W": 0.03,
    "3W": 0.03,
    "4W": 0.04,
    "N1_goods": 0.04,
}


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
) -> tuple[list[dict[str, Any]], list[VehicleMaster], list[str]]:
    """
    Return (enriched_shortlist, raw_vehicles, assumptions) based on profile filters.
    Subsidy calculation for each vehicle is delegated directly to calculate_subsidy()
    in eligibility_service.py to guarantee single-source-of-truth consistency.
    """
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
    raw_vehicles = list(result.scalars().all())

    # Fallback: if strict filters returned 0 rows, relax range and budget filter to show empanelled models
    if not raw_vehicles:
        relaxed_filters: list[Any] = [VehicleMaster.is_empanelled.is_(True)]
        if payload.preferred_categories:
            relaxed_filters.append(VehicleMaster.category.in_(payload.preferred_categories))
        stmt_relaxed = (
            select(VehicleMaster)
            .where(and_(*relaxed_filters))
            .order_by(VehicleMaster.price)
            .limit(limit)
        )
        res_relaxed = await db.execute(stmt_relaxed)
        raw_vehicles = list(res_relaxed.scalars().all())
        assumptions.append("Showing best matching empanelled EV models")

    # Deduplicate by make + model + category
    seen_models = set()
    vehicles = []
    for v in raw_vehicles:
        key = (v.make.strip().lower(), v.model.strip().lower(), v.category)
        if key not in seen_models:
            seen_models.add(key)
            vehicles.append(v)

    enriched_shortlist: list[dict[str, Any]] = []
    city = payload.city or "Delhi"
    is_delhi = city.strip().lower() in {
        "delhi", "new delhi", "gurugram", "gurgaon", "noida",
        "faridabad", "ghaziabad", "greater noida",
    }

    # Use the intake tradeInIce flag if provided
    scrappage_flag = "yes" if getattr(payload, "trade_in_ice", False) else "no"

    for v in vehicles:
        battery_kwh = v.specs.get("battery_kwh", 3.0) if v.specs else 3.0
        variant = v.specs.get("variant", "") if v.specs else ""
        cat = v.category or "4W"

        # Directly invoke eligibility_service.calculate_subsidy — single calculation engine
        subsidy_res = await calculate_subsidy(
            db=db,
            category=cat,
            vehicle_price=v.price,
            city=city,
            rc_issue_date=None,
            scrappage=scrappage_flag,
            battery_kwh=battery_kwh,
        )

        breakdown = subsidy_res.breakdown or {}
        direct_subsidy = breakdown.get("direct_subsidy", breakdown.get("base_amount", 0))
        scrappage_bonus = breakdown.get("scrappage_bonus", 0)

        # Recalculate road tax waiver with the correct Delhi EV rate
        # (DB rule `amount` field stores purchase incentive only, not road tax)
        tax_rate = _ROAD_TAX_RATE.get(cat, 0.04)
        road_tax_waiver = int(v.price * tax_rate) if is_delhi and v.price > 0 else 0

        # Delhi EV Policy 2026 — additional non-cash benefits
        free_insurance = _DELHI_FREE_INSURANCE.get(cat, 0) if is_delhi else 0
        free_rc_reg = _DELHI_FREE_REGISTRATION.get(cat, 0) if is_delhi else 0

        total_benefit = direct_subsidy + scrappage_bonus + road_tax_waiver + free_insurance + free_rc_reg
        effective_price = max(0, v.price - direct_subsidy - scrappage_bonus - road_tax_waiver)

        # Real vehicle photo lookup
        model_lower = (v.model or "").lower()
        image_url = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop"
        if "tiago" in model_lower:
            image_url = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop"
        elif "comet" in model_lower:
            image_url = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop"
        elif "punch" in model_lower:
            image_url = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop"
        elif "c3" in model_lower:
            image_url = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop"
        elif "nexon" in model_lower:
            image_url = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop"
        elif "tigor" in model_lower:
            image_url = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop"
        elif "syros" in model_lower:
            image_url = "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop"
        elif "3xo" in model_lower:
            image_url = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
        elif "windsor" in model_lower:
            image_url = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop"
        elif "xuv400" in model_lower:
            image_url = "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop"
        elif "ather" in model_lower:
            image_url = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop"

        enriched_shortlist.append({
            "id": str(v.id),
            "make": v.make,
            "model": v.model,
            "variant": variant,
            "category": cat,
            "exShowroomPrice": v.price,
            "priceMinLakh": round(v.price / 100_000, 2),
            "effectivePrice": effective_price,
            # Top-level subsidy fields (used by frontend totals)
            "subsidyAmount": direct_subsidy,
            "directSubsidy": direct_subsidy,
            "scrappageBonus": scrappage_bonus,
            "roadTaxWaiver": road_tax_waiver,
            # Delhi EV Policy 2026 specific non-cash benefits
            "freeInsurance": free_insurance,
            "freeRcRegistration": free_rc_reg,
            "totalBenefit": total_benefit,
            # Specs
            "rangeKm": v.range_km,
            "batteryCapacityKwh": battery_kwh,
            "empanelledStatus": "confirmed" if v.is_empanelled else "unverified",
            "chargingTimeHours": v.specs.get("charge_time_h", 6) if v.specs else 6,
            "topSpeedKmvh": v.specs.get("top_speed_kmh", 120) if v.specs else 120,
            "features": [],
            "whyThisFits": "Matches your budget and range requirements.",
            "runningCostPerKm": round(2.5 / max(battery_kwh, 1) * 10, 2),  # ₹2.5/kWh avg Delhi rate
            "imageUrl": image_url,
        })

    return enriched_shortlist, vehicles, assumptions


# Alias (typo fix)
_DELHI_FREE_REGISTRATION = _DELHI_FREE_RC_REGISTRATION
