"""Pydantic schemas for subsidy endpoints."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, model_validator


class SubsidyCalcIn(BaseModel):
    category: str                    # 2W | 3W | 4W | N1_goods
    city: str
    vehicle_id: uuid.UUID | None = None
    price: int | None = 0            # used if vehicle_id not given
    rc_issue_date: date | None = None
    scrappage: str = "no"            # yes | no
    scrapping: str | None = None      # alias for scrappage
    battery_kwh: float = 3.0        # battery capacity in kWh
    battery: float | None = None     # alias for battery_kwh
    reg_year: int = 1               # policy year tier: 1, 2, or 3
    gvw: float = 1.5               # gross vehicle weight in tons

    @model_validator(mode="before")
    @classmethod
    def normalize_input_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "scrapping" in data and ("scrappage" not in data or data["scrappage"] == "no"):
                data["scrappage"] = data["scrapping"]
            elif "scrappage" in data and "scrapping" not in data:
                data["scrapping"] = data["scrappage"]

            if "battery" in data and ("battery_kwh" not in data or data["battery_kwh"] == 3.0):
                try:
                    data["battery_kwh"] = float(data["battery"])
                except (ValueError, TypeError):
                    pass
            elif "battery_kwh" in data and "battery" not in data:
                data["battery"] = data["battery_kwh"]
        return data


class SubsidyBreakdown(BaseModel):
    vehicle_label: str = ""
    direct_subsidy: int = 0
    scrappage_bonus: int = 0
    road_tax_waiver: int = 0
    total_benefit: int = 0
    eligible: bool = True
    ineligible_reason: str | None = None
    # Backward compatibility / extended metadata
    base_amount: int = 0
    total: int = 0
    tax_exemption_pct: Optional[int] = None   # % of road tax waived (100 = full waiver)
    notes: Optional[list[str]] = None          # policy engine notes (warnings, eligibility reasons)
    validity: Optional[str] = None             # policy validity window e.g. "01-07-2026 to 31-03-2030"


class SubsidyCalcOut(BaseModel):
    eligible: bool
    reason: str | None = None
    vehicle_label: str | None = None
    direct_subsidy: int = 0
    scrappage_bonus: int = 0
    road_tax_waiver: int = 0
    total_benefit: int = 0
    ineligible_reason: str | None = None
    amount_breakdown: SubsidyBreakdown | None = None
    deadline: date | None = None


class SubsidyRuleCreateIn(BaseModel):
    category: str
    year_tier: int = 1
    amount: int
    price_ceiling: int
    effective_from: date | None = None
    effective_to: date | None = None


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
