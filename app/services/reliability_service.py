"""Reliability scoring calculation service for EV charging stations."""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.charging import ChargingStation, CrowdsourcedCheckin, ReliabilityScore, StationReview


def calculate_station_reliability(
    station: ChargingStation,
    reviews: Sequence[StationReview],
    checkins: Sequence[CrowdsourcedCheckin],
) -> dict[str, float | int | str]:
    """
    Computes reliability score (0-100) and component metrics according to WhyEV System Architecture specs.
    """
    now = datetime.now(timezone.utc)

    # 1. Business Status Score
    bs_str = (station.business_status or "OPERATIONAL").upper()
    if bs_str == "OPERATIONAL":
        business_status_score = 1.0
    elif bs_str == "CLOSED_TEMPORARILY":
        business_status_score = 0.3
    else:
        business_status_score = 0.0

    total_signals = len(reviews) + len(checkins)

    # Cold start handling (< 5 signals)
    if total_signals < 5:
        base_score = int(round(business_status_score * 60 + (station.rating or 4.0) * 5))
        score = max(0, min(100, base_score))
        return {
            "score": score,
            "label": "unverified",
            "recency_score": 0.8,
            "keyword_score": 0.8,
            "crowdsource_score": 0.8,
            "business_score": business_status_score,
            "freshness_score": 0.8,
        }

    # 2. Recency Weighted Rating Score (decay lambda = 0.05)
    weighted_rating_sum = 0.0
    weight_sum = 0.0
    latest_event_days = 999.0

    for r in reviews:
        review_date = r.time or station.created_at or now
        days_ago = max(0.0, (now - review_date.astimezone(timezone.utc)).total_seconds() / 86400.0)
        latest_event_days = min(latest_event_days, days_ago)
        
        w = math.exp(-0.05 * days_ago)
        r_rating = r.rating if r.rating is not None else (station.rating or 4.0)
        weighted_rating_sum += w * (r_rating / 5.0)
        weight_sum += w

    if weight_sum > 0:
        recency_weighted_rating_score = min(1.0, max(0.0, weighted_rating_sum / weight_sum))
    else:
        recency_weighted_rating_score = (station.rating or 4.0) / 5.0

    # 3. Keyword / AI Sentiment Score
    if reviews:
        neg_count = sum(1 for r in reviews if r.mentions_broken or r.mentions_closed or r.sentiment == "negative")
        keyword_sentiment_score = min(1.0, max(0.0, 1.0 - (neg_count / len(reviews))))
    else:
        keyword_sentiment_score = 0.8

    # 4. Crowdsourced Check-in Score
    for c in checkins:
        c_date = c.created_at or now
        days_ago = max(0.0, (now - c_date.astimezone(timezone.utc)).total_seconds() / 86400.0)
        latest_event_days = min(latest_event_days, days_ago)

    if checkins:
        working_checkins = sum(1 for c in checkins if c.status == "working")
        crowdsource_score = working_checkins / len(checkins)
    else:
        crowdsource_score = 0.8

    # 5. Freshness Score
    if latest_event_days < 999.0:
        freshness_score = max(0.2, min(1.0, math.exp(-0.02 * latest_event_days)))
    else:
        freshness_score = 0.5

    # Formula:
    # 35 * recency_weighted + 25 * keyword_sentiment + 20 * crowdsource + 10 * business_status + 10 * freshness
    raw_score = (
        35.0 * recency_weighted_rating_score
        + 25.0 * keyword_sentiment_score
        + 20.0 * crowdsource_score
        + 10.0 * business_status_score
        + 10.0 * freshness_score
    )
    final_score = int(round(max(0.0, min(100.0, raw_score))))

    if final_score >= 75:
        label = "working"
    elif final_score >= 45:
        label = "risky"
    else:
        label = "likely_not_working"

    return {
        "score": final_score,
        "label": label,
        "recency_score": round(recency_weighted_rating_score, 3),
        "keyword_score": round(keyword_sentiment_score, 3),
        "crowdsource_score": round(crowdsource_score, 3),
        "business_score": round(business_status_score, 3),
        "freshness_score": round(freshness_score, 3),
    }


async def recompute_and_upsert_reliability(
    db: AsyncSession, station_id: str
) -> ReliabilityScore:
    """Recomputes reliability score for a station and upserts into reliability_scores table."""
    st_stmt = select(ChargingStation).where(ChargingStation.id == station_id)
    res = await db.execute(st_stmt)
    station = res.scalar_one_or_none()
    if not station:
        raise ValueError(f"Station {station_id} not found")

    rev_stmt = select(StationReview).where(StationReview.station_id == station_id)
    rev_res = await db.execute(rev_stmt)
    reviews = rev_res.scalars().all()

    chk_stmt = select(CrowdsourcedCheckin).where(CrowdsourcedCheckin.station_id == station_id)
    chk_res = await db.execute(chk_stmt)
    checkins = chk_res.scalars().all()

    calc = calculate_station_reliability(station, reviews, checkins)

    rel_stmt = select(ReliabilityScore).where(ReliabilityScore.station_id == station_id)
    rel_res = await db.execute(rel_stmt)
    rel_obj = rel_res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if rel_obj is None:
        rel_obj = ReliabilityScore(
            station_id=station.id,
            reliability_score=int(calc["score"]),
            label=str(calc["label"]),
            recency_weighted_rating_score=float(calc["recency_score"]),
            keyword_sentiment_score=float(calc["keyword_score"]),
            crowdsource_confirmation_score=float(calc["crowdsource_score"]),
            business_status_score=float(calc["business_score"]),
            review_freshness_score=float(calc["freshness_score"]),
            last_computed_at=now,
        )
        db.add(rel_obj)
    else:
        rel_obj.reliability_score = int(calc["score"])
        rel_obj.label = str(calc["label"])
        rel_obj.recency_weighted_rating_score = float(calc["recency_score"])
        rel_obj.keyword_sentiment_score = float(calc["keyword_score"])
        rel_obj.crowdsource_confirmation_score = float(calc["crowdsource_score"])
        rel_obj.business_status_score = float(calc["business_score"])
        rel_obj.review_freshness_score = float(calc["freshness_score"])
        rel_obj.last_computed_at = now

    await db.commit()
    await db.refresh(rel_obj)
    return rel_obj
