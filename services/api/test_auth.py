"""Pruebas de AUTH-01: registro, login, proteccion de rutas y persistencia en TinyDB."""

import json
import time

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from tinydb import TinyDB

from services.api.auth.config import get_settings
from services.api.main import app


SECRET = "clave-de-prueba-solo-para-pytest"
PASSWORD = "clave-segura-123"
PROTECTED_ROUTES = [
    ("GET", "/users", None),
    ("GET", "/auth/me", None),
    ("GET", "/profiles/me", None),
    ("PUT", "/profiles/me", {"name": "Intruso"}),
    ("GET", "/suppliers", None),
    ("GET", "/suppliers/inexistente", None),
]


def login(client, email, password=PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password})


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def timestamp_in(minutes):
    return int(time.time()) + minutes * 60


@pytest.fixture(autouse=True)
def isolated_env(tmp_path, monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", SECRET)
    monkeypatch.setenv("JWT_ALGORITHM", "HS256")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    monkeypatch.setenv("HEALTHCORE_USERS_DB_PATH", str(tmp_path / "users.json"))
    monkeypatch.setenv("HEALTHCORE_DB_PATH", str(tmp_path / "suppliers.json"))
    get_settings.cache_clear()
    yield tmp_path
    get_settings.cache_clear()


@pytest.fixture
def users_db_path(isolated_env):
    return isolated_env / "users.json"


@pytest.fixture
def stored(users_db_path):
    def read(table: str) -> list[dict]:
        with TinyDB(users_db_path, encoding="utf-8", ensure_ascii=False) as database:
            return database.table(table).all()

    return read


@pytest.fixture
def client(isolated_env):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sign_token():
    def sign(claims: dict, secret: str = SECRET) -> str:
        return jwt.encode(claims, secret, algorithm=get_settings().algorithm)

    return sign


@pytest.fixture
def make_user(client):
    def create(email: str, **profile) -> dict:
        created = client.post("/users", json={"email": email, "password": PASSWORD, **profile})
        assert created.status_code == 201, created.text
        token = login(client, email).json()["access_token"]
        return {"id": created.json()["id"], "email": email, "token": token}

    return create


@pytest.fixture
def alice(make_user):
    return make_user("alice@example.com", name="Alice", phone="600111111", address="Calle Uno 1")


@pytest.fixture
def bob(make_user):
    return make_user("bob@example.com", name="Bob", phone="600222222", address="Calle Dos 2")


# 1. Registro de usuarios (POST /users)

def test_registration_with_only_credentials(client, stored):
    response = client.post("/users", json={"email": "solo@example.com", "password": PASSWORD})

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "solo@example.com"
    assert body["is_active"] is True
    assert "created_at" in body
    assert [user["id"] for user in stored("users")] == [body["id"]]


def test_registration_with_profile_data_creates_linked_profile(client, stored):
    created = client.post(
        "/users",
        json={"email": "perfil@example.com", "password": PASSWORD, "name": "Ana", "phone": "600000000", "address": "Av. Central 10"},
    )
    assert created.status_code == 201
    token = login(client, "perfil@example.com").json()["access_token"]

    profile = client.get("/profiles/me", headers=auth(token)).json()

    assert profile == {
        "id": profile["id"],
        "user_id": created.json()["id"],
        "name": "Ana",
        "phone": "600000000",
        "address": "Av. Central 10",
    }
    user_doc = stored("users")[0]
    assert not {"name", "phone", "address"} & user_doc.keys()


def test_registration_response_hides_password_and_hash(client, stored):
    response = client.post("/users", json={"email": "secreto@example.com", "password": PASSWORD})

    assert response.status_code == 201
    assert "hashed_password" not in response.json()
    assert PASSWORD not in response.text
    stored_user = stored("users")[0]
    assert stored_user["hashed_password"] != PASSWORD
    assert stored_user["hashed_password"].startswith("$2")
    assert PASSWORD not in json.dumps(stored_user)


def test_registration_assigns_default_role_user(client, stored):
    response = client.post("/users", json={"email": "rol@example.com", "password": PASSWORD})

    assert response.json()["role"] == "user"
    assert stored("users")[0]["role"] == "user"


@pytest.mark.parametrize("role", ["superadmin", "guest", "root", ""])
def test_registration_rejects_unknown_role_with_422(client, stored, role):
    response = client.post("/users", json={"email": "rol@example.com", "password": PASSWORD, "role": role})

    assert response.status_code == 422
    assert stored("users") == []


@pytest.mark.parametrize("role", ["admin", "manager", "user"])
def test_registration_does_not_accept_role_field(client, stored, role):
    response = client.post("/users", json={"email": "rol@example.com", "password": PASSWORD, "role": role})

    assert response.status_code == 422
    assert stored("users") == []


# 2. Autenticacion y tokens (POST /auth/login)

def test_login_with_valid_credentials_returns_jwt(client, alice):
    response = login(client, alice["email"])

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    claims = jwt.decode(body["access_token"], SECRET, algorithms=["HS256"])
    assert claims["sub"] == alice["id"]


def test_token_has_expected_structure_and_is_not_immediately_expired(client, alice):
    token = login(client, alice["email"]).json()["access_token"]

    header = jwt.get_unverified_header(token)
    claims = jwt.get_unverified_claims(token)
    remaining = claims["exp"] - time.time()

    assert header["alg"] == "HS256"
    assert set(claims) == {"sub", "exp"}
    assert 29 * 60 < remaining <= 30 * 60


def test_login_rejects_wrong_password_and_unknown_user_with_same_401(client, alice):
    wrong_password = login(client, alice["email"], password="clave-incorrecta-999")
    unknown_user = login(client, "nadie@example.com")

    assert wrong_password.status_code == 401
    assert unknown_user.status_code == 401
    assert "access_token" not in wrong_password.json()
    assert wrong_password.json()["detail"] == unknown_user.json()["detail"]


# 3. Endpoints autenticados y perfil

def test_auth_me_returns_email_role_and_profile(client, alice):
    response = client.get("/auth/me", headers=auth(alice["token"]))

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == alice["email"]
    assert body["role"] == "user"
    assert body["profile"]["user_id"] == alice["id"]
    assert body["profile"]["name"] == "Alice"
    assert body["profile"]["phone"] == "600111111"
    assert body["profile"]["address"] == "Calle Uno 1"
    assert "hashed_password" not in body


def test_get_profile_me_returns_own_profile(client, alice):
    response = client.get("/profiles/me", headers=auth(alice["token"]))

    assert response.status_code == 200
    assert response.json()["user_id"] == alice["id"]
    assert response.json()["name"] == "Alice"


def test_put_profile_me_updates_name_phone_and_address(client, alice):
    response = client.put(
        "/profiles/me",
        json={"name": "Alice Actualizada", "phone": "699999999", "address": "Nueva 5"},
        headers=auth(alice["token"]),
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Alice Actualizada"
    assert response.json()["phone"] == "699999999"
    assert response.json()["address"] == "Nueva 5"


def test_put_profile_me_partial_update_keeps_other_fields(client, alice):
    client.put("/profiles/me", json={"name": "Alice Actualizada"}, headers=auth(alice["token"]))

    response = client.put("/profiles/me", json={"phone": "611111111"}, headers=auth(alice["token"]))

    assert response.json()["name"] == "Alice Actualizada"
    assert response.json()["phone"] == "611111111"
    assert response.json()["address"] == "Calle Uno 1"


def test_user_cannot_read_or_change_another_users_account_with_403(client, alice, bob):
    headers = auth(alice["token"])

    assert client.get(f"/users/{bob['id']}", headers=headers).status_code == 403
    assert client.put(f"/users/{bob['id']}", json={"email": "robado@example.com"}, headers=headers).status_code == 403
    assert client.put(f"/users/{bob['id']}", json={"password": "clave-robada-123"}, headers=headers).status_code == 403
    assert client.delete(f"/users/{bob['id']}", headers=headers).status_code == 403
    assert login(client, bob["email"]).status_code == 200


def test_profile_update_only_changes_the_authenticated_user(client, alice, bob):
    response = client.put("/profiles/me", json={"name": "Intruso"}, headers=auth(alice["token"]))

    assert response.status_code == 200
    assert response.json()["user_id"] == alice["id"]
    assert client.get("/profiles/me", headers=auth(bob["token"])).json()["name"] == "Bob"


def test_user_cannot_escalate_own_role_with_403(client, alice):
    response = client.put(f"/users/{alice['id']}", json={"role": "admin"}, headers=auth(alice["token"]))

    assert response.status_code == 403
    assert client.get("/auth/me", headers=auth(alice["token"])).json()["role"] == "user"


# 4. Proteccion de rutas y accesos no autorizados

@pytest.mark.parametrize(("method", "path", "body"), PROTECTED_ROUTES)
def test_protected_routes_without_authorization_return_401(client, method, path, body):
    response = client.request(method, path, json=body)

    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.parametrize(("method", "path", "body"), PROTECTED_ROUTES)
def test_valid_token_is_accepted_on_protected_routes(client, alice, method, path, body):
    response = client.request(method, path, json=body, headers=auth(alice["token"]))

    assert response.status_code != 401


@pytest.mark.parametrize("token", ["no-es-un-jwt", "a.b.c"])
@pytest.mark.parametrize(("method", "path", "body"), PROTECTED_ROUTES)
def test_malformed_token_returns_401(client, method, path, body, token):
    response = client.request(method, path, json=body, headers=auth(token))

    assert response.status_code == 401


@pytest.mark.parametrize(("method", "path", "body"), PROTECTED_ROUTES)
def test_token_with_invalid_signature_returns_401(client, alice, sign_token, method, path, body):
    token = sign_token({"sub": alice["id"], "exp": timestamp_in(30)}, secret="otra-clave-distinta")

    response = client.request(method, path, json=body, headers=auth(token))

    assert response.status_code == 401


@pytest.mark.parametrize(("method", "path", "body"), PROTECTED_ROUTES)
def test_expired_token_returns_401(client, alice, sign_token, method, path, body):
    token = sign_token({"sub": alice["id"], "exp": timestamp_in(-1)})

    response = client.request(method, path, json=body, headers=auth(token))

    assert response.status_code == 401


# 5. Aislamiento de persistencia en TinyDB

def test_creation_is_persisted_in_tinydb_users_and_profiles(client, stored):
    created = client.post(
        "/users",
        json={"email": "persiste@example.com", "password": PASSWORD, "name": "Persistente"},
    ).json()

    assert [user["id"] for user in stored("users")] == [created["id"]]
    assert [profile["user_id"] for profile in stored("profiles")] == [created["id"]]
    assert stored("profiles")[0]["name"] == "Persistente"


def test_delete_user_removes_user_and_profile_in_cascade(client, alice, bob, stored):
    response = client.delete(f"/users/{alice['id']}", headers=auth(alice["token"]))

    assert response.status_code == 204
    assert [user["id"] for user in stored("users")] == [bob["id"]]
    assert [profile["user_id"] for profile in stored("profiles")] == [bob["id"]]
    assert login(client, alice["email"]).status_code == 401


def test_token_of_deleted_user_returns_401(client, alice, bob):
    client.delete(f"/users/{alice['id']}", headers=auth(alice["token"]))

    response = client.get("/auth/me", headers=auth(alice["token"]))

    assert response.status_code == 401
