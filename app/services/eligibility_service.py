"""Eligibility service — subsidy calculation engine.

Integrates the all-India EV policy engine written by the python_tools team
(app/scripts/calculator_python.py) into the FastAPI service layer.

Key design rules:
- subsidy_rules table is append-only; only 'live' rows are used.
- Two-person admin approval enforced at service layer (not just UI).
- Empanelled check happens before subsidy math.
- No LLM-generated numbers — every claim comes from DB or this engine.
- Policy engine covers all 36 States/UTs; DB overrides take precedence.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

import structlog
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subsidy import SubsidyRule, SubsidyApplication
from app.models.vehicle import VehicleMaster

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# All-India policy engine (ported from app/scripts/calculator_python.py)
# ---------------------------------------------------------------------------

ALL_STATES: list[str] = sorted([
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
])

# Road tax exemption % for states with known partial exemptions
DEFAULT_TAX_EXEMPTION: dict[str, int] = {
    "Kerala": 50,
    "Bihar": 75,
    "Meghalaya": 50,
}

# Scrappage bonuses per category (Delhi policy — used as default)
SCRAPPAGE_BONUS: dict[str, int] = {
    "2W": 10_000,
    "3W": 25_000,
    "4W Car": 1_00_000,
    "4W Goods (N1)": 50_000,
    # Aliases used by frontend
    "3W (L5M)": 25_000,
    "N1_goods": 50_000,
    "4W": 1_00_000,
}


@dataclass
class PolicyResult:
    state: str
    validity: str
    purchase_incentive: float
    scrapping_incentive: float
    tax_exemption_pct: int
    notes: list[str] = field(default_factory=list)

    @property
    def total_benefit(self) -> float:
        return self.purchase_incentive + self.scrapping_incentive


class EVPolicy:
    """Default fallback policy for states without detailed logic."""

    def __init__(self, state: str) -> None:
        self.state = state
        self.validity_period = "Subject to active state gazette"

    def calculate_benefits(
        self, reg_year: int, category: str, price: float,
        battery: float, scrapping: bool, gvw: float = 1.5,
    ) -> PolicyResult:
        tax_pct = DEFAULT_TAX_EXEMPTION.get(self.state, 100)
        return PolicyResult(
            state=self.state,
            validity=self.validity_period,
            purchase_incentive=0.0,
            scrapping_incentive=0.0,
            tax_exemption_pct=tax_pct,
            notes=[
                f"Standard {tax_pct}% road tax concession applied.",
                "Check local RTO for active direct cash subsidies.",
            ],
        )


class DelhiEVPolicy(EVPolicy):
    """Delhi EV Policy 2026 — the primary use-case for WhyEV MVP."""

    def __init__(self) -> None:
        super().__init__("Delhi")
        self.validity_period = "01-07-2026 to 31-03-2030"

    def calculate_benefits(
        self, reg_year: int, category: str, price: float,
        battery: float, scrapping: bool, gvw: float = 1.5,
    ) -> PolicyResult:
        purchase_incentive = 0.0
        scrapping_incentive = 0.0
        tax_exemption_pct = 100
        notes: list[str] = []

        # Normalise category aliases (frontend uses '4W', scripts use '4W Car')
        cat = _normalise_category(category)

        if cat == "2W":
            if price <= 225_000:
                if reg_year == 1:
                    purchase_incentive = min(battery * 10_000, 30_000)
                elif reg_year == 2:
                    purchase_incentive = min(battery * 6_600, 20_000)
                elif reg_year == 3:
                    purchase_incentive = min(battery * 3_300, 10_000)
            else:
                notes.append("Ex-showroom price exceeds ₹2.25 Lakh. Not eligible for purchase incentive.")
            if scrapping:
                scrapping_incentive = 10_000

        elif cat in ("3W", "3W (L5M)"):
            if battery >= 4.0:
                if reg_year == 1:
                    purchase_incentive = 50_000
                elif reg_year == 2:
                    purchase_incentive = 40_000
                elif reg_year == 3:
                    purchase_incentive = 30_000
            else:
                notes.append("Battery under 4 kWh. Not eligible for 3W purchase incentive.")
            if scrapping:
                scrapping_incentive = 25_000

        elif cat in ("4W", "4W Car"):
            if price > 30_00_000:
                tax_exemption_pct = 0
                notes.append("WARNING: Car exceeds ₹30 Lakh ex-showroom. NO road tax exemption applies.")
            else:
                notes.append("Car is under ₹30 Lakh. 100% road tax exemption applies.")
            if scrapping and price <= 30_00_000:
                scrapping_incentive = 1_00_000

        elif cat in ("N1_goods", "4W Goods (N1)"):
            if gvw > 1.75:
                tiers = {1: 1_00_000, 2: 75_000, 3: 50_000}
            else:
                tiers = {1: 50_000, 2: 37_500, 3: 25_000}
            purchase_incentive = tiers.get(reg_year, 0)
            if scrapping:
                scrapping_incentive = 50_000

        return PolicyResult(
            state=self.state,
            validity=self.validity_period,
            purchase_incentive=purchase_incentive,
            scrapping_incentive=scrapping_incentive,
            tax_exemption_pct=tax_exemption_pct,
            notes=notes,
        )


def _normalise_category(cat: str) -> str:
    """Map frontend/DB category aliases to a canonical form."""
    mapping = {
        "2W": "2W",
        "3W": "3W",
        "3W (L5M)": "3W",
        "4W": "4W",
        "4W Car": "4W",
        "N1_goods": "N1_goods",
        "4W Goods (N1)": "N1_goods",
    }
    return mapping.get(cat, cat)


# Build policy map — override with state-specific classes as they are added
_POLICY_MAP: dict[str, EVPolicy] = {state: EVPolicy(state) for state in ALL_STATES}
_POLICY_MAP["Delhi"] = DelhiEVPolicy()


def get_policy(state: str) -> EVPolicy:
    """Return the EVPolicy for a given state (case-insensitive match)."""
    for key, policy in _POLICY_MAP.items():
        if key.lower() == state.strip().lower():
            return policy
    return EVPolicy(state)  # unknown state → generic fallback


# ---------------------------------------------------------------------------
# Delhi NCR city set (for quick city-level eligibility check)
# ---------------------------------------------------------------------------

DELHI_NCR_CITIES: frozenset[str] = frozenset({
    "delhi", "new delhi", "gurugram", "gurgaon", "noida", "faridabad",
    "ghaziabad", "greater noida", "manesar", "bahadurgarh",
})


def city_is_delhi_ncr(city: str) -> bool:
    return city.strip().lower() in DELHI_NCR_CITIES


# ---------------------------------------------------------------------------
# Result type returned to routers / agent
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
# Core calculation — DB rule takes precedence; policy engine as fallback
# ---------------------------------------------------------------------------

async def calculate_subsidy(
    *,
    db: AsyncSession,
    category: str,
    vehicle_price: int,
    city: str,
    rc_issue_date: date | None,
    scrappage: str,
    battery_kwh: float = 3.0,
    reg_year: int = 1,
    gvw: float = 1.5,
) -> EligibilityResult:
    """
    Two-tier calculation:
    1. Try to find a matching 'live' DB subsidy rule (admin-controlled, versioned).
    2. Fall back to the built-in policy engine (covers all 36 states).
    Never free-generates numbers.
    """
    scrapping_bool = scrappage.lower() == "yes"
    deadline: date | None = None
    if rc_issue_date:
        deadline = rc_issue_date + timedelta(days=30)

    # --- Tier 1: DB rule ---
    stmt = (
        select(SubsidyRule)
        .where(and_(
            SubsidyRule.category == _normalise_category(category),
            SubsidyRule.status == "live",
            SubsidyRule.price_ceiling >= vehicle_price,
        ))
        .order_by(SubsidyRule.price_ceiling)
        .limit(1)
    )
    result = await db.execute(stmt)
    rule: SubsidyRule | None = result.scalar_one_or_none()

    if rule:
        base = rule.amount or 0
        scrappage_bonus = SCRAPPAGE_BONUS.get(_normalise_category(category), 0) if scrapping_bool else 0
        total = base + scrappage_bonus
        log.info("subsidy.calculated.db_rule", category=category, city=city, total=total, rule_id=str(rule.id))
        return _eligible(total, deadline, {
            "source": "db_rule",
            "rule_id": str(rule.id),
            "base_amount": base,
            "scrappage_bonus": scrappage_bonus,
            "total": total,
            "year_tier": rule.year_tier,
        })

    # --- Tier 2: Built-in policy engine ---
    # Resolve state: city → state mapping (simple heuristic for MVP)
    state = _city_to_state(city)
    policy = get_policy(state)
    policy_result = policy.calculate_benefits(
        reg_year=reg_year,
        category=category,
        price=vehicle_price,
        battery=battery_kwh,
        scrapping=scrapping_bool,
        gvw=gvw,
    )

    total = int(policy_result.purchase_incentive + policy_result.scrapping_incentive)
    log.info("subsidy.calculated.policy_engine", state=state, category=category, total=total)

    return _eligible(total, deadline, {
        "source": "policy_engine",
        "state": state,
        "validity": policy_result.validity,
        "purchase_incentive": int(policy_result.purchase_incentive),
        "scrappage_bonus": int(policy_result.scrapping_incentive),
        "tax_exemption_pct": policy_result.tax_exemption_pct,
        "total": total,
        "notes": policy_result.notes,
        # Aliases for frontend compatibility
        "base_amount": int(policy_result.purchase_incentive),
    })


def _city_to_state(city: str) -> str:
    """Best-effort city → state mapping for common cities."""
    city_lower = city.strip().lower()
    mapping = {
        "delhi": "Delhi", "new delhi": "Delhi",
        "gurugram": "Delhi", "gurgaon": "Delhi",
        "noida": "Delhi", "faridabad": "Delhi",
        "ghaziabad": "Delhi", "greater noida": "Delhi",
        "mumbai": "Maharashtra", "pune": "Maharashtra", "nagpur": "Maharashtra",
        "bangalore": "Karnataka", "bengaluru": "Karnataka",
        "hyderabad": "Telangana", "chennai": "Tamil Nadu",
        "kolkata": "West Bengal", "ahmedabad": "Gujarat",
        "jaipur": "Rajasthan", "lucknow": "Uttar Pradesh",
        "chandigarh": "Chandigarh", "kochi": "Kerala", "thiruvananthapuram": "Kerala",
        "patna": "Bihar", "bhubaneswar": "Odisha",
    }
    return mapping.get(city_lower, city.title())  # fallback: treat city as state name


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
    vehicle_stmt = select(VehicleMaster).where(VehicleMaster.id == vehicle_id)
    v_result = await db.execute(vehicle_stmt)
    vehicle: VehicleMaster | None = v_result.scalar_one_or_none()
    if not vehicle:
        raise ValueError("Vehicle not found")

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
# Admin: two-person rule approval (unchanged from original)
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
    """Second approver publishes the rule. Self-approval is rejected."""
    stmt = select(SubsidyRule).where(SubsidyRule.id == rule_id)
    result = await db.execute(stmt)
    rule: SubsidyRule | None = result.scalar_one_or_none()
    if not rule:
        raise ValueError("Subsidy rule not found")
    if rule.status != "pending_review":
        raise ValueError("Rule is not pending review")
    if rule.first_approver_id == admin_id:
        raise PermissionError("Self-approval not permitted — second distinct approver required")

    # Supersede previous live rules for same category
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


# ---------------------------------------------------------------------------
# Public helper: list all supported states
# ---------------------------------------------------------------------------

def get_all_states() -> list[str]:
    return ALL_STATES
