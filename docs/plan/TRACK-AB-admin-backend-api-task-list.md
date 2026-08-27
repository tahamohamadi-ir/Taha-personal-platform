# Track AB â€” Admin Backend API (`/api/v1/admin/*`, Django Ninja) â€” Task List

> Goal (FA): ØªÙˆØ³Ø¹Ù‡Ù” API Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø±Ø§ÛŒ Ù‚Ø§Ø¨Ù„ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ø²Ø·Ø±Ø§Ø­ÛŒ (Home ComposerØŒ TimelineØŒ Media focal/rightsØŒ Graph authoring ÙØ§Ø² Û±) â€” Ø¯Ù‚ÛŒÙ‚ØŒ ØªØ³Øªâ€ŒØ´Ø¯Ù‡ Ùˆ Ø¨Ø¯ÙˆÙ† ØªØ¯Ø§Ø®Ù„ Ø¨Ø§ Tracks BK/WF/AF.
> Read FIRST: `AGENTS.md`, `docs/plan/TRACK-MODE-environment-and-cutover.md` Â§1â€“Â§8, `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` Â§8, existing `apps/api/admin_api.py` + admin auth tests.

## 0. Ownership wall (from MODE Â§8)

- WRITE zone: new files matching `apps/api/admin_*.py` (you MAY create `admin_urls.py`, `admin_home.py`, `admin_timeline.py`, `admin_media_ext.py`, `admin_graph.py`) + your test modules under the repo's existing admin-API test directory pattern.
- ONE-TIME guarded edit: single include line in `config/urls.py` inside a `# [ADMIN-API]` marker comment (AB-00 only).
- READ allowed: any model file under `apps/cms/apps/**` for serialization/import. WRITE there is FORBIDDEN â€” route change requests via `docs/plan/BK-REQUESTS.md`.
- Session auth + CSRF + TOTP gating follows whatever decorators/helpers the CURRENT admin endpoints use â€” copy their usage verbatim; never invent a second auth scheme.

Every packet below follows this loop:

```powershell
# Terminal 1 already running mode A1 stack (MODE Â§4)
cd apps/cms
$env:DJANGO_SETTINGS_MODULE="config.settings.local"
uv run pytest apps/api -q                 # targeted before/after each step
uv run ruff check .
uv run python manage.py check
```

Contract style to mirror exactly (verified in AB-00 survey): Problem Details errors `{status, code, message, fields[]}` with stable codes like `AUTH_REQUIRED|FORBIDDEN|OTP_REQUIRED|AUTH_FAILED|CSRF_FAILED|RATE_LIMITED`; optimistic locking via `If-Match: <revision>` returning 409 `STALE_REVISION` on mismatch; audit log row per mutating call.

---

## AB-00 â€” Baseline survey & URL section marker

- DependsOn: BK-L0 local settings exist.
- AllowedFiles: new `apps/api/admin_urls.py`; one guarded line in `config/urls.py`; this doc checkbox; WORK_LOG.
- Steps:
  1. Open current admin API entrypoint(s); record in WORK_LOG: router prefix(es), auth decorator name(s), CSRF enforcement point, rate-limit helper, audit-log writer signature, If-Match helper (or note its absence), schema/OpenAPI exposure path.
  2. Create `apps/api/admin_urls.py` exposing an empty list `urlpatterns`/router mount point plus a module docstring declaring it the ONLY registration surface for future admin routers (AB-* packets append here).
  3. Insert into `config/urls.py`: guarded block
     ```python
     # [ADMIN-API] begin â€” Track AB exclusive
     from apps.api import admin_urls  # noqa: E402
     urlpatterns += [ path("api/v1/admin/", admin_urls.urls) ]  # exact include form may differ; match file conventions
     # [ADMIN-API] end
     ```
     Adapt include mechanism to whether project uses plain urlpatterns or Django-Ninja routers â€” mirror how `/api/v1/admin/auth/*` currently mounts.
  4. Verify: anonymous GET `/api/v1/admin/anything-new` â†’ expected 401-family per existing style; existing suite green.
- Done when: survey answers recorded; include line live without breaking current login flow.
- Commit: `feat(admin-api): baseline url section and ownership marker`
- Rollback: revert single commit.

## AB-01 â€” Shared write-helpers hardening (If-Match + validation-error mapping)

- DependsOn: AB-00.
- AllowedFiles: new `apps/api/admin_common.py` (+ its test file). If helpers already exist in `admin_api.py`, instead create thin wrappers importing them â€” do NOT refactor existing working code in this packet.
- Steps:
  1. Implement/confirm three reusable functions with typed signatures documented in docstrings: (a) `resolve_if_match(request, instance)` reading header vs instance revision attr name found by survey convention; (b) `validation_error(fields_map)` â†’ ProblemDetails payload builder reused by all later packets; (c) `audit(action, entity, pk, actor)`.
  2. Unit-test each: happy path + missing-header(428-style mapped to existing code vocabulary or new stable code `PRECONDITION_REQUIRED` declared once here) + stale revision 409.
- Verify: targeted pytest file â‰¥6 cases green; ruff clean.
- Commit: `feat(admin-api): shared if-match and problem-details helpers`

## AB-02 â€” Home composition CRUD

- DependsOn: BK-01 shipped models (contract request protocol Â§5 of BK). BLOCKED until its migration exists locally.
- AllowedFiles: `apps/api/admin_home.py`, `apps/api/admin_urls.py` (append router), new test module `test_admin_home.py`.
- Endpoints (exact paths frozen here so AF can code against them):
  ```text
  GET    /api/v1/admin/home-modules/{locale}                â†’ ordered array [{key, visible, order, selection_mode, provenance_note, revision}]
  PUT    /api/v1/admin/home-modules/{locale}   (If-Match)   â†’ full-array bulk save; 200 {revision}; 409 STALE_REVISION
  POST   /api/v1/admin/home-modules/{locale}/validate       â†’ same-body dry run; 200 {} | 400 fields[]   (AF uses for live client-side hints)
  ```
- Validation rules enforced server-side: keys limited to the eight canonical ones; order is a permutation without duplicates; visible default false; selection_mode âˆˆ {manual, rule, hybrid}; locale âˆˆ {fa,en}. Errors map fieldâ†’stable message tokens (`UNKNOWN_KEY|DUPLICATE_ORDER|BAD_ENUM`) that AF renders localized.
- Audit every successful PUT (`action="home_modules.update" entity="home" pk=locale`).
- Negative tests: unpublished referenced records never leak ids beyond counts (manual mode returns count only until BK serializer exposes safe refs); anonymous 401; wrong locale 404; cross-locale isolation faâ‰ en.
- Verify: pytest module green incl. â‰¥10 negative cases; manual curl snippet pasted in WORK_LOG showing full PUTâ†’GET roundtrip against A1 stack.
- Commit: `feat(admin-api): home composition endpoints`

## AB-03 â€” Timeline records CRUD

- DependsOn: BK-02 models.
- AllowedFiles: `apps/api/admin_timeline.py`, url append, `test_admin_timeline.py`.
- Endpoints:
  ```text
  GET    /api/v1/admin/timeline/{locale}?profile=<slug>        â†’ items[{id,type,label,period_label?,body,order,detail_uri?}]
  POST   /api/v1/admin/timeline/{locale}                       â†’ create (position=append; optional after_id)
  PATCH  /api/v1/admin/timeline/{locale}/{id}   (If-Match)     â†’ field edit
  DELETE ...{id}                     (If-Match)                 â†’ soft-delete convention if BK model has one; else hard delete flagged in response body {hard_delete:true}
  POST   /api/v1/admin/timeline/{locale}/reorder               â†’ ordered id array permutation (same permutation rules as AB-02)
  ```
- Same error-code vocabulary; audit writes `timeline.<op>`; list is locale-scoped strictly.
- Verify: pytest â‰¥12 cases incl. reorder across locales isolation; curl roundtrip logged.
- Commit: `feat(admin-api): timeline records endpoints`

## AB-04 â€” Media focal/rights/license extension

- DependsOn: BK-03 fields exist.
- AllowedFiles: `apps/api/admin_media_ext.py`, url append, `test_admin_media_ext.py`. The EXISTING media upload/list endpoints stay untouched.
- Endpoints:
  ```text
  PATCH /api/v1/admin/media/{id}/presentation  (If-Match)
        body accepts subset {focal_x?: 0..100, focal_y?: 0..100, rights_statement_fa?, rights_statement_en?, license_id?: int|null}
        null clears nullable fields (explicit-null semantics documented in endpoint docstring)
  GET   /api/v1/admin/media/licenses           â†’ [{id,name}] reference list ( backs AF select box )
  ```
- Reject out-of-range focal floats with field token `OUT_OF_RANGE`; license_id unknown â†’ `UNKNOWN_LICENSE`.
- Verify: pytest incl. decimal rounding acceptance to 2dp; inactive media still patchable by staff but remains publicly invisible (assert public projection unchanged).
- Commit: `feat(admin-api): media presentation metadata endpoints`

## AB-05 â€” Graph storage read-for-admin

- DependsOn: BK-04 models exist (AB reads them directly).
- AllowedFiles: `apps/api/admin_graph.py`, url append, `test_admin_graph_adminside.py`.
- Endpoints:
  ```text
  GET   /api/v1/admin/graph/versions                      â†’ [{version, status draft|active, created_at, node_count, edge_count}]
  POST  /api/v1/admin/graph/versions                      â†’ create empty draft (max open drafts guard if BK enforces one â†’ else allow many, status-only)
  GET   /api/v1/admin/graph/versions/{v}                  â†’ full payload nodes+edges+groups in GraphNodePublic-shaped camelCase (target contract types)
  PUT   /api/v1/admin/graph/versions/{v}/payload          â†’ replace whole payload of a DRAFT version; runs validator (AB-06) first; atomic reject keeps prior bytes
  POST  /api/v1/admin/graph/versions/{v}/activate         â†’ draftâ†’active; previously-active auto-archived; audit "graph.activate"
  GET   /api/v1/admin/graph/validation/{v}                â†’ re-run validator report without mutation
  ```
- Permission: same admin session as everything else; no special role invention.
- Payload contract = implementation-reference `GraphNodePublic/GraphEdgePublic` EXACTLY (ids stable strings; relatedRecords family/id pairs). Mapping code lives HERE reading BK rows; AF never sees DB shapes.
- Verify: roundtrip test PUT(payload)â†’GET equality byte-for-camelKey; activate switches active row atomically (concurrent double-activate second gets 409 `ALREADY_ACTIVE`).
- Commit: `feat(admin-api): graph versions and payload endpoints`

## AB-06 â€” Graph validator service

- DependsOn: AB-05 skeleton.
- AllowedFiles: `apps/api/admin_graph_validate.py` (service pure-function module), tests.
- Checks producing structured issues `[{code, node_id|edge_id?, message_token}]`: duplicate node id; orphan node (zero edges) severity warn allowed to persist in DRAFT but blocks ACTIVATE with 409 `VALIDATION_BLOCKED` and issue list; duplicate directed edge pair; self-edge; related-record target family/id resolving nothing â†’ `BROKEN_RELATED`; missing accessibleLabel per node; weight float range 0..1; position x,y required numeric (z optional); two-locale completeness warn if label_{fa,en} both absent per node policy discovered from BK model constraints (mirror exactly what columns enforce).
- Pure module (no HTTP) so AF-facing endpoint reuses it; unit table-driven tests covering every code string.
- Commit: `feat(admin-api): graph payload validator`

## AB-07 â€” Consolidation QA sweep

- DependsOn: all above merged locally.
- AllowedFiles: none new â€” runs suites + fixes typos within own zones only.
- Steps: full `uv run pytest -q`; exercise every new endpoint sequentially via curl script appended verbatim into WORK_LOG with status codes; confirm OpenAPI JSON (existing docs path found at AB-00) lists all new paths; ensure old endpoints untouched (git diff scope review).
- Done gate: zero non-own-zone diffs; suites green; handoff report complete.
- Commit (only if fixes needed): `fix(admin-api): consolidation polish`

## Handoff contract (every packet)

Branch `atlas-ab-<packet>` from verified base Â· changed-file manifest Â· endpoint contract diff table Â· commands+raw outputs Â· curl evidence for A1 stack Â· new DEBT/RISK ids if any Â· commit hash. No push, no deploy â€” integration lead merges per AGENT-COORDINATION Â§6 order after WF/BK compatible state.

---

## Engineering doctrine â€” admin API quality bar (applies to every AB packet)

> Goal (FA): API Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø§ÛŒØ¯ **Ø§ÙØ²ÙˆØ¯Ù†ÛŒ (additive)ØŒ Ø§Ù…Ù†ØŒ Ù‚Ø§Ø¨Ù„â€ŒØªØ³Øª Ùˆ Ø¨Ø¯ÙˆÙ† Ù†Ù‚Ø¶ Ù…Ø±Ø² Ø³Ù‡ Track Ø¯ÛŒÚ¯Ø±** Ø±Ø´Ø¯ Ú©Ù†Ø¯Ø› Ø§ÙØ²ÙˆØ¯Ù† Ù‚Ø§Ø¨Ù„ÛŒØª Ø¬Ø¯ÛŒØ¯ = ÛŒÚ© Ù…Ø§Ú˜ÙˆÙ„ router Ø¬Ø¯ÛŒØ¯ + ØªØ³ØªØŒ Ù†Ù‡ Ø¯Ø³Øªâ€ŒÚ©Ø§Ø±ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯.

### Layer & structure rules

1. **One domain, one module**: `admin_home.py`, `admin_timeline.py`, â€¦ self-contained router + schema + serializer-mapping. Cross-module imports limited to `admin_common.py` helpers; never import another feature's internals â€” shared logic graduates INTO `admin_common` first.
2. **Endpoint additions only**: existing admin endpoints (`auth/*`, profiles, composition) are frozen surfaces. New capability â‡’ new paths under the AB section marker; changing an existing endpoint's contract requires its own ADR-level proposal + owner tick + AF consumer ack, never a silent reshape.
3. **HTTP-thin views**: request parsing/validation errors â†’ ProblemDetails via shared helper; business rules live in pure functions or service calls so the validator/permission logic is unit-testable without Django test client. The ~40-line view figure is a SMELL THRESHOLD guiding extraction, not a cap: never drop validation branches, audit calls, or error-code tests to fit it. Over threshold with no natural seam (per the completeness-over-budget protocol mirrored from Track WF Â§7.5) â‡’ ship complete + TECH_DEBT id and flag `ESCALATE:` for split timing.
4. **Permission & audit uniformity**: every mutating call uses the SAME session-auth+CSRF+TOTP gate helpers discovered at AB-00 and writes one audit row with stable action naming `<domain>.<verb>` â€” no bespoke security per endpoint, ever.

### Scalability & extensibility rules

1. **Versioned-by-namespace growth**: future incompatible needs land as `/api/v2/admin/...` namespace alongside v1 rather than mutating v1 payloads; AF can migrate screen-by-screen using the same client patterns.
2. **Validator-as-library pattern** (established by AB-06): rule engines are pure modules exporting stable code/token enums; HTTP layer merely wraps them. New validation domains follow this template.
3. **Contract-first discipline**: before implementing any endpoint here, its row must exist in an AB task list doc with exact method/path/body â€” AF plans against THAT text. Contract drift discovered during implementation â‡’ stop, update BOTH docs in one commit, note in WORK_LOG.
4. **Test pyramid per endpoint**: unit (pure logic incl. validator) â‰¥ table-driven negatives; integration (Django test client happy+negative); manual curl roundtrip evidence on A1 stack for the shipping packet. Coverage bar: every declared error code has â‰¥1 test asserting it.

### Enforced quality gates

| # | Check | How | Fail |
|---|---|---|---|
| 1 | Suites green | pytest targeted + ruff | failure |
| 2 | Zone purity | `git diff --stat` contains ONLY `apps/api/admin_*` (+ guarded urls line when applicable) | foreign file touched |
| 3 | Auth/audit parity | grep new endpoints: same decorator/helper names as AB-00 survey list | bespoke auth found |
| 4 | Error-code registry sync | any NEW stable code string added to `admin_common` constants + this doctrine's vocabulary; tests assert it | orphan code string |
| 5 | OpenAPI surface | generated schema lists new paths with operation ids matching doc contracts | missing/mismatch |

WORK_LOG entries append `Doctrine compliance: [items verified]` identical to WF Â§7.4 convention.
