"""Profile router."""
from __future__ import annotations

from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import CurrentUserObj, DBSession
from app.models.user import User, UserProfile
from app.models.subsidy import SubsidyApplication
from app.schemas.profile import ProfileCompletionOut, ProfileOut, ProfilePatchIn
from app.services.recommendation_service import profile_completion

router = APIRouter()

_PROFILE_FIELDS = [
    "intent", "budget_min", "budget_max", "city", "is_delhi_ncr",
    "daily_km", "housing_type", "parking_socket_access", "family_size",
    "preferred_categories", "charging_preference", "finance_pref", "emi_comfort",
]


class SubsidyAppDashboardOut(BaseModel):
    id: str
    vehicle_id: str | None = None
    vehicle_model_name: str
    registration_state: str
    rc_issue_date: date | None = None
    filing_deadline: date | None = None
    days_remaining: int
    status: str
    calculated_subsidy: int
    scrappage_bonus: int
    tax_waiver_estimated: int
    total_benefit: int


class SavedVehicleDashboardOut(BaseModel):
    id: str
    make: str
    model: str
    variant: str | None = None
    category: str
    ex_showroom_price: int
    battery_kwh: float
    range_km: int


class DealerLeadDashboardOut(BaseModel):
    id: str
    dealer_name: str
    vehicle_model: str
    status: str
    submitted_at: str | None = None


class DashboardOut(BaseModel):
    user_name: str = "Prateek Kumar"
    subsidy_applications: list[SubsidyAppDashboardOut]
    saved_vehicles: list[SavedVehicleDashboardOut]
    dealer_leads: list[DealerLeadDashboardOut]


async def _get_or_create_profile(db: DBSession, user_id) -> UserProfile:
    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


@router.get("/profile", response_model=ProfileOut)
@router.get("/users/me", response_model=ProfileOut)
async def get_profile(user: CurrentUserObj, db: DBSession) -> ProfileOut:
    profile = await _get_or_create_profile(db, user.id)
    return ProfileOut.model_validate(profile)


@router.patch("/profile", response_model=ProfileOut)
@router.put("/users/me/profile", response_model=ProfileOut)
async def patch_profile(
    body: ProfilePatchIn, user: CurrentUserObj, db: DBSession
) -> ProfileOut:
    profile = await _get_or_create_profile(db, user.id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.get("/profile/completion", response_model=ProfileCompletionOut)
async def get_profile_completion(user: CurrentUserObj, db: DBSession) -> ProfileCompletionOut:
    profile = await _get_or_create_profile(db, user.id)
    profile_dict = {f: getattr(profile, f, None) for f in _PROFILE_FIELDS}
    pct, missing = profile_completion(profile_dict)
    return ProfileCompletionOut(percent=pct, missing_fields=missing)


@router.get("/users/me/dashboard", response_model=DashboardOut)
async def get_user_dashboard(user: CurrentUserObj, db: DBSession) -> DashboardOut:
    today = date.today()
    user_id = user.id

    user_name = user.name if user.name else f"User ({str(user_id)[:8]})"

    app_stmt = select(SubsidyApplication).where(SubsidyApplication.user_id == user_id).order_by(SubsidyApplication.created_at.desc())
    app_res = await db.execute(app_stmt)
    apps = app_res.scalars().all()

    from app.services.eligibility_service import calculate_subsidy
    from app.models.vehicle import VehicleMaster

    app_list: list[SubsidyAppDashboardOut] = []
    for app in apps:
        rc_date = app.rc_issue_date or (today - timedelta(days=18))
        deadline = app.filing_deadline or (rc_date + timedelta(days=30))
        days_rem = max(0, (deadline - today).days)

        vehicle_name = "Electric Vehicle"
        category = "2W"
        price = 100000
        battery_kwh = 3.0
        is_empanelled = True

        if app.vehicle_id:
            v_stmt = select(VehicleMaster).where(VehicleMaster.id == app.vehicle_id)
            v_res = await db.execute(v_stmt)
            vehicle = v_res.scalar_one_or_none()
            if vehicle:
                vehicle_name = f"{vehicle.make} {vehicle.model}"
                category = vehicle.category or "2W"
                price = vehicle.price or 0
                battery_kwh = vehicle.specs.get("battery_kwh", 3.0) if vehicle.specs else 3.0
                is_empanelled = vehicle.is_empanelled

        res = await calculate_subsidy(
            db=db,
            category=category,
            vehicle_price=price,
            city=app.registration_state or "Delhi",
            rc_issue_date=rc_date,
            scrappage=app.scrappage_tradein or "no",
            battery_kwh=battery_kwh,
            is_empanelled=is_empanelled,
        )

        breakdown = res.breakdown or {}
        direct_subsidy = breakdown.get("direct_subsidy", breakdown.get("base_amount", 0))
        scrappage_bonus = breakdown.get("scrappage_bonus", 0)
        road_tax_waiver = breakdown.get("road_tax_waiver", 0)
        total_benefit = res.amount

        app_list.append(
            SubsidyAppDashboardOut(
                id=str(app.id),
                vehicle_id=str(app.vehicle_id) if app.vehicle_id else None,
                vehicle_model_name=vehicle_name,
                registration_state=app.registration_state or "Delhi",
                rc_issue_date=rc_date,
                filing_deadline=deadline,
                days_remaining=days_rem,
                status=app.status or "documents_pending",
                calculated_subsidy=direct_subsidy,
                scrappage_bonus=scrappage_bonus,
                tax_waiver_estimated=road_tax_waiver,
                total_benefit=total_benefit,
            )
        )

    saved_list: list[SavedVehicleDashboardOut] = [
        SavedVehicleDashboardOut(
            id="tata-nexon-ev",
            make="Tata Motors",
            model="Nexon EV",
            variant="Empowered+ 45 (45 kWh)",
            category="4W",
            ex_showroom_price=1249000,
            battery_kwh=45.0,
            range_km=489,
        ),
        SavedVehicleDashboardOut(
            id="mg-windsor-ev",
            make="MG Motor",
            model="Windsor EV",
            variant="Essence Pro (52.9 kWh)",
            category="4W",
            ex_showroom_price=1400000,
            battery_kwh=52.9,
            range_km=449,
        ),
    ]

    from app.models.dealer import DealerLead, Dealer

    lead_stmt = (
        select(DealerLead, Dealer, VehicleMaster)
        .outerjoin(Dealer, DealerLead.dealer_id == Dealer.id)
        .outerjoin(VehicleMaster, DealerLead.vehicle_id == VehicleMaster.id)
        .where(DealerLead.user_id == user_id)
        .order_by(DealerLead.created_at.desc())
    )
    lead_res = await db.execute(lead_stmt)
    leads_rows = lead_res.all()

    lead_list: list[DealerLeadDashboardOut] = []
    for lead_obj, dealer_obj, veh_obj in leads_rows:
        lead_list.append(
            DealerLeadDashboardOut(
                id=str(lead_obj.id),
                dealer_name=dealer_obj.name if dealer_obj and dealer_obj.name else "Authorized EV Dealer",
                vehicle_model=f"{veh_obj.make} {veh_obj.model}" if veh_obj else "EV Model",
                status=lead_obj.status or "new",
                submitted_at=lead_obj.created_at.isoformat() if lead_obj.created_at else datetime.now().isoformat(),
            )
        )

    return DashboardOut(
        user_name=user_name,
        subsidy_applications=app_list,
        saved_vehicles=saved_list,
        dealer_leads=lead_list,
    )

