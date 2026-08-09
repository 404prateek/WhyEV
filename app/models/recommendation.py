"""Recommendation SQLAlchemy model — persists every questionnaire → shortlist run."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ARRAY, DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    # Raw intake payload (RecommendationIn as dict)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    # Enriched shortlist returned to the user (list of vehicle dicts)
    shortlist: Mapped[list] = mapped_column(JSON, nullable=False)
    # Assumption strings generated during matching
    assumptions: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # Back-reference to leads created from this recommendation
    leads: Mapped[list["DealerLead"]] = relationship(  # noqa: F821
        "DealerLead", back_populates="recommendation", foreign_keys="DealerLead.recommendation_id"
    )
