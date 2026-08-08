"""Unit tests for the Stage 1 keyword filter and Stage 2 relevance check.

These tests are fully offline — no DB, no HTTP, no LLM calls.
They test the deterministic filtering logic only.
"""
from __future__ import annotations

import pytest

from app.services.news_service import keyword_score, passes_stage2, _assign_category


# ---------------------------------------------------------------------------
# Stage 1 — keyword_score tests
# ---------------------------------------------------------------------------

class TestKeywordScore:
    def test_strong_ev_title_gets_high_score(self):
        score = keyword_score(
            "Delhi EV Policy 2026: Complete Subsidy Guide for EV Buyers",
            "Everything about Delhi state EV subsidy scheme including PM E-DRIVE incentives"
        )
        assert score >= 60, f"Expected >= 60, got {score}"

    def test_tata_nexon_ev_article(self):
        score = keyword_score(
            "Tata Nexon EV vs Curvv EV: Which Should You Buy?",
            "We compare the two bestselling Tata EV models on range, price and charging speed"
        )
        assert score >= 50, f"Expected >= 50, got {score}"

    def test_charging_station_article(self):
        score = keyword_score(
            "100 New CCS2 Fast Charging Stations for Delhi NCR",
            "Tata Power deploys 100 high-speed EV charging points across Delhi NCR highway corridors"
        )
        assert score >= 50, f"Expected >= 50, got {score}"

    def test_non_ev_petrol_car_gets_zero_or_low(self):
        score = keyword_score(
            "Best Petrol Cars Under 10 Lakh in India 2026",
            "Top petrol car options with best mileage and features for Indian buyers"
        )
        # Should score below the threshold (30), may score 0-25 from Tier-3 keywords
        assert score < 40, f"Expected < 40 (non-EV article), got {score}"

    def test_formula1_article_penalised(self):
        score = keyword_score(
            "Formula 1 2026: Max Verstappen Wins Monaco Grand Prix",
            "A thrilling race on the Monaco circuit with classic overtakes"
        )
        assert score < 20, f"Expected < 20 (F1 article), got {score}"

    def test_generic_auto_article_below_threshold(self):
        score = keyword_score(
            "Maruti Suzuki Launches New BS-VI Petrol Variant of Alto",
            "Maruti Alto gets a new 1.0L petrol engine meeting BS-VI emission norms"
        )
        assert score < 30, f"Expected below threshold, got {score}"

    def test_kwh_battery_article_scores_high(self):
        score = keyword_score(
            "New 60 kWh Lithium Battery Packs Will Cut EV Range Anxiety",
            "The 60 kWh LiFePO4 battery provides 500 km real-world range in EVs"
        )
        assert score >= 40, f"Expected >= 40, got {score}"

    def test_score_capped_at_100(self):
        score = keyword_score(
            "electric vehicle EV India charging station subsidy FAME scheme lithium battery kwh",
            "ev ev ev ev ev electric vehicle electric vehicle electric vehicle",
        )
        assert score <= 100, f"Score must not exceed 100, got {score}"

    def test_score_floor_at_zero(self):
        score = keyword_score(
            "Formula 1 classic vintage petrol diesel car rally F1 NASCAR",
            "ice vehicle diesel car petrol car vintage car luxury yacht"
        )
        assert score >= 0, f"Score must not go below 0, got {score}"


# ---------------------------------------------------------------------------
# Stage 2 — passes_stage2 tests
# ---------------------------------------------------------------------------

class TestPassesStage2:
    def test_delhi_ev_policy_passes(self):
        assert passes_stage2(
            "Delhi Extends EV Subsidy Scheme",
            "The Delhi government announced extension of the state EV policy with enhanced subsidies",
            kw_score_val=70
        ) is True

    def test_high_score_no_india_signal_with_very_high_score_passes(self):
        # Score >= 80 with no India signal should still pass (globally relevant EV)
        assert passes_stage2(
            "New 150 kWh Battery Pack Achieves 800 km Real-World EV Range",
            "Battery chemistry breakthrough in EV lithium packs enables 800km range",
            kw_score_val=85
        ) is True

    def test_generic_auto_with_low_score_fails(self):
        assert passes_stage2(
            "New Maruti Car Launch",
            "Maruti Suzuki announces a new car for Indian buyers",
            kw_score_val=15
        ) is False

    def test_global_ev_with_moderate_score_no_india_fails(self):
        # Moderate score (35) with no India signal should fail Stage 2
        assert passes_stage2(
            "Tesla Model 3 Charging Speed Review",
            "We tested the Model 3 Level 2 charging speed on a US highway",
            kw_score_val=35
        ) is False

    def test_ola_electric_passes(self):
        assert passes_stage2(
            "Ola Electric S1 Pro Now Available in Delhi",
            "Ola Electric has opened bookings for the S1 Pro electric scooter in Delhi",
            kw_score_val=55
        ) is True


# ---------------------------------------------------------------------------
# Category assignment tests
# ---------------------------------------------------------------------------

class TestAssignCategory:
    def test_subsidy_article_categorised(self):
        assert _assign_category("Delhi EV Subsidy Scheme", "New FAME subsidy for buyers") == "Policy & Subsidies"

    def test_launch_article_categorised(self):
        assert _assign_category("Tata Curvv EV Launch Price", "Tata unveils the Curvv EV") == "New Launches"

    def test_charging_article_categorised(self):
        assert _assign_category("New Fast Charger Hub", "CCS2 charging station opens") == "Charging Infra"

    def test_battery_article_categorised(self):
        assert _assign_category("NMC Battery vs LFP Range", "Battery kwh chemistry") == "Battery Tech"

    def test_sales_article_categorised(self):
        assert _assign_category("EV Sales Q2 2026 Vahan", "EV registrations grew 40%") == "Market & Sales"

    def test_fallback_category(self):
        assert _assign_category("Something Random", "No clear category here") == "Industry News"
