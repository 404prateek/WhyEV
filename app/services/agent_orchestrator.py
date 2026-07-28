"""Agent orchestrator — 2-agent design using Groq (open-source LLMs).

MVP Architecture (simplified from the original 6-agent design):

┌─────────────────────────────────────────────────────────────────┐
│  User message                                                   │
│       ↓                                                         │
│  [ROUTER AGENT]  (llama-3.1-8b — fast, cheap)                  │
│  • Reads the message                                            │
│  • Decides which TOOL to call (not which "agent")               │
│  • Returns: tool_name + extracted params                        │
│       ↓                                                         │
│  [TOOL EXECUTOR]  (pure Python — no LLM, instant)              │
│  • calculate_subsidy()   → hits DB, returns ₹ amount           │
│  • find_vehicles()        → hits DB, returns shortlist          │
│  • get_dealer_info()      → hits DB, returns nearby dealers     │
│  • get_profile_status()   → hits DB, returns completion %       │
│       ↓                                                         │
│  [RESPONDER AGENT]  (llama-3.3-70b — smart, articulate)        │
│  • Gets: user message + tool result (DB data)                   │
│  • Writes the final reply in plain conversational language      │
│  • CANNOT invent numbers — only interprets the tool result      │
│  • Streams tokens back to user                                  │
└─────────────────────────────────────────────────────────────────┘

Why this is better than 6 separate agents:
- Fewer LLM calls (2 instead of up to 6 per turn)
- Simpler to debug (one router, one responder)
- Tool results are 100% DB-backed → no hallucination
- Easy to add new tools without changing the agent logic
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

import structlog
from groq import AsyncGroq
from groq._streaming import AsyncStream
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.groq_pool import GroqPool, get_groq_pool
from app.models.conversation import AiConversation
from app.models.subsidy import SubsidyRule
from app.models.user import UserProfile
from app.models.vehicle import VehicleMaster

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Tool definitions — what the router agent can call
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_subsidy",
            "description": "Calculate EV subsidy eligibility and amount for a user. Call this when the user asks about subsidy, scheme, government benefit, or financial incentive.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "enum": ["2W", "3W", "N1_goods"], "description": "Vehicle category"},
                    "city": {"type": "string", "description": "User's city"},
                    "scrappage": {"type": "string", "enum": ["yes", "no"], "description": "Does user have an old vehicle to scrap/trade-in?"},
                },
                "required": ["category", "city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_vehicles",
            "description": "Find matching EV vehicles based on budget, category and daily usage. Call this when the user asks for vehicle recommendations, which EV to buy, or wants to compare models.",
            "parameters": {
                "type": "object",
                "properties": {
                    "budget_max": {"type": "integer", "description": "Maximum budget in INR"},
                    "category": {"type": "string", "enum": ["2W", "3W", "N1_goods"]},
                    "daily_km": {"type": "integer", "description": "Average daily distance in km"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_profile_status",
            "description": "Check what information is still needed from the user to give them a complete recommendation. Call this when the user wants to know their profile status or what to fill in next.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_dealer_info",
            "description": "Get information about EV dealers. Call this when the user asks about where to buy, test drive, nearest dealer, or showroom.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City to search dealers in"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "general_ev_chat",
            "description": "Answer general questions about EVs, charging, maintenance, or anything else not covered by the other tools.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "What the user is asking about"},
                },
                "required": ["topic"],
            },
        },
    },
]

# ---------------------------------------------------------------------------
# Tool executor — pure Python, hits the DB, returns structured data
# ---------------------------------------------------------------------------

async def execute_tool(
    tool_name: str, tool_args: dict, db: AsyncSession, user_id: uuid.UUID
) -> dict:
    """Execute the tool the router chose and return a DB-backed result dict."""

    if tool_name == "calculate_subsidy":
        from app.services.eligibility_service import calculate_subsidy, city_is_delhi_ncr
        city = tool_args.get("city", "")
        category = tool_args.get("category", "2W")
        scrappage = tool_args.get("scrappage", "no")

        # Get a real vehicle price from DB for context
        stmt = select(VehicleMaster).where(
            VehicleMaster.category == category,
            VehicleMaster.is_empanelled.is_(True),
        ).limit(1)
        result = await db.execute(stmt)
        sample = result.scalar_one_or_none()
        price = sample.price or 100_000 if sample else 100_000

        res = await calculate_subsidy(
            db=db, category=category, vehicle_price=price,
            city=city, rc_issue_date=None, scrappage=scrappage,
        )
        return {
            "tool": "calculate_subsidy",
            "eligible": res.eligible,
            "amount": res.amount,
            "reason": res.reason,
            "breakdown": res.breakdown,
            "city_is_delhi_ncr": city_is_delhi_ncr(city),
        }

    elif tool_name == "find_vehicles":
        from app.services.recommendation_service import get_recommendations
        from app.schemas.profile import RecommendationIn
        payload = RecommendationIn(
            budget_max=tool_args.get("budget_max"),
            preferred_categories=[tool_args["category"]] if tool_args.get("category") else None,
            daily_km=tool_args.get("daily_km"),
        )
        shortlist, assumptions = await get_recommendations(db=db, payload=payload)
        return {
            "tool": "find_vehicles",
            "count": len(shortlist),
            "vehicles": [
                {
                    "make": v.make, "model": v.model,
                    "category": v.category, "price": v.price,
                    "range_km": v.range_km, "is_empanelled": v.is_empanelled,
                }
                for v in shortlist[:5]
            ],
            "assumptions": assumptions,
        }

    elif tool_name == "get_profile_status":
        from app.services.recommendation_service import profile_completion
        stmt = select(UserProfile).where(UserProfile.user_id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        if profile:
            profile_dict = {
                f: getattr(profile, f, None) for f in [
                    "intent", "budget_min", "budget_max", "city", "is_delhi_ncr",
                    "daily_km", "housing_type", "parking_socket_access",
                    "family_size", "preferred_categories", "charging_preference",
                    "finance_pref", "emi_comfort",
                ]
            }
            pct, missing = profile_completion(profile_dict)
        else:
            pct, missing = 0, ["all fields — profile not started"]
        return {"tool": "get_profile_status", "completion_percent": pct, "missing_fields": missing}

    elif tool_name == "get_dealer_info":
        stmt = select(VehicleMaster).where(VehicleMaster.is_empanelled.is_(True)).limit(3)
        result = await db.execute(stmt)
        # In MVP return a placeholder until dealer DB is populated
        return {
            "tool": "get_dealer_info",
            "message": "Dealer directory is being populated. Visit whyev.in/dealers for the latest list.",
            "city": tool_args.get("city", ""),
        }

    else:  # general_ev_chat — no DB lookup needed
        return {"tool": "general_ev_chat", "topic": tool_args.get("topic", "")}


# ---------------------------------------------------------------------------
# Router agent — decides which tool to call
# ---------------------------------------------------------------------------

_ROUTER_SYSTEM = """\
You are a routing assistant for WhyEV, an EV consultation platform in India.
Your ONLY job is to look at the user's message and decide which tool to call.
Do not answer the user directly. Always call exactly one tool.
If nothing specific matches, call general_ev_chat.
"""

async def route_to_tool(pool: GroqPool, user_text: str, history: list[dict]) -> tuple[str, dict]:
    """Call the fast/cheap model to decide which tool to use. Returns (tool_name, tool_args)."""
    messages = [
        *history[-4:],  # only last 2 turns for context
        {"role": "user", "content": user_text},
    ]
    resp = await pool.chat_with_retry(
        model=settings.LLM_CLASSIFIER_MODEL,
        messages=[{"role": "system", "content": _ROUTER_SYSTEM}, *messages],
        tools=TOOLS,
        tool_choice="required",
        max_tokens=256,
    )
    choice = resp.choices[0].message
    if choice.tool_calls:
        tc = choice.tool_calls[0]
        return tc.function.name, json.loads(tc.function.arguments or "{}")
    return "general_ev_chat", {"topic": user_text}


# ---------------------------------------------------------------------------
# Responder agent — converts tool result into a human reply (streams)
# ---------------------------------------------------------------------------

_RESPONDER_SYSTEM = """\
You are WhyEV's friendly EV consultant for India, focused on Delhi NCR.
You have just received a structured result from a database tool.

STRICT RULES:
1. Use ONLY the numbers and facts in the TOOL RESULT block below. Never invent figures.
2. Be conversational, warm, and jargon-free.
3. If the result says the user is ineligible, explain why clearly and suggest next steps.
4. Keep replies concise — 3 to 6 sentences unless the user asks for detail.
5. End with a relevant follow-up question to keep the conversation going.
"""

# ---------------------------------------------------------------------------
# Main streaming entry point
# ---------------------------------------------------------------------------

async def stream_agent_response(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    conversation_id: uuid.UUID,
    user_text: str,
) -> AsyncGenerator[str, None]:
    """
    2-agent pipeline:
      1. Router (fast model)  → picks a tool
      2. Tool executor        → hits DB, returns structured data
      3. Responder (smart model) → streams a human reply

    SSE event format:
      data: {"type":"meta","tool":"calculate_subsidy","label":"Checking your subsidy…"}
      data: {"type":"token","text":"<partial>"}
      data: {"type":"done"}
    """
    pool   = get_groq_pool()

    # Load recent conversation history
    history = await _load_history(db=db, user_id=user_id, conversation_id=conversation_id)

    # --- Step 1: Route ---
    tool_name, tool_args = await route_to_tool(pool, user_text, history)
    label = _tool_label(tool_name)

    yield f'data: {json.dumps({"type": "meta", "tool": tool_name, "label": label})}\n\n'

    # --- Step 2: Execute tool (DB-backed) ---
    tool_result = await execute_tool(tool_name, tool_args, db, user_id)

    # --- Step 3: Save user turn ---
    user_turn = AiConversation(
        user_id=user_id,
        conversation_id=conversation_id,
        agent_type=tool_name,
        message_role="user",
        message_text=user_text,
    )
    db.add(user_turn)
    await db.flush()

    # --- Step 4: Responder streams the reply ---
    responder_messages = [
        *history[-6:],
        {"role": "user", "content": user_text},
        {
            "role": "user",   # inject tool result as context
            "content": f"[TOOL RESULT — use only these facts]\n{json.dumps(tool_result, indent=2)}",
        },
    ]

    full_response: list[str] = []
    stream_ctx = await pool.stream_chat(
        model=settings.LLM_AGENT_MODEL,
        messages=[{"role": "system", "content": _RESPONDER_SYSTEM}, *responder_messages],
        max_tokens=512,
    )

    async with stream_ctx as stream:
        async for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                full_response.append(text)
                yield f'data: {json.dumps({"type": "token", "text": text})}\n\n'

    # --- Step 5: Persist agent turn ---
    agent_turn = AiConversation(
        user_id=user_id,
        conversation_id=conversation_id,
        agent_type=tool_name,
        message_role="assistant",
        message_text="".join(full_response),
    )
    db.add(agent_turn)
    await db.flush()

    yield f'data: {json.dumps({"type": "done"})}\n\n'

    log.info(
        "agent.turn.complete",
        user_id=str(user_id),
        tool=tool_name,
        response_len=len("".join(full_response)),
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_TOOL_LABELS = {
    "calculate_subsidy": "Checking your subsidy eligibility…",
    "find_vehicles": "Finding the best EVs for you…",
    "get_profile_status": "Reviewing your profile…",
    "get_dealer_info": "Looking up nearby dealers…",
    "general_ev_chat": "Thinking…",
}

def _tool_label(tool_name: str) -> str:
    return _TOOL_LABELS.get(tool_name, "Processing…")


async def _load_history(
    *, db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID, limit: int = 8
) -> list[dict]:
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
        {"role": t.message_role if t.message_role != "agent" else "assistant",
         "content": t.message_text or ""}
        for t in turns
    ]
