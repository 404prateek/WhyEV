"""Dealers, leads, and appointments router."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.dealer import Appointment, Dealer, DealerLead
from app.schemas.dealer import (
    AppointmentCreateIn,
    AppointmentOut,
    DealerOut,
    LeadCreateIn,
    LeadOut,
)
from app.services.dealer_service import (
    create_appointment,
    create_lead,
    get_nearby_dealers,
)

from pydantic import BaseModel

router = APIRouter()


class ChargerOut(BaseModel):
    id: str
    name: str
    operator: str
    address: str
    lat: float
    lng: float
    status: str
    powerKw: int
    totalGuns: int
    availableGuns: int
    costPerKwh: float
    lastVerified: str


@router.get("/chargers", response_model=list[ChargerOut])
async def get_chargers(
    lat: float | None = Query(None),
    lng: float | None = Query(None)
) -> list[ChargerOut]:
    """Get list of charging stations in Delhi NCR region."""
    return [
        ChargerOut(
            id="chg-001",
            name="Tata Power EZ Charge - Connaught Place",
            operator="Tata Power",
            address="Inner Circle, Block A, Connaught Place, New Delhi",
            lat=28.6315,
            lng=77.2167,
            status="working",
            powerKw=60,
            totalGuns=4,
            availableGuns=3,
            costPerKwh=18.0,
            lastVerified="2 mins ago",
        ),
        ChargerOut(
            id="chg-002",
            name="Statiq Fast Charger - Nehru Place",
            operator="Statiq",
            address="Nehru Place Metro Station Complex, New Delhi",
            lat=28.5492,
            lng=77.2520,
            status="working",
            powerKw=120,
            totalGuns=6,
            availableGuns=4,
            costPerKwh=19.5,
            lastVerified="5 mins ago",
        ),
        ChargerOut(
            id="chg-003",
            name="Jio-bp pulse - Cyber Hub",
            operator="Jio-bp",
            address="DLF Cyber City, Phase 2, Gurugram",
            lat=28.4950,
            lng=77.0890,
            status="busy",
            powerKw=60,
            totalGuns=4,
            availableGuns=0,
            costPerKwh=18.5,
            lastVerified="1 min ago",
        ),
        ChargerOut(
            id="chg-004",
            name="BluSmart Superhub - Okhla Ph 3",
            operator="BluSmart",
            address="Okhla Industrial Estate Phase III, New Delhi",
            lat=28.5400,
            lng=77.2750,
            status="working",
            powerKw=30,
            totalGuns=12,
            availableGuns=8,
            costPerKwh=16.0,
            lastVerified="10 mins ago",
        ),
        ChargerOut(
            id="chg-005",
            name="Ather Grid - Saket District Centre",
            operator="Ather Grid",
            address="Select CITYWALK Mall, Saket, New Delhi",
            lat=28.5285,
            lng=77.2195,
            status="working",
            powerKw=22,
            totalGuns=2,
            availableGuns=1,
            costPerKwh=15.0,
            lastVerified="3 mins ago",
        ),
    ]


@router.get("/dealers/nearby", response_model=list[DealerOut])
async def nearby_dealers(
    user_id: CurrentUser,
    db: DBSession,
    lat: float = Query(...),
    lng: float = Query(...),
    model_id: uuid.UUID | None = Query(None),
) -> list[DealerOut]:
    dealers = await get_nearby_dealers(db=db, lat=lat, lng=lng, model_id=model_id)
    return [DealerOut.model_validate(d) for d in dealers]


@router.get("/dealers/{dealer_id}", response_model=DealerOut)
async def get_dealer(dealer_id: uuid.UUID, user_id: CurrentUser, db: DBSession) -> DealerOut:
    stmt = select(Dealer).where(Dealer.id == dealer_id)
    result = await db.execute(stmt)
    dealer = result.scalar_one_or_none()
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    return DealerOut.model_validate(dealer)


@router.post("/leads", response_model=LeadOut, status_code=201)
async def create_lead_endpoint(
    body: LeadCreateIn, user_id: CurrentUser, db: DBSession
) -> LeadOut:
    if not body.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit consent required to share your details with a dealer.",
        )
    try:
        lead = await create_lead(db=db, user_id=user_id, payload=body)
    except PermissionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return LeadOut.model_validate(lead)


@router.get("/leads/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: uuid.UUID, user_id: CurrentUser, db: DBSession) -> LeadOut:
    stmt = select(DealerLead).where(
        DealerLead.id == lead_id, DealerLead.user_id == user_id
    )
    result = await db.execute(stmt)
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadOut.model_validate(lead)


@router.post("/appointments", response_model=AppointmentOut, status_code=201)
async def book_appointment(
    body: AppointmentCreateIn, user_id: CurrentUser, db: DBSession
) -> AppointmentOut:
    appt = await create_appointment(db=db, user_id=user_id, payload=body)
    return AppointmentOut.model_validate(appt)
