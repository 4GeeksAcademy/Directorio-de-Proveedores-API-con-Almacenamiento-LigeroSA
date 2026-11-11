from __future__ import annotations

import argparse
import getpass
import hashlib
import hmac
import json
import os
import secrets
import time
from pathlib import Path

USERS_FILE = Path(os.environ.get("STAFF_USERS_FILE", Path(__file__).with_name("staff_users.json")))
SESSION_TTL = 8 * 60 * 60
MAX_FAILURES = 5
FAILURE_WINDOW = 15 * 60
SCRYPT_PARAMS = {"n": 2**14, "r": 8, "p": 1}

_sessions: dict[str, tuple[str, float]] = {}
_failures: dict[str, list[float]] = {}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, dklen=32, **SCRYPT_PARAMS)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    if scheme != "scrypt":
        return False
    candidate = hashlib.scrypt(password.encode("utf-8"), salt=bytes.fromhex(salt_hex), dklen=32, **SCRYPT_PARAMS)
    return hmac.compare_digest(candidate.hex(), digest_hex)


DUMMY_HASH = hash_password(secrets.token_hex(16))


def load_users() -> dict[str, str]:
    if not USERS_FILE.exists():
        return {}
    return json.loads(USERS_FILE.read_text(encoding="utf-8"))


def is_locked(email: str) -> bool:
    cutoff = time.monotonic() - FAILURE_WINDOW
    recent = [moment for moment in _failures.get(email, []) if moment >= cutoff]
    _failures[email] = recent
    return len(recent) >= MAX_FAILURES


def authenticate(email: str, password: str) -> bool:
    if is_locked(email):
        return False
    users = load_users()
    valid = verify_password(password, users.get(email, DUMMY_HASH)) and email in users
    if valid:
        _failures.pop(email, None)
    else:
        _failures.setdefault(email, []).append(time.monotonic())
    return valid


def create_session(email: str) -> str:
    now = time.monotonic()
    for token, (_, expires) in list(_sessions.items()):
        if expires < now:
            del _sessions[token]
    token = secrets.token_urlsafe(32)
    _sessions[token] = (email, now + SESSION_TTL)
    return token


def get_session(token: str | None) -> str | None:
    if not token:
        return None
    entry = _sessions.get(token)
    if entry is None or entry[1] < time.monotonic():
        _sessions.pop(token, None)
        return None
    return entry[0]


def end_session(token: str | None) -> None:
    if token:
        _sessions.pop(token, None)


def main() -> None:
    parser = argparse.ArgumentParser(description="Gestiona usuarios de staff.")
    subcommands = parser.add_subparsers(dest="command", required=True)
    add = subcommands.add_parser("add", help="Crea o actualiza un usuario.")
    add.add_argument("email")
    args = parser.parse_args()

    password = getpass.getpass("Contraseña: ")
    if len(password) < 12:
        raise SystemExit("La contraseña debe tener al menos 12 caracteres.")
    if getpass.getpass("Repite la contraseña: ") != password:
        raise SystemExit("Las contraseñas no coinciden.")

    users = load_users()
    users[args.email.strip().lower()] = hash_password(password)
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")
    print(f"Usuario guardado en {USERS_FILE}")


if __name__ == "__main__":
    main()
