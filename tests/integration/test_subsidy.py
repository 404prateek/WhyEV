"""Integration tests for subsidy calculation endpoint."""
from __future__ import annotations

from unittest.mock import patch

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Auth helper — uses the dev-token bypass already built into deps.py.
# When DEBUG=True, the bearer value "dev-token-xyz" resolves to the
# zero-UUID guest user without hitting Supabase.
# ---------------------------------------------------------------------------

def _auth_header() -> dict:
    return {"Authorization": "Bearer dev-token-xyz"}


@pytest.mark.asyncio
class TestSubsidyCalc:
    async def test_non_delhi_returns_ineligible(self, client: AsyncClient):
        with patch("app.routers.subsidy.calculate_subsidy") as mock_calc:
            from app.services.eligibility_service import EligibilityResult
            mock_calc.return_value = EligibilityResult(
                eligible=False, reason="Not Delhi NCR"
            )
            resp = await client.post(
                "/api/v1/subsidy/calculate",
                json={"category": "2W", "city": "mumbai", "price": 100000},
                headers=_auth_header(),
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["eligible"] is False
        assert "Not Delhi NCR" in data["reason"]

    async def test_public_rules_endpoint_no_auth(self, client: AsyncClient):
        """Rules endpoint must be accessible without JWT."""
        resp = await client.get("/api/v1/subsidy/rules/current")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
