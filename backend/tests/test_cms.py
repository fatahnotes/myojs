"""CMS/content endpoint regression tests for SEAIPC 2026."""
import io
import os
import uuid
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
    return r.json()["token"]


def _hdr(t):
    return {"Authorization": f"Bearer {t}"}


# -------- GET /api/content (public) --------
class TestContentGet:
    def test_get_content_public_returns_full_doc(self):
        r = requests.get(f"{API}/content", timeout=15)
        assert r.status_code == 200, r.text
        c = r.json()
        for key in ("theme", "branding", "flyer", "dates", "about", "cfp", "templates"):
            assert key in c, f"Missing key: {key}"
        assert isinstance(c["dates"], list) and len(c["dates"]) >= 1
        assert isinstance(c["cfp"]["sub_themes"], list)
        assert isinstance(c["templates"], list)
        assert "hero_title" in c["branding"]

    def test_get_content_no_mongo_id_leaked(self):
        r = requests.get(f"{API}/content", timeout=15)
        assert "_id" not in r.json()


# -------- PUT /api/content (admin-only + partial merge) --------
class TestContentPut:
    def _restore_theme(self, token, theme):
        requests.put(f"{API}/content", headers=_hdr(token), json={"theme": theme}, timeout=15)

    def test_put_content_requires_admin(self):
        # Unauthenticated -> 401/403
        r = requests.put(f"{API}/content", json={"theme": "rose"}, timeout=15)
        assert r.status_code in (401, 403)

        # Author -> 403
        au = _login(*AUTHOR)
        r = requests.put(f"{API}/content", headers=_hdr(au), json={"theme": "rose"}, timeout=15)
        assert r.status_code == 403

        # Editor -> 403 (admin-only)
        ed = _login(*EDITOR)
        r = requests.put(f"{API}/content", headers=_hdr(ed), json={"theme": "rose"}, timeout=15)
        assert r.status_code == 403

    def test_put_theme_persists_and_does_not_wipe_other_sections(self):
        ad = _login(*ADMIN)
        # Snapshot current
        orig = requests.get(f"{API}/content", timeout=15).json()
        orig_theme = orig.get("theme", "blue-classic")
        orig_sub_theme_count = len(orig["cfp"]["sub_themes"])
        orig_dates_count = len(orig["dates"])
        orig_branding_title = orig["branding"].get("hero_title")

        try:
            # Partial PUT: only theme
            r = requests.put(f"{API}/content", headers=_hdr(ad), json={"theme": "rose"}, timeout=15)
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["theme"] == "rose"
            # Other sections untouched
            assert len(body["cfp"]["sub_themes"]) == orig_sub_theme_count
            assert len(body["dates"]) == orig_dates_count
            assert body["branding"].get("hero_title") == orig_branding_title

            # GET back confirms persistence
            g = requests.get(f"{API}/content", timeout=15).json()
            assert g["theme"] == "rose"
            assert len(g["cfp"]["sub_themes"]) == orig_sub_theme_count
        finally:
            self._restore_theme(ad, orig_theme)

    def test_put_branding_partial_merge(self):
        ad = _login(*ADMIN)
        orig = requests.get(f"{API}/content", timeout=15).json()
        orig_branding = dict(orig["branding"])
        try:
            new_branding = dict(orig_branding)
            new_branding["hero_title"] = f"TEST_TITLE_{uuid.uuid4().hex[:6]}"
            r = requests.put(f"{API}/content", headers=_hdr(ad),
                             json={"branding": new_branding}, timeout=15)
            assert r.status_code == 200
            g = requests.get(f"{API}/content", timeout=15).json()
            assert g["branding"]["hero_title"] == new_branding["hero_title"]
            # dates untouched
            assert len(g["dates"]) == len(orig["dates"])
        finally:
            requests.put(f"{API}/content", headers=_hdr(ad),
                         json={"branding": orig_branding}, timeout=15)

    def test_put_dates_replaces_list(self):
        ad = _login(*ADMIN)
        orig = requests.get(f"{API}/content", timeout=15).json()
        orig_dates = orig["dates"]
        try:
            new_dates = orig_dates + [{"tag": "TEST", "label": "TEST_date", "date": "1 Jan 2027"}]
            r = requests.put(f"{API}/content", headers=_hdr(ad),
                             json={"dates": new_dates}, timeout=15)
            assert r.status_code == 200
            g = requests.get(f"{API}/content", timeout=15).json()
            assert len(g["dates"]) == len(new_dates)
            assert any(d["label"] == "TEST_date" for d in g["dates"])
        finally:
            requests.put(f"{API}/content", headers=_hdr(ad),
                         json={"dates": orig_dates}, timeout=15)


# -------- Logo upload --------
class TestLogoUpload:
    PNG_BYTES = (b"\x89PNG\r\n\x1a\n" + b"\x00" * 64)

    def test_upload_logo_requires_admin(self):
        au = _login(*AUTHOR)
        r = requests.post(f"{API}/content/logo/upload", headers=_hdr(au),
                          files={"file": ("logo.png", io.BytesIO(self.PNG_BYTES), "image/png")},
                          timeout=30)
        assert r.status_code == 403

    def test_upload_logo_png_ok_and_public_serve(self):
        ad = _login(*ADMIN)
        r = requests.post(f"{API}/content/logo/upload", headers=_hdr(ad),
                          files={"file": ("logo.png", io.BytesIO(self.PNG_BYTES), "image/png")},
                          timeout=60)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200, r.text
        body = r.json()
        assert "file_id" in body and "url" in body
        assert body["url"] == f"/api/public/logo/{body['file_id']}"

        # Public fetch should work without auth, inline disposition
        pub = requests.get(f"{BASE_URL}{body['url']}", timeout=30)
        assert pub.status_code == 200
        assert "inline" in pub.headers.get("content-disposition", "").lower()
        assert pub.headers.get("content-type", "").startswith("image/png")

    def test_upload_logo_rejects_disallowed_extension(self):
        ad = _login(*ADMIN)
        r = requests.post(f"{API}/content/logo/upload", headers=_hdr(ad),
                          files={"file": ("logo.gif", io.BytesIO(b"GIF89a" + b"\x00" * 16), "image/gif")},
                          timeout=30)
        assert r.status_code == 400
        assert "Allowed" in r.text or "allowed" in r.text.lower()

    def test_upload_logo_accepts_svg(self):
        ad = _login(*ADMIN)
        svg = b'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect /></svg>'
        r = requests.post(f"{API}/content/logo/upload", headers=_hdr(ad),
                          files={"file": ("logo.svg", io.BytesIO(svg), "image/svg+xml")}, timeout=30)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200

    def test_public_logo_404_for_unknown(self):
        r = requests.get(f"{API}/public/logo/does-not-exist-{uuid.uuid4().hex[:6]}", timeout=15)
        assert r.status_code == 404


# -------- Flyer upload --------
class TestFlyerUpload:
    PNG_BYTES = (b"\x89PNG\r\n\x1a\n" + b"\x00" * 64)
    PDF_BYTES = b"%PDF-1.4\nflyer\n%%EOF\n"

    def test_flyer_upload_requires_admin(self):
        ed = _login(*EDITOR)
        r = requests.post(f"{API}/content/flyer/upload", headers=_hdr(ed),
                          files={"file": ("f.png", io.BytesIO(self.PNG_BYTES), "image/png")},
                          timeout=30)
        assert r.status_code == 403

    def test_flyer_upload_png_ok(self):
        ad = _login(*ADMIN)
        r = requests.post(f"{API}/content/flyer/upload", headers=_hdr(ad),
                          files={"file": ("flyer.png", io.BytesIO(self.PNG_BYTES), "image/png")},
                          timeout=60)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200
        body = r.json()
        assert body["url"].startswith("/api/public/flyer/")
        # Public fetch
        pub = requests.get(f"{BASE_URL}{body['url']}", timeout=30)
        assert pub.status_code == 200

    def test_flyer_upload_pdf_ok(self):
        ad = _login(*ADMIN)
        r = requests.post(f"{API}/content/flyer/upload", headers=_hdr(ad),
                          files={"file": ("flyer.pdf", io.BytesIO(self.PDF_BYTES), "application/pdf")},
                          timeout=60)
        if r.status_code == 500 and "Storage" in r.text:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200

    def test_flyer_upload_rejects_svg(self):
        ad = _login(*ADMIN)
        r = requests.post(f"{API}/content/flyer/upload", headers=_hdr(ad),
                          files={"file": ("flyer.svg", io.BytesIO(b"<svg/>"), "image/svg+xml")},
                          timeout=30)
        # flyer allowed = jpg,jpeg,png,webp,pdf -> svg disallowed
        assert r.status_code == 400


# NOTE: CORS headers are overwritten by Emergent ingress (Access-Control-Allow-Origin:* and
# Access-Control-Allow-Credentials:true together). App-level fix was to remove axios
# withCredentials so browsers don't raise the "credentials with wildcard origin" error.
# We don't assert on ingress CORS headers since they are infra-level.


# -------- Regression: login still works (no withCredentials) --------
class TestAuthRegression:
    def test_admin_login_ok(self):
        t = _login(*ADMIN)
        r = requests.get(f"{API}/auth/me", headers=_hdr(t), timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_author_login_ok(self):
        t = _login(*AUTHOR)
        r = requests.get(f"{API}/auth/me", headers=_hdr(t), timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "author"
