You are an expert full-stack engineer specializing in Django (DRF) + React (JSX).
I want to implement a secure password reset feature using a verification code (OTP).
Follow this plan and generate production-grade code with explanations:

**Flow**

1. User enters email → server generates a 6-digit verification code, hashes it, stores it with expiry, and sends it via email.
2. User enters the code → server validates (rate-limited, single-use), and returns a short-lived reset_token.
3. User sets a new password using reset_token.

**Security requirements**

- Do not reveal if an email exists. Always return generic responses.
- Verification codes must be random 6-digit numbers, stored only as hashes.
- Expire codes after 60 seconds, single-use only.
- Limit attempts (e.g., 5 tries).
- Throttle requests per IP/email.
- Sign reset_token using Django’s `TimestampSigner` (short-lived, 15 min).
- Apply Django password validators.

**Backend tasks (Django DRF)**

- Model: `PasswordResetCode` (UUID id, user FK, code_hash, expires_at, attempts, used).
- Utility: functions to generate and verify codes, plus `make_reset_token` and `read_reset_token` using `TimestampSigner`.
- API endpoints:
  - `/auth/password-reset/request` (POST, takes email, generates code, sends email).
  - `/auth/password-reset/verify` (POST, takes email + code, verifies, returns reset_token).
  - `/auth/password-reset/confirm` (POST, takes reset_token + new password, updates password).
- Include URL routes, serializers if needed, and sample `send_mail` integration.

**Frontend tasks (React JSX)**

- Component `ResetPassword.jsx` with three steps:
  1. Request: input email → POST to `/request` → always show “If account exists, code sent.”
  2. Verify: input 6-digit code → POST to `/verify` → if success, get reset_token.
  3. Confirm: input new password → POST to `/confirm` with reset_token.
- Handle loading, success, error states.
- Keep UI minimal but functional (plain form + buttons).

**Deliverables**

1. Full Django model, utils, views, urls.
2. Example React JSX component for the 3-step flow.
3. Explanations for security practices (hashing, expiry, throttling, generic responses).
4. Checklist of production hardening steps (logging, throttling, email backend).

Output should be structured, with code blocks and explanations. Assume project is a standard DRF + React setup.

At the end provide we with instructions on what I should do in my end.
