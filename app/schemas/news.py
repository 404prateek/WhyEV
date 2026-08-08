"""Pydantic schemas for the news feed API."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl, field_validator


class NewsArticleOut(BaseModel):
    """Response schema for a single EV news article."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    slug: str
    title: str
    summary: str | None = None
    image_url: str | None = None
    article_url: str | None = None
    author: str | None = None
    source_name: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_featured: bool = False
    published_at: datetime | None = None
    provider: str


class NewsListResponse(BaseModel):
    """Paginated list of news articles."""

    articles: list[NewsArticleOut]
    total: int
    page: int
    page_size: int
    has_more: bool


class NewsIngestResult(BaseModel):
    """Internal result returned by the ingestion service — not exposed on the public API."""

    fetched: int
    passed_stage1: int
    passed_stage3: int
    stored: int
    duplicates_skipped: int
    provider_used: str
