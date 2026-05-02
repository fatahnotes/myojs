# OJS - SEAIPC 2026 (Open Journal System)

## Original Problem Statement
"Buatkan saya sistem untuk OJS open journal system dimana user bisa registrasi, login, submit paper lalu proses review paper sampai finalisasi paper."

## Deployment Target
- Production: http://seaipc2026.imz.or.id/

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT (PyJWT), bcrypt, Emergent Object Storage, Resend SDK
- Frontend: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner + axios + i18n (EN/ID)
- Design: Swiss / Brutalist light theme — palette dynamically switchable via CSS variables (`--brand`, `--brand-hover`, `--brand-soft`, `--brand-on`)

## Conference Context
- **SEAIPC 2026** — 9th Southeast Asia International Philanthropy Conference
- Theme: *Waqf for the Future*
- Dates: 26–27 August 2026 · Jakarta / Bogor
- 39 sub-themes, 4 partner journals, 2 paper templates (EN + BM)

## What's Been Implemented

### Iteration 1 (Feb 2026) — Core OJS
- JWT auth, role-based (author/reviewer/editor/admin), demo seeding
- Papers CRUD with PDF/DOCX upload to Emergent Object Storage
- Review flow (assign, submit with score/recommendation/confidential notes)
- Decision flow (accept/reject/revision/publish), revision upload
- In-app notifications + email (Resend MOCKED)
- Admin user management, role-specific stats, bilingual EN/ID

### Iteration 2 (Feb 2026) — SEAIPC rebrand
- Full SEAIPC 2026 branding (Home/Header/Footer/copy)
- New public pages: Call for Papers (39 sub-themes), Key Dates, Templates (2 downloadable .docx), About
- Password reset flow (forgot + reset with 1h token, MOCKED email)
- PDF inline preview (iframe via token query param)
- DOI assignment on publish (custom or auto-generated)
- CORS ready for `seaipc2026.imz.or.id`

### Iteration 3 (Feb 2026) — CMS & Theming
- **Site Content CMS** at `/dashboard/cms` (admin only) with 7 tabs:
  1. **Theme** — 8 color palettes (Classic Blue, Emerald, Slate, Royal Purple, Amber, Teal, Rose, Indigo), applied live via CSS vars
  2. **Branding & Logo** — upload logo (PNG/JPG/SVG/WEBP), edit all hero text, conference metadata, stats
  3. **Flyer** — upload flyer image (PNG/JPG/WEBP/PDF), toggle to show above Key Dates on Home, caption + external URL
  4. **Key Dates** — add/edit/remove deadline rows
  5. **About** — body + objectives[] + attendees[] + venue_items[] + organiser + contact
  6. **Call for Papers** — title + intro + sub_themes[] + publications[]
  7. **Templates** — CRUD template listings with name/language/filename/download URL
- Backend: `/api/content` (GET public, PUT admin), `/api/content/logo/upload`, `/api/content/flyer/upload`, `/api/public/logo/{id}`, `/api/public/flyer/{id}`
- Public pages (Home/About/CFP/Dates/Templates) refactored to read from ContentProvider
- Home: **Flyer section added above Important Dates** (only shown when enabled + image present)
- Logo displays in PublicHeader + Sidebar (fallback to initial letter)
- **CORS/auth fix**: removed axios `withCredentials` (Emergent ingress overrides CORS headers); Bearer-only now

## Test Results
- Iteration 1: 34/34 (100%)
- Iteration 2: 45/46 (1 flaky storage upstream, not bug) + 12/12 new
- Iteration 3: **63/63 (100%)** — 17 new CMS + 46 regression. Zero bugs.

## Backlog / Next Phase
### P1 (High)
- Set `RESEND_API_KEY` to enable real emails (password reset + notifications)
- Deploy to `seaipc2026.imz.or.id`
- Split server.py (880+ lines) into routers: auth, papers, reviews, content, users
- Split CMS.jsx (520+ lines) into per-tab files under `src/pages/cms/`
- Deep-merge PUT /api/content to avoid partial wipes
- Cache-Control headers on /api/public/logo and /api/public/flyer

### P2
- Nested Pydantic validation for content sections
- Separate `content_files` collection from paper files
- Per-email rate limit on forgot-password
- DOI registrar integration (Crossref/DataCite)
- Map paper → sub-theme (currently flat)
- ContentProvider: add in-memory cache / SWR

### P3
- ORCID integration
- Stats charts, public author profiles
- Multi-language CMS content (currently content is single-language)
- Admin-uploaded hero image, not fixed
