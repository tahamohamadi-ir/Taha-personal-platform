# ADR-0021: P3 media library and upload security

**Status:** Accepted (2026-08-15, P3 code-first gate).

## Context

P3 must support a media library whose uploads may later back public
projections. Upload security rules: MIME+signature allowlist, size limit,
safe storage names, private default, no direct delivery of originals.

## Decision

- `apps/media.Media` model: `file`, `title`, `alt_text`, `mime` (detected from
  file content, never client metadata), `size` (bytes, detected), `is_active`
  (default `False` — private until an editor explicitly activates), timestamps.
- Validation via the pure-Python `filetype` package (sniff first 2048 bytes):
  allowlist `image/jpeg`, `image/png`, `image/gif`, `application/pdf`;
  extension↔mime cross-check; max 5 MB.
- Safe storage names: extension derived from the detected mime map, random hex
  prefix, sanitized basename, no user-controlled directories, no spaces/unicode
  in stored names.
- Public projection: `active_public()` returns `is_active=True` only.

## Consequences

- Malicious/renamed files are rejected by content signature, not by name.
- The media provider decision (local disk vs S3-like) is deferred to the
  capacity/owner decision; `MEDIA_ROOT` is config-based.
- Original files are never delivered directly in public projections; the
  rendition contract lives in `apps.media.renditions` (`RENDITION_SPECS`:
  thumb/card/full WebP). Real file generation remains media-runtime phase.
