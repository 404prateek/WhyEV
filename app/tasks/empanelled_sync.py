"""Empanelled model sync Celery task.

Refreshes vehicles_master.is_empanelled against the Model Approval Committee list.
Never hardcodes the list in application code.
"""
from __future__ import annotations

import asyncio

import structlog

from celery_app import celery_app

log = structlog.get_logger(__name__)


@celery_app.task(name="app.tasks.empanelled_sync.sync_empanelled_models", bind=True, max_retries=3)
def sync_empanelled_models(self) -> dict:
    return asyncio.get_event_loop().run_until_complete(_async_sync())


async def _async_sync() -> dict:
    from datetime import datetime, timezone

    from app.db.session import AsyncSessionLocal
    from app.models.vehicle import VehicleMaster
    from sqlalchemy import select

    # Fetch approved model IDs from MAC portal
    approved_ids = await _fetch_approved_model_ids()

    updated = 0
    async with AsyncSessionLocal() as db:
        stmt = select(VehicleMaster)
        result = await db.execute(stmt)
        vehicles = result.scalars().all()

        for v in vehicles:
            should_be = str(v.id) in approved_ids
            if v.is_empanelled != should_be:
                v.is_empanelled = should_be
                v.empanelled_synced_at = datetime.now(timezone.utc)
                updated += 1

        await db.commit()

    log.info("empanelled_sync.complete", updated=updated, total=len(vehicles))
    return {"updated": updated, "total_checked": len(vehicles)}


async def _fetch_approved_model_ids() -> set[str]:
    """Stub — replace with MAC portal API call or file download."""
    # In production, hit the FAME/MAC portal endpoint
    return set()
