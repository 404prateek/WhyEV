"""Unit tests for the certification service — fully offline, no DB or HTTP.

Tests cover:
- _compute_battery_score: scoring formula correctness
- Score boundary conditions
- BatteryReportOut.model_validate: qr_code_url derivation
"""
from __future__ import annotations

import pytest
from app.services.certification_service import _compute_battery_score
from app.schemas.misc import BatteryReportOut
import uuid
from datetime import date


class TestComputeBatteryScore:
    """Tests for the offline battery score computation function."""

    def test_new_vehicle_low_km_gets_high_score(self):
        score, remaining = _compute_battery_score(2025, 5_000)
        assert score >= 85, f"New vehicle should score >= 85, got {score}"
        assert remaining >= 6.0, f"New vehicle should have >= 6 years remaining, got {remaining}"

    def test_older_vehicle_high_km_gets_lower_score(self):
        score, remaining = _compute_battery_score(2019, 120_000)
        assert score < 60, f"Old high-km vehicle should score < 60, got {score}"

    def test_score_never_exceeds_100(self):
        score, _ = _compute_battery_score(2026, 0)  # brand new, zero km
        assert score <= 100, f"Score must not exceed 100, got {score}"

    def test_score_never_below_zero(self):
        score, remaining = _compute_battery_score(1990, 999_999)  # extreme values
        assert score >= 0, f"Score must not go below 0, got {score}"
        assert remaining >= 0.0, f"Remaining years must not go below 0, got {remaining}"

    def test_known_values_2024_28450(self):
        """Regression test: values from manual verification run."""
        score, remaining = _compute_battery_score(2024, 28_450)
        assert score == 87, f"Expected 87, got {score}"
        assert remaining == 7.0, f"Expected 7.0, got {remaining}"

    def test_known_values_2020_80000(self):
        score, remaining = _compute_battery_score(2020, 80_000)
        assert score == 60, f"Expected 60, got {score}"
        assert remaining == 4.8, f"Expected 4.8, got {remaining}"

    def test_remaining_life_proportional_to_score(self):
        score_low, remaining_low = _compute_battery_score(2019, 100_000)
        score_high, remaining_high = _compute_battery_score(2024, 10_000)
        assert score_high > score_low
        assert remaining_high > remaining_low

    def test_remaining_capped_at_8_years(self):
        _, remaining = _compute_battery_score(2026, 0)
        assert remaining <= 8.0, f"Remaining years must not exceed 8.0 (max), got {remaining}"


class TestBatteryReportOutQrCodeUrl:
    """Tests for BatteryReportOut.model_validate: qr_code_url derivation."""

    def _make_report_dict(self, qr_code: str | None = None) -> dict:
        return {
            "id": uuid.uuid4(),
            "owner_id": uuid.uuid4(),
            "vehicle_model_id": None,
            "inspection_date": date.today(),
            "battery_score": 87,
            "remaining_life_years": 7.0,
            "certificate_valid_until": date.today(),
            "qr_code": qr_code,
        }

    def test_qr_code_url_built_from_token(self):
        raw_token = "abc123xyz"
        data = self._make_report_dict(qr_code=raw_token)
        out = BatteryReportOut.model_validate(data)
        assert out.qr_code_url == f"https://whyev.in/verify/{raw_token}"

    def test_qr_code_url_is_none_when_no_token(self):
        data = self._make_report_dict(qr_code=None)
        out = BatteryReportOut.model_validate(data)
        assert out.qr_code_url is None

    def test_battery_score_preserved(self):
        data = self._make_report_dict(qr_code="some-token")
        out = BatteryReportOut.model_validate(data)
        assert out.battery_score == 87

    def test_remaining_life_preserved(self):
        data = self._make_report_dict(qr_code="some-token")
        out = BatteryReportOut.model_validate(data)
        assert out.remaining_life_years == 7.0
