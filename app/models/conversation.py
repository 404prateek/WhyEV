"""AiConversation SQLAlchemy model with pgvector embedding column."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

try:
    from pgvector.sqlalchemy import Vector
    _HAS_PGVECTOR = True
except ImportError:
    _HAS_PGVECTOR = False


class AiConversation(Base):
    __tablename__ = "ai_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    agent_type: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )  # profile|eligibility|financial|recommendation|dealer_matching|followup
    message_role: Mapped[str | None] = mapped_column(
        String(10), nullable=True
    )  # user | agent
    message_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Vector embedding — conditionally typed to avoid hard dependency on pgvector
    embedding: Mapped[object | None] = mapped_column(
        Vector(1536) if _HAS_PGVECTOR else Text,  # type: ignore[arg-type]
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
