# IDEA — Taha Personal Platform

Taha Personal Platform is a personal software platform for building and integrating AI-assisted, data-driven, and productivity-oriented capabilities around my projects, workflows, knowledge, and digital tools.

The project may evolve over time and can include backend services, APIs, data processing, AI/LLM integrations, automation, personalization, dashboards, and user-facing features.

## Architecture (2026-08-26 — ATLAS-aligned)

- **Public frontend `apps/web/` — Astro 7 + TypeScript 5.9 + Tailwind CSS 4 + React 19 islands**, rebuilt **from scratch** per canonical brief `Assets/site-redesign/implementation-reference/` (branch `p14c-visual-atlas`, commit `7d9b87f`). Dual-theme Design System (24 components `agent-kit/components.json` + 6 templates `agent-kit/templates.json`), local-only Visual Atlas `DESIGN_ATLAS=1` → `/_design/` (not in production build). Public pages stay **no-JS readable**; React is an island, not the shell (MASTER-SPEC §2–3, §9).
- **CMS/admin `apps/cms/` — Django 5.2.9 + Django Ninja 1.6.2 + PostgreSQL 17**, custom React admin SPA at `/admin/` (`admin-frontend/`) + Django staff HTML at `/staff/` (LOGIN_URL, MFA fallback). Wagtail removed (`DEBT-0003` CLOSED). Public projections `/api/` + `/media/` are **published-only** (`is_active` for anonymous).
- **Runtime target (ADR-0027):** one Compose project `taha-cms` = `db` + `cms` + `web` (nginx) + `caddy` (profile `edge`). Old `taha-prod-*` stack gone.
- **Frontend/admin separation is invariant (ADR-0026):** `apps/web` and `apps/cms` (+ `admin-frontend`) remain **separate projects, separate builds, separate routes** — no shared writable worktree, no merged bundle. Any merge proposal must be rejected.

## Canonical reference

Next-generation frontend intent is owned by `Assets/site-redesign/implementation-reference/` — read order: `README.md` → `MASTER-SPEC.md` §1–6, §11 → `AGENT-COORDINATION.md` → `MULTI-AGENT-TASK-LIST.md` (global constraints + execution board ATLAS-00..12) → `agent-kit/*.json` + `ACCEPTANCE-GATES.md` (G0..G9). Current runtime authority remains `apps/web/src/styles/global.css` + `docs/contracts/*` until an ATLAS packet is accepted and merged (`DOCUMENT-MIGRATION-MAP.md`). For tokens, `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13.

## When working on this project:

- Treat the existing repository as the source of truth.
- Inspect the architecture, dependencies, configuration, tests, and current implementation before proposing changes.
- Prefer clean, maintainable, modular, and production-oriented solutions.
- Make minimal, reviewable changes instead of unnecessary rewrites.
- Preserve existing behavior unless a task explicitly requires changing it.
- Consider security, privacy, observability, performance, and maintainability in architectural decisions.
- For AI-related features, prefer explicit data flow, traceability, validation, user control, and graceful failure over opaque automation.
- Never expose secrets or modify production credentials/data.
- For non-trivial tasks, inspect first, explain the current state, propose a plan, then implement and verify.
- Run the relevant build, tests, linting, or other available verification after changes.
- Clearly report what was changed, what was verified, and any unresolved risks.

The immediate goal is to understand the current codebase accurately and progressively develop the platform without losing architectural coherence as new capabilities are added.
