# Task Spec — P0-A server access, staging DNS and backup bootstrap

**Status:** In progress — owner action required before any SSH connection.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Risk IDs:** `RISK-0001`, `RISK-0002`, `RISK-0003`

## Goal

Establish a safe, evidence-based starting point for P0-A operations without scaffolding the application or deploying any service: validate the existing named non-root SSH-key operator account (or create one only if it is unsuitable), create the isolated staging DNS record, and prepare the encrypted Google Drive backup bootstrap.

## In scope

- Rotate the exposed root credential outside this repository.
- Perform a read-only privilege check on the existing named, non-root SSH-key operator account before any account or SSH configuration change.
- Adopt that account and add the owner's new dedicated SSH key only if it has the required owner-controlled sudo path; otherwise create a separate account from provider/root console.
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
- Owner terminal evidence on 2026-08-14 shows an existing non-root account already accepts SSH public-key authentication. Direct account-creation commands were rejected because that session is not root; no account or authorization file was created by the failed attempt.
- The existing account is a member of `sudo`; its non-interactive sudo check requires interactive authentication, and a later owner-controlled interactive sudo session successfully reached root. The current root SSH connection rejects the available authentication method, which is expected to remain the case after hardening.
- The VPS is the owner-provided production target. Its address is intentionally not repeated here because it is already managed as infrastructure configuration, not repository data.
- `RISK-0002` remains a hard blocker until the root credential is rotated and key-only non-root SSH access is proved.

## Ordered execution and acceptance criteria

1. Owner rotates the root password in the provider panel or active root session and stores it only in a password manager.
2. Owner exits the failed editor without saving and performs the runbook's read-only privilege check on the existing SSH account.
3. The existing account's interactive sudo path is verified; the owner uses that controlled root session to rotate the exposed root password, set a new unique operator password, add the new public key, and prove a fresh key login in a second terminal.
4. Only after the fresh key login and sudo test succeed, the SSH hardening drop-in is validated and loaded.
4. Owner adds the `staging` Cloudflare record described in the runbook; DNS propagation is checked from an external resolver. The record alone must not be represented as an application deployment.
5. Codex performs an explicitly authorized, read-only SSH audit and records non-sensitive evidence.
6. With a dedicated Google Drive folder and owner-available OAuth consent, restic/rclone are configured on the audited server; a scheduled job, retention observation and staging restore rehearsal provide closure evidence for `RISK-0003`.

## Rollback / fallback

- Keep the original root console session open while testing `tahaops`; if new key login fails, remove the non-working SSH drop-in from that console and reload SSH only after `sshd -t` passes.
- Deleting only the new `staging` DNS record rolls back its DNS routing; it does not alter the production root or `www` records.
- A failed backup bootstrap must be disabled and secrets revoked/rotated; no backup configuration is accepted without a successful restore rehearsal.

## Verification to record

- Read-only privilege check for the existing account, a separate `ssh -i` login, `sshd -t`, and a post-reload key-only login.
- DNS resolution for `staging.tahamohamadi.ir` and Cloudflare proxy state.
- Read-only audit outputs summarized without secrets.
- Backup job status, restic snapshot/retention metadata, and staging restore evidence without credentials.
