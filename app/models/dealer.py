"""Dealer, DealerLead, Appointment SQLAlchemy models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Dealer(Base):
    __tablename__ = "dealers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    lat: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    lng: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    crm_webhook_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    crm_status: Mapped[str] = mapped_column(String(20), default="not_connected", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    leads: Mapped[list["DealerLead"]] = relationship(back_populates="dealer")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="dealer")


class DealerLead(Base):
    __tablename__ = "dealer_leads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    dealer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dealers.id"), nullable=False, index=True
    )
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles_master.id"), nullable=True
    )
    source_module: Mapped[str | None] = mapped_column(String(20), nullable=True)  # recommendation | subsidy
    status: Mapped[str] = mapped_column(
        String(20), default="new", nullable=False
    )  # new|contacted|converted|dropped
    consent_given_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )  # null until explicit opt-in
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    dealer: Mapped["Dealer"] = relationship(back_populates="leads")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    dealer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dealers.id"), nullable=False
    )
    type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # test_drive | inspection
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="booked", nullable=False)

    dealer: Mapped["Dealer"] = relationship(back_populates="appointments")
