"""SubsidyRule and SubsidyApplication models — append-only, versioned."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class SubsidyRule(Base):
    """Append-only versioned subsidy rule table.

    A new policy value creates a new row (status='draft').  Two distinct admins
    must approve before status flips to 'live'; the previous live row flips to
    'superseded'.  Rows are never deleted or updated in-place.
    """
    __tablename__ = "subsidy_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    year_tier: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1 | 2 | 3
    amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_ceiling: Mapped[int | None] = mapped_column(Integer, nullable=True)
    effective_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="draft", nullable=False, index=True
    )  # draft | pending_review | live | superseded

    # Two-person review: first_approver + approved_by (second approver)
    first_approver_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class SubsidyApplication(Base):
    __tablename__ = "subsidy_applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles_master.id"), nullable=True
    )
    registration_state: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rc_issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    filing_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)  # rc + 30 days
    scrappage_tradein: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="calculated", nullable=False, index=True
    )  # calculated|documents_pending|submitted|disbursed|rejected
    amount_calculated: Mapped[int | None] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    disbursed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
