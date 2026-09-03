from __future__ import annotations

import logging
import socket
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_host_reachable(url_str: str) -> bool:
    """Return True only if the TCP connection to the DB host succeeds within 2s.

    Catches ALL exceptions (including OSError errno 101 'Network is unreachable'
    which occurs on Render when outbound port 5432 is blocked) and returns False
    rather than propagating the error.
    """
    try:
        parsed = urlparse(url_str.replace("postgresql+asyncpg://", "http://"))
        host = parsed.hostname
        port = parsed.port or 5432
        if not host:
            return False
        # Short timeout — if unreachable we want to fail fast
        with socket.create_connection((host, port), timeout=2.0):
            return True
    except OSError as exc:
        # Includes errno 101 (Network is unreachable), ECONNREFUSED, etc.
        logger.info("[session] DB host not reachable via TCP: %s — will try engine anyway", exc)
        return False
    except Exception as exc:
        logger.info("[session] DB reachability check failed: %s", exc)
        return False


def _make_sqlite_engine():
    """Return a synchronous-safe SQLite async engine as the fallback."""
    logger.warning(
        "[session] PostgreSQL unreachable — falling back to SQLite (whyev.db). "
        "Check DATABASE_URL on Render and ensure the Supabase pooler URL (port 6543) is set."
    )
    return create_async_engine(
        "sqlite+aiosqlite:///./whyev.db",
        echo=settings.DEBUG,
    )


def get_engine():
    """Create the async SQLAlchemy engine.

    Priority:
    1. SQLite — if DATABASE_URL already points to SQLite
    2. PostgreSQL (asyncpg) — using DATABASE_URL from settings
    3. SQLite fallback — if PostgreSQL engine creation fails for any reason

    This function is intentionally fault-tolerant: any network or config error
    results in a SQLite fallback rather than a startup crash.
    """
    db_url = settings.DATABASE_URL

    # --- Case 1: already a SQLite URL ---
    if "sqlite" in db_url:
        return create_async_engine(db_url, echo=settings.DEBUG)

    # --- Case 2: PostgreSQL ---
    # Always attempt to create the asyncpg engine regardless of TCP reachability.
    # On Render, asyncpg uses a different network path than the raw socket test,
    # so the reachability probe is advisory only — we still try the real engine.
    # If Render blocks port 5432 (direct) use port 6543 (Supabase Transaction Pooler).
    reachable = _is_host_reachable(db_url)
    logger.info("[session] PostgreSQL TCP probe: %s", "reachable" if reachable else "not reachable (will try anyway)")

    try:
        pg_engine = create_async_engine(
            db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            # Conservative pool for Render free tier (limited connections)
            pool_size=5,
            max_overflow=10,
            # Kill idle connections after 60 s to avoid Supabase idle timeout
            pool_recycle=60,
        )
        logger.info("[session] PostgreSQL engine created (connection tested lazily at first query).")
        return pg_engine
    except Exception as exc:
        logger.error("[session] Failed to create PostgreSQL engine: %s — using SQLite fallback.", exc)
        return _make_sqlite_engine()


engine = get_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)
