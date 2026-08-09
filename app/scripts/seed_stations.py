"""Seed EV Charging Stations script for WhyEV."""
from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.db.base import Base
from app.services.ingestion_service import seed_from_json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def get_working_engine():
    db_url = settings.DATABASE_URL
    try:
        engine = create_async_engine(db_url, pool_pre_ping=True)
        async with engine.begin() as conn:
            await conn.run_sync(lambda _: None)
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to primary DATABASE_URL ({db_url}): {e}")
        logger.info("Falling back to local SQLite database: sqlite+aiosqlite:///./whyev.db")
        sqlite_engine = create_async_engine("sqlite+aiosqlite:///./whyev.db")
        return sqlite_engine


async def main():
    logger.info("Initializing database connection...")
    engine = await get_working_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as db:
        logger.info("Seeding stations from delhi ncr ev stations.json...")
        count = await seed_from_json(db)
        logger.info(f"SUCCESS: Ingested {count} EV charging stations with initial reliability scores!")


if __name__ == "__main__":
    asyncio.run(main())
