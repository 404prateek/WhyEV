"""Integration tests for auth flow.

NOTE: WhyEV uses Supabase for authentication (Google OAuth + phone OTP).
Auth is handled entirely by Supabase — there is no custom OTP router in the
FastAPI backend. Token validation happens in app/core/deps.py via
decode_supabase_token().

These tests are placeholders for future auth integration tests against
the Supabase JWT flow.
"""
from __future__ import annotations
