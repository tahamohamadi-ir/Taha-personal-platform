# Project-document migration map

Do not rewrite every project document before implementation evidence exists.
Update the owner file first when an accepted task changes a fact, then reconcile
documents that quote it.

| Document | When to update | Required change |
|---|---|---|
| `docs/contracts/DESIGN-CONTRACT.md` | Token task accepted | Dual-theme roles, font decision, atlas isolation and final motion/glass rules |
| `apps/web/src/styles/global.css` | Same token task | Exact runtime tokens; remains executable token authority |
| `docs/contracts/IA-CONTRACT.md` | Only if route/navigation decision changes | Main navigation labels/children while preserving canonical families |
| `docs/design.md` | After token/component/template acceptance | Supersede old visual direction; link this reference and actual runtime components |
| `docs/user-journey-information-architecture.md` | After accepted journey/route changes | PhD, academic, industry, reader, learner and creative journeys |
| `PROJECT_MANIFEST.md` | When architecture/tooling state changes | Atlas launch method, activated libraries and current state only |
| `AGENTS.md` | When runtime gate/current state changes | New active implementation phase and immutable boundaries |
| `docs/README.md` | When new owner documents become authoritative | Source-of-truth map and current-state table |
| `docs/plan/README.md` | Every packet activation/completion | Exact task state and responsible agent |
| `Task-list.md` | Integration planning and packet closure | One master section that links, rather than duplicates, this task list |
| `docs/status/WORK_LOG.md` | Every actual action | Commands, results, decisions and recovery evidence |
| `docs/status/deferred-validation.md` | Any skipped required check | Explicit ID, owner and closure condition |
| `docs/status/TECH_DEBT.md` | Any accepted imperfect implementation | Cost, impact and removal plan |
| `docs/status/RISK_REGISTER.md` | Security/content/release blocker | Evidence without repeating secrets |
| `docs/status/known-issues.md` | Visitor-visible defect | Reproduction, affected routes and mitigation |
| `Assets/site-redesign/README.md` | Reference package changes | Canonical implementation-reference entry and asset rules |
| `Assets/site-redesign/MANIFEST.md` | Managed binary added/replaced | Dimensions, bytes, source role and corresponding hash |
| `Assets/site-redesign/SHA256SUMS.txt` | Managed binary changes | Exact new hashes |
| CMS/admin Task Specs | After CMS gap audit | Approved fields/endpoints/migrations; never inferred from this design spec |

## Documentation completion rule

The final documentation reconciliation agent must compare statements against
the merged source and verification output. It must not copy future tense into a
“current state” table, mark Figma as authoritative, claim Dark is live before
runtime adoption, or claim a CMS field exists before migration/API evidence.

