"""Celery application instance and Beat schedule."""
from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "whyev",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.deadline_reminder",
        "app.tasks.policy_sync",
        "app.tasks.notification_dispatch",
        "app.tasks.empanelled_sync",
        "app.tasks.certificate_expiry",
        "app.tasks.carsearch_sync",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,  # fair dispatch for long-running tasks
)

# ---------------------------------------------------------------------------
# Beat schedule (cron jobs — spec §8)
# ---------------------------------------------------------------------------

celery_app.conf.beat_schedule = {
    # Daily: sync scraped carsearch pricing & specs into vehicles_master
    "carsearch_pricing_specs_sync": {
        "task": "app.tasks.carsearch_sync.sync_carsearch_pricing_specs",
        "schedule": crontab(hour=2, minute=30),  # 2:30 AM IST
    },
    # Hourly: flag subsidy applications at day 20/25/29
    "deadline_reminder_check": {
        "task": "app.tasks.deadline_reminder.check_deadlines",
        "schedule": crontab(minute=0),  # every hour
    },
    # Daily: check for policy changes → create draft rules
    "policy_sync": {
        "task": "app.tasks.policy_sync.sync_policies",
        "schedule": crontab(hour=3, minute=0),  # 3 AM IST
    },
    # Daily: refresh empanelled model list
    "empanelled_model_sync": {
        "task": "app.tasks.empanelled_sync.sync_empanelled_models",
        "schedule": crontab(hour=4, minute=0),  # 4 AM IST
    },
    # Daily: flag expired battery certificates
    "certificate_expiry_check": {
        "task": "app.tasks.certificate_expiry.check_certificate_expiry",
        "schedule": crontab(hour=5, minute=0),  # 5 AM IST
    },
}
