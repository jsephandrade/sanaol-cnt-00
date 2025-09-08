# Backend (Django)

This is a minimal Django backend scaffolded for API development without touching a database. It exposes stub endpoints that mirror the frontend's needs and uses an in-memory SQLite config so Django can run without migrations.

What's included

- Minimal settings (no auth/sessions/admin) to avoid DB usage
- File-based SQLite DB by default (`db.sqlite3`) for models; override with `DJANGO_DB_NAME`
- Endpoints:
  - `GET /api/health` -> `{ status: "ok" }`
  - `POST /api/auth/login` -> returns mock user+token (accepts `admin@canteen.com` / `1234`)
  - `POST /api/auth/logout`
  - `POST /api/auth/register`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/refresh-token`
  - Basic rate limiting on auth endpoints (e.g., login 5/min, signup 3/min) returning HTTP 429 with `Retry-After` header
  - `POST /api/auth/google` -> verifies Google ID token or code and issues a JWT

Run locally

1. Create a virtualenv and install deps
   python -m venv .venv
   .venv/Scripts/activate # Windows
   source .venv/bin/activate # macOS/Linux
   pip install -r requirements.txt

2. Create DB and run migrations
   python manage.py makemigrations
   python manage.py migrate

3. Start the dev server
   python manage.py runserver 8000

Frontend proxy

- The Vite dev server is configured to proxy `/api` to `http://localhost:8000`.
- To switch the frontend from built-in mocks to this backend, set `VITE_ENABLE_MOCKS=false` in your environment (or `.env`) when running Vite.

Notes

- A minimal `AppUser` model has been added under `api/models.py`. The API uses the DB when available and falls back to in-memory data if the DB is not migrated yet. On first DB access, the in-memory seed is imported automatically.
- JWT is issued for auth flows. Configure `DJANGO_JWT_SECRET` and `DJANGO_JWT_EXP_SECONDS` in `.env` for production.

## Bootstrap an admin user

You can quickly create or update an admin via a management command:

    python manage.py bootstrap_admin --email admin@canteen.com --password "your-strong-pass" --name "Admin User"

This will set role=admin and permissions=["all"]. Re-running updates the password/name.
