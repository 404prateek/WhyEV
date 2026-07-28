"""Battery certification router."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.certification import BatteryReport
from app.schemas.misc import BatteryReportOut, CertificationRequestIn
from app.services.certification_service import generate_qr_image, request_certification

router = APIRouter()


@router.post("/certification/request", response_model=BatteryReportOut, status_code=201)
async def create_certification(
    body: CertificationRequestIn,
    user_id: CurrentUser,
    db: DBSession,
    rc_photo: UploadFile | None = File(None),
) -> BatteryReportOut:
    rc_key = None
    if rc_photo:
        # TODO: upload rc_photo to S3 and get the key
        rc_key = f"rc/{user_id}/{rc_photo.filename}"

    report = await request_certification(
        db=db,
        owner_id=user_id,
        model_id=body.model_id,
        year=body.year,
        odometer=body.odometer,
        rc_photo_s3_key=rc_key,
    )
    return BatteryReportOut.model_validate(report)


@router.get("/certification/{report_id}", response_model=BatteryReportOut)
async def get_certification(
    report_id: uuid.UUID, user_id: CurrentUser, db: DBSession
) -> BatteryReportOut:
    stmt = select(BatteryReport).where(
        BatteryReport.id == report_id, BatteryReport.owner_id == user_id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return BatteryReportOut.model_validate(report)


@router.get("/certification/{qr_code}/verify")
async def verify_certificate_by_qr(qr_code: str, db: DBSession) -> dict:
    """Public endpoint — QR scan target. No auth required."""
    stmt = select(BatteryReport).where(BatteryReport.qr_code == qr_code)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Invalid or expired certificate")
    return {
        "valid": True,
        "battery_score": report.battery_score,
        "remaining_life_years": float(report.remaining_life_years or 0),
        "certificate_valid_until": str(report.certificate_valid_until),
        "inspection_date": str(report.inspection_date),
    }
