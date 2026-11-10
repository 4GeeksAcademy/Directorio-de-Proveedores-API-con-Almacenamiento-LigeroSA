"""Dependencias reutilizables para proteger rutas."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from services.api.auth.models import User, UserRole
from services.api.auth.security import decode_access_token
from services.api.auth.store import find_user_by_id


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user_id = decode_access_token(token)
    user = None if user_id is None else find_user_by_id(user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Token no valido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def ensure_owner_or_admin(current_user: User, owner_id: str) -> None:
    if current_user.role != UserRole.admin and current_user.id != owner_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No tienes permiso para este recurso.")
