"""Acceso a TinyDB para usuarios y perfiles; una apertura por operacion."""

from contextlib import contextmanager
from threading import RLock

from tinydb import Query, TinyDB

from services.api.auth.config import get_settings
from services.api.auth.models import Profile, User


DATABASE_LOCK = RLock()
USERS_TABLE = "users"
PROFILES_TABLE = "profiles"


@contextmanager
def auth_database():
    with DATABASE_LOCK:
        path = get_settings().users_db_path
        path.parent.mkdir(parents=True, exist_ok=True)
        with TinyDB(path, encoding="utf-8", ensure_ascii=False) as database:
            yield database


def find_user_by_id(user_id: str) -> User | None:
    with auth_database() as database:
        doc = database.table(USERS_TABLE).get(Query().id == user_id)
    return None if doc is None else User.model_validate(doc)


def find_user_by_email(email: str) -> User | None:
    with auth_database() as database:
        doc = database.table(USERS_TABLE).get(Query().email == email)
    return None if doc is None else User.model_validate(doc)


def list_users() -> list[User]:
    with auth_database() as database:
        return [User.model_validate(doc) for doc in database.table(USERS_TABLE).all()]


def insert_user_with_profile(user: User, profile: Profile) -> None:
    with auth_database() as database:
        database.table(USERS_TABLE).insert(user.model_dump(mode="json"))
        database.table(PROFILES_TABLE).insert(profile.model_dump(mode="json"))


def update_user(user_id: str, changes: dict) -> User | None:
    with auth_database() as database:
        users = database.table(USERS_TABLE)
        if not users.update(changes, Query().id == user_id):
            return None
        return User.model_validate(users.get(Query().id == user_id))


def delete_user(user_id: str) -> bool:
    with auth_database() as database:
        removed = database.table(USERS_TABLE).remove(Query().id == user_id)
        database.table(PROFILES_TABLE).remove(Query().user_id == user_id)
    return bool(removed)


def find_profile_by_user(user_id: str) -> Profile | None:
    with auth_database() as database:
        doc = database.table(PROFILES_TABLE).get(Query().user_id == user_id)
    return None if doc is None else Profile.model_validate(doc)


def update_profile(user_id: str, changes: dict) -> Profile | None:
    with auth_database() as database:
        profiles = database.table(PROFILES_TABLE)
        if not profiles.update(changes, Query().user_id == user_id):
            return None
        return Profile.model_validate(profiles.get(Query().user_id == user_id))
