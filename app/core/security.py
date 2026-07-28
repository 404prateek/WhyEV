"""JWT encoding/decoding and OTP hashing utilities."""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password / OTP hashing
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_secret(value: str) -> str:
    """Bcrypt-hash a value (OTP, refresh token)."""
    return pwd_context.hash(value)


def verify_secret(plain: str, hashed: str) -> bool:
    """Constant-time comparison against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    return "".join([str(secrets.randbelow(10)) for _ in range(length)])


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_ACCESS_TTL)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> tuple[str, str]:
    """Return (raw_token, hashed_token). Store only the hash in the DB."""
    raw = secrets.token_urlsafe(48)
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_REFRESH_TTL)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": raw,
        "type": "refresh",
    }
    encoded = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded, hash_secret(raw)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT. Raises JWTError on failure."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise


# ---------------------------------------------------------------------------
# HMAC fingerprint for Redis OTP keys (phone → don't store plaintext in key)
# ---------------------------------------------------------------------------

_REDIS_KEY_SECRET = settings.JWT_SECRET.encode()


def phone_key(phone: str) -> str:
    """Derive a stable but non-reversible Redis key suffix from a phone number."""
    return hmac.new(_REDIS_KEY_SECRET, phone.encode(), hashlib.sha256).hexdigest()[:16]
