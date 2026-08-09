"""Unit test for Charging Station API Endpoints."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.routers.charging import get_db, haversine_distance
from app.db.base import Base


class TestChargingEndpoints:
    def test_haversine_distance(self):
        # Distance between Connaught Place (28.6315, 77.2167) and Nehru Place (28.5492, 77.2520) ~ 9.7 km
        dist = haversine_distance(28.6315, 77.2167, 28.5492, 77.2520)
        assert 9.0 <= dist <= 10.5

    def test_haversine_zero(self):
        dist = haversine_distance(28.6139, 77.2090, 28.6139, 77.2090)
        assert dist == 0.0
