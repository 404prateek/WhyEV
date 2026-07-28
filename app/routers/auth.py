"""Auth router — Google OAuth only (MVP).

OTP/SMS removed. All auth goes through Google.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import httpx
import structlog
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DBSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_secret,
)
from app.models.user import RefreshToken, User
from app.schemas.auth import (
    GoogleAuthIn,
    TokenPairOut,
    TokenRefreshIn,
    UserOut,
)

log = structlog.get_logger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_or_create_user_from_google(
    db: DBSession, email: str, name: str | None
) -> User:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            name=name,
            # phone field kept in schema but not required for Google auth
            phone=f"google_{uuid.uuid4().hex[:10]}",
            auth_provider="google",
        )
        db.add(user)
        await db.flush()
        log.info("auth.new_user", email=email)
    return user


async def _issue_tokens(db: DBSession, user: User) -> tuple[str, str]:
    extra_claims = {"role": user.role}
    access = create_access_token(str(user.id), extra_claims)
    raw_refresh, hashed_refresh = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id=user.id,
        token_hash=hashed_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_REFRESH_TTL),
    )
    db.add(rt)
    await db.flush()
    return access, raw_refresh


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/auth/google", response_model=TokenPairOut)
async def google_auth(body: GoogleAuthIn, db: DBSession) -> TokenPairOut:
    """
    Verify a Google ID token (issued by Google Sign-In on the frontend)
    and return a WhyEV JWT access + refresh token pair.

    Frontend flow:
      1. User clicks "Sign in with Google"
      2. Google returns an id_token to the frontend
      3. Frontend POSTs that id_token here
      4. We verify it with Google's public endpoint
      5. We return our own JWT — frontend stores this and uses it for all API calls
    """
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": body.id_token},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        )

    data = resp.json()

    # Verify the token was issued for OUR app (prevents token reuse attacks)
    if data.get("aud") != settings.GOOGLE_OAUTH_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token was not issued for this application",
        )

    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email address",
        )

    user = await _get_or_create_user_from_google(db, email, data.get("name"))
    access, refresh = await _issue_tokens(db, user)

    return TokenPairOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )


@router.post("/auth/refresh", response_model=TokenPairOut)
async def refresh_token(body: TokenRefreshIn, db: DBSession) -> TokenPairOut:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    from app.core.security import decode_token
    from jose import JWTError

    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a refresh token")

    user_id = uuid.UUID(payload["sub"])
    raw_jti = payload.get("jti", "")

    # Check token is not revoked
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked.is_(False),
    )
    result = await db.execute(stmt)
    tokens = result.scalars().all()
    valid = next((t for t in tokens if verify_secret(raw_jti, t.token_hash)), None)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    # Rotate: revoke old, issue new
    valid.revoked = True
    await db.flush()

    user_stmt = select(User).where(User.id == user_id)
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access, refresh = await _issue_tokens(db, user)
    return TokenPairOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )
