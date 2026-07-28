"""FastAPI dependency injectors: DB session, Redis, current user."""
from __future__ import annotations

import uuid
from typing import Annotated, AsyncGenerator

import redis.asyncio as aioredis
import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import AsyncSessionLocal

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# DB Session
# ---------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


DBSession = Annotated[AsyncSession, Depends(get_db)]

# ---------------------------------------------------------------------------
# Redis
# ---------------------------------------------------------------------------

_redis_pool: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
        )
    return _redis_pool


RedisConn = Annotated[aioredis.Redis, Depends(get_redis)]

# ---------------------------------------------------------------------------
# Auth dependencies
# ---------------------------------------------------------------------------

_bearer = HTTPBearer(auto_error=True)

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    redis: RedisConn,
) -> uuid.UUID:
    """Validate JWT and return the authenticated user's UUID."""
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise _CREDENTIALS_EXCEPTION

    if payload.get("type") != "access":
        raise _CREDENTIALS_EXCEPTION

    sub = payload.get("sub")
    if not sub:
        raise _CREDENTIALS_EXCEPTION

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise _CREDENTIALS_EXCEPTION


async def get_current_admin_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    redis: RedisConn,
) -> uuid.UUID:
    """Like get_current_user_id but also asserts role=admin claim."""
    user_id = await get_current_user_id(credentials, redis)
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise _CREDENTIALS_EXCEPTION

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user_id


CurrentUser = Annotated[uuid.UUID, Depends(get_current_user_id)]
AdminUser = Annotated[uuid.UUID, Depends(get_current_admin_user_id)]
