#!/usr/bin/env bash
# Minimal CMS smoke after Caddy proxy is applied.
# Usage: bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir

set -euo pipefail

BASE_URL="${1:-https://tahamohamadi.ir}"
BASE_URL="${BASE_URL%/}"

fail=0

check() {
  local path="$1"
  local expect="$2"
  local code
  code="$(curl -sS -o /tmp/cms-smoke-body -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL ${path} expected ${expect} got ${code}" >&2
    fail=1
  else
    echo "PASS ${path} ${code}"
  fi
}

# Custom React admin SPA (ADM-1 cutover) — should return the SPA shell.
check "/admin/" "200"
# Legacy Wagtail admin at /admin-wagtail/ (TOTP HTML, preview, rollback).
# LOGIN_URL is /admin-wagtail/login/ — not Django's /accounts/login/ (that 302s).
check "/admin-wagtail/login/" "200"
if ! grep -qiE "Wagtail|password|ورود|sign.in|login" /tmp/cms-smoke-body; then
  echo "FAIL /admin-wagtail/login/ is not a sign-in page" >&2
  fail=1
fi
check "/health/" "200"
if ! grep -q '"db"' /tmp/cms-smoke-body; then
  echo "FAIL /health/ body is not CMS JSON" >&2
  fail=1
fi
# Must remain the static artifact — /health* glob would steal this path.
check "/health.json" "200"
if ! grep -q '"service":"static"' /tmp/cms-smoke-body && ! grep -q '"service": "static"' /tmp/cms-smoke-body; then
  echo "FAIL /health.json was not the static-site payload (Caddy must not proxy /health*)" >&2
  fail=1
fi
# Bare /admin must redirect (308) to /admin/ or return 200 (SPA served directly).
code="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/admin")"
if [[ "$code" != "200" && "$code" != "308" ]]; then
  echo "FAIL /admin expected 200 or 308 got ${code}" >&2
  fail=1
else
  echo "PASS /admin ${code}"
fi

check "/" "200"

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "CMS smoke PASS"
