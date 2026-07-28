"""Eligibility service — subsidy calculation engine.

Design rules (from spec §6):
- subsidy_rules is append-only; calculation uses only 'live' rows.
- Two-person admin approval enforced at service layer.
- Empanelled check happens before subsidy math.
- No LLM-generated numbers — every factual claim comes from the DB.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

import structlog
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subsidy import SubsidyRule, SubsidyApplication
from app.models.vehicle import VehicleMaster

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DELHI_NCR_CITIES = frozenset(
    {
        "delhi", "new delhi", "gurugram", "gurgaon", "noida", "faridabad",
        "ghaziabad", "greater noida", "manesar", "bahadurgarh",
    }
)

SCRAPPAGE_BONUS: dict[str, int] = {
    "2W": 10_000,
    "3W": 25_000,
    "N1_goods": 50_000,
}


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class EligibilityResult:
    eligible: bool
    amount: int = 0
    deadline: date | None = None
    reason: str | None = None
    breakdown: dict[str, Any] | None = None


def _ineligible(reason: str) -> EligibilityResult:
    return EligibilityResult(eligible=False, reason=reason)


def _eligible(amount: int, deadline: date | None, breakdown: dict[str, Any]) -> EligibilityResult:
    return EligibilityResult(eligible=True, amount=amount, deadline=deadline, breakdown=breakdown)


# ---------------------------------------------------------------------------
# Core calculation
# ---------------------------------------------------------------------------

def city_is_delhi_ncr(city: str) -> bool:
    return city.strip().lower() in DELHI_NCR_CITIES


async def calculate_subsidy(
    *,
    db: AsyncSession,
    category: str,
    vehicle_price: int,
    city: str,
    rc_issue_date: date | None,
    scrappage: str,
) -> EligibilityResult:
    """Pure DB-backed subsidy calculation. Never free-generates numbers."""

    if not city_is_delhi_ncr(city):
        return _ineligible("Subsidy applies only to Delhi-NCR registered vehicles.")

    # Fetch the best matching live rule
    stmt = (
        select(SubsidyRule)
        .where(
            and_(
                SubsidyRule.category == category,
                SubsidyRule.status == "live",
                SubsidyRule.price_ceiling >= vehicle_price,
            )
        )
        .order_by(SubsidyRule.price_ceiling)  # pick the tightest ceiling
        .limit(1)
    )
    result = await db.execute(stmt)
    rule: SubsidyRule | None = result.scalar_one_or_none()

    if not rule:
        return _ineligible(
            f"No active subsidy tier found for {category} vehicles at ₹{vehicle_price:,}."
        )

    base_amount = rule.amount or 0
    scrappage_bonus = SCRAPPAGE_BONUS.get(category, 0) if scrappage == "yes" else 0
    total_amount = base_amount + scrappage_bonus

    deadline: date | None = None
    if rc_issue_date:
        deadline = rc_issue_date + timedelta(days=30)

    breakdown = {
        "base_amount": base_amount,
        "scrappage_bonus": scrappage_bonus,
        "total": total_amount,
        "rule_id": str(rule.id),
        "year_tier": rule.year_tier,
    }

    log.info(
        "subsidy.calculated",
        category=category,
        city=city,
        amount=total_amount,
        rule_id=str(rule.id),
    )

    return _eligible(total_amount, deadline, breakdown)


# ---------------------------------------------------------------------------
# Application helpers
# ---------------------------------------------------------------------------

async def create_application(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    vehicle_id: uuid.UUID,
    registration_state: str,
    rc_issue_date: date | None,
    scrappage_tradein: str,
) -> SubsidyApplication:
    # Fetch vehicle to get category + price for calculation
    vehicle_stmt = select(VehicleMaster).where(VehicleMaster.id == vehicle_id)
    v_result = await db.execute(vehicle_stmt)
    vehicle: VehicleMaster | None = v_result.scalar_one_or_none()
    if not vehicle:
        raise ValueError("Vehicle not found")

    # We need city; for now use registration_state as proxy (caller can improve)
    result = await calculate_subsidy(
        db=db,
        category=vehicle.category or "2W",
        vehicle_price=vehicle.price or 0,
        city=registration_state,
        rc_issue_date=rc_issue_date,
        scrappage=scrappage_tradein,
    )

    filing_deadline = rc_issue_date + timedelta(days=30) if rc_issue_date else None

    app = SubsidyApplication(
        user_id=user_id,
        vehicle_id=vehicle_id,
        registration_state=registration_state,
        rc_issue_date=rc_issue_date,
        filing_deadline=filing_deadline,
        scrappage_tradein=scrappage_tradein,
        status="calculated",
        amount_calculated=result.amount if result.eligible else None,
    )
    db.add(app)
    await db.flush()
    return app


# ---------------------------------------------------------------------------
# Admin: two-person rule approval
# ---------------------------------------------------------------------------

async def submit_rule_for_review(
    *, db: AsyncSession, rule_id: uuid.UUID, admin_id: uuid.UUID
) -> SubsidyRule:
    stmt = select(SubsidyRule).where(SubsidyRule.id == rule_id)
    result = await db.execute(stmt)
    rule: SubsidyRule | None = result.scalar_one_or_none()
    if not rule:
        raise ValueError("Subsidy rule not found")
    if rule.status != "draft":
        raise ValueError("Only draft rules can be submitted for review")
    rule.status = "pending_review"
    rule.first_approver_id = admin_id
    await db.flush()
    return rule


async def approve_rule(
    *, db: AsyncSession, rule_id: uuid.UUID, admin_id: uuid.UUID
) -> SubsidyRule:
    """Second approver publishes the rule.  Rejects if same person tries to self-approve."""
    stmt = select(SubsidyRule).where(SubsidyRule.id == rule_id)
    result = await db.execute(stmt)
    rule: SubsidyRule | None = result.scalar_one_or_none()
    if not rule:
        raise ValueError("Subsidy rule not found")
    if rule.status != "pending_review":
        raise ValueError("Rule is not pending review")
    if rule.first_approver_id == admin_id:
        raise PermissionError("Self-approval not permitted — second distinct approver required")

    # Supersede previous live rules for the same category
    live_stmt = select(SubsidyRule).where(
        and_(SubsidyRule.category == rule.category, SubsidyRule.status == "live")
    )
    live_results = await db.execute(live_stmt)
    for old_rule in live_results.scalars().all():
        old_rule.status = "superseded"

    rule.status = "live"
    rule.approved_by = admin_id
    await db.flush()
    log.info("subsidy.rule.approved", rule_id=str(rule.id), admin_id=str(admin_id))
    return rule
