import os
from pathlib import Path
try:
    from dotenv import load_dotenv  # type: ignore
except Exception:
    load_dotenv = None

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from backend directory if python-dotenv is available
if load_dotenv:
    try:
        load_dotenv(BASE_DIR / ".env")
    except Exception:
        pass

# Core settings
DEBUG = os.getenv("DJANGO_DEBUG", "1") in {"1", "true", "True"}
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-secret-key")
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")

# Minimal apps to avoid DB usage
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",

    # Third-party
    "corsheaders",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",

    # Local apps
    "api",
    "accounts",
]

# Keep middleware lightweight; omit session/auth/csrf
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    # Gate API routes for pending/unauthorized users (JWT-aware)
    "api.middleware.PendingUserGateMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"

# Database configuration (SQLite by default; supports MySQL/Postgres via env)

def _env_bool(key: str, default: bool = False) -> bool:
    val = os.getenv(key)
    if val is None:
        return default
    return val in {"1", "true", "True", "yes", "on"}


DB_ENGINE = (os.getenv("DJANGO_DB_ENGINE", "") or "").strip().lower()
DB_NAME = os.getenv("DJANGO_DB_NAME", str(BASE_DIR / "db.sqlite3"))
DB_USER = os.getenv("DJANGO_DB_USER", "")
DB_PASSWORD = os.getenv("DJANGO_DB_PASSWORD", "")
DB_HOST = os.getenv("DJANGO_DB_HOST", "")
DB_PORT = os.getenv("DJANGO_DB_PORT", "")
try:
    DB_CONN_MAX_AGE = int(os.getenv("DJANGO_DB_CONN_MAX_AGE", "60"))
except Exception:
    DB_CONN_MAX_AGE = 60

if DB_ENGINE in {"mysql", "mariadb"}:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST or "127.0.0.1",
            "PORT": DB_PORT or "3306",
            "CONN_MAX_AGE": DB_CONN_MAX_AGE,
            "OPTIONS": {
                # Ensure utf8mb4 support for emoji and full Unicode
                "charset": "utf8mb4",
                # Safe strict mode; adjust if your server disallows it
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
elif DB_ENGINE in {"postgres", "postgresql", "psql"}:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST or "127.0.0.1",
            "PORT": DB_PORT or "5432",
            "CONN_MAX_AGE": DB_CONN_MAX_AGE,
        }
    }
else:
    # Default to SQLite (file-based)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": DB_NAME,
        }
    }

# Static files (optional for API-only)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
SITE_ID = 1

TIME_ZONE = "UTC"
USE_TZ = True

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
CORS_ALLOW_HEADERS = list(set([
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]))

# Django defaults
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# JWT settings
JWT_SECRET = os.getenv("DJANGO_JWT_SECRET", SECRET_KEY)
JWT_ALGORITHM = os.getenv("DJANGO_JWT_ALG", "HS256")
try:
    JWT_EXP_SECONDS = int(os.getenv("DJANGO_JWT_EXP_SECONDS", "3600"))
except Exception:
    JWT_EXP_SECONDS = 3600

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()

# Media (public) and Private Media (not served directly)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Private media directory for sensitive uploads (e.g., identity headshots)
# Not served by Django; use authenticated views or presigned URLs.
PRIVATE_MEDIA_ROOT = os.getenv("DJANGO_PRIVATE_MEDIA_ROOT") or str(BASE_DIR / "private_media")
try:
    os.makedirs(PRIVATE_MEDIA_ROOT, exist_ok=True)
except Exception:
    # If the path is invalid or we lack permissions, ignore here; file saves will attempt to create directories as needed
    pass

# Django Allauth config
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_USERNAME_REQUIRED = False

SOCIALACCOUNT_AUTO_SIGNUP = True  # creation allowed, but we gate access until approved
SOCIALACCOUNT_ADAPTER = "accounts.adapters.SocialAdapter"
LOGIN_REDIRECT_URL = "/account/verify/"
LOGOUT_REDIRECT_URL = "/"

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["openid", "email", "profile"],
        "AUTH_PARAMS": {"prompt": "select_account"},
        "VERIFIED_EMAILS_ONLY": True,
    }
}

# Email configuration
EMAIL_BACKEND = os.getenv(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
DEFAULT_FROM_EMAIL = os.getenv("DJANGO_DEFAULT_FROM_EMAIL", "no-reply@canteen.local")
SERVER_EMAIL = os.getenv("DJANGO_SERVER_EMAIL", DEFAULT_FROM_EMAIL)

# Optional SMTP settings (used if EMAIL_BACKEND is SMTP)
EMAIL_HOST = os.getenv("DJANGO_EMAIL_HOST", "localhost")
try:
    EMAIL_PORT = int(os.getenv("DJANGO_EMAIL_PORT", "25"))
except Exception:
    EMAIL_PORT = 25
EMAIL_HOST_USER = os.getenv("DJANGO_EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("DJANGO_EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("DJANGO_EMAIL_USE_TLS", "0") in {"1", "true", "True"}
EMAIL_USE_SSL = os.getenv("DJANGO_EMAIL_USE_SSL", "0") in {"1", "true", "True"}

# Admin recipients (for mail_admins). Set DJANGO_ADMINS="Name <email>,Other <email>"
def _parse_admins(raw: str):
    out = []
    if not raw:
        return out
    parts = [x.strip() for x in raw.split(",") if x.strip()]
    for p in parts:
        # Expect "Name <email>" or just email
        if "<" in p and ">" in p:
            name = p.split("<", 1)[0].strip()
            email = p.split("<", 1)[1].split(">", 1)[0].strip()
        else:
            name = p
            email = p
        if email:
            out.append((name or email, email))
    return out

ADMINS = _parse_admins(os.getenv("DJANGO_ADMINS", ""))
EMAIL_SUBJECT_PREFIX = os.getenv("DJANGO_EMAIL_SUBJECT_PREFIX", "[Canteen]")
