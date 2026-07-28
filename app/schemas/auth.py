"""Pydantic schemas for auth endpoints."""
from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


_PHONE_RE = re.compile(r"^\+?[1-9]\d{6,14}$")


def _validate_phone(v: str) -> str:
    v = v.strip().replace(" ", "").replace("-", "")
    if not _PHONE_RE.match(v):
        raise ValueError("Invalid phone number format")
    return v


class OtpRequestIn(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        return _validate_phone(v)


class OtpVerifyIn(BaseModel):
    phone: str
    code: str

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        return _validate_phone(v)


class GoogleAuthIn(BaseModel):
    id_token: str


class TokenRefreshIn(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: uuid.UUID
    phone: str
    email: str | None
    name: str | None
    auth_provider: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class OtpSentOut(BaseModel):
    sent: bool = True
    message: str = "OTP sent successfully"
