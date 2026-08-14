# Server access hardening runbook

**Status:** Owner-executed bootstrap; Codex must not connect until steps 1–5 succeed.  
**Applies to:** Production VPS access in P0-A  
**Related:** `docs/plan/P0-A-server-access-dns-backup-task-spec.md`, `RISK-0002`

## Security boundary

The operating account is `tahaops`. It belongs to the owner, not to an agent; it exists so work is attributable and key-based rather than dependent on root/password access. Do not send the private key, a password or any token through chat, Git, GitHub issues, CI logs or this document.

Keep the existing root console connected until a new, separate terminal has proved the `tahaops` SSH-key login. Do not run the SSH-lockdown step before that proof.

## 1. Rotate the exposed root credential

From the VPS provider panel or the existing root console, set a new unique root password and place it in the owner's password manager. Do not paste it here or into a terminal command.

## 2. Create the operator key on Windows

Run this in **your local PowerShell**, once. It creates the private key locally and prints only the public key that you will paste in the next step.

```powershell
$opsKey = Join-Path $env:USERPROFILE '.ssh\taha-platform-ops'
ssh-keygen -t ed25519 -a 64 -f $opsKey -C 'taha-platform-ops-2026'
Get-Content "$opsKey.pub"
```

Choose a strong passphrase when prompted. The private file without `.pub` must remain only on your laptop (and, if desired, your encrypted password-manager attachment).

## 3. Create the named non-root account on the VPS

In the still-open **root** server console, run the following. At the editor step, paste exactly the one-line public key printed by the previous command; never paste the private key.

```bash
adduser tahaops
usermod -aG sudo tahaops
install -d -m 700 -o tahaops -g tahaops /home/tahaops/.ssh
nano /home/tahaops/.ssh/authorized_keys
chown tahaops:tahaops /home/tahaops/.ssh/authorized_keys
chmod 600 /home/tahaops/.ssh/authorized_keys
sudo -l -U tahaops
```

The `adduser` password is only a temporary local-account setup detail; it is not an SSH credential after step 5. Do not record it.

## 4. Prove key login before locking SSH down

Open a **new** local PowerShell window. Replace `<SERVER_IP>` with the VPS address, then run:

```powershell
$opsKey = Join-Path $env:USERPROFILE '.ssh\taha-platform-ops'
ssh -i $opsKey -o IdentitiesOnly=yes tahaops@<SERVER_IP>
```

After login, run these commands; the results must be `root` and then `tahaops`, respectively. Leave the original root console open.

```bash
sudo -v
sudo -n whoami
whoami
```

## 5. Disable root and password SSH login

Only after step 4 succeeds, return to the root console and create this file with `nano /etc/ssh/sshd_config.d/99-taha-platform.conf`:

```text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers tahaops
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
```

Then validate and reload without closing either terminal:

```bash
sshd -t
systemctl reload ssh
```

Repeat the step-4 connection from the second terminal. A password or root SSH attempt must now be rejected; the key-only `tahaops` login must work. Only then may the root session be closed.

## 6. What to send back

Reply with only these non-sensitive facts:

- root credential rotated: yes/no;
- key-based `tahaops` login: yes/no;
- `sudo -l` succeeded: yes/no;
- `sshd -t` and post-reload login: yes/no;
- explicit authorization for a read-only SSH audit: yes/no.

Do not send passwords, keys, host fingerprints, OAuth codes or full configuration output.

## Cloudflare staging record

In Cloudflare DNS, create exactly one new record:

| Field | Value |
|---|---|
| Type | `A` |
| Name | `staging` |
| Content | the same current VPS address as the production root `A` record |
| Proxy status | Proxied (orange cloud) |
| TTL | Auto |

This does not change the existing root `A` or `www` CNAME. Current Cloudflare mode is observed as **Full**; change it to **Full (strict)** only after the future Caddy origin certificate has been installed and verified. Do not switch to strict first, because that can make the current origin unavailable.

## Backup handoff

Before the audit, create a dedicated Google Drive folder named `taha-personal-platform-backups` under the owner's account. Do not share its OAuth code or credentials. After secure server access is audited, the owner will complete interactive OAuth consent locally and the implementation will configure encrypted restic/rclone, scheduled retention and a staging restore rehearsal according to `docs/governance/BACKUP_POLICY.md`.
