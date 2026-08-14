# Taha Personal Platform

The repository for the replacement of `tahamohamadi.ir`: a bilingual Persian/English personal research, professional and knowledge platform.

## Current status

P0-G0 documentation baseline. Application code has not been scaffolded and no service is deployed from this repository.

Start with [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md), then [AGENTS.md](AGENTS.md), [Documentation Policy](docs/governance/DOCUMENTATION_POLICY.md) and the [Master Plan](docs/taha-personal-platform-development-master-plan-fa.md).

## Repository layout

```text
apps/web/   future Astro public website
apps/cms/   future Django/Wagtail/Django Ninja application
infra/      future deployment and operations files
docs/       product, design, architecture, governance and status
```

## Safety

Do not add secrets to this repository. The production server is not configured by this repository yet; deployment and backup remain P0-A work.
