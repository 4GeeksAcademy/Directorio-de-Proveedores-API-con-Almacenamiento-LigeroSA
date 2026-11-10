"""Documentos almacenados en TinyDB para usuarios y perfiles."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class User(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    role: UserRole = UserRole.user
    created_at: datetime


class Profile(BaseModel):
    id: str
    user_id: str
    name: str | None = None
    phone: str | None = None
    address: str | None = None
