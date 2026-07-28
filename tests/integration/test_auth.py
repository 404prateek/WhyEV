"""Integration tests for auth endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
class TestOtpFlow:
    async def test_otp_request_returns_sent(self, client: AsyncClient):
        with patch("app.routers.auth.generate_otp", return_value="123456"), \
             patch("app.routers.auth._check_rate_limit", new_callable=AsyncMock):
            resp = await client.post(
                "/api/v1/auth/otp/request", json={"phone": "+919999999999"}
            )
        assert resp.status_code == 200
        assert resp.json()["sent"] is True

    async def test_invalid_phone_rejected(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/otp/request", json={"phone": "notaphone"}
        )
        assert resp.status_code == 422

    async def test_otp_verify_wrong_code(self, client: AsyncClient):
        with patch("app.routers.auth._check_rate_limit", new_callable=AsyncMock), \
             patch("app.core.deps.get_redis") as mock_redis:
            mock_redis.return_value.get = AsyncMock(return_value=None)
            resp = await client.post(
                "/api/v1/auth/otp/verify",
                json={"phone": "+919999999999", "code": "000000"},
            )
        assert resp.status_code == 401
