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

router = APIRouter()


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
