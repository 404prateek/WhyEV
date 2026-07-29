"""AI Agent router — SSE streaming endpoint."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.core.deps import CurrentUserObj, CurrentUserOptional, DBSession
from app.models.conversation import AiConversation
from app.schemas.misc import AgentConversationTurnOut, AgentMessageIn
from app.services.agent_orchestrator import stream_agent_response

router = APIRouter()


@router.post("/agent/message")
async def send_agent_message(
    body: AgentMessageIn, user: CurrentUserOptional, db: DBSession
) -> StreamingResponse:
    conversation_id = body.conversation_id or uuid.uuid4()

    async def generator():
        async for chunk in stream_agent_response(
            db=db,
            user_id=user.id,
            conversation_id=conversation_id,
            user_text=body.text,
        ):
            yield chunk

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Conversation-Id": str(conversation_id),
        },
    )


@router.get("/agent/conversation/{conversation_id}", response_model=list[AgentConversationTurnOut])
async def get_conversation(
    conversation_id: uuid.UUID, user: CurrentUserObj, db: DBSession
) -> list[AgentConversationTurnOut]:
    stmt = (
        select(AiConversation)
        .where(
            AiConversation.conversation_id == conversation_id,
            AiConversation.user_id == user.id,
        )
        .order_by(AiConversation.created_at)
    )
    result = await db.execute(stmt)
    turns = result.scalars().all()
    if not turns:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return [AgentConversationTurnOut.model_validate(t) for t in turns]
