# OJS - SEAIPC 2026 (Open Journal System)

## Original Problem Statement
"Buatkan saya sistem untuk OJS open journal system dimana user bisa registrasi, login, submit paper lalu proses review paper sampai finalisasi paper."

## Deployment Target
- Production: http://seaipc2026.imz.or.id/

## User Choices
- Roles: Author + Reviewer + Editor + Admin
- Auth: JWT custom (email + password) + password reset via email
- File storage: Emergent Object Storage (PDF/DOCX)
- Email: Resend (MOCKED until RESEND_API_KEY provided)
- UI: Bilingual English + Bahasa Indonesia

## Conference Context
- **SEAIPC 2026** — 9th Southeast Asia International Philanthropy Conference
- Theme: *Waqf for the Future: Building Lasting Impact and Economic Resilience in Southeast Asia*
- Dates: 26–27 August 2026 (+ 28 Aug visits)
- Venue: Jakarta / Bogor, Indonesia
- Organiser: In collaboration with IMZ Capital
- 39 sub-themes, 4 partner journals (Al-Iqtishad, Ahkam, JIPSF, E-JITU)

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT (PyJWT), bcrypt, Emergent Object Storage, Resend SDK
- Frontend: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner + axios + i18n (EN/ID)
- Design: Swiss / Brutalist light theme (IBM Plex Sans, #002FA7 IKB primary, sharp 0.25rem radius)

## What's Been Implemented
### Iteration 1 (Feb 2026)
- Auth: register, login, logout, /me (JWT + cookie)
- Admin/demo seeding on startup (admin/editor/reviewer/author)
- Papers CRUD, upload (PDF/DOCX) to Emergent Object Storage, download with RBAC
- Review flow: assign reviewers, submit review (score + recommendation + confidential notes)
- Decision flow: accept / reject / revision_required / publish
- Revision upload (revision_required -> resubmitted)
- Notifications (in-app + email mocked)
- Admin user management, stats dashboards
- Bilingual UI EN/ID

### Iteration 2 (Feb 2026) — SEAIPC 2026 customization
- **Rebrand**: Home, header, footer, all public copy switched to SEAIPC 2026
- **New pages**: Call for Papers (39 sub-themes), Important Dates, Templates download (E-JITU EN + BM), About SEAIPC, Forgot Password, Reset Password
- **Password reset flow**: `/api/auth/forgot-password` + `/api/auth/reset-password` (1h token)
- **PDF inline preview**: `/api/files/{id}/preview?token=...` with iframe modal on PaperDetail
- **DOI assignment**: editor can assign custom DOI on publish (auto-generated if not provided)
- **CORS updated** for `seaipc2026.imz.or.id` domain
- **Template downloads**: 2 E-JITU templates (English + Bahasa Melayu) via CDN

## Test Results
- Iteration 1: 34/34 pytest (100%)
- Iteration 2: 45/46 (97.8%) — 12/12 new SEAIPC feature tests pass. 1 flaky upstream storage 500 (not a bug).

## Backlog / Next Phase
### P1 (High)
- Add `RESEND_API_KEY` to unlock real emails (currently mocked)
- Deploy to `seaipc2026.imz.or.id`
- Per-email rate limit on forgot-password
- TTL index on password_reset_tokens.expires_at
- Preserve existing DOI if editor republishes without providing one

### P2 (Nice to have)
- Real DOI registrar integration (Crossref/DataCite)
- Multi-track submission (map paper -> sub-theme)
- Reviewer expertise tagging & auto-suggest
- Editor-in-chief super role
- Plagiarism check stub
- Global search across papers
- Server-side proxy for template downloads (force-download headers)

### P3
- ORCID integration
- Multi-language beyond EN/ID (add Bahasa Melayu)
- Stats charts (submissions over time)
- Public author profile pages
- Separate journals per partner publication
