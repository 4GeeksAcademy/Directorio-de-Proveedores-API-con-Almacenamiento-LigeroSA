import os
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from services.api.auth.config import get_settings
from services.api.main import app
from services.api.seed import SUPPLIERS, seed


class SupplierTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = Path(self.directory.name) / "suppliers.json"
        self.environment = patch.dict(os.environ, {
            "HEALTHCORE_DB_PATH": str(self.path),
            "HEALTHCORE_USERS_DB_PATH": str(Path(self.directory.name) / "users.json"),
            "JWT_SECRET_KEY": "clave-solo-para-tests-de-proveedores",
        })
        self.environment.start()
        get_settings.cache_clear()
        self.client = TestClient(app)
        credentials = dict(email="tester@example.com", password="clave-segura-prueba")
        self.client.post("/users", json=credentials)
        token = self.client.post("/auth/login", json=credentials).json()["access_token"]
        self.client.headers["Authorization"] = f"Bearer {token}"
        self.payload = dict(name="Epic Systems", country="US", category="health_tech_software", rate=185, status="activo")

    def tearDown(self):
        self.client.close()
        self.environment.stop()
        get_settings.cache_clear()
        self.directory.cleanup()

    def create(self, **changes):
        return self.client.post("/suppliers", json=self.payload | changes)

    def test_create_detail_update_delete(self):
        response = self.create()
        self.assertEqual(response.status_code, 201)
        original = response.json()
        supplier_id = original["id"]
        self.assertIsNotNone(datetime.fromisoformat(original["updated_at"]).tzinfo)
        self.assertEqual(self.client.get(f"/suppliers/{supplier_id}").json(), original)
        rate = self.client.patch(f"/suppliers/{supplier_id}/rate", json={"rate": 200.5})
        self.assertEqual(rate.status_code, 200)
        self.assertEqual(rate.json()["rate"], 200.5)
        self.assertGreater(rate.json()["updated_at"], original["updated_at"])
        status = self.client.patch(f"/suppliers/{supplier_id}/status", json={"status": "suspendido"})
        self.assertEqual(status.json()["status"], "suspendido")
        self.assertGreater(status.json()["updated_at"], rate.json()["updated_at"])
        self.assertEqual(self.client.delete(f"/suppliers/{supplier_id}").status_code, 204)
        self.assertEqual(self.client.get(f"/suppliers/{supplier_id}").status_code, 404)

    def test_invalid_create_never_opens_database(self):
        invalid = [dict(rate=value) for value in (0, -1, "185", True, None)]
        invalid += [dict(status="unknown"), dict(country="ES"), dict(category="other"), dict(name="  "), dict(updated_at="2026-01-01"), dict(id="client-id")]
        with patch("services.api.routes.suppliers.supplier_table", side_effect=AssertionError("TinyDB no debe abrirse")):
            for changes in invalid:
                with self.subTest(changes=changes):
                    self.assertEqual(self.create(**changes).status_code, 422)
        self.assertFalse(self.path.exists())

    def test_invalid_updates_never_open_database(self):
        with patch("services.api.routes.suppliers.supplier_table", side_effect=AssertionError("TinyDB no debe abrirse")):
            for rate in (0, -10, "12", True, None):
                self.assertEqual(self.client.patch("/suppliers/missing/rate", json={"rate": rate}).status_code, 422)
            self.assertEqual(self.client.patch("/suppliers/missing/status", json={"status": "pending"}).status_code, 422)

    def test_filters_and_invalid_queries(self):
        self.create()
        self.create(name="EMIS", country="UK")
        self.create(name="Medline", category="medical_supplies")
        self.assertEqual(len(self.client.get("/suppliers").json()), 3)
        self.assertEqual(len(self.client.get("/suppliers?country=UK").json()), 1)
        self.assertEqual(len(self.client.get("/suppliers?category=medical_supplies").json()), 1)
        self.assertEqual(len(self.client.get("/suppliers?country=US&category=health_tech_software").json()), 1)
        self.assertEqual(self.client.get("/suppliers?country=UK&category=medical_supplies").json(), [])
        self.assertEqual(self.client.get("/suppliers?country=ES").status_code, 422)
        self.assertEqual(self.client.get("/suppliers?category=unknown").status_code, 422)

    def test_nonfinite_json_returns_422_before_database_access(self):
        with patch("services.api.routes.suppliers.supplier_table", side_effect=AssertionError("TinyDB no debe abrirse")):
            for value in ("NaN", "Infinity", "-Infinity", "1e309"):
                with self.subTest(value=value):
                    response = self.client.patch("/suppliers/missing/rate", content='{"rate":' + value + '}', headers={"Content-Type": "application/json"})
                    self.assertEqual(response.status_code, 422)
                    body = '{"name":"Demo","country":"US","category":"medical_supplies","rate":' + value + '}'
                    self.assertEqual(self.client.post("/suppliers", content=body, headers={"Content-Type": "application/json"}).status_code, 422)

    def test_missing_and_security(self):
        for method, suffix, payload in [("get", "", None), ("delete", "", None), ("patch", "/rate", {"rate": 10}), ("patch", "/status", {"status": "activo"})]:
            self.assertEqual(self.client.request(method, f"/suppliers/missing{suffix}", json=payload).status_code, 404)
        self.assertEqual(self.client.post("/suppliers", json=self.payload, headers={"origin": "https://external.example"}).status_code, 403)

    def test_seed_is_idempotent_and_preserves_existing_data(self):
        self.assertEqual(seed(), len(SUPPLIERS))
        records = self.client.get("/suppliers").json()
        self.assertEqual(seed(), 0)
        self.assertEqual(self.client.get("/suppliers").json(), records)

    def test_seed_adds_only_missing_names_and_keeps_existing_records(self):
        original = self.create().json()
        self.assertEqual(seed(), len(SUPPLIERS) - 1)
        records = self.client.get("/suppliers").json()
        self.assertEqual(len(records), len(SUPPLIERS))
        self.assertEqual(sum(r["name"] == "Epic Systems" for r in records), 1)
        self.assertIn(original, records)
        self.assertEqual(seed(), 0)

    def test_ui_origin_only_allowed_for_suppliers(self):
        with patch.dict(os.environ, {"HEALTHCORE_UI_ORIGIN": "http://127.0.0.1:3001"}):
            headers = {"origin": "http://127.0.0.1:3001", "sec-fetch-site": "same-origin"}
            self.assertEqual(self.client.post("/suppliers", json=self.payload, headers=headers).status_code, 201)
            self.assertEqual(self.client.get("/api/incidents/schema", headers=headers).status_code, 403)
            headers["sec-fetch-site"] = "cross-site"
            self.assertEqual(self.client.post("/suppliers", json=self.payload, headers=headers).status_code, 403)

    def test_concurrent_creates_are_not_lost(self):
        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(lambda index: self.create(name=f"Supplier {index}"), range(12)))
        self.assertTrue(all(result.status_code == 201 for result in results))
        self.assertEqual(len(self.client.get("/suppliers").json()), 12)


if __name__ == "__main__":
    unittest.main()