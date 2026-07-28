"""Auth router — OTP request/verify, Google OAuth, token refresh."""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DBSession, RedisConn
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_secret,
    phone_key,
    verify_secret,
)
from app.models.user import RefreshToken, User
from app.schemas.auth import (
    GoogleAuthIn,
    OtpRequestIn,
    OtpSentOut,
    OtpVerifyIn,
    TokenPairOut,
    TokenRefreshIn,
    UserOut,
)

log = structlog.get_logger(__name__)
router = APIRouter()

_OTP_PREFIX = "whyev:otp:"
_RATE_PHONE_PREFIX = "whyev:rate:phone:"
_RATE_IP_PREFIX = "whyev:rate:ip:"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _check_rate_limit(redis: RedisConn, key: str, limit: int, window: int) -> None:
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, window)
    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    return forwarded.split(",")[0].strip() if forwarded else (request.client.host or "unknown")


async def _get_or_create_user(db: DBSession, phone: str) -> User:
    stmt = select(User).where(User.phone == phone)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(phone=phone, auth_provider="phone")
        db.add(user)
        await db.flush()
    return user


async def _issue_tokens(
    db: DBSession, redis: RedisConn, user: User
) -> tuple[str, str]:
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

    # Cache user_id → role in Redis for 60s
    await redis.setex(f"whyev:user:{user.id}", 60, user.role)
    return access, raw_refresh


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/auth/otp/request", response_model=OtpSentOut, status_code=status.HTTP_200_OK)
async def request_otp(
    body: OtpRequestIn,
    request: Request,
    db: DBSession,
    redis: RedisConn,
) -> OtpSentOut:
    ip = _client_ip(request)
    await _check_rate_limit(redis, f"{_RATE_PHONE_PREFIX}{phone_key(body.phone)}", 3, 60)
    await _check_rate_limit(redis, f"{_RATE_IP_PREFIX}{ip}", 10, 3600)

    otp = generate_otp()
    otp_hash = hash_secret(otp)
    await redis.setex(
        f"{_OTP_PREFIX}{phone_key(body.phone)}",
        settings.OTP_EXPIRY_SECONDS,
        otp_hash,
    )

    # TODO: dispatch SMS via notification_service / Celery
    log.info("otp.sent", phone_suffix=body.phone[-4:])
    if settings.DEBUG:
        log.debug("otp.debug_value", otp=otp)  # only log OTP in debug mode

    return OtpSentOut()


@router.post("/auth/otp/verify", response_model=TokenPairOut)
async def verify_otp(
    body: OtpVerifyIn,
    db: DBSession,
    redis: RedisConn,
) -> TokenPairOut:
    stored_hash = await redis.get(f"{_OTP_PREFIX}{phone_key(body.phone)}")
    if not stored_hash or not verify_secret(body.code, stored_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired OTP")

    await redis.delete(f"{_OTP_PREFIX}{phone_key(body.phone)}")

    user = await _get_or_create_user(db, body.phone)
    access, refresh = await _issue_tokens(db, redis, user)

    return TokenPairOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )


@router.post("/auth/google", response_model=TokenPairOut)
async def google_auth(body: GoogleAuthIn, db: DBSession, redis: RedisConn) -> TokenPairOut:
    """Verify Google ID token and issue WhyEV JWT pair."""
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": body.id_token},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    data = resp.json()
    if data.get("aud") != settings.GOOGLE_OAUTH_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token audience mismatch")

    email = data.get("email")
    name = data.get("name")

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            name=name,
            phone=f"google_{uuid.uuid4().hex[:10]}",  # placeholder; update when user adds phone
            auth_provider="google",
        )
        db.add(user)
        await db.flush()

    access, refresh = await _issue_tokens(db, redis, user)
    return TokenPairOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )


@router.post("/auth/refresh", response_model=TokenPairOut)
async def refresh_token(body: TokenRefreshIn, db: DBSession, redis: RedisConn) -> TokenPairOut:
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

    # Verify token is not revoked
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked.is_(False),
    )
    result = await db.execute(stmt)
    tokens = result.scalars().all()
    valid = next((t for t in tokens if verify_secret(raw_jti, t.token_hash)), None)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    # Rotate: revoke old token
    valid.revoked = True
    await db.flush()

    user_stmt = select(User).where(User.id == user_id)
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access, refresh = await _issue_tokens(db, redis, user)
    return TokenPairOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )
