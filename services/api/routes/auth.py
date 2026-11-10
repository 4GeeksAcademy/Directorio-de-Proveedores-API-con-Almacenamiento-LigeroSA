"""Login y perfil del usuario autenticado."""

from fastapi import APIRouter, Depends, HTTPException

from services.api.auth.dependencies import get_current_user
from services.api.auth.models import User
from services.api.auth.schemas import LoginRequest, MeResponse, ProfileResponse, TokenResponse
from services.api.auth.security import create_access_token, verify_password
from services.api.auth.store import find_profile_by_user, find_user_by_email


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = find_user_by_email(payload.email)
    if user is None or not user.is_active or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Credenciales no validas.", headers={"WWW-Authenticate": "Bearer"})
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    profile = find_profile_by_user(current_user.id)
    return MeResponse(
        email=current_user.email,
        role=current_user.role,
        profile=None if profile is None else ProfileResponse.model_validate(profile),
    )
