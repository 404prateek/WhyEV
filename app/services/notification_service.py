"""Notification service — multi-channel dispatch (push/WhatsApp/SMS/email)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification

log = structlog.get_logger(__name__)


async def create_notification(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    channel: str,
    notification_type: str,
    payload: dict[str, Any],
) -> Notification:
    notif = Notification(
        user_id=user_id,
        channel=channel,
        type=notification_type,
        payload=payload,
    )
    db.add(notif)
    await db.flush()
    return notif


async def mark_sent(*, db: AsyncSession, notif: Notification) -> None:
    notif.sent_at = datetime.now(timezone.utc)
    await db.flush()


async def mark_read(*, db: AsyncSession, notif: Notification) -> None:
    notif.read_at = datetime.now(timezone.utc)
    await db.flush()


# ---------------------------------------------------------------------------
# Gateway dispatch stubs (wired to Celery tasks in production)
# ---------------------------------------------------------------------------

def dispatch_sms(phone: str, message: str) -> None:
    """Enqueue an SMS via MSG91/Twilio — called from Celery task."""
    log.info("sms.dispatch", phone=phone[:4] + "****")
    # TODO: integrate MSG91 / Twilio SDK


def dispatch_whatsapp(phone: str, template: str, params: dict[str, Any]) -> None:
    log.info("whatsapp.dispatch", phone=phone[:4] + "****", template=template)
    # TODO: integrate WhatsApp Business API


def dispatch_push(device_token: str, title: str, body: str) -> None:
    log.info("push.dispatch", device_token=device_token[:8] + "****")
    # TODO: integrate Firebase FCM


def dispatch_email(to: str, subject: str, html: str) -> None:
    log.info("email.dispatch", to=to.split("@")[0] + "@***")
    # TODO: integrate SendGrid / SES
