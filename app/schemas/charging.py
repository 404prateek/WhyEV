"""Pydantic schemas for EV Charging Stations API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ConnectorSchema(BaseModel):
    type: str
    total: int = 1
    available: int = 1
    busy: int = 0
    broken: int = 0
    power_kw: Optional[float] = 30.0


class PricingSchema(BaseModel):
    type: str = "per_kwh"
    rate: float = 18.0


class TimelineEntrySchema(BaseModel):
    id: str
    status: str
    timeAgo: str
    reporterType: str = "Verified EV Driver"
    note: Optional[str] = None


class StationDataSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    operator: str
    lat: float
    lng: float
    address: str
    locality: str
    status: str  # working | risky | broken | unverified
    confidencePct: int
    reportCount: int
    lastVerifiedMinutesAgo: int
    isFast: bool
    maxPowerKw: float
    pricing: PricingSchema
    operatingHours: str
    connectors: list[ConnectorSchema]
    amenities: list[str] = Field(default_factory=list)
    photos: list[str] = Field(default_factory=list)
    timeline: list[TimelineEntrySchema] = Field(default_factory=list)
    distanceKm: Optional[float] = None
    finalScore: Optional[float] = None


class CheckinRequest(BaseModel):
    status: Literal["working", "busy", "broken"]
    note: Optional[str] = None
    user_id: Optional[str] = None


class CheckinResponse(BaseModel):
    success: bool
    station_id: str
    new_reliability_score: int
    new_status: str
    message: str


class IngestionRequest(BaseModel):
    lat: float = 28.6139
    lng: float = 77.2090
    radius_km: float = 10.0
