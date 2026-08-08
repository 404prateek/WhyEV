"""Pydantic schemas for agent, notification, and certification endpoints."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# AI Agent
# ---------------------------------------------------------------------------

class AgentMessageIn(BaseModel):
    conversation_id: uuid.UUID | None = None
    text: str


class AgentConversationTurnOut(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    agent_type: str | None
    message_role: str
    message_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------

class NotificationOut(BaseModel):
    id: uuid.UUID
    channel: str | None
    type: str | None
    payload: dict | None
    sent_at: datetime | None
    read_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationPreferenceIn(BaseModel):
    push: bool = True
    whatsapp: bool = True
    sms: bool = True
    email: bool = True


# ---------------------------------------------------------------------------
# Certification
# ---------------------------------------------------------------------------

from pydantic import BaseModel, ConfigDict

class CertificationRequestIn(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_id: uuid.UUID
    year: int
    odometer: int          # km


class BatteryReportOut(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    vehicle_model_id: uuid.UUID | None
    inspection_date: date | None
    battery_score: int | None
    remaining_life_years: float | None
    certificate_valid_until: date | None
    qr_code: str | None
    # Derived field: full public verification URL built from the raw qr_code token.
    # Frontend displays this as a scannable QR image.
    qr_code_url: str | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def model_validate(cls, obj, **kwargs):  # type: ignore[override]
        instance = super().model_validate(obj, **kwargs)
        if instance.qr_code:
            # TODO(battery-integration): replace hardcoded domain with settings.APP_BASE_URL
            # once that config field is added. Currently uses production domain.
            # Expected env var: APP_BASE_URL (e.g. https://whyev.in)
            instance.qr_code_url = f"https://whyev.in/verify/{instance.qr_code}"
        return instance
