"""Base settings shared by all environments (P3 code-first)."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = "insecure-dev-key-not-for-production"
DEBUG = False
ALLOWED_HOSTS: list[str] = []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "apps.users",
    "apps.health",
    "apps.admin",
    "apps.content",
    "apps.media",
    "apps.security",
    "apps.api",
    "apps.rebuild",
    "apps.composition",
    "apps.siteconfig",
    "django_otp",
    "django_otp.plugins.otp_totp",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "apps.security.mfa.MFAEnforcementMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.security.middleware.AuditMiddleware",
    "apps.security.middleware.LoginRateLimitMiddleware",
    "apps.security.middleware.AdminOpenAPIGateMiddleware",
    "apps.security.middleware.NoIndexMiddleware",
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
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

AUTH_USER_MODEL = "users.User"
# Django staff HTML + preview use /staff/login/; SPA primary UX is /admin/login/.
LOGIN_URL = "/staff/login/"
LOGIN_REDIRECT_URL = "/admin/"

REBUILD_TRIGGER_ENABLED = False
REBUILD_TRIGGER_SECRET = ""
REBUILD_SCRIPT_PATH = ""

# Public preview share tokens (DEFER-0016). Falls back to SECRET_KEY when unset.
PREVIEW_SHARE_SECRET = ""
PREVIEW_SHARE_TTL_SECONDS = 900

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ADR-0022 allowlist (docs/editor contract). Storage is TextField; sanitizer is
# apps.content.html_sanitize.
RICHTEXT_ALLOWED_FEATURES = [
    "h2",
    "h3",
    "h4",
    "bold",
    "italic",
    "ol",
    "ul",
    "link",
    "document-link",
    "hr",
    "blockquote",
    "code",
]

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

OTP_TOTP_ISSUER = "tahamohamadi.ir"
OTP_EMAIL_SENDER = "noreply@tahamohamadi.ir"
