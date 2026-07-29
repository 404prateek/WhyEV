"""Groq API key pool — round-robin rotation with automatic 429 back-off.

Usage
-----
Instead of:
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

Use:
    pool   = get_groq_pool()
    client = pool.get_client()            # picks the next healthy key
    # or, with auto-retry on rate-limit:
    result = await pool.chat_with_retry(model=..., messages=..., **kwargs)

How the pool works
------------------
1.  You add multiple free Groq keys: GROQ_API_KEY_1, GROQ_API_KEY_2, …
    (Groq free tier = 14,400 req/day per key and 6,000 tokens/min per key)
2.  The pool keeps a round-robin pointer and cycles through keys on every call.
3.  If a key returns HTTP 429 (rate-limit hit), the pool marks it as
    "cooling down" for COOLDOWN_SECONDS (default 60 s) and skips it.
4.  If ALL keys are cooling down, it waits on the one that recovers soonest
    and raises GroqRateLimitError so the caller can surface a friendly message.
5.  On any other Groq error (5xx, network, etc.) it retries on the next key
    up to MAX_RETRIES times.

How to create multiple free Groq accounts
-----------------------------------------
1. Go to console.groq.com
2. Sign up with email:
   • yourname+whyev1@gmail.com  (Gmail "+" trick — same inbox, different account)
   • yourname+whyev2@gmail.com
   • yourname+whyev3@gmail.com
   (Create as many as you need — 3 keys = ~43,000 req/day combined)
3. In each account: API Keys → Create Key → copy the gsk_... value
4. Add to .env:
   GROQ_API_KEY_1=gsk_...
   GROQ_API_KEY_2=gsk_...
   GROQ_API_KEY_3=gsk_...
"""
from __future__ import annotations

import asyncio
import time
from itertools import cycle
from typing import Any

import structlog
from groq import AsyncGroq, RateLimitError

log = structlog.get_logger(__name__)

# How long (seconds) to skip a key after it gets rate-limited
COOLDOWN_SECONDS: int = 60

# How many times to retry across different keys before giving up
MAX_RETRIES: int = 5


class GroqRateLimitError(Exception):
    """All keys are cooling down — propagate to caller."""


class _KeySlot:
    """Tracks one API key's health."""
    __slots__ = ("key", "client", "cooling_until")

    def __init__(self, key: str) -> None:
        self.key = key
        self.client = AsyncGroq(api_key=key)
        self.cooling_until: float = 0.0  # unix timestamp

    @property
    def is_available(self) -> bool:
        return time.monotonic() >= self.cooling_until

    def mark_rate_limited(self) -> None:
        self.cooling_until = time.monotonic() + COOLDOWN_SECONDS
        log.warning("groq.key.rate_limited", key_suffix=self.key[-6:], cooldown=COOLDOWN_SECONDS)

    def seconds_until_recovery(self) -> float:
        return max(0.0, self.cooling_until - time.monotonic())


class GroqPool:
    """Thread-safe (asyncio) Groq client pool with automatic key rotation."""

    def __init__(self, keys: list[str]) -> None:
        if not keys:
            raise ValueError("GroqPool requires at least one API key. Check GROQ_API_KEY_* env vars.")
        self._slots = [_KeySlot(k) for k in keys]
        self._cycle = cycle(range(len(self._slots)))
        self._lock = asyncio.Lock()
        log.info("groq.pool.initialized", num_keys=len(keys))

    def _next_available(self) -> _KeySlot | None:
        """Round-robin through slots, return first available one."""
        for _ in range(len(self._slots)):
            idx = next(self._cycle)
            slot = self._slots[idx]
            if slot.is_available:
                return slot
        return None

    def _soonest_recovery(self) -> float:
        """Seconds until the fastest-recovering key becomes available."""
        return min(s.seconds_until_recovery() for s in self._slots)

    async def chat_with_retry(
        self,
        *,
        model: str,
        messages: list[dict],
        stream: bool = False,
        **kwargs: Any,
    ) -> Any:
        """
        Call Groq chat completions with automatic key rotation on 429.
        Retries MAX_RETRIES times across different keys before raising.
        """
        last_exc: Exception | None = None

        for attempt in range(MAX_RETRIES):
            async with self._lock:
                slot = self._next_available()

            if slot is None:
                wait = self._soonest_recovery()
                log.warning("groq.pool.all_cooling", wait_seconds=round(wait, 1))
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(min(wait, 30))  # never wait more than 30s
                    continue
                raise GroqRateLimitError(
                    f"All Groq API keys are rate-limited. Fastest recovery in {wait:.0f}s."
                )

            try:
                log.debug("groq.request", key_suffix=slot.key[-6:], model=model, attempt=attempt)
                result = await slot.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=stream,
                    **kwargs,
                )
                return result

            except RateLimitError as exc:
                slot.mark_rate_limited()
                last_exc = exc
                # immediately try next key — no sleep
                continue

            except Exception as exc:
                log.exception("groq.request.error", key_suffix=slot.key[-6:], model=model)
                last_exc = exc
                await asyncio.sleep(1)
                continue

        raise last_exc or GroqRateLimitError("Max retries exhausted")

    async def stream_chat(
        self,
        *,
        model: str,
        messages: list[dict],
        **kwargs: Any,
    ):
        """
        Streaming version — returns async stream created via chat.completions.create(..., stream=True).
        On 429 it retries on the next key transparently.
        """
        last_exc: Exception | None = None

        for attempt in range(MAX_RETRIES):
            async with self._lock:
                slot = self._next_available()

            if slot is None:
                wait = self._soonest_recovery()
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(min(wait, 30))
                    continue
                raise GroqRateLimitError(f"All keys cooling. Retry in {wait:.0f}s.")

            try:
                return await slot.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=True,
                    **kwargs,
                )
            except RateLimitError as exc:
                slot.mark_rate_limited()
                last_exc = exc
                continue
            except Exception as exc:
                log.exception("groq.stream_chat.error", key_suffix=slot.key[-6:], model=model)
                last_exc = exc
                await asyncio.sleep(1)
                continue

        raise last_exc or GroqRateLimitError("Max retries exhausted")

    @property
    def key_count(self) -> int:
        return len(self._slots)

    @property
    def available_count(self) -> int:
        return sum(1 for s in self._slots if s.is_available)


# ---------------------------------------------------------------------------
# Singleton — one pool per process
# ---------------------------------------------------------------------------

_pool: GroqPool | None = None


def get_groq_pool() -> GroqPool:
    """Return the singleton GroqPool. Initialised from GROQ_API_KEY_* env vars."""
    global _pool
    if _pool is None:
        _pool = _build_pool()
    return _pool


def _build_pool() -> GroqPool:
    """
    Reads all GROQ_API_KEY_N keys from config.
    Falls back to single GROQ_API_KEY if no numbered keys are set.
    """
    from app.core.config import settings

    keys: list[str] = []

    # Numbered keys: GROQ_API_KEY_1, GROQ_API_KEY_2, ...
    for i in range(1, 21):  # support up to 20 keys
        val = getattr(settings, f"GROQ_API_KEY_{i}", "")
        if val:
            keys.append(val)

    # Fallback to single key
    if not keys and settings.GROQ_API_KEY:
        keys.append(settings.GROQ_API_KEY)

    if not keys:
        raise RuntimeError(
            "No Groq API keys configured. Set GROQ_API_KEY or GROQ_API_KEY_1, "
            "GROQ_API_KEY_2, … in your .env file."
        )

    return GroqPool(keys)
