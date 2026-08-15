#!/usr/bin/env bash
# NOT-APPLIED — candidate only; deploy requires owner capacity decision (RISK-0007) and a separate Task Spec
#
# Manual fallback to rebuild the public Astro site (apps/web) from a repository
# checkout. Run from anywhere; requires node/npm available. Publishing or pushing
# the built artifact is wired in the deploy slice — NOT implemented here.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

echo "==> [manual-rebuild] rebuilding public site from ${REPO_ROOT}/apps/web"
cd "${REPO_ROOT}/apps/web"
npm ci
npm run build

echo "==> [manual-rebuild] build complete at apps/web/dist"
echo "==> [manual-rebuild] artifact publish/deploy step: wired in the deploy slice, not run here"
