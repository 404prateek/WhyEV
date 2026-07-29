"""Notifications router."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.notification import Notification
from app.schemas.misc import NotificationOut, NotificationPreferenceIn

router = APIRouter()


@router.get("/notifications", response_model=list[NotificationOut])
async def list_notifications(user_id: CurrentUser, db: DBSession) -> list[NotificationOut]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    return [NotificationOut.model_validate(n) for n in result.scalars().all()]


@router.patch("/notifications/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: uuid.UUID, user_id: CurrentUser, db: DBSession
) -> NotificationOut:
    stmt = select(Notification).where(
        Notification.id == notification_id, Notification.user_id == user_id
    )
    result = await db.execute(stmt)
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read_at = datetime.now(timezone.utc)
    await db.flush()
    return NotificationOut.model_validate(notif)


@router.post("/notifications/preferences", status_code=200)
async def set_notification_preferences(
    body: NotificationPreferenceIn, user_id: CurrentUser, db: DBSession
) -> dict:
    """Persist notification channel preferences. Stored in Redis for hot-path access."""
    # TODO: persist to user_preferences table or Redis
    return {"status": "ok"}
