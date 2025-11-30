# Deploying the Django API to Hostinger

Checklist to run the backend on Hostinger (SSH-enabled plan or VPS).

## 1) Prep environment

- Python 3.11 available (`python3.11 --version`).
- MySQL 8 credentials (host/user/pass/name/port).
- Redis endpoint (for Channels/websockets) or managed Redis instance.
- Domain ready; plan to reverse-proxy traffic to your app.

## 2) Configure env vars

Copy `backend/.env.example` to `backend/.env` and fill:

- `DJANGO_SECRET_KEY` and `DJANGO_JWT_SECRET` to strong random values.
- `DJANGO_DEBUG=0`
- `DJANGO_ALLOWED_HOSTS=your-domain.com,api.your-domain.com`
- `CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://api.your-domain.com`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://your-domain.com` (add SPA origin if different)
- `FRONTEND_BASE_URL=https://your-domain.com`
- Database: `DJANGO_DB_HOST`, `DJANGO_DB_NAME`, `DJANGO_DB_USER`, `DJANGO_DB_PASSWORD`, `DJANGO_DB_PORT`
- Redis: `REDIS_URL=redis://<redis-host>:6379/0`
- Web push: set `WEBPUSH_VAPID_PUBLIC_KEY` and `WEBPUSH_VAPID_PRIVATE_KEY` (required when `DEBUG=0`)
- SMTP: `DJANGO_EMAIL_*` for your mail provider.

## 3) Install dependencies

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 4) Collect static and migrate

```bash
python manage.py collectstatic --noinput
python manage.py migrate --noinput
```

## 5) Create an admin/app user (optional)

```bash
python manage.py bootstrap_admin --email "admin@example.com" --password "StrongPass123" --name "Admin" --role admin
# or Django admin superuser:
python manage.py createsuperuser
```

## 6) Run the server

Use Gunicorn for HTTP and Daphne for websockets (if exposing ws):

```bash
# HTTP (API)
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Websockets (needs Redis)
daphne -b 0.0.0.0 -p 8001 config.asgi:application
```

Behind a reverse proxy, route:

- HTTPS API -> Gunicorn port (e.g., 8000)
- wss://your-domain.com/ws/events -> Daphne port (e.g., 8001)

`SECURE_PROXY_SSL_HEADER` is set so HTTPS is respected when proxied.

## 7) Process manager

- Use systemd or your Hostinger process manager to keep Gunicorn/Daphne alive.
- Example systemd units (adjust paths/ports):
  - `ExecStart=/path/to/.venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3`
  - `ExecStart=/path/to/.venv/bin/daphne -b 0.0.0.0 -p 8001 config.asgi:application`

## 8) Health check

Visit `https://your-domain.com/api/health/` to verify the API, and confirm static files load from `/static/` (served via WhiteNoise after `collectstatic`).
