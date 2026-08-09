"""SQLAlchemy model for persisted news articles."""
from __future__ import annotations

from datetime import datetime, timezone
import uuid

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base



class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # Deduplication key — sha256 of (source_id + provider)
    source_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)  # 'newsdata' | 'currents'

    # Core article content
    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(String(256), nullable=False, unique=True, index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    article_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Classification
    category: Mapped[str | None] = mapped_column(String(60), nullable=True, index=True)
    # Stage 1 keyword filter score (0-100); articles below threshold are not stored
    kw_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Stage 3 LLM classification result: 'ev_relevant' | 'ambiguous' | 'rejected'
    llm_label: Mapped[str | None] = mapped_column(String(20), nullable=True)

    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Timestamps
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
