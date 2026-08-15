#!/usr/bin/env bash
# Root-only (installed at /opt/taha/bin/caddy-apply.sh, root:root 0755):
# applies the documented 404 handle_errors fix to /etc/caddy/Caddyfile with
# backup -> validate -> reload; restores the backup if validation fails.
#
# This is intentionally a FIXED transformation (no user-supplied patch files),
# so the sudoers grant for this script cannot be used to run arbitrary code.
set -euo pipefail

CADDY_FILE="/etc/caddy/Caddyfile"
BACKUP="$CADDY_FILE.auto-$(date +%Y%m%d%H%M%S)"

cp -a "$CADDY_FILE" "$BACKUP"

python3 - "$CADDY_FILE" <<'PYEOF'
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    text = f.read()

if "handle_errors {" in text:
    print("handle_errors already present; no change")
    sys.exit(0)

idx = text.find("(taha_application_routes) {")
if idx == -1:
    print("error: taha_application_routes snippet not found", file=sys.stderr)
    sys.exit(1)

fs = text.find("file_server", idx)
if fs == -1:
    print("error: file_server not found inside snippet", file=sys.stderr)
    sys.exit(1)

line_end = text.find("\n", fs)
insert = "\n\thandle_errors {\n\t\trewrite * /404.html\n\t\tfile_server\n\t}"
new_text = text[: line_end + 1] + insert + text[line_end + 1 :]

with open(path, "w", encoding="utf-8") as f:
    f.write(new_text)
print("handle_errors block inserted into taha_application_routes")
PYEOF

if ! caddy validate --config "$CADDY_FILE"; then
  echo "validation failed; restoring $BACKUP" >&2
  cp -a "$BACKUP" "$CADDY_FILE"
  exit 1
fi

systemctl reload caddy
echo "caddy: 404 handle_errors applied and reloaded; backup at $BACKUP"
