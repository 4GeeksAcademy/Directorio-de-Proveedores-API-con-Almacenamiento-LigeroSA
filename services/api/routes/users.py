"""CRUD de credenciales de usuario; los datos de contacto viven en /profiles."""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response

from services.api.auth.dependencies import ensure_owner_or_admin, get_current_user
from services.api.auth.models import Profile, User, UserRole
from services.api.auth.schemas import UserCreate, UserPublic, UserUpdate
from services.api.auth.security import hash_password
from services.api.auth.store import (
    delete_user,
    find_user_by_email,
    find_user_by_id,
    insert_user_with_profile,
    list_users,
    update_user,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserPublic, status_code=201)
def create_user(payload: UserCreate):
    if find_user_by_email(payload.email) is not None:
        raise HTTPException(409, "El email ya esta registrado.")
    user = User(
        id=uuid4().hex,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        created_at=datetime.now(timezone.utc),
    )
    profile = Profile(
        id=uuid4().hex,
        user_id=user.id,
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
    )
    insert_user_with_profile(user, profile)
    return UserPublic.model_validate(user)


@router.get("", response_model=list[UserPublic])
def list_all_users(_: User = Depends(get_current_user)):
    return [UserPublic.model_validate(user) for user in list_users()]


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    ensure_owner_or_admin(current_user, user_id)
    user = find_user_by_id(user_id)
    if user is None:
        raise HTTPException(404, "Usuario no encontrado.")
    return UserPublic.model_validate(user)


@router.put("/{user_id}", response_model=UserPublic)
def update_user_credentials(
    user_id: str,
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    ensure_owner_or_admin(current_user, user_id)
    changes = payload.model_dump(mode="json", exclude_none=True)
    if "role" in changes and current_user.role != UserRole.admin:
        raise HTTPException(403, "Solo un admin puede cambiar el rol.")
    if "email" in changes:
        existing = find_user_by_email(changes["email"])
        if existing is not None and existing.id != user_id:
            raise HTTPException(409, "El email ya esta registrado.")
    if "password" in changes:
        changes["hashed_password"] = hash_password(changes.pop("password"))
    updated = update_user(user_id, changes)
    if updated is None:
        raise HTTPException(404, "Usuario no encontrado.")
    return UserPublic.model_validate(updated)


@router.delete("/{user_id}", status_code=204)
def delete_user_account(user_id: str, current_user: User = Depends(get_current_user)):
    ensure_owner_or_admin(current_user, user_id)
    if not delete_user(user_id):
        raise HTTPException(404, "Usuario no encontrado.")
    return Response(status_code=204)
