"""Contratos de entrada y salida de /auth, /users y /profiles."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from services.api.auth.models import UserRole


BCRYPT_MAX_BYTES = 72


def ensure_bcrypt_length(value: str | None) -> str | None:
    if value is not None and len(value.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError("La contrasena supera 72 bytes.")
    return value


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = Field(default=None, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=300)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        return ensure_bcrypt_length(value)


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    role: UserRole | None = None

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str | None) -> str | None:
        return ensure_bcrypt_length(value)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=300)


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str | None
    phone: str | None
    address: str | None


class MeResponse(BaseModel):
    email: EmailStr
    role: UserRole
    profile: ProfileResponse | None
