#!/usr/bin/env bash
# Reusable HTTP smoke checks for a deployed static P1 site (staging or
# production). Read-only; no SSH, no sudo.
#
# Usage:
#   ./smoke.sh <BASE_URL> [--expect-noindex] [--expect-cms-origin]
#
# Checks (one PASS|FAIL line each; non-zero exit on any FAIL):
#   /                -> 200
#   /en/             -> 200
#   /fa/             -> 200
#   /health.json     -> 200 and body contains "status":"ok"
#   /robots.txt      -> 200
#   /sitemap.xml     -> 200
#   /nonexistent-qa  -> 404
#   --expect-noindex -> response header x-robots-tag on / contains noindex
#   --expect-cms-origin -> <meta name="cms-build-origin" content="cms"> present
#                         on /{locale}/cv/ (proves HTML came from a CMS rebuild,
#                         not the offline snapshot — publish→rebuild chain, C1)

set -euo pipefail

BASE_URL="${1:?usage: smoke.sh <BASE_URL> [--expect-noindex|--expect-cms-origin]}"
FLAG="${2:-}"
FLAG2="${3:-}"

FAILURES=0

expect_status() { # expect_status <name> <path> <expected-status>
  local name="$1" path="$2" expected="$3" status
  status="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${path}" || echo 000)"
  if [[ "$status" == "$expected" ]]; then
    echo "PASS ${name}"
  else
    echo "FAIL ${name} (expected ${expected}, got ${status})"
    FAILURES=$((FAILURES + 1))
  fi
}

expect_status "root /" "/" "200"
expect_status "locale /en/" "/en/" "200"
expect_status "locale /fa/" "/fa/" "200"
expect_status "robots.txt" "/robots.txt" "200"
expect_status "sitemap.xml" "/sitemap.xml" "200"
expect_status "nonexistent-qa" "/nonexistent-qa" "404"

health_status="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/health.json" || echo 000)"
health_body="$(curl -s "${BASE_URL}/health.json" || true)"
if [[ "$health_status" == "200" && "$health_body" == *'"status":"ok"'* ]]; then
  echo "PASS health.json body"
else
  echo "FAIL health.json body (expected 200 with \"status\":\"ok\" in body, got ${health_status})"
  FAILURES=$((FAILURES + 1))
fi

if [[ "$FLAG" == "--expect-noindex" ]]; then
  headers="$(curl -s -D - -o /dev/null "${BASE_URL}/" || true)"
  if grep -qi '^x-robots-tag:.*noindex' <<<"$headers"; then
    echo "PASS noindex /"
  else
    echo "FAIL noindex / (x-robots-tag header on / does not contain noindex)"
    FAILURES=$((FAILURES + 1))
  fi
fi

if [[ "$FLAG" == "--expect-cms-origin" || "$FLAG2" == "--expect-cms-origin" ]]; then
  for path in /en/cv/ /fa/cv/; do
    body="$(curl -s "${BASE_URL}${path}" || true)"
    if grep -q '<meta name="cms-build-origin" content="cms"' <<<"$body"; then
      echo "PASS cms-build-origin=cms ${path}"
    else
      echo "FAIL cms-build-origin=cms ${path} (meta missing or not cms — snapshot build?)"
      FAILURES=$((FAILURES + 1))
    fi
  done
fi

if [[ -n "$FLAG2" && "$FLAG2" != "--expect-cms-origin" && "$FLAG2" != "--expect-noindex" ]]; then
  echo "unknown flag ${FLAG2}"
  exit 2
fi

exit "$FAILURES"
