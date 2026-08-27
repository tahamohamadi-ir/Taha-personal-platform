# Track BK â€” Backend CMS (public data layer, `apps/cms`) â€” Task List

> Goal (FA): ØªÙˆØ³Ø¹Ù‡Ù” Ø¨Ú©Ù†Ø¯ Ø¹Ù…ÙˆÙ…ÛŒ â€” Ù…Ø¯Ù„â€ŒÙ‡Ø§ØŒ migrationØŒ Ù¾Ø±ÙˆØ¬Ú©Ø´Ù† published-only Ùˆ API Ø¹Ù…ÙˆÙ…ÛŒØ› ØªØ£Ù…ÛŒÙ† Ù‚Ø§Ø¨Ù„ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ±Ø¯Ù†ÛŒØ§Ø² Ø¨Ø§Ø²Ø·Ø±Ø§Ø­ÛŒ (Home composition Ø¯Ø§Ø¯Ù‡ØŒ timelineØŒ media metadataØŒ graph payload) **Ø¨Ø¯ÙˆÙ† Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø§Ø¯Ù…ÛŒÙ†**.
> Rule: only this track owns models + migrations. Tracks AB/AF request changes via contract tickets (Â§5), never edit these files.

## 1. Exclusive file ownership

| Zone | Rule |
|---|---|
| `apps/cms/apps/content/**` (models.py, migrations/**, projections/services) | **Exclusive to Track BK** |
| `apps/cms/apps/media/**` | Exclusive to BK |
| `apps/cms/apps/api/public*.py` / any public JSON view modules serving `/api/*` | Exclusive to BK |
| `apps/cms/config/settings*.py`, public URL routing for `/api/`,`/health/` | Exclusive to BK |
| `apps/cms/apps/security/**`, `apps/api/admin_*.py`, `apps/admin/**`, composition admin endpoints | FORBIDDEN to BK â€” those are Tracks AB/AF |
| Schema/endpoint/DTO **removals or renames** of live public fields | FORBIDDEN outright (content preservation non-negotiable; additive-only) |

## 2. Invariants

- Migration policy: smallest reversible step; **dumpdata fixture + restic backup evidence BEFORE applying anything on VPS** (`RISK-0010` path); never enable `CMS_CD_AUTO_MIGRATE`.
- Public projections remain published-only: draft/private/inactive never leak (`public()`/`active_public()` gates stay).
- Locale independence: fa/en fields additive per existing convention (e.g., `alt_text_fa/en` pattern).
- Every new model gets negative tests proving anonymous users cannot read unpublished rows.

## 3. Local-first loop

```powershell
# working directory: apps/cms/
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv sync --python 3.12
uv run ruff check .
uv run python manage.py check
uv run python manage.py makemigrations <app> --dry-run   # then real, in the SAME commit as model change
uv run pytest -q
uv run python manage.py dumpdata --natural-primary --natural-foreign -o fixtures/pre_<packet>.json   # before local risky applies
```

Full-stack demo (optional, no deploy): compose up `db+cms`, point a scratch web build at it via `CMS_API_BASE=http://127.0.0.1:18000`.

## 4. Packets

| ID | Packet | Key steps | Files (owned) | Verify | Done gate | Deps |
|---|---|---|---|---|---|---|
| **BK-00** | Data-contract inventory sheet | Read-only sweep of current models/public DTOs; publish `docs/plan/BK-DATA-CONTRACTS.md`: entity â†’ fields â†’ locale/status â†’ consumer route; mark which MASTER-SPEC needs exist/partial/absent (feeds Tracks AB/AF/WF planning); no code change | new doc only + WORK_LOG | doc resolves every public endpoint; review by other tracks noted | X1 unblocked | â€” |
| **BK-01** | Home composition data model | Additive migration: home module records â€” key (identity/graph/research-fit/journey/projects/publications/previews/cta), visible_{fa,en}, order, selection_mode(manual/rule/hybrid), provenance note; constraints: unique(locale,key); serializer exposed ONLY when published; honest-empty default = module omitted | `content/models.py`, new `migrations/00XX_home_modules.py`, projection + tests (positive+negative) | pytest incl. leak tests; makemigrations --check clean | ready for AB-02 consumption | BK-00 |
| **BK-02** | Timeline & journey records | Reusable ordered record set (period label optional, type, role, body_{locale}, detail link optional, weight) attachable to Profile/CV context; empty value â‡’ field absent from payload; ordering stable | same app files + tests | idem | AB-03/AF editor data ready | BK-00 |
| **BK-03** | Media rights & focal metadata | Additive Media fields: `focal_x/focal_y` (nullable decimal %), `rights_statement_{locale}`, `license_id` FK-or-null, alt enforcement unchanged; renditions may honor focal later (web-side crop is CSS-first; DB stores intent) | `media/models.py`, migration, serializers, tests (rights not exposed on inactive) | idem | AB-05 picker fields ready | BK-00 |
| **BK-04** | Graph schema storage | Model set: GraphVersion(content_object? standalone) with nodes(label,type,color_role,icon_role,weight,pos,x/y/z nullable,related M2M generic), edges(source,target,relation_type,directed,weight), groups/locale variants + validation: unique node IDs/version, no duplicate directed edge pair, related must reference published-or-null; NO endpoint here (AB-06 owns admin writes; BK ships the public READ projection below) | content or dedicated `graph` model file(s) + migration + tests | validation tests PASS | G7 storage side | BK-01 optional |
| **BK-05** | Public graph read API | Published-latest version â†’ `GET /api/graph/{locale}` shape-mapped to `GraphNodePublic/GraphEdgePublic` camelContract of implementation-reference (IDs stable strings); 404 fail-closed behavior mirrors articles conventions when nothing published; list-fallback consumer unaffected | public api module + url + schema test + curl sample in WORK_LOG | contract test vs target types; anonymous-only leakage check | WF-08 can consume | BK-04 |
| **BK-06** | Publication/Talk/Course/Work gap fill | Inventory-driven small packets ONLY for fields tracks marked absent-required (e.g., talk slides_uri? course outcomes already exist from P9) â€” each field: model+migration+serializer+negative test in ONE commit; skip anything whose absence the frontend treats honestly (omit â‰  error) | targeted per-gap commits | per-commit pytest green | X2 clear | BK-00 |

## 5. Cross-track contract protocol (conflict prevention)

1. Other tracks NEVER open `.py` under this track's zones. They file a row in `docs/plan/BK-REQUESTS.md` (fields/endpoints wanted, rationale, gate).
2. BK triages requests into next packet; resulting shapes are announced by editing that request row with `DELIVERED:<migration>`.
3. Endpoint responses are append-only: adding fields OK, removing/renaming forbidden without owner ADR.

## 5b. BK-L0 â€” local settings profile (FIRST packet, prerequisites for all others)

Defined in full in `TRACK-MODE-environment-and-cutover.md` Â§3 â€” creates `apps/cms/config/settings/local.py` verified against the DEV-00 local Postgres (`:15432`). Every later packet's verify loop assumes `$env:DJANGO_SETTINGS_MODULE="config.settings.local"` with the mode-A1 stack up.

## 6. Rollback

Revert commit restores prior models; because every migration is additive, `migrate <app> <previous>` remains available. Pre-apply dumpdata fixture is the recovery artifact for content edits made between backups.

## 7. Field/column drop protocol (clean codebase, MODE Â§7.4)

Candidate drops â†’ rows in `docs/plan/BK-DROP-TICKETS.md` (path created on first need): `<field> :: last-consumer <sha> :: proposed-release N+2`. Execution requires: zero grep consumers across ALL track zones + two released builds past removal-of-last-consumer + owner tick + fresh dumpdata evidence in WORK_LOG before the `RemoveField` migration commit. Public API fields never drop (Â§2 invariant).

---

## 8. Engineering doctrine â€” backend quality bar (non-negotiable, applies to every BK packet)

> Goal (FA): Ø¨Ú©Ù†Ø¯ Ø¨Ø§ÛŒØ¯ **Ù„Ø§ÛŒÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ´Ø¯Ù‡ØŒ ØªØ³Øªâ€ŒÙ…Ø­ÙˆØ±ØŒ Ù‚Ø§Ø¨Ù„â€ŒÚ¯Ø³ØªØ±Ø´ Ùˆ Ø§Ù…Ù†** Ø¨Ù…Ø§Ù†Ø¯Ø› Ø§ÙØ²ÙˆØ¯Ù† entity Ø¬Ø¯ÛŒØ¯ ÛŒØ§ field Ø¬Ø¯ÛŒØ¯ Ø¨Ø¯ÙˆÙ† Ø¯Ø³Øªâ€ŒØ²Ø¯Ù† Ø¨Ù‡ Ú©Ø¯Ù‡Ø§ÛŒ Ù…ØµØ±Ùâ€ŒÚ©Ù†Ù†Ø¯Ù‡ Ù…Ù…Ú©Ù† Ø¨Ø§Ø´Ø¯ Ùˆ Ù‡Ø± ØªØºÛŒÛŒØ± schema Ù…Ø³ÛŒØ± Ø¨Ø±Ú¯Ø´Øª Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.

### 8.1 Layered architecture rules

1. **Strict layer separation** (mirror of existing repo conventions found in services/projections):
   `Model (persistence) â†’ Service/Manager (business rules: lifecycle, ordering, validation) â†’ Projection/Serializer (public DTO shape) â†’ View/API module (HTTP concerns only)`.
   - A view never queries the ORM directly beyond `get_object_or_404`-style fetch via its service; business logic (order permutation checks, published gates, locale fallbacks) lives in service functions that are unit-testable without HTTP.
   - Adding a new endpoint = serializer + tiny view + url line. The ~15-line view guidance is a SMELL THRESHOLD, not a cap (same protocol as Track WF Â§7.5): if extraction would force artificial contortions or split cohesive validation, ship complete + TECH_DEBT id instead â€” never drop validation/negative tests/leak checks to shorten a view.
2. **One concept, one model/serializer**: no parallel "v2" models duplicating an entity; extensions are additive fields or new related models. The closed registry for v1 = entities listed in `BK-DATA-CONTRACTS.md`; new entity â‡’ proposal row there with consumer evidence BEFORE migration is written.
3. **DTO contract freeze discipline**: public serializers may only ADD keys. Every shipped key must appear in `BK-DATA-CONTRACTS.md` (packet updates doc in same commit). WF consumes via these docs, never by reading Django source.

### 8.2 Data & schema scalability rules

1. **Migration hygiene**: one logical change per migration; name migrations descriptively (`00XX_home_modules`, not `00XX_misc`); every migration runs forward+backward (`RemoveField`/`AlterField` reverse where Django supports automatically); atomic edits on Postgres default are fine but long backfills get separate data-migration steps.
2. **Locale pattern**: `_fa/_en` suffix convention stays consistent; validators enforce completeness policy per existing content-health rules; NEVER add a third ad-hoc naming (`_fa_ir`) â€” escalate instead.
3. **Indexing & constraints as features**: any field used by list endpoints gets its index/constraint declared in the same commit it ships (`UniqueConstraint(locale,key)` precedent); N+1 risks in list projections resolved with `select_related/prefetch_related` and asserted via `django_assert_num_queries` style tests where suites already use them.
4. **Publishing/lifecycle reuse**: new entities mixin into the EXISTING lifecycle/public-projection framework rather than inventing status columns; anonymous-read protection tests come from the shared projection test helpers.

### 8.3 Enforced quality gates (per packet loop additions to Â§3 loop output)

| # | Check | How | Fail condition |
|---|---|---|---|
| 1 | Suite green + ruff clean | `uv run pytest -q`, `uv run ruff check .` | any failure |
| 2 | Migration coherence | `makemigrations --check --dry-run` empty AFTER commit's real migration exists | drift |
| 3 | Leak negatives ship with feature | same-commit test asserting unpublished/inactive/other-locale rows invisible anonymously | missing negative |
| 4 | DTO parity doc updated | `BK-DATA-CONTRACTS.md` diff includes each new public key | undocumented key |
| 5 | No secret/env hardcoding | settings read env with local-only defaults confined to `settings/local.py` | prod-settings mutation |
| 6 | Service-layer placement | grep view module: ORM aggregates/ordering logic absent (delegated) | fat views |

### 8.4 Extensibility seams (recorded once here so future fixes stay cheap)

- New public read family â†’ new projection function + serializer module under existing package layout, registered in public urls guarded section `[PUBLIC-API]`.
- New admin-side capability (Track AB asks) â†’ answered with new additive service + serializer, announced through `BK-REQUESTS.md` row edit `DELIVERED:<migration>` â€” AB/AF files untouched by BK, and vice versa.
- Performance work later (FTS, vector search per P10/P11 ADRs) plugs at the projection layer without reshaping models â€” that seam is intentionally kept clean by rule Â§8.1(1).

Every BK WORK_LOG entry appends `Doctrine compliance: [Â§8.x items verified]` exactly like Track WF Â§7.4.
