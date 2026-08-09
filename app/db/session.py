from __future__ import annotations

import logging
import socket
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_host_reachable(url_str: str) -> bool:
    try:
        parsed = urlparse(url_str.replace("postgresql+asyncpg://", "http://"))
        host = parsed.hostname
        port = parsed.port or 5432
        if not host:
            return False
        # Socket connection test with 3.0 second timeout
        with socket.create_connection((host, port), timeout=3.0):
            return True
    except Exception:
        return False


def get_engine():
    db_url = settings.DATABASE_URL
    if "sqlite" in db_url:
        return create_async_engine(db_url)

    # Try PostgreSQL first if host is reachable
    if _is_host_reachable(db_url):
        try:
            return create_async_engine(
                db_url,
                echo=settings.DEBUG,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
            )
        except Exception as e:
            logger.warning(f"Failed to create PostgreSQL engine: {e}. Falling back to SQLite.")

    # Try creating PostgreSQL engine anyway if configured
    try:
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    except Exception as exc:
        logger.info(f"Primary PostgreSQL database host is unreachable ({exc}). Using local SQLite database (whyev.db).")
        return create_async_engine("sqlite+aiosqlite:///./whyev.db")


engine = get_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)
