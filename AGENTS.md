# Forgot Password — Email Flow (React JSX + Django)

This project uses an email-based password reset flow.

## Endpoints

- `POST /api/auth/forgot-password` — Body `{ email }` → Always 202 with neutral message; sends reset link (and optional 6-digit code) to email.
- `GET /api/auth/reset-password/validate?token=...` — 200 `{ ok: true }` or 400 `{ token: "Invalid or expired link." }`.
- `POST /api/auth/reset-password` — Body `{ token, newPassword }` → 200 on success; rotates sessions.

## Frontend Routes

- `/forgot-password` — enter email; shows neutral success message.
- `/reset-password?token=` — validate token, set new password.
- `/reset-code` (optional) — verify a 6‑digit email code when used.

## Security & UX

- No enumeration; neutral responses; rate limits via in-app limiter.
- Tokens are short‑lived; single‑use; sessions are rotated after reset.
- Accessible, mobile-friendly forms.

## Environment

Basic email settings come from `backend/config/settings_components.py` and `.env` (see `backend/.env.example`). No Twilio/Redis/SMS is used in this codebase.
