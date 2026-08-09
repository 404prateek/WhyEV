"""VehicleMaster SQLAlchemy model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class VehicleMaster(Base):
    __tablename__ = "vehicles_master"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    make: Mapped[str] = mapped_column(String(60), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    variant: Mapped[str | None] = mapped_column(String(80), nullable=True)
    body_type: Mapped[str] = mapped_column(String(40), nullable=False)  # 2W | 3W | 4W_car | 4W_commercial
    ex_showroom_price: Mapped[float] = mapped_column(Numeric, nullable=False)
    battery_capacity_kwh: Mapped[float] = mapped_column(Numeric, nullable=False)
    claimed_range_km: Mapped[int] = mapped_column(Integer, nullable=False)
    real_world_range_km: Mapped[int | None] = mapped_column(Integer, nullable=True)
    specs: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
