# Deploying to Render (Static Site + Web Service)

This repository ships with `render.yaml` that defines:

- `technomart-frontend` (Static Site): builds the Vite app and publishes `dist/`.
- `technomart-api` (Web Service): Django API served by Gunicorn + WhiteNoise.
- `technomart-ws` (optional Web Service): Daphne for websockets `/ws/events` if you need realtime.

## One-time setup

1. Connect the GitHub repo in Render.
2. Render will detect `render.yaml`; accept it. If not, create services manually using the values below.

### Static Site (frontend)

- Root directory: `.` (repo root)
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://technomart-api.onrender.com/api` (point to your API URL)
  - `VITE_WS_URL=wss://technomart-ws.onrender.com/ws/events` (if using websocket service)
  - `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>`
  - `VITE_ENABLE_MOCKS=false`
  - `VITE_MEDIA_BASE_URL=https://technomart-api.onrender.com`
- SPA routing: handled by `public/_redirects` (Render will serve `index.html` for client routes).

### Web Service (backend API)

- Root directory: `backend`
- Runtime: Python 3.11
- Build command: `pip install --upgrade pip && pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 3`
- Post-deploy command: add `python manage.py migrate --noinput`
- Env vars (minimum):
  - `DJANGO_SECRET_KEY` = strong random
  - `DJANGO_DEBUG=0`
  - `DJANGO_ALLOWED_HOSTS=technomart-api.onrender.com`
  - `CSRF_TRUSTED_ORIGINS=https://technomart-api.onrender.com`
  - `DJANGO_CORS_ALLOWED_ORIGINS=https://technomart-frontend.onrender.com`
  - `FRONTEND_BASE_URL=https://technomart-frontend.onrender.com`
  - `DJANGO_JWT_SECRET` = strong random
  - `WEBPUSH_VAPID_PUBLIC_KEY` / `WEBPUSH_VAPID_PRIVATE_KEY` (required when DEBUG=0)
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - SMTP: `DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`, `DJANGO_EMAIL_HOST`, `DJANGO_EMAIL_PORT=587`, `DJANGO_EMAIL_USE_TLS=1`, `DJANGO_EMAIL_HOST_USER`, `DJANGO_EMAIL_HOST_PASSWORD`, `DJANGO_DEFAULT_FROM_EMAIL=no-reply@technomart.com`
  - Database (Render Postgres recommended):
    - `DJANGO_DB_ENGINE=django.db.backends.postgresql`
    - `DJANGO_DB_NAME`, `DJANGO_DB_USER`, `DJANGO_DB_PASSWORD`, `DJANGO_DB_HOST`, `DJANGO_DB_PORT=5432`
  - Redis (for Channels/websockets): `REDIS_URL=redis://:<password>@<host>:<port>/0`

### Web Service (optional websockets)

- Root directory: `backend`
- Build command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start command: `daphne -b 0.0.0.0 -p ${PORT:-10000} config.asgi:application`
- Env vars: same as API (including `REDIS_URL`), plus allowed hosts for the ws domain if separate.
- Point frontend `VITE_WS_URL` to this service’s URL.

## Manual creation (if not using render.yaml)

- Static Site: fill the form with the values under “Static Site (frontend)”.
- Web Service: fill the form with the values under “Web Service (backend API)”.
- Add env vars in Render dashboard, then deploy.

## After first deploy

1. Run migrations (if not using post-deploy command): `python manage.py migrate --noinput`.
2. Create an app admin: `python manage.py bootstrap_admin --email "admin@example.com" --password "StrongPass123" --name "Admin" --role admin`.
3. Health check: `https://technomart-api.onrender.com/api/health/`.
