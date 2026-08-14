# ADR-0002: Python runtime baseline

**Status:** Accepted for the future CMS bootstrap; not installed for this project yet.  
**Date:** 2026-08-14

## Context

The control plane currently has Python 3.14 and a Hermes-owned Python 3.11 interpreter, but neither is the project runtime. The owner prioritizes stable, low-risk ecosystem compatibility over the newest language release.

## Decision

- Use the latest supported patch release of Python 3.12 for the project.
- Pair it with Django 5.2 LTS and Wagtail 7.4 LTS when the CMS phase is authorized.
- Create a project-local `.venv` through `uv`; do not reuse the Hermes interpreter.

## Consequences

- Python 3.12 must be installed on the control plane and production image only when the task authorizes CMS bootstrap.
- The lockfile records exact patch/dependency versions, and upgrades to Python/Django/Wagtail happen in separate, tested tasks.
