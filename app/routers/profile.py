"""Profile router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.user import UserProfile
from app.schemas.profile import ProfileCompletionOut, ProfileOut, ProfilePatchIn
from app.services.recommendation_service import profile_completion

router = APIRouter()

_PROFILE_FIELDS = [
    "intent", "budget_min", "budget_max", "city", "is_delhi_ncr",
    "daily_km", "housing_type", "parking_socket_access", "family_size",
    "preferred_categories", "charging_preference", "finance_pref", "emi_comfort",
]


async def _get_or_create_profile(db: DBSession, user_id) -> UserProfile:
    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        await db.flush()
    return profile


@router.get("/profile", response_model=ProfileOut)
async def get_profile(user_id: CurrentUser, db: DBSession) -> ProfileOut:
    profile = await _get_or_create_profile(db, user_id)
    return ProfileOut.model_validate(profile)


@router.patch("/profile", response_model=ProfileOut)
async def patch_profile(
    body: ProfilePatchIn, user_id: CurrentUser, db: DBSession
) -> ProfileOut:
    profile = await _get_or_create_profile(db, user_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.flush()
    return ProfileOut.model_validate(profile)


@router.get("/profile/completion", response_model=ProfileCompletionOut)
async def get_profile_completion(user_id: CurrentUser, db: DBSession) -> ProfileCompletionOut:
    profile = await _get_or_create_profile(db, user_id)
    profile_dict = {f: getattr(profile, f, None) for f in _PROFILE_FIELDS}
    pct, missing = profile_completion(profile_dict)
    return ProfileCompletionOut(percent=pct, missing_fields=missing)
