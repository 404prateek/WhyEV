"""Admin router — leads, certifications, analytics, and subsidy scheme approval."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.core.deps import AdminUser, DBSession
from app.models.certification import BatteryReport
from app.models.dealer import DealerLead
from app.models.subsidy import SubsidyRule
from app.models.user import User
from app.schemas.misc import BatteryReportOut
from app.schemas.dealer import LeadOut
from app.schemas.subsidy import SubsidyRuleOut
from app.services.eligibility_service import approve_rule, submit_rule_for_review

router = APIRouter(prefix="/admin")


@router.get("/leads", response_model=list[LeadOut])
async def admin_list_leads(
    admin_id: AdminUser,
    db: DBSession,
    limit: int = 50,
    offset: int = 0,
) -> list[LeadOut]:
    stmt = select(DealerLead).order_by(DealerLead.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [LeadOut.model_validate(lead) for lead in result.scalars().all()]


@router.get("/certifications", response_model=list[BatteryReportOut])
async def admin_list_certifications(
    admin_id: AdminUser,
    db: DBSession,
    limit: int = 50,
    offset: int = 0,
) -> list[BatteryReportOut]:
    stmt = (
        select(BatteryReport).order_by(BatteryReport.created_at.desc()).limit(limit).offset(offset)
    )
    result = await db.execute(stmt)
    return [BatteryReportOut.model_validate(r) for r in result.scalars().all()]


@router.get("/analytics/overview")
async def analytics_overview(admin_id: AdminUser, db: DBSession) -> dict:
    user_count = await db.scalar(select(func.count(User.id)))
    lead_count = await db.scalar(select(func.count(DealerLead.id)))
    cert_count = await db.scalar(select(func.count(BatteryReport.id)))
    return {
        "total_users": user_count,
        "total_leads": lead_count,
        "total_certifications": cert_count,
    }


@router.get("/schemes", response_model=list[SubsidyRuleOut])
async def list_all_schemes(admin_id: AdminUser, db: DBSession) -> list[SubsidyRuleOut]:
    stmt = select(SubsidyRule).order_by(SubsidyRule.created_at.desc())
    result = await db.execute(stmt)
    return [SubsidyRuleOut.model_validate(r) for r in result.scalars().all()]


@router.post("/schemes/{rule_id}/submit-for-review", response_model=SubsidyRuleOut)
async def submit_scheme_for_review(
    rule_id: uuid.UUID, admin_id: AdminUser, db: DBSession
) -> SubsidyRuleOut:
    """First admin submits a draft rule for the two-person approval workflow."""
    try:
        rule = await submit_rule_for_review(db=db, rule_id=rule_id, admin_id=admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return SubsidyRuleOut.model_validate(rule)


@router.post("/schemes/{rule_id}/approve", response_model=SubsidyRuleOut)
async def approve_scheme(
    rule_id: uuid.UUID, admin_id: AdminUser, db: DBSession
) -> SubsidyRuleOut:
    """Second distinct admin approves — single-approver self-approval is rejected at service layer."""
    try:
        rule = await approve_rule(db=db, rule_id=rule_id, admin_id=admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    return SubsidyRuleOut.model_validate(rule)
