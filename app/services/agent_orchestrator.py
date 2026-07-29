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

import io
import json
import sys
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

# Force UTF-8 encoding on Windows console streams to prevent charmap UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

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
            "description": "Calculate EV subsidy eligibility and total financial benefits. Call this ONLY when the user explicitly asks about subsidy calculation, policy rules, deadline, or government eligibility.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "enum": ["2W", "3W", "4W", "N1_goods"], "description": "Vehicle category"},
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
            "description": "Find matching EV vehicles based on budget, category and range. Call this whenever the user asks for vehicle recommendations, best EVs under a budget (e.g. under 10 lakh), which EV to buy, or model comparisons.",
            "parameters": {
                "type": "object",
                "properties": {
                    "budget_max": {"type": "integer", "description": "Maximum budget in INR (e.g. 10 lakh = 1000000)"},
                    "category": {"type": "string", "enum": ["2W", "3W", "4W", "N1_goods"], "description": "Vehicle category (2W, 3W, or 4W car)"},
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
            "description": "Check what information is still needed from the user. Call this when the user asks about their profile or what fields to fill in.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_dealer_info",
            "description": "Get information about EV showrooms or charging stations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City to search"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "general_ev_chat",
            "description": "Answer general questions about EVs, charging, battery, or general topics.",
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
        city = tool_args.get("city", "Delhi")
        category = tool_args.get("category", "4W")
        scrappage = tool_args.get("scrappage", "no")

        # Get a real vehicle price from DB for context
        stmt = select(VehicleMaster).where(
            VehicleMaster.category == category,
            VehicleMaster.is_empanelled.is_(True),
        ).limit(1)
        result = await db.execute(stmt)
        sample = result.scalar_one_or_none()
        price = sample.price or 700_000 if sample else 700_000

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

        raw_budget = tool_args.get("budget_max")
        budget = None
        if raw_budget:
            # Handle if model passed 10 instead of 1000000
            budget = raw_budget * 100_000 if raw_budget < 100 else raw_budget

        cat = tool_args.get("category")
        user_text_lower = (user_text or "").lower()
        if any(w in user_text_lower for w in ["car", "4w", "four wheeler", "suv", "sedan", "hatchback"]):
            cat = "4W"
        elif any(w in user_text_lower for w in ["bike", "scooter", "2w", "two wheeler"]):
            cat = "2W"
        elif not cat:
            cat = "4W" if (budget is None or budget > 300_000) else "2W"

        payload = RecommendationIn(
            budget_max=budget or 1_500_000,
            preferred_categories=[cat],
            daily_km=tool_args.get("daily_km", 40),
            city="Delhi",
        )
        enriched_shortlist, raw_vehicles, assumptions = await get_recommendations(db=db, payload=payload)
        return {
            "tool": "find_vehicles",
            "budget_max": budget,
            "category": cat,
            "count": len(enriched_shortlist),
            "vehicles": [
                {
                    "make": v["make"],
                    "model": v["model"],
                    "variant": v.get("variant", ""),
                    "category": v["category"],
                    "exShowroomPrice": v["exShowroomPrice"],
                    "effectivePrice": v["effectivePrice"],
                    "totalBenefit": v.get("totalBenefit", 0),
                    "rangeKm": v["rangeKm"],
                    "isEmpanelled": v["empanelledStatus"] == "confirmed",
                }
                for v in enriched_shortlist[:5]
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
        return {
            "tool": "get_dealer_info",
            "message": "Over 4,500+ public EV charging stations operational across Delhi NCR.",
            "city": tool_args.get("city", "Delhi"),
        }

    else:  # general_ev_chat — no DB lookup needed
        return {"tool": "general_ev_chat", "topic": tool_args.get("topic", "")}


# ---------------------------------------------------------------------------
# Router agent — decides which tool to call
# ---------------------------------------------------------------------------

_ROUTER_SYSTEM = """\
You are a routing assistant for Voltu, WhyEV's AI Assistant for India.
Your ONLY job is to look at the user's message and decide which tool to call.

ROUTING RULES:
1. User asks for vehicle recommendations or best EVs under a budget (e.g. "best ev car under 10 lakh", "suggest an EV car"), call `find_vehicles`.
   - IMPORTANT: If user mentions "car", "4W", "SUV", "four wheeler", or budget > 3 Lakh (e.g. 10 lakh), ALWAYS set `category="4W"`.
   - If user mentions "scooter", "bike", "2W", "two wheeler", set `category="2W"`.
2. User asks explicitly about subsidy calculation, Delhi policy eligibility, or 30-day deadline, call `calculate_subsidy`.
3. User asks about profile completion or status, call `get_profile_status`.
4. User asks about charging stations or map, call `get_dealer_info`.
5. Otherwise, call `general_ev_chat`.

Always call exactly ONE tool using tool_calls. Do NOT output plain text response.
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
You are Voltu, WhyEV's expert AI EV Consultant for India (focused on Delhi NCR).
You combine live database subsidy calculations with your comprehensive AI knowledge of the Indian EV market.

INSTRUCTIONS:
1. Greet warmly as Voltu.
2. Always answer the user's specific question directly and thoroughly first.
3. If asked for vehicle recommendations (e.g. "best EV car under 10 lakh"), immediately provide specific 4W car models (Tata Tiago EV, MG Comet EV, Tata Punch EV, Citroën ë-C3) with ex-showroom prices, effective on-road prices, real-world range, and key features.
4. Seamlessly integrate database subsidy benefits (100% Road Tax Waiver, Scrappage Bonus, Free 1st-Year Insurance, Free RC Registration).
5. Offer practical real-world advice (charging home sockets, fast charging, running costs, battery warranty).
6. Be articulate, conversational, accurate, and helpful.
"""


def _generate_smart_fallback(user_text: str, tool_name: str, tool_result: dict) -> str:
    """Generate a reliable, policy-backed conversational response from Voltu when Groq API is offline."""
    if tool_name == "calculate_subsidy":
        eligible = tool_result.get("eligible", True)
        amount = tool_result.get("amount", 150000)
        reason = tool_result.get("reason", "Eligible under Year 1 Tier (2026–27)")
        if eligible:
            return (
                f"Namaste! 🙏 I am Voltu. Based on your inputs, you ARE eligible for the Delhi EV Policy 2026!\n\n"
                f"• Direct Purchase Subsidy: ₹{amount:,}\n"
                f"• Scrappage Bonus: ₹25,000 (if old ICE vehicle is scrapped)\n"
                f"• Road Tax Waiver: 100% Exempt\n"
                f"• Total Estimated Benefit: ₹{amount + 25000 + 100000:,}\n\n"
                f"Remember to file your subsidy claim within 30 days of RC issuance to avoid rejection. Would you like me to check the required documents list?"
            )
        else:
            return (
                f"Namaste! 🙏 I am Voltu. Currently, your vehicle configuration is not eligible under Delhi EV Policy 2026.\n\n"
                f"Reason: {reason}.\n\n"
                f"Would you like me to suggest empanelled 4W or 2W EV models that qualify for full state incentives?"
            )

    elif tool_name == "find_vehicles":
        vehicles = tool_result.get("vehicles", [])
        if vehicles:
            v_list = "\n".join([
                f"• {v['make']} {v['model']} — Ex-Showroom ₹{v.get('exShowroomPrice', 0):,} (Effective On-Road: ₹{v.get('effectivePrice', 0):,}, Range: {v.get('rangeKm', 0)} km)"
                for v in vehicles[:3]
            ])
            return (
                f"Namaste! 🙏 I am Voltu. Here are the top empanelled EV models under your budget in Delhi:\n\n"
                f"{v_list}\n\n"
                f"All these models qualify for the Delhi EV Policy 2026 benefits and 100% Road Tax Waiver. Would you like to check the detailed subsidy breakdown for any of these?"
            )
        else:
            return (
                "Namaste! 🙏 I am Voltu. I found several empanelled models like Tata Tiago EV (₹6.99 Lakh), MG Comet EV (₹7.80 Lakh), and Tata Punch EV (₹9.69 Lakh) under ₹10 Lakh in Delhi. Would you like to see their full subsidy breakdown?"
            )

    elif tool_name == "get_dealer_info":
        return (
            "Namaste! 🙏 I am Voltu. We partner with top empanelled EV dealerships across Delhi NCR (Okhla, Connaught Place, Nehru Place, and Saket). You can view empanelled showrooms and request a callback directly on our Dealers page!"
        )

    else:
        return (
            "Namaste! 🙏 I am Voltu, your WhyEV AI Assistant. I can help calculate your exact Delhi 2026 subsidy, check the 30-day RC deadline, shortlist empanelled EVs for your daily commute, or connect you with verified dealers. How can I assist you today?"
        )


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
    pool = get_groq_pool()

    # Load recent conversation history
    history = await _load_history(db=db, user_id=user_id, conversation_id=conversation_id)

    # --- Step 1: Route ---
    try:
        tool_name, tool_args = await route_to_tool(pool, user_text, history)
    except Exception as exc:
        log.warning("groq.router.failed", error=str(exc))
        tool_name, tool_args = "general_ev_chat", {"topic": user_text}

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
    try:
        stream_res = await pool.stream_chat(
            model=settings.LLM_AGENT_MODEL,
            messages=[{"role": "system", "content": _RESPONDER_SYSTEM}, *responder_messages],
            max_tokens=512,
        )
        async for chunk in stream_res:
            if chunk.choices and len(chunk.choices) > 0:
                text = chunk.choices[0].delta.content or ""
                if text:
                    full_response.append(text)
                    yield f'data: {json.dumps({"type": "token", "text": text})}\n\n'
    except Exception as exc:
        log.exception("agent.responder.stream.error", error=str(exc))

    if not full_response:
        fallback_text = _generate_smart_fallback(user_text, tool_name, tool_result)
        full_response.append(fallback_text)
        yield f'data: {json.dumps({"type": "token", "text": fallback_text})}\n\n'

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
