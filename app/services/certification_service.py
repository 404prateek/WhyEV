"""Certification service — battery health report + QR code + PDF generation."""
from __future__ import annotations

import io
import secrets
import uuid
from datetime import date, timedelta

import qrcode
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.certification import BatteryReport
from app.models.vehicle import VehicleMaster

log = structlog.get_logger(__name__)


def _compute_battery_score(year: int, odometer: int) -> tuple[int, float]:
    """
    Simplified scoring model for v1.
    In production, integrate with a real battery diagnostics API.
    """
    age = max(0, date.today().year - year)
    km_degradation = odometer / 100_000 * 20   # 20 pts per 1 lakh km
    age_degradation = age * 4                   # 4 pts per year
    score = max(0, min(100, 100 - int(km_degradation + age_degradation)))
    remaining = round(max(0.0, (score / 100) * 8.0), 1)  # max 8 years
    return score, remaining


async def request_certification(
    *,
    db: AsyncSession,
    owner_id: uuid.UUID,
    model_id: uuid.UUID,
    year: int,
    odometer: int,
    rc_photo_s3_key: str | None = None,
) -> BatteryReport:
    """Create a battery report with computed score + 2-year certificate validity."""
    vehicle_stmt = select(VehicleMaster).where(VehicleMaster.id == model_id)
    v_result = await db.execute(vehicle_stmt)
    vehicle: VehicleMaster | None = v_result.scalar_one_or_none()
    if not vehicle:
        raise ValueError("Vehicle model not found")

    score, remaining = _compute_battery_score(year, odometer)
    qr = secrets.token_urlsafe(32)[:64]
    valid_until = date.today() + timedelta(days=730)  # 2 years

    report = BatteryReport(
        owner_id=owner_id,
        vehicle_model_id=model_id,
        inspection_date=date.today(),
        battery_score=score,
        remaining_life_years=remaining,
        certificate_valid_until=valid_until,
        qr_code=qr,
    )
    db.add(report)
    await db.flush()

    log.info(
        "certification.created",
        report_id=str(report.id),
        score=score,
        remaining=remaining,
        qr=qr,
    )
    return report


def generate_qr_image(qr_code: str, base_url: str) -> bytes:
    """Return PNG bytes for the QR code pointing to the public verify endpoint."""
    verify_url = f"{base_url}/api/v1/certification/{qr_code}/verify"
    img = qrcode.make(verify_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
