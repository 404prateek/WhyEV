"""BatteryReport SQLAlchemy model."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class BatteryReport(Base):
    __tablename__ = "battery_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    vehicle_model_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles_master.id"), nullable=True
    )
    inspection_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    battery_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    remaining_life_years: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)
    certificate_valid_until: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    qr_code: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    s3_report_key: Mapped[str | None] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
