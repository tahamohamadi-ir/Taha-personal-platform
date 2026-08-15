# ADR Index

ADRها immutable هستند: تغییر تصمیم با ADR جدید انجام می‌شود، نه با بازنویسی تصمیم پذیرفته‌شده.

| ADR | Decision | Status |
|---|---|---|
| 0002 | Python 3.12 + Django 5.2 LTS + Wagtail 7.4 LTS baseline | Accepted; bootstrap deferred |
| 0008 | Docker Compose + Caddy deployment | Accepted for P0-A; existing live Caddy/Compose stack audited, project-specific config not provisioned |
| 0009 | GitHub Actions hosted CI | Accepted |
| 0010 | Encrypted Google Drive backup | Accepted target; provisioned and file-level restore-tested on 2026-08-14; staging DB import remains |
| 0011 | Bilingual URL behavior | Accepted |
| 0014 | `/admin/` boundary | Accepted for route; hardening deferred |
| 0015 | Isolated staging placeholder | Accepted P0-A route; not yet applied |

The technology baseline still governs the remaining architecture decisions. Create a new ADR only when a decision is non-obvious, expensive to reverse, security/operations relevant, or changes a frozen contract.
