"""SEAIPC 2026 new features regression tests: forgot-password, reset-password, DOI on publish, file preview."""
import os
import io
import re
import uuid
import time
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://paper-review-flow.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("admin@ojs.com", "admin123")
EDITOR = ("editor@ojs.com", "editor123")
AUTHOR = ("author@ojs.com", "author123")


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    return r.json()["token"], r.json()


def _hdr(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Password Reset Flow ----------------
class TestPasswordReset:
    """Forgot -> grab token from backend log -> Reset -> login with new password, then restore."""

    def _extract_reset_token(self, email):
        # scan backend logs for [PASSWORD RESET] line for this email
        time.sleep(0.8)
        paths = [
            "/var/log/supervisor/backend.err.log",
            "/var/log/supervisor/backend.out.log",
        ]
        for p in paths:
            try:
                out = subprocess.check_output(["tail", "-n", "200", p], stderr=subprocess.DEVNULL).decode()
            except Exception:
                continue
            # find the most recent entry for this email
            matches = re.findall(rf"\[PASSWORD RESET\] link for {re.escape(email)}: \S*token=([^\s]+)", out)
            if matches:
                return matches[-1]
        return None

    def test_forgot_password_always_returns_200(self):
        # Even unknown email should return 200 (no enumeration)
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": f"nobody_{uuid.uuid4().hex[:6]}@nowhere.com"}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        assert "message" in body

    def test_forgot_password_known_email_logs_reset_link(self):
        email, _pw = AUTHOR
        r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=15)
        assert r.status_code == 200
        token = self._extract_reset_token(email)
        assert token, "Expected reset token to be logged to backend log"
        assert len(token) > 10

    def test_reset_password_invalid_token_rejected(self):
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": "invalid_" + uuid.uuid4().hex, "password": "newpass123"}, timeout=15)
        assert r.status_code == 400

    def test_full_reset_flow_then_restore(self):
        # Use a throwaway user so we don't break the shared author creds for other tests.
        email = f"test_reset_{uuid.uuid4().hex[:8]}@example.com"
        orig_pw = "origpass123"
        new_pw = "newpass456"
        # Register
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": orig_pw, "name": "Reset Test"
        }, timeout=15)
        assert r.status_code == 200, r.text
        uid = r.json()["id"]

        # Verify original login works
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": orig_pw}, timeout=15)
        assert r.status_code == 200

        # Forgot
        r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=15)
        assert r.status_code == 200
        token = self._extract_reset_token(email)
        assert token, "Reset token not found in backend log"

        # Reset
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": token, "password": new_pw}, timeout=15)
        assert r.status_code == 200, r.text

        # Old password rejected
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": orig_pw}, timeout=15)
        assert r.status_code == 401

        # New password works
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": new_pw}, timeout=15)
        assert r.status_code == 200

        # Token can't be reused
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": token, "password": "another123"}, timeout=15)
        assert r.status_code == 400

        # Cleanup: admin deletes the test user
        admin_token, _ = _login(*ADMIN)
        requests.delete(f"{API}/users/{uid}", headers=_hdr(admin_token), timeout=15)


# ---------------- DOI on Publish ----------------
class TestDOIOnPublish:
    """When editor publishes, doi field is set (auto or provided)."""

    def _create_ready_paper(self, author_token, editor_token, title):
        r = requests.post(f"{API}/papers", headers=_hdr(author_token), json={
            "title": title, "abstract": "abs", "keywords": ["x"], "co_authors": []
        }, timeout=15)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        # Upload PDF
        pdf = b"%PDF-1.4\nTEST\n%%EOF\n"
        up = requests.post(f"{API}/papers/{pid}/upload", headers=_hdr(author_token),
                           files={"file": ("t.pdf", io.BytesIO(pdf), "application/pdf")}, timeout=60)
        if up.status_code == 500 and "Storage" in up.text:
            pytest.skip("Storage unavailable")
        assert up.status_code == 200, up.text
        return pid, up.json()["file_id"]

    def test_publish_auto_assigns_doi(self):
        a_tok, _ = _login(*AUTHOR)
        e_tok, _ = _login(*EDITOR)
        pid, _fid = self._create_ready_paper(a_tok, e_tok, f"TEST_DOI_Auto_{uuid.uuid4().hex[:6]}")
        r = requests.post(f"{API}/papers/{pid}/decision", headers=_hdr(e_tok),
                          json={"decision": "publish", "note": "ok"}, timeout=15)
        assert r.status_code == 200, r.text

        r = requests.get(f"{API}/papers/{pid}", headers=_hdr(e_tok), timeout=15)
        assert r.status_code == 200
        paper = r.json()
        assert paper["status"] == "published"
        assert paper.get("doi"), "Expected DOI to be auto-assigned on publish"
        assert paper["doi"].startswith("10.9999/seaipc2026."), f"Unexpected DOI format: {paper['doi']}"

        # Appears in public archive with doi
        r = requests.get(f"{API}/papers/published", timeout=15)
        match = next((p for p in r.json() if p["id"] == pid), None)
        assert match is not None
        assert match.get("doi")

    def test_publish_with_explicit_doi(self):
        a_tok, _ = _login(*AUTHOR)
        e_tok, _ = _login(*EDITOR)
        pid, _fid = self._create_ready_paper(a_tok, e_tok, f"TEST_DOI_Explicit_{uuid.uuid4().hex[:6]}")
        custom_doi = f"10.1234/custom.{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/papers/{pid}/decision", headers=_hdr(e_tok),
                          json={"decision": "publish", "note": "", "doi": custom_doi}, timeout=15)
        assert r.status_code == 200, r.text
        r = requests.get(f"{API}/papers/{pid}", headers=_hdr(e_tok), timeout=15)
        assert r.json().get("doi") == custom_doi


# ---------------- File Preview Endpoint ----------------
class TestFilePreview:
    def _setup_paper_with_file(self):
        a_tok, _ = _login(*AUTHOR)
        r = requests.post(f"{API}/papers", headers=_hdr(a_tok), json={
            "title": f"TEST_Preview_{uuid.uuid4().hex[:6]}", "abstract": "x",
            "keywords": [], "co_authors": []
        }, timeout=15)
        pid = r.json()["id"]
        pdf = b"%PDF-1.4\nhello\n%%EOF\n"
        up = requests.post(f"{API}/papers/{pid}/upload", headers=_hdr(a_tok),
                           files={"file": ("p.pdf", io.BytesIO(pdf), "application/pdf")}, timeout=60)
        if up.status_code == 500 and "Storage" in up.text:
            pytest.skip("Storage unavailable")
        return a_tok, pid, up.json()["file_id"]

    def test_preview_with_query_token_inline(self):
        a_tok, _pid, fid = self._setup_paper_with_file()
        r = requests.get(f"{API}/files/{fid}/preview", params={"token": a_tok}, timeout=30)
        assert r.status_code == 200, r.text
        cd = r.headers.get("content-disposition", "")
        assert "inline" in cd.lower(), f"Expected inline disposition, got: {cd}"
        assert r.content.startswith(b"%PDF"), "Expected PDF content"

    def test_preview_with_bearer_header(self):
        a_tok, _pid, fid = self._setup_paper_with_file()
        r = requests.get(f"{API}/files/{fid}/preview", headers=_hdr(a_tok), timeout=30)
        assert r.status_code == 200
        assert "inline" in r.headers.get("content-disposition", "").lower()

    def test_preview_no_token_rejected(self):
        _a_tok, _pid, fid = self._setup_paper_with_file()
        r = requests.get(f"{API}/files/{fid}/preview", timeout=15)
        assert r.status_code == 401

    def test_preview_invalid_token_rejected(self):
        _a_tok, _pid, fid = self._setup_paper_with_file()
        r = requests.get(f"{API}/files/{fid}/preview", params={"token": "not_a_jwt"}, timeout=15)
        assert r.status_code == 401

    def test_preview_unauthorized_reviewer_forbidden(self):
        _a_tok, _pid, fid = self._setup_paper_with_file()
        rv_tok, _ = _login("reviewer@ojs.com", "reviewer123")
        r = requests.get(f"{API}/files/{fid}/preview", params={"token": rv_tok}, timeout=15)
        assert r.status_code == 403

    def test_preview_admin_allowed(self):
        _a_tok, _pid, fid = self._setup_paper_with_file()
        ad_tok, _ = _login(*ADMIN)
        r = requests.get(f"{API}/files/{fid}/preview", params={"token": ad_tok}, timeout=15)
        assert r.status_code == 200
