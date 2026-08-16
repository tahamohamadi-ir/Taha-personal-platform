#!/usr/bin/env bash
# Minimal CMS smoke after Caddy proxy is applied.
# Usage: ./infra/deploy/smoke-cms.sh https://tahamohamadi.ir

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

# Anonymous admin login page (Wagtail) should be reachable — typically 200.
check "/admin/login/" "200"
# CMS readiness JSON (proxied). Static site health remains /health.json.
check "/health/" "200"
# Static site still healthy.
check "/health.json" "200"
check "/" "200"

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "CMS smoke PASS"
