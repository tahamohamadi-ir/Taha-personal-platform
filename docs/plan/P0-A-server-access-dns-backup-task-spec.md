# Task Spec — P0-A server access, staging DNS and backup bootstrap

**Status:** In progress — owner action required before any SSH connection.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Risk IDs:** `RISK-0001`, `RISK-0002`, `RISK-0003`

## Goal

Establish a safe, evidence-based starting point for P0-A operations without scaffolding the application or deploying any service: replace the exposed root-password access path with a named SSH-key operator account, create the isolated staging DNS record, and prepare the encrypted Google Drive backup bootstrap.

## In scope

- Rotate the exposed root credential outside this repository.
- Create `tahaops` as the owner-controlled, named, non-root Ubuntu operator account with a dedicated SSH key.
- After a second-session key-login test succeeds, disable root and password SSH login using the documented drop-in configuration.
- Add the proxied Cloudflare `A` record `staging.tahamohamadi.ir` to the existing VPS address.
- Perform a read-only server audit only after the secure key-based account is confirmed.
- Prepare Google Drive access and then provision restic/rclone only after the audit and an approved secret-handling path exist.

## Explicit non-goals

- No Astro/Django/Wagtail scaffold, dependency install, Docker Compose, Caddy, CI workflow, application deployment, migration or DNS change to the production root.
- No server password, private key, OAuth token, restic password, rclone configuration value or other secret is written to Git, chat logs or project documentation.
- No firewall change until the read-only audit confirms the active SSH port and access path.
- No claim that backup is complete before a scheduled job and staging restore rehearsal have evidence.

## Inputs and observed evidence

- Cloudflare screenshots supplied by the owner on 2026-08-14 show: the production root `A` record and `www` CNAME are proxied; no staging record exists yet; zone encryption mode is currently **Full**.
- The VPS is the owner-provided production target. Its address is intentionally not repeated here because it is already managed as infrastructure configuration, not repository data.
- `RISK-0002` remains a hard blocker until the root credential is rotated and key-only non-root SSH access is proved.

## Ordered execution and acceptance criteria

1. Owner rotates the root password in the provider panel or active root session and stores it only in a password manager.
2. Owner creates the local `ed25519` key and installs its public part for `tahaops` using [SERVER_ACCESS_RUNBOOK.md](../governance/SERVER_ACCESS_RUNBOOK.md).
3. Owner proves a fresh `tahaops` key login in a second terminal; only then the SSH hardening drop-in is validated and loaded.
4. Owner adds the `staging` Cloudflare record described in the runbook; DNS propagation is checked from an external resolver. The record alone must not be represented as an application deployment.
5. Codex performs an explicitly authorized, read-only SSH audit and records non-sensitive evidence.
6. With a dedicated Google Drive folder and owner-available OAuth consent, restic/rclone are configured on the audited server; a scheduled job, retention observation and staging restore rehearsal provide closure evidence for `RISK-0003`.

## Rollback / fallback

- Keep the original root console session open while testing `tahaops`; if new key login fails, remove the non-working SSH drop-in from that console and reload SSH only after `sshd -t` passes.
- Deleting only the new `staging` DNS record rolls back its DNS routing; it does not alter the production root or `www` records.
- A failed backup bootstrap must be disabled and secrets revoked/rotated; no backup configuration is accepted without a successful restore rehearsal.

## Verification to record

- `sudo -l` for `tahaops`, a separate `ssh -i` login, `sshd -t`, and a post-reload key-only login.
- DNS resolution for `staging.tahamohamadi.ir` and Cloudflare proxy state.
- Read-only audit outputs summarized without secrets.
- Backup job status, restic snapshot/retention metadata, and staging restore evidence without credentials.

