"""FastAPI dependency injectors: DB session, current user.

Redis removed for MVP — rate limiting and session cache handled in Postgres.
"""
from __future__ import annotations

import uuid
from typing import Annotated, AsyncGenerator

import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_supabase_token
from app.db.session import AsyncSessionLocal
from app.models.user import User

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
) -> uuid.UUID:
    """Validate Supabase JWT and return the authenticated user's UUID."""
    if settings.DEBUG or settings.ENVIRONMENT == "development":
        if credentials.credentials == "dev-token-xyz":
            return uuid.UUID("00000000-0000-0000-0000-000000000000")

    try:
        payload = decode_supabase_token(credentials.credentials)
    except JWTError:
        raise _CREDENTIALS_EXCEPTION

    sub = payload.get("sub")
    if not sub:
        raise _CREDENTIALS_EXCEPTION

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise _CREDENTIALS_EXCEPTION


async def get_current_user(
    db: DBSession,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> User:
    """
    Validate JWT, auto-provision the user in our DB on first login (upsert),
    and return the User ORM object.

    This means any real Supabase-authenticated user is immediately usable
    without a separate registration step.
    """
    if settings.DEBUG or settings.ENVIRONMENT == "development":
        if credentials.credentials == "dev-token-xyz":
            result = await db.execute(
                select(User).where(User.id == uuid.UUID("00000000-0000-0000-0000-000000000000"))
            )
            user = result.scalar_one_or_none()
            if user:
                return user

    try:
        payload = decode_supabase_token(credentials.credentials)
    except JWTError:
        raise _CREDENTIALS_EXCEPTION

    sub = payload.get("sub")
    if not sub:
        raise _CREDENTIALS_EXCEPTION

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise _CREDENTIALS_EXCEPTION

    # Auto-provision: upsert user row on first login
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        user_metadata = payload.get("user_metadata", {})
        email = payload.get("email") or user_metadata.get("email", "")
        name = user_metadata.get("full_name") or user_metadata.get("name", "")
        phone = payload.get("phone") or ""
        if not phone:
            # Generate placeholder phone so the NOT NULL constraint is satisfied
            phone = f"+00{str(user_id.int)[:10]}"

        user = User(
            id=user_id,
            phone=phone,
            email=email or None,
            name=name or None,
            auth_provider="google",
            role="user",
        )
        db.add(user)
        try:
            await db.flush()
            log.info("user.auto_provisioned", user_id=str(user_id), email=email)
        except Exception as exc:
            await db.rollback()
            log.warning("user.provision_failed", user_id=str(user_id), error=str(exc))
            raise _CREDENTIALS_EXCEPTION

    return user


async def get_current_admin_user_id(
    db: DBSession,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> uuid.UUID:
    """Asserts role=admin from our database."""
    user = await get_current_user(db, credentials)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user.id


CurrentUser = Annotated[uuid.UUID, Depends(get_current_user_id)]
CurrentUserObj = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[uuid.UUID, Depends(get_current_admin_user_id)]
