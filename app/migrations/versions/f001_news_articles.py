"""add_news_articles_table

Revision ID: f001_news_articles
Revises: e001_lead_pipeline
Create Date: 2026-08-06

Changes:
  CREATE TABLE news_articles — stores EV-filtered articles ingested from
  NewsData.io (primary) / Currents API (fallback).
  Includes dedup key (source_id), Stage 1 kw_score, Stage 3 llm_label.

  Note: news_category, news_preferences, news_bookmarks, news_read_history
  tables are NOT included here. They belong to Phase 2 (personalization)
  and will be added in a separate migration once the backend business logic
  and API contracts for those features are fully designed.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f001_news_articles"
down_revision: Union[str, None] = "e001_lead_pipeline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "news_articles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("source_id", sa.String(length=128), nullable=False),
        sa.Column("provider", sa.String(length=20), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("slug", sa.String(length=256), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content_snippet", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("article_url", sa.Text(), nullable=True),
        sa.Column("author", sa.String(length=200), nullable=True),
        sa.Column("source_name", sa.String(length=200), nullable=True),
        sa.Column("category", sa.String(length=60), nullable=True),
        sa.Column("kw_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("llm_label", sa.String(length=20), nullable=True),
        sa.Column("tags", sa.ARRAY(sa.Text()), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "ingested_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_news_articles_source_id", "news_articles", ["source_id"], unique=True)
    op.create_index("ix_news_articles_slug", "news_articles", ["slug"], unique=True)
    op.create_index("ix_news_articles_category", "news_articles", ["category"], unique=False)
    op.create_index("ix_news_articles_published_at", "news_articles", ["published_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_news_articles_published_at", table_name="news_articles")
    op.drop_index("ix_news_articles_category", table_name="news_articles")
    op.drop_index("ix_news_articles_slug", table_name="news_articles")
    op.drop_index("ix_news_articles_source_id", table_name="news_articles")
    op.drop_table("news_articles")
