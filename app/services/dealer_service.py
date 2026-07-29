"""Dealer service — nearby search and lead creation with consent enforcement."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dealer import Dealer, DealerLead, Appointment
from app.schemas.dealer import LeadCreateIn, AppointmentCreateIn


async def get_nearby_dealers(
    *, db: AsyncSession, lat: float, lng: float, model_id: uuid.UUID | None, limit: int = 10
) -> list[Dealer]:
    """Return dealers ordered by crude distance (no PostGIS required for v1)."""
    stmt = select(Dealer).limit(limit)
    result = await db.execute(stmt)
    dealers = list(result.scalars().all())

    # Sort by Euclidean distance (good enough for v1; replace with PostGIS in v2)
    dealers.sort(
        key=lambda d: (
            ((float(d.lat) if d.lat is not None else 0) - lat) ** 2 + ((float(d.lng) if d.lng is not None else 0) - lng) ** 2
        )
    )
    return dealers[:limit]


async def create_lead(
    *, db: AsyncSession, user_id: uuid.UUID, payload: LeadCreateIn
) -> DealerLead:
    """Consent must be True at API level — enforced here as a double-check."""
    if not payload.consent:
        raise PermissionError("Lead creation requires explicit user consent")

    lead = DealerLead(
        user_id=user_id,
        dealer_id=payload.dealer_id,
        vehicle_id=payload.vehicle_id,
        source_module=payload.source_module,
        status="new",
        consent_given_at=datetime.now(timezone.utc),
    )
    db.add(lead)
    await db.flush()
    return lead


async def create_appointment(
    *, db: AsyncSession, user_id: uuid.UUID, payload: AppointmentCreateIn
) -> Appointment:
    appt = Appointment(
        user_id=user_id,
        dealer_id=payload.dealer_id,
        type=payload.type,
        scheduled_at=payload.scheduled_at,
        status="booked",
    )
    db.add(appt)
    await db.flush()
    return appt
