"""User, UserProfile, RefreshToken SQLAlchemy models."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    ARRAY,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(20), default="phone", nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationships
    profile: Mapped["UserProfile | None"] = relationship(back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    intent: Mapped[str | None] = mapped_column(String(20), nullable=True)
    budget_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    budget_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True)
    is_delhi_ncr: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    daily_km: Mapped[int | None] = mapped_column(Integer, nullable=True)
    housing_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    parking_socket_access: Mapped[str | None] = mapped_column(String(10), nullable=True)
    family_size: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_categories: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    charging_preference: Mapped[str | None] = mapped_column(String(10), nullable=True)
    finance_pref: Mapped[str | None] = mapped_column(String(10), nullable=True)
    emi_comfort: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profile")
