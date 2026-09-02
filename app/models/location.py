"""UserLocation SQLAlchemy model — stores explicit 'Locate Me' coordinates per user action."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Double, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class UserLocation(Base):
    """
    Stores the GPS coordinates obtained after a user explicitly clicks 'Locate Me'.

    Design decisions:
    - user_id is nullable: anonymous (unauthenticated) Locate Me clicks are stored
      with user_id=NULL rather than the shared guest UUID to avoid polluting
      a synthetic identity with real location data.
    - No street address: raw coordinates are the source of truth.
    - No watchPosition: this is NOT continuous tracking — one record per explicit action.
    """

    __tablename__ = "user_locations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Nullable: anonymous users (no JWT) have user_id=NULL
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    latitude: Mapped[float] = mapped_column(Double, nullable=False)
    longitude: Mapped[float] = mapped_column(Double, nullable=False)
    # accuracy_meters: browser-provided radius in metres (position.coords.accuracy)
    accuracy_meters: Mapped[float | None] = mapped_column(Double, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
