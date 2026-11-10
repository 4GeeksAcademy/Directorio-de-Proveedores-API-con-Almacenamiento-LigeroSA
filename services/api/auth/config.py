"""Configuracion de autenticacion leida desde el fichero .env de la raiz."""

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_USERS_DB_PATH = ROOT / "data" / "users.json"

load_dotenv(ROOT / ".env")


@dataclass(frozen=True)
class AuthSettings:
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    users_db_path: Path


@lru_cache
def get_settings() -> AuthSettings:
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("Falta JWT_SECRET_KEY en el fichero .env.")
    return AuthSettings(
        secret_key=secret_key,
        algorithm=os.environ.get("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
        users_db_path=Path(os.environ.get("HEALTHCORE_USERS_DB_PATH", str(DEFAULT_USERS_DB_PATH))),
    )
