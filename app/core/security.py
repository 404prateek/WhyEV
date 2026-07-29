"""Supabase JWT decoding utilities — supports both HS256 and ES256 (JWKS)."""
from __future__ import annotations

import json
import threading
import urllib.request
from typing import Any

from jose import JWTError, jwt
from jose.backends import ECKey

from app.core.config import settings

# ---------------------------------------------------------------------------
# JWKS Cache — fetch the Supabase public key once per process, thread-safe
# ---------------------------------------------------------------------------
_jwks_lock = threading.Lock()
_jwks_cache: dict[str, Any] = {}  # kid -> key dict


def _fetch_jwks() -> list[dict[str, Any]]:
    """Fetch the current JWKS keys from Supabase."""
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    with urllib.request.urlopen(url, timeout=5) as resp:  # noqa: S310
        return json.loads(resp.read())["keys"]


def _get_jwks_keys() -> dict[str, Any]:
    """Return cached kid->jwk_dict mapping, fetching once per process."""
    global _jwks_cache
    with _jwks_lock:
        if not _jwks_cache:
            keys = _fetch_jwks()
            _jwks_cache = {k["kid"]: k for k in keys}
    return _jwks_cache


def decode_supabase_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a Supabase JWT.

    Strategy:
    1. Peek at the JWT header to get the algorithm and kid.
    2. If alg == ES256, resolve the public key from JWKS and verify.
    3. If alg == HS256 (legacy/dev tokens), verify with SUPABASE_JWT_SECRET.
    4. Raise JWTError on any verification failure.
    """
    try:
        # Decode header without verification to get alg + kid
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise

    alg = unverified_header.get("alg", settings.JWT_ALGORITHM)

    if alg == "ES256":
        kid = unverified_header.get("kid")
        keys = _get_jwks_keys()
        jwk = keys.get(kid)
        if jwk is None:
            # kid not in cache — refresh once and try again
            global _jwks_cache
            with _jwks_lock:
                _jwks_cache = {}
            keys = _get_jwks_keys()
            jwk = keys.get(kid)
        if jwk is None:
            raise JWTError(f"No JWKS key found for kid={kid}")

        # jose can accept a JWK dict directly as the key
        try:
            return jwt.decode(
                token,
                jwk,
                algorithms=["ES256"],
                audience="authenticated",
                options={"verify_aud": True, "verify_exp": False},
            )
        except JWTError:
            # Try without audience for Supabase v2 edge cases
            return jwt.decode(
                token,
                jwk,
                algorithms=["ES256"],
                options={"verify_aud": False, "verify_exp": False},
            )
    else:
        # HS256 fallback — legacy / dev tokens
        try:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_exp": False},
            )
        except JWTError:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_exp": False},
            )
