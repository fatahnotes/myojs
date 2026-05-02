# OJS - Open Journal System

## Original Problem Statement
"Buatkan saya sistem untuk OJS open journal system dimana user bisa registrasi, login, submit paper lalu proses review paper sampai finalisasi paper."

## User Choices
- Roles: Author + Reviewer + Editor + Admin
- Auth: JWT custom (email + password)
- File storage: Emergent Object Storage (PDF/DOCX)
- Email: Resend (MOCKED until RESEND_API_KEY provided)
- UI: Bilingual English + Bahasa Indonesia

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT (PyJWT), bcrypt, Emergent Object Storage integration, Resend SDK
- Frontend: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner toasts + axios + i18n
- Design: Swiss / Brutalist light theme (IBM Plex Sans, #002FA7 IKB primary, sharp 0.25rem radius)

## What's Been Implemented (Feb 2026)
### Backend (`/app/backend/server.py`)
- Auth: register, login, logout, /me (JWT in body + httpOnly cookie, Bearer header support)
- Admin/demo seeding on startup: admin@ojs.com, editor@ojs.com, reviewer@ojs.com, author@ojs.com
- Papers: create, list (role-scoped), get, published archive (public)
- File upload: Emergent Object Storage (PDF/DOCX, 25MB max), download with role-based access
- Review flow: assign reviewers (editor), submit review (score 1-10, recommendation, comments, confidential notes)
- Decision flow: accept / reject / revision_required / publish
- Revision: re-upload transitions revision_required -> resubmitted
- Notifications: in-app CRUD + email (Resend, MOCKED while key empty)
- Admin: list users, patch role, delete user
- Stats: role-specific dashboards

### Frontend
- Public: Home (hero + process timeline + CTA), About, JournalsArchive, Login, Register
- Dashboard (role-aware sidebar): Overview, My Papers (author), Submit Paper (author), Assigned Reviews (reviewer), All Submissions (editor), User Management (admin), Notifications, Paper Detail
- Paper Detail: timeline, metadata, file download, assign reviewers dialog, decision dialog, submit review dialog, revision upload
- Bilingual EN/ID switcher (header + sidebar)
- Brutalist Swiss design system: sharp borders, IBM Plex Sans, editorial hierarchy

## Test Results (Iteration 1)
- Backend: 34/34 pytest (100%)
- Frontend: All critical flows smoke-tested
- Full paper lifecycle verified: submit → upload PDF → assign → review → decision → revision → publish

## Backlog / Next Phase
### P1 (High)
- Add RESEND_API_KEY to unlock real emails (currently mocked)
- Password reset flow (forgot / reset via email)
- Split server.py into routers (auth, papers, reviews, users)
- Strict role-gating: restrict reviewer assignment to `role='reviewer'` only

### P2 (Nice to have)
- Multiple journals / issues / volumes (currently flat)
- Co-author accounts (linked users, not just strings)
- Plagiarism / similarity flag stub
- Editor-in-chief super role
- PDF inline preview (react-pdf)
- DOI assignment on publish
- Export CSV of submissions
- Global search across papers
- Rate limiting on /api/auth/login (5-fail lockout)

### P3
- OJS theme customization per journal
- ORCID integration
- Statistics charts (submissions over time)
- Multi-language beyond EN/ID
