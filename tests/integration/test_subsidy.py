"""Integration tests for subsidy calculation endpoint."""
from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token


def _auth_header(user_id: str = None) -> dict:
    uid = user_id or str(uuid.uuid4())
    token = create_access_token(uid, {"role": "user"})
    return {"Authorization": f"Bearer {token}"}


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
