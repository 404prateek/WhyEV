"""Pydantic schemas for the user location persistence API."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class LocationCreateIn(BaseModel):
    """
    Request body for POST /api/v1/locations.
    Accepts the coordinates returned by the browser Geolocation API.
    """

    latitude: float = Field(
        ...,
        description="WGS-84 latitude in decimal degrees",
        ge=-90.0,
        le=90.0,
    )
    longitude: float = Field(
        ...,
        description="WGS-84 longitude in decimal degrees",
        ge=-180.0,
        le=180.0,
    )
    accuracy_meters: Optional[float] = Field(
        None,
        description="Accuracy radius in metres as reported by position.coords.accuracy",
        ge=0.0,
    )

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-90.0 <= v <= 90.0):
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (-180.0 <= v <= 180.0):
            raise ValueError("longitude must be between -180 and 180")
        return v


class LocationSaveResponse(BaseModel):
    """Minimal response returned after a successful location save."""

    success: bool = True


class LocationRecordOut(BaseModel):
    """Admin-facing record schema — only exposed to admin-authenticated requests."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    latitude: float
    longitude: float
    accuracy_meters: Optional[float]
    created_at: datetime
