"""ChargingStation, Connector, StationReview, ReliabilityScore, CrowdsourcedCheckin SQLAlchemy models."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    google_place_id: Mapped[str | None] = mapped_column(
        String(128), nullable=True, unique=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    operator: Mapped[str | None] = mapped_column(String(120), nullable=True, default="Unknown")
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True, default="Delhi NCR")
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    business_status: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="OPERATIONAL"
    )
    rating: Mapped[float | None] = mapped_column(Float, nullable=True, default=4.0)
    user_ratings_total: Mapped[int | None] = mapped_column(Integer, nullable=True, default=0)
    price_per_unit: Mapped[float | None] = mapped_column(Float, nullable=True)
    operating_hours: Mapped[str | None] = mapped_column(String(120), nullable=True, default="24/7")
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    connectors: Mapped[list["Connector"]] = relationship(
        "Connector", back_populates="station", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["StationReview"]] = relationship(
        "StationReview", back_populates="station", cascade="all, delete-orphan"
    )
    reliability_score_rel: Mapped["ReliabilityScore | None"] = relationship(
        "ReliabilityScore", back_populates="station", uselist=False, cascade="all, delete-orphan"
    )
    checkins: Mapped[list["CrowdsourcedCheckin"]] = relationship(
        "CrowdsourcedCheckin", back_populates="station", cascade="all, delete-orphan"
    )


class Connector(Base):
    __tablename__ = "connectors"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    station_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(40), nullable=False)  # CCS2, Type 2, CHAdeMO, GB/T, 15A Plug
    power_kw: Mapped[float | None] = mapped_column(Float, nullable=True, default=30.0)
    total_guns: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    available_guns: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    station: Mapped["ChargingStation"] = relationship("ChargingStation", back_populates="connectors")


class StationReview(Base):
    __tablename__ = "station_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    station_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Classification fields
    is_relevant: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=True)
    sentiment: Mapped[str | None] = mapped_column(String(20), nullable=True)  # positive | negative | neutral
    mentions_broken: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    mentions_closed: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    mentions_slow_or_queue: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    station: Mapped["ChargingStation"] = relationship("ChargingStation", back_populates="reviews")


class ReliabilityScore(Base):
    __tablename__ = "reliability_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    station_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    reliability_score: Mapped[int] = mapped_column(Integer, nullable=False, default=85)
    label: Mapped[str] = mapped_column(
        String(30), nullable=False, default="working"
    )  # working | risky | likely_not_working | unverified
    recency_weighted_rating_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    keyword_sentiment_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    crowdsource_confirmation_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    business_status_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    review_freshness_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    last_computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    station: Mapped["ChargingStation"] = relationship("ChargingStation", back_populates="reliability_score_rel")


class CrowdsourcedCheckin(Base):
    __tablename__ = "crowdsourced_checkins"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    station_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False)  # working | busy | broken
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    station: Mapped["ChargingStation"] = relationship("ChargingStation", back_populates="checkins")
