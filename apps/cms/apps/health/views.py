"""Health/readiness endpoint — no secrets, no internal paths, no stack traces."""

from django.db import connection
from django.http import JsonResponse


def health(request):
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:  # pragma: no cover - defensive for readiness reporting
        db_ok = False
    return JsonResponse(
        {"status": "ok" if db_ok else "degraded", "db": "ok" if db_ok else "error"}
    )
