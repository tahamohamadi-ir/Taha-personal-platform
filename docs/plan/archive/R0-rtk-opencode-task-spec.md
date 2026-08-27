# Task Spec — RTK integration for OpenCode agents

**Status:** Complete — locally verified.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` developer-tooling change  
**Risk level:** Low, with a global OpenCode hook boundary

## Goal

Install the official Windows build of RTK (Rust Token Killer), verify its
checksum, and enable the official OpenCode integration so shell-heavy OpenCode
agents receive compact command output. Measure this repository's real command
output savings before making any percentage claim.

## In scope

- Official `rtk-ai/rtk` Windows x86_64 release only.
- Install `rtk.exe` under `C:\Users\Taha\.local\bin` (already on `PATH`).
- Use RTK's official `rtk init -g --opencode` integration after inspecting its
  proposed paths/output.
- Preserve the existing OpenCode model/agent permissions and provider config.
- Smoke-test direct RTK commands and a restarted OpenCode Flash agent.
- Record exact version, generated global paths, rollback and measured savings.

## Non-goals

- No secret/provider/model changes.
- No application dependency, runtime, schema, VPS, CI, push or deploy change.
- No third-party `openrtk` npm plugin while first-party OpenCode support exists.
- No claim that RTK output reduction equals the same reduction in API cost.

## Allowed changes

- `C:\Users\Taha\.local\bin\rtk.exe`
- RTK-generated files under `C:\Users\Taha\.config\opencode\` after pre/post
  inventory and backup of any file it updates
- RTK's own config/data directories under `C:\Users\Taha\.config\rtk\` and
  `C:\Users\Taha\.local\share\rtk\`
- `PROJECT_MANIFEST.md`
- `docs/plan/SMALL-MODEL-EXECUTION-PLAN.md`
- `docs/status/WORK_LOG.md`
- this Task Spec

Everything else is forbidden.

## Verification

- GitHub release checksum matches the downloaded Windows archive.
- `rtk --version`, `rtk gain`, and `rtk init --show` succeed.
- Direct comparisons include at least `git status`, `git log`, and one verbose
  test/build-style command; raw output remains recoverable for failures.
- A fresh OpenCode session using DeepSeek V4 Flash demonstrates that the
  OpenCode plugin loads and rewrites an eligible shell command.
- Existing project OpenCode config and agent permission files remain unchanged
  unless explicitly documented in the final diff.

## Rollback

Run the official OpenCode uninstall mode, restore any backed-up global config,
remove only the verified `rtk.exe`, and restart OpenCode. Repository rollback is
a normal revert of the documentation-only commit.

## Completion evidence

- Installed official RTK `0.45.0` for Windows x86_64. The downloaded archive's
  SHA-256 matched the release checksum exactly:
  `34cea9009a8099acdaf85147b971d95f65efabfa63fb3aea7d3e2b73e6f517c3`.
- Installed binary: `C:\Users\Taha\.local\bin\rtk.exe` (`rtk 0.45.0`).
  Official generated plugin:
  `C:\Users\Taha\.config\opencode\plugins\rtk.ts`.
- `rtk init --show` reports the OpenCode plugin installed. The intentionally
  absent generic Claude hook is not required for the OpenCode-only boundary.
- A fresh OpenCode `1.18.18` DeepSeek V4 Flash session rewrote main-agent
  `git status` to `rtk git status`; its delegated general sub-agent independently
  confirmed `git log -n 10` was rewritten to `rtk git log -n 10`.
- Initial history: 7 commands, 216 estimated tokens saved (17.9%). Direct byte
  comparisons were approximately 77.6% for `git status`, 52.2% for a ten-entry
  `git log`, and 2.8% by RTK's estimate for the Astro build. Savings therefore
  vary materially by command.
- `rtk init -g --opencode --uninstall --dry-run` resolves only the generated
  OpenCode plugin and writes nothing. No provider/model, project OpenCode config,
  application dependency, CI, VPS, push or deploy change was made.
