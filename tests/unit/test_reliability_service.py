"""Unit tests for the Reliability Scoring Engine."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone
from app.models.charging import ChargingStation, StationReview, CrowdsourcedCheckin
from app.services.reliability_service import calculate_station_reliability


class TestReliabilityEngine:
    def test_cold_start_unverified(self):
        station = ChargingStation(
            name="Test Station",
            business_status="OPERATIONAL",
            rating=4.5,
        )
        reviews = []
        checkins = []
        result = calculate_station_reliability(station, reviews, checkins)
        assert result["label"] == "unverified"
        assert result["score"] >= 60

    def test_working_station_high_score(self):
        station = ChargingStation(
            name="Test Station High",
            business_status="OPERATIONAL",
            rating=4.8,
        )
        now = datetime.now(timezone.utc)
        reviews = [
            StationReview(rating=5.0, time=now, sentiment="positive", mentions_broken=False)
            for _ in range(5)
        ]
        checkins = [
            CrowdsourcedCheckin(status="working", created_at=now)
            for _ in range(3)
        ]
        result = calculate_station_reliability(station, reviews, checkins)
        assert result["label"] == "working"
        assert result["score"] >= 75

    def test_broken_station_low_score(self):
        station = ChargingStation(
            name="Test Broken Station",
            business_status="CLOSED_TEMPORARILY",
            rating=1.5,
        )
        now = datetime.now(timezone.utc)
        reviews = [
            StationReview(rating=1.0, time=now, sentiment="negative", mentions_broken=True)
            for _ in range(5)
        ]
        checkins = [
            CrowdsourcedCheckin(status="broken", created_at=now)
            for _ in range(3)
        ]

        result = calculate_station_reliability(station, reviews, checkins)
        assert result["label"] == "likely_not_working"
        assert result["score"] < 45
