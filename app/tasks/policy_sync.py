"""Policy sync Celery task.

Checks for subsidy policy changes and creates a draft SubsidyRule if a diff
is detected.  NEVER auto-publishes — admin two-person review is required.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
from datetime import date

import structlog

from celery_app import celery_app

log = structlog.get_logger(__name__)


@celery_app.task(name="app.tasks.policy_sync.sync_policies", bind=True, max_retries=3)
def sync_policies(self) -> dict:
    return asyncio.get_event_loop().run_until_complete(_async_sync_policies())


async def _async_sync_policies() -> dict:
    """
    Fetch the policy source (Transport Dept portal or internal config),
    diff against current live rules, create draft rows on change.

    In production, replace _fetch_remote_policy() with actual API/scraper.
    """
    from app.db.session import AsyncSessionLocal
    from app.models.subsidy import SubsidyRule
    from sqlalchemy import select

    remote = await _fetch_remote_policy()
    new_drafts = 0

    async with AsyncSessionLocal() as db:
        for rule_data in remote:
            # Check if this exact rule already exists (by hash)
            rule_hash = _hash_rule(rule_data)
            stmt = select(SubsidyRule).where(
                SubsidyRule.category == rule_data["category"],
                SubsidyRule.status.in_(["live", "pending_review", "draft"]),
            )
            result = await db.execute(stmt)
            existing = result.scalars().all()

            hashes = {_hash_existing(r) for r in existing}
            if rule_hash not in hashes:
                # New policy detected — create a draft (never auto-publish)
                draft = SubsidyRule(
                    category=rule_data["category"],
                    year_tier=rule_data.get("year_tier"),
                    amount=rule_data.get("amount"),
                    price_ceiling=rule_data.get("price_ceiling"),
                    effective_from=date.fromisoformat(rule_data["effective_from"]),
                    status="draft",
                )
                db.add(draft)
                new_drafts += 1
                log.info("policy_sync.draft_created", category=draft.category, amount=draft.amount)

        await db.commit()

    return {"new_drafts": new_drafts, "checked": len(remote)}


async def _fetch_remote_policy() -> list[dict]:
    """Stub — replace with actual Transport Dept API call or HTML scraper."""
    return []


def _hash_rule(rule_data: dict) -> str:
    canonical = json.dumps(
        {k: rule_data.get(k) for k in ["category", "year_tier", "amount", "price_ceiling"]},
        sort_keys=True,
    )
    return hashlib.sha256(canonical.encode()).hexdigest()


def _hash_existing(rule) -> str:
    return _hash_rule(
        {
            "category": rule.category,
            "year_tier": rule.year_tier,
            "amount": rule.amount,
            "price_ceiling": rule.price_ceiling,
        }
    )
