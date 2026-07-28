"""Notification dispatch Celery task — multi-channel send."""
from __future__ import annotations

import asyncio
import uuid
from typing import Any

import structlog

from celery_app import celery_app

log = structlog.get_logger(__name__)


@celery_app.task(
    name="app.tasks.notification_dispatch.dispatch_notification",
    bind=True,
    max_retries=5,
    default_retry_delay=30,
)
def dispatch_notification(
    self,
    user_id: str,
    channel: str,
    notification_type: str,
    payload: dict[str, Any],
) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _async_dispatch(uuid.UUID(user_id), channel, notification_type, payload)
    )


async def _async_dispatch(
    user_id: uuid.UUID,
    channel: str,
    notification_type: str,
    payload: dict[str, Any],
) -> dict:
    from app.db.session import AsyncSessionLocal
    from app.models.user import User
    from app.services.notification_service import (
        create_notification,
        dispatch_sms,
        dispatch_whatsapp,
        dispatch_push,
        dispatch_email,
        mark_sent,
    )
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        user_stmt = select(User).where(User.id == user_id)
        result = await db.execute(user_stmt)
        user = result.scalar_one_or_none()
        if not user:
            log.error("notification.user_not_found", user_id=str(user_id))
            return {"status": "error", "reason": "user_not_found"}

        notif = await create_notification(
            db=db,
            user_id=user_id,
            channel=channel,
            notification_type=notification_type,
            payload=payload,
        )

        try:
            if channel == "sms":
                dispatch_sms(user.phone, _render_message(notification_type, payload))
            elif channel == "whatsapp":
                dispatch_whatsapp(user.phone, notification_type, payload)
            elif channel == "push":
                dispatch_push(payload.get("device_token", ""), payload.get("title", ""), payload.get("body", ""))
            elif channel == "email" and user.email:
                dispatch_email(user.email, payload.get("subject", "WhyEV Update"), payload.get("html", ""))

            await mark_sent(db=db, notif=notif)
            await db.commit()
            log.info("notification.sent", notif_id=str(notif.id), channel=channel)
            return {"status": "sent", "notification_id": str(notif.id)}

        except Exception as exc:
            log.exception("notification.dispatch_failed", channel=channel)
            raise self.retry(exc=exc)


def _render_message(notification_type: str, payload: dict[str, Any]) -> str:
    if notification_type == "subsidy_deadline_reminder":
        days = payload.get("days_left", "?")
        amount = payload.get("amount", "?")
        return (
            f"WhyEV Reminder: Your EV subsidy application of ₹{amount:,} "
            f"must be filed in {days} days. Log in now to complete it."
        )
    return "You have a new update on WhyEV."
