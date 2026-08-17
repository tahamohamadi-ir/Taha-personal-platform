#!/usr/bin/env bash
# Blog + research smoke after static deploy (P4-05 / P5 prod evidence).
# Usage: bash infra/deploy/smoke-blog.sh https://tahamohamadi.ir

set -euo pipefail

BASE_URL="${1:-https://tahamohamadi.ir}"
BASE_URL="${BASE_URL%/}"
fail=0
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT

check() {
  local path="$1"
  local expect="$2"
  local code
  code="$(curl -sS -o "$BODY" -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL ${path} expected ${expect} got ${code}" >&2
    fail=1
  else
    echo "PASS ${path} ${code}"
  fi
}

for locale in en fa; do
  check "/${locale}/blog/" "200"
  check "/${locale}/research/" "200"
done

# Public /api/ remains blocked until DEFER-0017 owner approval.
code="$(curl -sS -o "$BODY" -w "%{http_code}" "${BASE_URL}/api/articles/en")"
if [[ "$code" == "200" ]]; then
  echo "WARN /api/articles/en returned 200 — confirm this is intentional (DEFER-0017)"
else
  echo "PASS /api/articles/en blocked (${code})"
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "blog smoke PASS"
