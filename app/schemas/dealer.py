"""Pydantic schemas for dealer, lead, and appointment endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class DealerOut(BaseModel):
    id: uuid.UUID
    name: str | None
    city: str | None
    lat: float | None
    lng: float | None
    crm_status: str

    model_config = {"from_attributes": True}


class LeadCreateIn(BaseModel):
    dealer_id: uuid.UUID
    vehicle_id: uuid.UUID
    source_module: str       # recommendation | subsidy
    consent: bool            # must be True; API rejects if False


class LeadOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    dealer_id: uuid.UUID
    vehicle_id: uuid.UUID | None
    source_module: str | None
    status: str
    consent_given_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AppointmentCreateIn(BaseModel):
    dealer_id: uuid.UUID
    type: str               # test_drive | inspection
    scheduled_at: datetime


class AppointmentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    dealer_id: uuid.UUID
    type: str | None
    scheduled_at: datetime | None
    status: str

    model_config = {"from_attributes": True}
