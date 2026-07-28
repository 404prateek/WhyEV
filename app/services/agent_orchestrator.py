"""Agent orchestrator — routes user messages to the correct sub-agent prompt.

Architecture (spec §7):
1. Load recent conversation turns + top-k similar past turns (pgvector).
2. Classify intent via cheap model → route to sub-agent.
3. Sub-agent receives: user profile + relevant DB data + classified label.
4. Stream tokens back via SSE; persist full turn on completion.
5. Every factual claim (subsidy amount, deadline) is injected from DB —
   the LLM is explicitly forbidden from free-generating numbers.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

import anthropic
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.conversation import AiConversation
from app.models.subsidy import SubsidyRule
from app.models.user import UserProfile
from app.models.vehicle import VehicleMaster
from app.agents.prompts import (
    profile as profile_prompt,
    eligibility as eligibility_prompt,
    financial as financial_prompt,
    recommendation as recommendation_prompt,
    dealer_matching as dealer_matching_prompt,
    followup as followup_prompt,
)

log = structlog.get_logger(__name__)

_AGENT_TYPES = [
    "profile", "eligibility", "financial",
    "recommendation", "dealer_matching", "followup",
]

_LABEL_MAP = {
    "profile": "Building your profile…",
    "eligibility": "Checking your subsidy eligibility…",
    "financial": "Calculating your finance options…",
    "recommendation": "Finding the best EV matches for you…",
    "dealer_matching": "Locating nearby dealers…",
    "followup": "Following up on your application…",
}

_PROMPT_MAP = {
    "profile": profile_prompt.SYSTEM,
    "eligibility": eligibility_prompt.SYSTEM,
    "financial": financial_prompt.SYSTEM,
    "recommendation": recommendation_prompt.SYSTEM,
    "dealer_matching": dealer_matching_prompt.SYSTEM,
    "followup": followup_prompt.SYSTEM,
}


# ---------------------------------------------------------------------------
# Intent classifier (cheap model call)
# ---------------------------------------------------------------------------

async def classify_intent(client: anthropic.AsyncAnthropic, user_text: str) -> str:
    """Return one of the 6 agent_type strings."""
    resp = await client.messages.create(
        model=settings.ANTHROPIC_CLASSIFIER_MODEL,
        max_tokens=16,
        system=(
            "You are an intent classifier for an EV consultation chatbot. "
            "Classify the user message into exactly ONE of these labels (respond with the label only): "
            + ", ".join(_AGENT_TYPES)
        ),
        messages=[{"role": "user", "content": user_text}],
    )
    raw = resp.content[0].text.strip().lower()
    return raw if raw in _AGENT_TYPES else "profile"


# ---------------------------------------------------------------------------
# Context loader
# ---------------------------------------------------------------------------

async def load_context(
    *, db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID, limit: int = 10
) -> list[dict]:
    """Return recent turns as Anthropic message dicts."""
    stmt = (
        select(AiConversation)
        .where(
            AiConversation.user_id == user_id,
            AiConversation.conversation_id == conversation_id,
        )
        .order_by(AiConversation.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    turns = list(reversed(result.scalars().all()))
    return [
        {"role": t.message_role, "content": t.message_text or ""}
        for t in turns
        if t.message_role in ("user", "assistant")
    ]


async def load_db_context(*, db: AsyncSession, agent_type: str) -> str:
    """Load relevant DB data to inject into the system prompt."""
    lines: list[str] = []

    if agent_type == "eligibility":
        stmt = select(SubsidyRule).where(SubsidyRule.status == "live").limit(5)
        res = await db.execute(stmt)
        rules = res.scalars().all()
        for r in rules:
            lines.append(
                f"LIVE RULE: category={r.category}, tier={r.year_tier}, "
                f"amount=₹{r.amount:,}, price_ceiling=₹{r.price_ceiling:,}"
            )

    if agent_type == "recommendation":
        stmt = (
            select(VehicleMaster)
            .where(VehicleMaster.is_empanelled.is_(True))
            .limit(20)
        )
        res = await db.execute(stmt)
        vehicles = res.scalars().all()
        for v in vehicles:
            lines.append(
                f"VEHICLE: {v.make} {v.model} | cat={v.category} | "
                f"price=₹{v.price:,} | range={v.range_km}km"
            )

    return "\n".join(lines) if lines else "No additional DB context available."


# ---------------------------------------------------------------------------
# Main streaming orchestrator
# ---------------------------------------------------------------------------

async def stream_agent_response(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    conversation_id: uuid.UUID,
    user_text: str,
) -> AsyncGenerator[str, None]:
    """
    Yields SSE-formatted text chunks.

    First event format (JSON):
      data: {"type":"meta","agent_type":"eligibility","label":"Checking your subsidy eligibility…"}

    Subsequent events:
      data: {"type":"token","text":"<partial text>"}

    Final event:
      data: {"type":"done"}
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    # 1. Classify intent
    agent_type = await classify_intent(client, user_text)
    label = _LABEL_MAP.get(agent_type, "Processing…")

    yield f'data: {json.dumps({"type": "meta", "agent_type": agent_type, "label": label})}\n\n'

    # 2. Load conversation history
    history = await load_context(db=db, user_id=user_id, conversation_id=conversation_id)

    # 3. Load DB context for system prompt
    db_context = await load_db_context(db=db, agent_type=agent_type)

    system = (
        _PROMPT_MAP.get(agent_type, profile_prompt.SYSTEM)
        + f"\n\n=== LIVE DB CONTEXT (use these numbers, never invent) ===\n{db_context}"
    )

    # 4. Build messages
    messages = [*history, {"role": "user", "content": user_text}]

    # 5. Save user turn
    user_turn = AiConversation(
        user_id=user_id,
        conversation_id=conversation_id,
        agent_type=agent_type,
        message_role="user",
        message_text=user_text,
    )
    db.add(user_turn)
    await db.flush()

    # 6. Stream agent response
    full_response: list[str] = []

    async with client.messages.stream(
        model=settings.ANTHROPIC_AGENT_MODEL,
        max_tokens=1024,
        system=system,
        messages=messages,  # type: ignore[arg-type]
    ) as stream:
        async for text in stream.text_stream:
            full_response.append(text)
            yield f'data: {json.dumps({"type": "token", "text": text})}\n\n'

    # 7. Persist agent turn
    agent_turn = AiConversation(
        user_id=user_id,
        conversation_id=conversation_id,
        agent_type=agent_type,
        message_role="assistant",
        message_text="".join(full_response),
    )
    db.add(agent_turn)
    await db.flush()

    yield f'data: {json.dumps({"type": "done"})}\n\n'

    log.info(
        "agent.turn.complete",
        user_id=str(user_id),
        conversation_id=str(conversation_id),
        agent_type=agent_type,
        response_len=len("".join(full_response)),
    )
