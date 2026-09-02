import pytest
import jwt
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_location_anonymous():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/locations",
            json={"latitude": 28.6139, "longitude": 77.2090, "accuracy_meters": 15.0}
        )
        assert res.status_code == 201
        assert res.json() == {"success": True}

@pytest.mark.asyncio
async def test_location_validation_error():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/locations",
            json={"latitude": 95.0, "longitude": 77.2090}
        )
        assert res.status_code == 422

@pytest.mark.asyncio
async def test_location_authenticated():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = jwt.encode(
            {"sub": "5e5e40f7-9cda-4037-a4b4-d9dcbcb71a85", "role": "authenticated", "exp": 253402300799},
            settings.SUPABASE_JWT_SECRET,
            algorithm="HS256"
        )
        res = await client.post(
            "/api/v1/locations",
            json={"latitude": 28.5355, "longitude": 77.3910, "accuracy_meters": 12.0},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 201
        assert res.json() == {"success": True}
