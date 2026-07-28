"""Deadline reminder Celery task.

Flags subsidy_applications approaching the 30-day RC filing window
at day 20, 25, and 29 and enqueues notification dispatch.
"""
from __future__ import annotations

import asyncio
from datetime import date, timedelta

import structlog
from sqlalchemy import and_, select

from celery_app import celery_app

log = structlog.get_logger(__name__)

_REMINDER_DAYS = [20, 25, 29]


@celery_app.task(name="app.tasks.deadline_reminder.check_deadlines", bind=True, max_retries=3)
def check_deadlines(self) -> dict:
    return asyncio.get_event_loop().run_until_complete(_async_check_deadlines())


async def _async_check_deadlines() -> dict:
    from app.db.session import AsyncSessionLocal
    from app.models.subsidy import SubsidyApplication
    from app.tasks.notification_dispatch import dispatch_notification

    today = date.today()
    flagged = 0

    async with AsyncSessionLocal() as db:
        for days_elapsed in _REMINDER_DAYS:
            target_deadline = today + timedelta(days=(30 - days_elapsed))
            stmt = select(SubsidyApplication).where(
                and_(
                    SubsidyApplication.filing_deadline == target_deadline,
                    SubsidyApplication.status.in_(["calculated", "documents_pending"]),
                )
            )
            result = await db.execute(stmt)
            apps = result.scalars().all()

            for app in apps:
                days_left = (app.filing_deadline - today).days
                dispatch_notification.delay(
                    user_id=str(app.user_id),
                    channel="whatsapp",
                    notification_type="subsidy_deadline_reminder",
                    payload={
                        "application_id": str(app.id),
                        "days_left": days_left,
                        "filing_deadline": str(app.filing_deadline),
                        "amount": app.amount_calculated,
                    },
                )
                flagged += 1
                log.info("deadline.reminder.sent", app_id=str(app.id), days_left=days_left)

    return {"flagged": flagged, "date": str(today)}
