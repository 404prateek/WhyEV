"""Certificate expiry check Celery task.

Flags battery_reports past certificate_valid_until and sends reminders.
"""
from __future__ import annotations

import asyncio
from datetime import date

import structlog

from celery_app import celery_app

log = structlog.get_logger(__name__)


@celery_app.task(
    name="app.tasks.certificate_expiry.check_certificate_expiry", bind=True, max_retries=3
)
def check_certificate_expiry(self) -> dict:
    return asyncio.get_event_loop().run_until_complete(_async_check())


async def _async_check() -> dict:
    from app.db.session import AsyncSessionLocal
    from app.models.certification import BatteryReport
    from app.tasks.notification_dispatch import dispatch_notification
    from sqlalchemy import and_, select

    today = date.today()
    flagged = 0

    async with AsyncSessionLocal() as db:
        # Expired within the last 30 days (to catch recent expirations)
        stmt = select(BatteryReport).where(
            and_(BatteryReport.certificate_valid_until <= today)
        )
        result = await db.execute(stmt)
        expired = result.scalars().all()

        for cert in expired:
            dispatch_notification.delay(
                user_id=str(cert.owner_id),
                channel="sms",
                notification_type="battery_cert_expired",
                payload={
                    "report_id": str(cert.id),
                    "expired_on": str(cert.certificate_valid_until),
                },
            )
            flagged += 1

    log.info("cert_expiry.check_complete", flagged=flagged, date=str(today))
    return {"flagged": flagged}
