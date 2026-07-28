"""Subsidy router — calculation, rule management, and application lifecycle."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.subsidy import SubsidyApplication, SubsidyRule
from app.schemas.subsidy import (
    SubsidyApplicationCreateIn,
    SubsidyApplicationOut,
    SubsidyCalcIn,
    SubsidyCalcOut,
    SubsidyBreakdown,
    SubsidyRuleOut,
)
from app.services.eligibility_service import (
    calculate_subsidy,
    create_application,
)

router = APIRouter()


@router.post("/subsidy/calculate", response_model=SubsidyCalcOut)
async def calculate_subsidy_endpoint(
    body: SubsidyCalcIn, user_id: CurrentUser, db: DBSession
) -> SubsidyCalcOut:
    # Resolve vehicle price
    vehicle_price = body.price or 0
    if body.vehicle_id:
        from app.models.vehicle import VehicleMaster
        stmt = select(VehicleMaster).where(VehicleMaster.id == body.vehicle_id)
        result = await db.execute(stmt)
        v = result.scalar_one_or_none()
        if not v:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        vehicle_price = v.price or 0
        category = v.category or body.category
    else:
        category = body.category

    res = await calculate_subsidy(
        db=db,
        category=category,
        vehicle_price=vehicle_price,
        city=body.city,
        rc_issue_date=body.rc_issue_date,
        scrappage=body.scrappage,
    )

    breakdown = None
    if res.breakdown:
        breakdown = SubsidyBreakdown(
            base_amount=res.breakdown["base_amount"],
            scrappage_bonus=res.breakdown["scrappage_bonus"],
            total=res.breakdown["total"],
        )

    return SubsidyCalcOut(
        eligible=res.eligible,
        reason=res.reason,
        amount_breakdown=breakdown,
        deadline=res.deadline,
    )


@router.get("/subsidy/rules/current", response_model=list[SubsidyRuleOut])
async def get_current_rules(db: DBSession) -> list[SubsidyRuleOut]:
    """Public endpoint — no auth required."""
    stmt = select(SubsidyRule).where(SubsidyRule.status == "live")
    result = await db.execute(stmt)
    return [SubsidyRuleOut.model_validate(r) for r in result.scalars().all()]


@router.post("/subsidy/applications", response_model=SubsidyApplicationOut, status_code=201)
async def create_subsidy_application(
    body: SubsidyApplicationCreateIn, user_id: CurrentUser, db: DBSession
) -> SubsidyApplicationOut:
    app = await create_application(
        db=db,
        user_id=user_id,
        vehicle_id=body.vehicle_id,
        registration_state=body.registration_state,
        rc_issue_date=body.rc_issue_date,
        scrappage_tradein=body.scrappage_tradein,
    )
    return SubsidyApplicationOut.model_validate(app)


@router.get("/subsidy/applications/{application_id}", response_model=SubsidyApplicationOut)
async def get_application(
    application_id: uuid.UUID, user_id: CurrentUser, db: DBSession
) -> SubsidyApplicationOut:
    stmt = select(SubsidyApplication).where(
        SubsidyApplication.id == application_id,
        SubsidyApplication.user_id == user_id,
    )
    result = await db.execute(stmt)
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return SubsidyApplicationOut.model_validate(app)


@router.post("/subsidy/applications/{application_id}/documents", status_code=202)
async def upload_documents(
    application_id: uuid.UUID,
    user_id: CurrentUser,
    db: DBSession,
    files: list[UploadFile] = File(...),
) -> dict:
    """Accept document uploads and queue for S3 processing."""
    stmt = select(SubsidyApplication).where(
        SubsidyApplication.id == application_id,
        SubsidyApplication.user_id == user_id,
    )
    result = await db.execute(stmt)
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # TODO: upload files to S3 via background task
    app.status = "documents_pending"
    await db.flush()
    return {"accepted": len(files), "message": "Documents queued for processing"}
