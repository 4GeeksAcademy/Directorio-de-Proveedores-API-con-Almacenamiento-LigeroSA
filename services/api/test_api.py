import asyncio
import threading
import time
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from packages.incidents.analysis import MAX_FILE_BYTES
from packages.incidents.test_analysis import csv_bytes, record
from services.api.main import COOKIE_NAME, MAX_ACTIVE_ANALYSES, SESSION_TTL, app, purge_results


class APITests(unittest.TestCase):
    def setUp(self):
        app.state.results.clear()
        app.state.active_analyses = 0
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.client.close()

    def upload(self, content=None, filename="incidents.csv"):
        return self.client.post("/api/incidents/analyze", files={"file": (filename, csv_bytes([record()]) if content is None else content, "text/csv")})

    def test_analyze_and_export_use_same_logic(self):
        response = self.upload(csv_bytes([record(), record(score=""), record("cancelado", "")]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["invalid"], 1)
        self.assertEqual(response.json()["valid"], 2)
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertNotIn("TEST-001", response.text)
        export = self.client.get("/api/incidents/results/export")
        self.assertEqual(export.status_code, 200)
        self.assertIn('filename="results.csv"', export.headers["content-disposition"])
        self.assertIn("invalidos,1", export.text)
        self.assertNotIn("Paciente", export.text)

    def test_invalid_input_status_codes(self):
        self.assertEqual(self.upload(b"").status_code, 400)
        self.assertEqual(self.upload(b"not a csv").status_code, 400)
        self.assertEqual(self.upload(filename="incidents.pdf").status_code, 400)
        self.assertEqual(self.client.post("/api/incidents/analyze", json={}).status_code, 415)
        self.assertEqual(self.client.post("/api/incidents/analyze", files={"wrong": ("file.csv", b"test")}).status_code, 400)
        self.assertEqual(self.upload(b"x" * (MAX_FILE_BYTES + 1)).status_code, 413)
        self.assertEqual(self.upload(b"x" * (MAX_FILE_BYTES + 70000)).status_code, 413)
        self.assertEqual(self.client.post("/api/incidents/analyze", content=b"bad", headers={"content-type": "multipart/form-data"}).status_code, 400)

    def test_session_isolation_and_latest_result(self):
        self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 404)
        self.upload()
        other = TestClient(app)
        try:
            self.assertEqual(other.get("/api/incidents/results/export").status_code, 404)
        finally:
            other.close()
        self.upload(csv_bytes([record(), record()]))
        self.assertIn("total_procesados,2", self.client.get("/api/incidents/results/export").text)
        self.assertEqual(len(app.state.results), 1)

    def test_expiration(self):
        self.upload()
        token = self.client.cookies.get(COOKIE_NAME)
        _, result = app.state.results[token]
        app.state.results[token] = (time.monotonic() - SESSION_TTL - 1, result)
        self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 404)

    def test_reject_cross_site_requests(self):
        response = self.client.post("/api/incidents/analyze", files={"file": ("file.csv", csv_bytes([record()]))}, headers={"origin": "https://external.example"})
        self.assertEqual(response.status_code, 403)

    def test_upload_does_not_spool_patient_data_to_disk(self):
        content = csv_bytes([record()] * 20000)
        self.assertGreater(len(content), 1024 * 1024)
        with patch("tempfile.TemporaryFile", side_effect=AssertionError("No debe escribir pacientes en disco")):
            response = self.upload(content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["valid"], 20000)

    def test_malformed_multipart_returns_client_error(self):
        response = self.client.post("/api/incidents/analyze", content=b"garbage", headers={"content-type": "multipart/form-data; boundary=boundary"})
        self.assertEqual(response.status_code, 400)

    def test_schema_matches_executable_healthcore_rules(self):
        from packages.incidents.rules import RULES
        self.assertEqual(self.client.get("/api/incidents/schema").json(), RULES.public_dict())

    def test_limit_rejection_preserves_last_successful_analysis(self):
        self.upload()
        with patch("packages.incidents.analysis.MAX_RECORDS", 1):
            response = self.upload(csv_bytes([record(), record()]))
        self.assertEqual(response.status_code, 413)
        self.assertIn("no se publica un análisis parcial", response.json()["detail"])
        self.assertIn("total_procesados,1", self.client.get("/api/incidents/results/export").text)
        self.assertEqual(app.state.active_analyses, 0)
        with patch("packages.incidents.analysis.MAX_ERROR_DETAILS", 1):
            self.assertEqual(self.upload(csv_bytes([record(score=""), record(score="")])).status_code, 413)

    def test_concurrency_rejects_third_upload_before_reading(self):
        async def scenario():
            entered = asyncio.Event()
            release = asyncio.Event()
            reads = 0

            async def blocked_read(request):
                nonlocal reads
                reads += 1
                if reads == MAX_ACTIVE_ANALYSES:
                    entered.set()
                await release.wait()
                return csv_bytes([record()])

            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
                with patch("services.api.main.read_upload", blocked_read):
                    tasks = [asyncio.create_task(client.post("/api/incidents/analyze")) for _ in range(MAX_ACTIVE_ANALYSES)]
                    try:
                        await asyncio.wait_for(entered.wait(), timeout=5)
                        rejected = await client.post("/api/incidents/analyze")
                        self.assertEqual(rejected.status_code, 429)
                        self.assertEqual(rejected.headers["Retry-After"], "1")
                        self.assertEqual(reads, MAX_ACTIVE_ANALYSES)
                    finally:
                        release.set()
                        responses = await asyncio.gather(*tasks)
                    self.assertTrue(all(response.status_code == 200 for response in responses))
                    self.assertEqual(app.state.active_analyses, 0)
        asyncio.run(scenario())

    def test_expired_sessions_are_removed_without_new_request(self):
        self.upload()
        token = self.client.cookies.get(COOKIE_NAME)
        _, result = app.state.results[token]
        app.state.results[token] = (time.monotonic() - SESSION_TTL - 1, result)
        cleaned = threading.Event()

        def cleanup():
            purge_results()
            if token not in app.state.results:
                cleaned.set()

        with patch("services.api.main.PURGE_INTERVAL_SECONDS", 0.01), patch("services.api.main.purge_results", cleanup):
            with TestClient(app):
                self.assertTrue(cleaned.wait(timeout=2))

    def test_session_capacity_evicts_oldest_session(self):
        others = [TestClient(app), TestClient(app)]
        try:
            with patch("services.api.main.MAX_SESSIONS", 2):
                for client in [self.client, *others]:
                    response = client.post("/api/incidents/analyze", files={"file": ("synthetic.csv", csv_bytes([record()]), "text/csv")})
                    self.assertEqual(response.status_code, 200)
                self.assertEqual(len(app.state.results), 2)
                self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 404)
                for client in others:
                    self.assertEqual(client.get("/api/incidents/results/export").status_code, 200)
        finally:
            for client in others:
                client.close()

    def test_static_route_only_serves_public_assets(self):
        self.assertEqual(self.client.get("/assets/app.js").status_code, 200)
        self.assertEqual(self.client.get("/assets/README.md").status_code, 404)
        self.assertEqual(self.client.get("/assets/package-lock.json").status_code, 404)
        self.assertEqual(self.client.get("/assets/test-browser.mjs").status_code, 404)


if __name__ == "__main__":
    unittest.main()