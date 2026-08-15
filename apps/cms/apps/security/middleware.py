"""Admin-security middleware — lightweight audit logging and login rate limiting (P3)."""

from django.core.cache import cache
from django.http import HttpResponse

from apps.security.models import AuditLog

LOGIN_PATH = "/admin/login/"
ADMIN_PREFIX = "/admin/"
SKIP_PREFIXES = ("/health/", "/static/", "/media/")
LOGIN_RATE_LIMIT = 5
LOGIN_RATE_WINDOW_SECONDS = 300


class AuditMiddleware:
    """Record security-relevant events into AuditLog, never touching request bodies."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method != "POST":
            return response
        path = request.path
        if path.startswith(SKIP_PREFIXES):
            return response
        if path == LOGIN_PATH:
            self._record_login(request, response)
        elif path.startswith(ADMIN_PREFIX) and request.user.is_authenticated:
            self._record_mutation(request, response)
        return response

    def _record_login(self, request, response):
        if request.user.is_authenticated:
            action = "login.success"
            user = request.user
            object_id = str(request.user.pk)
        elif response.status_code == 429:
            action = "login.blocked"
            user = None
            object_id = ""
        else:
            action = "login.failed"
            user = None
            object_id = ""
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name="user",
            object_id=object_id,
            ip=self._client_ip(request),
            detail=f"{request.method} {request.path} -> {response.status_code}",
        )

    def _record_mutation(self, request, response):
        segments = request.path[len(ADMIN_PREFIX) :].strip("/").split("/")
        model_name = segments[0] if segments else ""
        object_id = next((segment for segment in segments[1:] if segment.isdigit()), "")
        AuditLog.objects.create(
            user=request.user,
            action="admin.mutation",
            model_name=model_name,
            object_id=object_id,
            ip=self._client_ip(request),
            detail=f"{request.method} {request.path} -> {response.status_code}",
        )

    @staticmethod
    def _client_ip(request):
        return (request.META.get("REMOTE_ADDR") or "")[:45]


class LoginRateLimitMiddleware:
    """Cache-backed per-IP limit on admin login posts; the limit+1th attempt gets a 429."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not (request.method == "POST" and request.path == LOGIN_PATH):
            return self.get_response(request)
        cache_key = self._cache_key(request)
        attempts = cache.get(cache_key, 0)
        if attempts >= LOGIN_RATE_LIMIT:
            return HttpResponse(
                "Too many login attempts. Please try again later.", status=429
            )
        response = self.get_response(request)
        if request.user.is_authenticated:
            cache.delete(cache_key)
        else:
            cache.set(cache_key, attempts + 1, LOGIN_RATE_WINDOW_SECONDS)
        return response

    @staticmethod
    def _cache_key(request):
        ip = request.META.get("REMOTE_ADDR", "unknown")
        return f"security:login-limit:{ip}"
