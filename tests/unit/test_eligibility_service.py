"""Unit tests for the subsidy eligibility engine — the USP of WhyEV."""
from __future__ import annotations

import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.eligibility_service import (
    EligibilityResult,
    DELHI_NCR_CITIES,
    SCRAPPAGE_BONUS,
    calculate_subsidy,
    city_is_delhi_ncr,
)


# ---------------------------------------------------------------------------
# city_is_delhi_ncr
# ---------------------------------------------------------------------------

class TestCityIsDelhi:
    def test_delhi_ncr_cities_covered(self):
        for city in ["delhi", "gurugram", "noida", "faridabad", "ghaziabad"]:
            assert city_is_delhi_ncr(city), f"{city} should be Delhi NCR"

    def test_non_delhi_cities_rejected(self):
        for city in ["mumbai", "bangalore", "pune", "chennai"]:
            assert not city_is_delhi_ncr(city), f"{city} should NOT be Delhi NCR"

    def test_case_insensitive(self):
        assert city_is_delhi_ncr("Delhi")
        assert city_is_delhi_ncr("GURUGRAM")
        assert city_is_delhi_ncr("  Noida  ")


# ---------------------------------------------------------------------------
# calculate_subsidy
# ---------------------------------------------------------------------------

def _mock_rule(amount: int = 15_000, price_ceiling: int = 150_000, category: str = "2W"):
    rule = MagicMock()
    rule.id = uuid.uuid4()
    rule.amount = amount
    rule.price_ceiling = price_ceiling
    rule.category = category
    rule.year_tier = 1
    return rule


@pytest.mark.asyncio
class TestCalculateSubsidy:
    async def _run(self, db, category="2W", price=100_000, city="delhi",
                   rc_date=None, scrappage="no"):
        return await calculate_subsidy(
            db=db,
            category=category,
            vehicle_price=price,
            city=city,
            rc_issue_date=rc_date,
            scrappage=scrappage,
        )

    async def test_non_delhi_ineligible(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute.return_value = mock_result
        result = await self._run(db, city="mumbai")
        assert result.eligible
        assert result.breakdown["state"] == "Maharashtra"

        result_unempanelled = await calculate_subsidy(
            db=db,
            category="2W",
            vehicle_price=100_000,
            city="delhi",
            rc_issue_date=None,
            scrappage="no",
            is_empanelled=False,
        )
        assert not result_unempanelled.eligible

    async def test_no_matching_rule_ineligible(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute.return_value = mock_result

        # Non-empanelled model returns ineligible
        result = await calculate_subsidy(
            db=db,
            category="2W",
            vehicle_price=100_000,
            city="delhi",
            rc_issue_date=None,
            scrappage="no",
            is_empanelled=False,
        )
        assert not result.eligible

    async def test_eligible_2w(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = _mock_rule(amount=15_000)
        db.execute.return_value = mock_result

        result = await self._run(db, city="delhi", price=80_000)
        assert result.eligible
        assert result.breakdown is not None
        assert result.breakdown["direct_subsidy"] == 15_000
        assert result.breakdown["scrappage_bonus"] == 0

    async def test_scrappage_bonus_added(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = _mock_rule(amount=15_000, category="2W")
        db.execute.return_value = mock_result

        result = await self._run(db, city="delhi", scrappage="yes")
        assert result.eligible
        assert result.breakdown["direct_subsidy"] == 15_000
        assert result.breakdown["scrappage_bonus"] == SCRAPPAGE_BONUS["2W"]

    async def test_deadline_computed_from_rc_date(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = _mock_rule()
        db.execute.return_value = mock_result

        rc = date(2024, 1, 1)
        result = await self._run(db, city="delhi", rc_date=rc)
        assert result.deadline == rc + timedelta(days=30)

    async def test_no_deadline_without_rc(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = _mock_rule()
        db.execute.return_value = mock_result

        result = await self._run(db, city="delhi", rc_date=None)
        assert result.deadline is None


# ---------------------------------------------------------------------------
# Two-person approval enforcement
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
class TestSubsidyRuleApproval:
    async def test_self_approval_rejected(self):
        from app.services.eligibility_service import approve_rule

        admin_id = uuid.uuid4()
        rule = MagicMock()
        rule.id = uuid.uuid4()
        rule.status = "pending_review"
        rule.first_approver_id = admin_id  # Same admin!
        rule.category = "2W"

        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = rule
        db.execute.return_value = mock_result

        with pytest.raises(PermissionError, match="Self-approval"):
            await approve_rule(db=db, rule_id=rule.id, admin_id=admin_id)

    async def test_second_approver_succeeds(self):
        from app.services.eligibility_service import approve_rule

        first_admin = uuid.uuid4()
        second_admin = uuid.uuid4()

        rule = MagicMock()
        rule.id = uuid.uuid4()
        rule.status = "pending_review"
        rule.first_approver_id = first_admin
        rule.category = "2W"

        db = AsyncMock()
        mock_rule_result = MagicMock()
        mock_rule_result.scalar_one_or_none.return_value = rule

        mock_live_result = MagicMock()
        mock_live_result.scalars.return_value.all.return_value = []

        db.execute.side_effect = [mock_rule_result, mock_live_result]

        approved = await approve_rule(db=db, rule_id=rule.id, admin_id=second_admin)
        assert approved.status == "live"
        assert approved.approved_by == second_admin
