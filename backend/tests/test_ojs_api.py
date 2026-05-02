"""OJS API regression tests covering auth, papers, reviews, decisions, files, notifications, users, stats."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://paper-review-flow.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Demo creds
ADMIN = ("admin@ojs.com", "admin123")
EDITOR = ("editor@ojs.com", "editor123")
REVIEWER = ("reviewer@ojs.com", "reviewer123")
AUTHOR = ("author@ojs.com", "author123")


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["token"]
    return data["token"], data


def _hdr(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def tokens():
    return {
        "admin": _login(*ADMIN),
        "editor": _login(*EDITOR),
        "reviewer": _login(*REVIEWER),
        "author": _login(*AUTHOR),
    }


# ---------------- Health & public ----------------
class TestPublic:
    def test_health(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "message" in r.json()

    def test_papers_published_public(self):
        r = requests.get(f"{API}/papers/published", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------- Auth ----------------
class TestAuth:
    def test_login_all_demo(self, tokens):
        for role in ["admin", "editor", "reviewer", "author"]:
            _, user = tokens[role]
            assert user["role"] == role
            assert user["email"].endswith("@ojs.com")

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "x@x.com", "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me(self, tokens):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/auth/me", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "author"
        assert "password_hash" not in r.json()

    def test_me_unauthorized(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_register_new_author(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Test User"
        }, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "author"
        assert data["email"] == email
        assert "token" in data

    def test_register_admin_downgraded(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "testpass123", "name": "X", "role": "admin"
        }, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "author"  # forced down

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": ADMIN[0], "password": "xxxxxx", "name": "dup"
        }, timeout=15)
        assert r.status_code == 400


# ---------------- Users (admin/editor) ----------------
class TestUsers:
    def test_list_users_as_admin(self, tokens):
        token, _ = tokens["admin"]
        r = requests.get(f"{API}/users", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 4

    def test_list_reviewers(self, tokens):
        token, _ = tokens["editor"]
        r = requests.get(f"{API}/users?role=reviewer", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert all(u["role"] == "reviewer" for u in data)
        assert len(data) >= 1

    def test_author_cannot_list_users(self, tokens):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/users", headers=_hdr(token), timeout=15)
        assert r.status_code == 403


# ---------------- Papers + Review + Decision flow ----------------
class TestPaperFlow:
    @pytest.fixture(scope="class")
    def paper_id(self, tokens):
        token, _ = tokens["author"]
        r = requests.post(f"{API}/papers", headers=_hdr(token), json={
            "title": "TEST_Paper Flow",
            "abstract": "Testing end-to-end OJS flow",
            "keywords": ["test", "ojs"],
            "co_authors": ["Alice"]
        }, timeout=15)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        assert r.json()["status"] == "submitted"
        return pid

    def test_paper_created_and_listed_for_author(self, tokens, paper_id):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/papers", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        ids = [p["id"] for p in r.json()]
        assert paper_id in ids

    def test_get_paper(self, tokens, paper_id):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/papers/{paper_id}", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Paper Flow"

    def test_upload_pdf(self, tokens, paper_id):
        token, _ = tokens["author"]
        # minimal valid-ish PDF bytes
        pdf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"
        files = {"file": ("test.pdf", io.BytesIO(pdf), "application/pdf")}
        r = requests.post(f"{API}/papers/{paper_id}/upload", headers=_hdr(token), files=files, timeout=60)
        # Accept 200, if storage unavailable we'll mark it
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip(f"Storage unavailable: {r.text}")
        assert r.status_code == 200, r.text
        assert r.json()["file_id"]

    def test_upload_invalid_extension(self, tokens, paper_id):
        token, _ = tokens["author"]
        files = {"file": ("bad.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{API}/papers/{paper_id}/upload", headers=_hdr(token), files=files, timeout=30)
        assert r.status_code == 400

    def test_author_cannot_assign_reviewers(self, tokens, paper_id):
        token, _ = tokens["author"]
        r = requests.post(f"{API}/papers/{paper_id}/assign-reviewers",
                          headers=_hdr(token), json={"reviewer_ids": ["x"]}, timeout=15)
        assert r.status_code == 403

    def test_editor_assigns_reviewer(self, tokens, paper_id):
        editor_token, _ = tokens["editor"]
        # Get reviewer id
        r = requests.get(f"{API}/users?role=reviewer", headers=_hdr(editor_token), timeout=15)
        reviewer_id = r.json()[0]["id"]
        r = requests.post(f"{API}/papers/{paper_id}/assign-reviewers",
                          headers=_hdr(editor_token),
                          json={"reviewer_ids": [reviewer_id]}, timeout=15)
        assert r.status_code == 200, r.text
        # Verify status changed
        r = requests.get(f"{API}/papers/{paper_id}", headers=_hdr(editor_token), timeout=15)
        assert r.json()["status"] == "under_review"
        assert reviewer_id in r.json()["reviewer_ids"]

    def test_reviewer_sees_assigned_paper(self, tokens, paper_id):
        token, _ = tokens["reviewer"]
        r = requests.get(f"{API}/papers", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        ids = [p["id"] for p in r.json()]
        assert paper_id in ids

    def test_reviewer_submits_review(self, tokens, paper_id):
        token, _ = tokens["reviewer"]
        r = requests.post(f"{API}/papers/{paper_id}/reviews", headers=_hdr(token), json={
            "score": 7,
            "recommendation": "minor_revision",
            "comments": "Good paper overall, minor tweaks needed.",
            "confidential_notes": "Editor only note"
        }, timeout=15)
        assert r.status_code == 200, r.text

    def test_reviewer_cannot_make_decision(self, tokens, paper_id):
        token, _ = tokens["reviewer"]
        r = requests.post(f"{API}/papers/{paper_id}/decision", headers=_hdr(token),
                          json={"decision": "accept", "note": ""}, timeout=15)
        assert r.status_code == 403

    def test_author_cannot_see_reviews_before_decision(self, tokens, paper_id):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/papers/{paper_id}/reviews", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert r.json() == []

    def test_editor_makes_revision_decision(self, tokens, paper_id):
        token, _ = tokens["editor"]
        r = requests.post(f"{API}/papers/{paper_id}/decision", headers=_hdr(token),
                          json={"decision": "revision_required", "note": "Pls fix section 2"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "revision_required"

    def test_author_sees_reviews_after_decision(self, tokens, paper_id):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/papers/{paper_id}/reviews", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        reviews = r.json()
        assert len(reviews) >= 1
        # Confidential stripped
        assert reviews[0]["confidential_notes"] == ""
        assert reviews[0]["reviewer_name"] == "Reviewer"

    def test_author_uploads_revision(self, tokens, paper_id):
        token, _ = tokens["author"]
        pdf = b"%PDF-1.4\ntestrev\n%%EOF\n"
        files = {"file": ("rev.pdf", io.BytesIO(pdf), "application/pdf")}
        r = requests.post(f"{API}/papers/{paper_id}/upload", headers=_hdr(token), files=files, timeout=60)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200
        assert r.json()["status"] == "resubmitted"

    def test_editor_publishes(self, tokens, paper_id):
        token, _ = tokens["editor"]
        r = requests.post(f"{API}/papers/{paper_id}/decision", headers=_hdr(token),
                          json={"decision": "publish", "note": "LGTM"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "published"
        # Appears in public archive
        r = requests.get(f"{API}/papers/published", timeout=15)
        assert paper_id in [p["id"] for p in r.json()]


# ---------------- File download permissions ----------------
class TestFileDownload:
    def test_unauth_other_author_denied(self, tokens):
        # Author creates paper + uploads
        a_token, _ = tokens["author"]
        r = requests.post(f"{API}/papers", headers=_hdr(a_token), json={
            "title": "TEST_File Perm", "abstract": "perm test", "keywords": [], "co_authors": []
        }, timeout=15)
        pid = r.json()["id"]
        pdf = b"%PDF-1.4\ntest\n%%EOF\n"
        up = requests.post(f"{API}/papers/{pid}/upload", headers=_hdr(a_token),
                           files={"file": ("f.pdf", io.BytesIO(pdf), "application/pdf")}, timeout=60)
        if up.status_code == 500 and "Storage" in up.text:
            pytest.skip("Storage unavailable")
        fid = up.json()["file_id"]

        # Reviewer (not assigned) should be denied
        rv_token, _ = tokens["reviewer"]
        r = requests.get(f"{API}/files/{fid}/download", headers=_hdr(rv_token), timeout=30)
        assert r.status_code == 403

        # Admin allowed
        ad_token, _ = tokens["admin"]
        r = requests.get(f"{API}/files/{fid}/download", headers=_hdr(ad_token), timeout=30)
        assert r.status_code == 200


# ---------------- Notifications ----------------
class TestNotifications:
    def test_list(self, tokens):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/notifications", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_mark_all_read(self, tokens):
        token, _ = tokens["author"]
        r = requests.post(f"{API}/notifications/read-all", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        # Verify
        r = requests.get(f"{API}/notifications", headers=_hdr(token), timeout=15)
        assert all(n["read"] for n in r.json())


# ---------------- Stats ----------------
class TestStats:
    def test_author_stats(self, tokens):
        token, _ = tokens["author"]
        r = requests.get(f"{API}/stats", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert "my_papers" in r.json()

    def test_editor_stats(self, tokens):
        token, _ = tokens["editor"]
        r = requests.get(f"{API}/stats", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "total_papers" in d and "users" in d

    def test_reviewer_stats(self, tokens):
        token, _ = tokens["reviewer"]
        r = requests.get(f"{API}/stats", headers=_hdr(token), timeout=15)
        assert r.status_code == 200
        assert "assigned" in r.json()


# ---------------- Admin user management ----------------
class TestAdminUsers:
    def test_update_role_and_delete(self, tokens):
        admin_token, _ = tokens["admin"]
        # Register new user
        email = f"test_{uuid.uuid4().hex[:8]}@ojs.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "x1234567", "name": "Temp"
        }, timeout=15)
        uid = r.json()["id"]
        # Promote
        r = requests.patch(f"{API}/users/{uid}/role", headers=_hdr(admin_token),
                           json={"role": "reviewer"}, timeout=15)
        assert r.status_code == 200
        # Delete
        r = requests.delete(f"{API}/users/{uid}", headers=_hdr(admin_token), timeout=15)
        assert r.status_code == 200

    def test_editor_cannot_update_role(self, tokens):
        token, _ = tokens["editor"]
        r = requests.patch(f"{API}/users/nonexistent/role", headers=_hdr(token),
                           json={"role": "admin"}, timeout=15)
        assert r.status_code == 403
