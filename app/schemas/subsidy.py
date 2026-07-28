"""Pydantic schemas for subsidy endpoints."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel


class SubsidyCalcIn(BaseModel):
    category: str                    # 2W | 3W | N1_goods
    city: str
    vehicle_id: uuid.UUID | None = None
    price: int | None = None         # used if vehicle_id not given
    rc_issue_date: date | None = None
    scrappage: str = "no"            # yes | no


class SubsidyBreakdown(BaseModel):
    base_amount: int
    scrappage_bonus: int
    total: int


class SubsidyCalcOut(BaseModel):
    eligible: bool
    reason: str | None = None
    amount_breakdown: SubsidyBreakdown | None = None
    deadline: date | None = None


class SubsidyRuleOut(BaseModel):
    id: uuid.UUID
    category: str | None
    year_tier: int | None
    amount: int | None
    price_ceiling: int | None
    effective_from: date | None
    effective_to: date | None
    status: str

    model_config = {"from_attributes": True}


class SubsidyApplicationCreateIn(BaseModel):
    vehicle_id: uuid.UUID
    registration_state: str
    rc_issue_date: date | None = None
    scrappage_tradein: str = "no"


class SubsidyApplicationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    vehicle_id: uuid.UUID | None
    status: str
    amount_calculated: int | None
    filing_deadline: date | None
    submitted_at: datetime | None
    disbursed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
