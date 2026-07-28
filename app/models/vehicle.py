"""VehicleMaster SQLAlchemy model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class VehicleMaster(Base):
    __tablename__ = "vehicles_master"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    make: Mapped[str | None] = mapped_column(String(80), nullable=True)
    model: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    category: Mapped[str | None] = mapped_column(String(10), nullable=True, index=True)  # 2W | 3W | N1_goods
    price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    range_km: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_empanelled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    empanelled_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    specs: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
