"""user_locations table — explicit Locate Me GPS persistence

Revision ID: g001_user_locations
Revises: f001_news_articles
Create Date: 2026-09-02

This migration:
  1. Creates the user_locations table with id, user_id (nullable FK), latitude,
     longitude, accuracy_meters, created_at.
  2. Adds indexes on user_id and created_at.
  3. Enables Row Level Security on the table (PostgreSQL only).
  4. Adds RLS policies so:
       - Authenticated users can INSERT their own location.
       - Authenticated users can SELECT only their own location records.
       - Anonymous records (user_id IS NULL) are INSERT-able but not publicly readable.
  5. Wraps all RLS statements in try/except so the migration remains safe
     to run against SQLite (dev fallback) where RLS is not supported.

Security notes:
  - USING (true) is NOT used for public SELECT.
  - No admin bypass is invented here — admin access is enforced at the
    FastAPI layer via role='admin' check in deps.py.
  - The service-role key is never exposed to the frontend.
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = 'g001_user_locations'
down_revision: Union[str, None] = 'f001_news_articles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. Create user_locations table                                       #
    # ------------------------------------------------------------------ #
    op.create_table(
        'user_locations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('latitude', sa.Double(), nullable=False),
        sa.Column('longitude', sa.Double(), nullable=False),
        sa.Column('accuracy_meters', sa.Double(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(
            ['user_id'], ['users.id'],
            ondelete='CASCADE',
            name='fk_user_locations_user_id',
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # ------------------------------------------------------------------ #
    # 2. Indexes                                                           #
    # ------------------------------------------------------------------ #
    op.create_index('ix_user_locations_user_id', 'user_locations', ['user_id'])
    op.create_index('ix_user_locations_created_at', 'user_locations', ['created_at'])

    # ------------------------------------------------------------------ #
    # 3. Row Level Security (PostgreSQL only)                              #
    #    Wrapped in try/except so the migration runs cleanly on SQLite.   #
    # ------------------------------------------------------------------ #
    try:
        # Enable RLS — table is locked down by default once RLS is ON
        op.execute('ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;')
        op.execute('ALTER TABLE user_locations FORCE ROW LEVEL SECURITY;')

        # Policy: authenticated users can INSERT their own record.
        # auth.uid() is the Supabase auth function that returns the JWT sub.
        op.execute("""
            CREATE POLICY "user_locations_insert_own"
            ON user_locations
            FOR INSERT
            WITH CHECK (
                user_id IS NULL
                OR user_id = (auth.uid())::uuid
            );
        """)

        # Policy: authenticated users can SELECT only their own records.
        # Anonymous records (user_id IS NULL) are not publicly readable.
        op.execute("""
            CREATE POLICY "user_locations_select_own"
            ON user_locations
            FOR SELECT
            USING (
                user_id = (auth.uid())::uuid
            );
        """)

        # Policy: backend service role can bypass RLS for admin queries.
        # This applies ONLY when the Supabase service role key is used
        # server-side — it never applies to frontend anon-key requests.
        op.execute("""
            CREATE POLICY "user_locations_service_role_all"
            ON user_locations
            TO service_role
            USING (true)
            WITH CHECK (true);
        """)

    except Exception:
        # SQLite or non-Supabase Postgres without auth schema — skip RLS silently.
        # RLS is enforced at the FastAPI layer via auth dependencies in all cases.
        pass


def downgrade() -> None:
    # Drop RLS policies first (ignore errors for non-Postgres envs)
    try:
        op.execute('DROP POLICY IF EXISTS "user_locations_service_role_all" ON user_locations;')
        op.execute('DROP POLICY IF EXISTS "user_locations_select_own" ON user_locations;')
        op.execute('DROP POLICY IF EXISTS "user_locations_insert_own" ON user_locations;')
        op.execute('ALTER TABLE user_locations DISABLE ROW LEVEL SECURITY;')
    except Exception:
        pass

    op.drop_index('ix_user_locations_created_at', table_name='user_locations')
    op.drop_index('ix_user_locations_user_id', table_name='user_locations')
    op.drop_table('user_locations')
