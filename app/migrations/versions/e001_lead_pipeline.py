"""phase_e_lead_pipeline

Revision ID: e001_lead_pipeline
Revises: 9fece0e7bc0f
Create Date: 2026-08-06

Changes:
  1. CREATE TABLE recommendations
  2. ALTER TABLE dealer_leads:
     - dealer_id: NOT NULL → NULL (unassigned leads)
     - ADD recommendation_id FK
     - ADD questionnaire_snapshot JSONB
     - ADD lead_quality_score SMALLINT
     - Widen status column to VARCHAR(30)
     - Change status default to 'unassigned'
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "e001_lead_pipeline"
down_revision: Union[str, None] = "9fece0e7bc0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. CREATE TABLE recommendations
    # ------------------------------------------------------------------ #
    op.create_table(
        "recommendations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("shortlist", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("assumptions", sa.ARRAY(sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recommendations_user_id"), "recommendations", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_recommendations_created_at"), "recommendations", ["created_at"], unique=False
    )

    # ------------------------------------------------------------------ #
    # 2. ALTER TABLE dealer_leads
    # ------------------------------------------------------------------ #

    # 2a. Make dealer_id nullable (allow unassigned auto-created leads)
    op.alter_column("dealer_leads", "dealer_id", nullable=True)

    # 2b. Widen status column to VARCHAR(30) and change default
    op.alter_column(
        "dealer_leads",
        "status",
        type_=sa.String(30),
        existing_nullable=False,
        server_default="unassigned",
    )

    # 2c. Add recommendation_id FK column
    op.add_column(
        "dealer_leads",
        sa.Column("recommendation_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        "fk_dealer_leads_recommendation_id",
        "dealer_leads",
        "recommendations",
        ["recommendation_id"],
        ["id"],
    )
    op.create_index(
        op.f("ix_dealer_leads_recommendation_id"),
        "dealer_leads",
        ["recommendation_id"],
        unique=False,
    )

    # 2d. Add questionnaire_snapshot JSONB
    op.add_column(
        "dealer_leads",
        sa.Column(
            "questionnaire_snapshot",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )

    # 2e. Add lead_quality_score SMALLINT
    op.add_column(
        "dealer_leads",
        sa.Column("lead_quality_score", sa.SmallInteger(), nullable=True, server_default="0"),
    )

    # 2f. Add index on status for unassigned lead queue
    op.create_index(
        op.f("ix_dealer_leads_status"), "dealer_leads", ["status"], unique=False
    )


def downgrade() -> None:
    # ------------------------------------------------------------------ #
    # Reverse in opposite order
    # ------------------------------------------------------------------ #
    op.drop_index(op.f("ix_dealer_leads_status"), table_name="dealer_leads")
    op.drop_column("dealer_leads", "lead_quality_score")
    op.drop_column("dealer_leads", "questionnaire_snapshot")
    op.drop_index(
        op.f("ix_dealer_leads_recommendation_id"), table_name="dealer_leads"
    )
    op.drop_constraint(
        "fk_dealer_leads_recommendation_id", "dealer_leads", type_="foreignkey"
    )
    op.drop_column("dealer_leads", "recommendation_id")
    op.alter_column(
        "dealer_leads",
        "status",
        type_=sa.String(20),
        existing_nullable=False,
        server_default="new",
    )
    op.alter_column("dealer_leads", "dealer_id", nullable=False)

    op.drop_index(op.f("ix_recommendations_created_at"), table_name="recommendations")
    op.drop_index(op.f("ix_recommendations_user_id"), table_name="recommendations")
    op.drop_table("recommendations")
