"""Perfil del usuario autenticado; la ruta /me limita el acceso al propio dueño."""

from fastapi import APIRouter, Depends, HTTPException

from services.api.auth.dependencies import get_current_user
from services.api.auth.models import User
from services.api.auth.schemas import ProfileResponse, ProfileUpdate
from services.api.auth.store import find_profile_by_user, update_profile


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    profile = find_profile_by_user(current_user.id)
    if profile is None:
        raise HTTPException(404, "Perfil no encontrado.")
    return ProfileResponse.model_validate(profile)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(payload: ProfileUpdate, current_user: User = Depends(get_current_user)):
    updated = update_profile(current_user.id, payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(404, "Perfil no encontrado.")
    return ProfileResponse.model_validate(updated)
