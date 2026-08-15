"""Rebuild trigger signing helpers (P3-08) — HMAC-SHA256 signed trigger.

The signed message is ``taha-rebuild:<timestamp>``. The token travels with its
timestamp so a caller can prove freshness without server-side state; validation
compares with ``hmac.compare_digest`` to stay constant-time.
"""

import hashlib
import hmac
import time
from urllib.parse import urlencode

MESSAGE_PREFIX = "taha-rebuild"
MAX_TRIGGER_AGE_SECONDS = 300


def _sign(secret: str, timestamp: int) -> str:
    message = f"{MESSAGE_PREFIX}:{timestamp}"
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()


def validate_rebuild_token(token: str, secret: str, timestamp: int) -> bool:
    """Return True when ``token`` matches the HMAC of ``taha-rebuild:<timestamp>``.

    Uses constant-time comparison. Callers must also enforce timestamp
    freshness; an empty secret always fails closed.
    """
    if not secret:
        return False
    return hmac.compare_digest(token, _sign(secret, timestamp))


def build_signed_rebuild_url(secret: str, base_url: str) -> str:
    """Return a rebuild-trigger URL carrying a fresh token and its timestamp."""
    timestamp = int(time.time())
    query = urlencode({"token": _sign(secret, timestamp), "timestamp": timestamp})
    return f"{base_url.rstrip('/')}/rebuild-trigger/?{query}"
