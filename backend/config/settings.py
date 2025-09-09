import os
from pathlib import Path
from .settings_components import get_database, get_cors, get_jwt, get_email
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
DATABASES = get_database(BASE_DIR)

# Static files (optional for API-only)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
SITE_ID = 1

TIME_ZONE = "UTC"
USE_TZ = True

# CORS
CORS_ALLOWED_ORIGINS, CORS_ALLOW_HEADERS = get_cors()

# Django defaults
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# JWT settings
_jwt = get_jwt()
JWT_SECRET = _jwt["JWT_SECRET"]
JWT_ALGORITHM = _jwt["JWT_ALGORITHM"]
JWT_EXP_SECONDS = _jwt["JWT_EXP_SECONDS"]
JWT_REMEMBER_EXP_SECONDS = _jwt["JWT_REMEMBER_EXP_SECONDS"]
JWT_REFRESH_EXP_SECONDS = _jwt["JWT_REFRESH_EXP_SECONDS"]
JWT_REFRESH_REMEMBER_EXP_SECONDS = _jwt["JWT_REFRESH_REMEMBER_EXP_SECONDS"]

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
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]

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
_email = get_email()
EMAIL_BACKEND = _email["EMAIL_BACKEND"]
DEFAULT_FROM_EMAIL = _email["DEFAULT_FROM_EMAIL"]
SERVER_EMAIL = _email["SERVER_EMAIL"]
EMAIL_HOST = _email["EMAIL_HOST"]
EMAIL_PORT = _email["EMAIL_PORT"]
EMAIL_HOST_USER = _email["EMAIL_HOST_USER"]
EMAIL_HOST_PASSWORD = _email["EMAIL_HOST_PASSWORD"]
EMAIL_USE_TLS = _email["EMAIL_USE_TLS"]
EMAIL_USE_SSL = _email["EMAIL_USE_SSL"]
ADMINS = _email["ADMINS"]
EMAIL_SUBJECT_PREFIX = _email["EMAIL_SUBJECT_PREFIX"]

# Frontend base URL for building links in emails (password reset, verification)
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:8080")
