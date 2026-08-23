# Publish → Rebuild chain proof (board C1)

**Status:** READY — joint (owner + agent), production
**Goal:** Prove end-to-end that publishing content in the admin triggers the
public web rebuild with **zero SSH**, and record real timestamps as evidence.
**Preconditions (already verified in repo):**
`REBUILD_TRIGGER_ENABLED=true` on VPS (`DEFER-0027` CLOSED / LOG-0207);
HMAC hook `invoke_static_rebuild()` fires on `published`
(`apps/api/admin_content.py`); `rebuild-web.sh` is the post-cutover path
(LOG-0173 / LOG-0216).

---

## Steps

1. **Before publish — record baseline**
   - `curl -s https://tahamohamadi.ir/en/cv/ | grep cms-build-origin`
     → note existing value and time.
   - Owner: open `/admin/`, pick an existing **draft** article (or create a
     throwaway titled `rebuild-chain-check-<date>`; do not invent new public
     routes beyond one article row).
2. **Publish via admin UI only** — set Status = Published, Published at = now.
   Record `T_publish = <UTC hh:mm:ss>`.
3. **Watch for rebuild without SSH**
   - GitHub Actions run list: no manual dispatch used.
   - Within ~2–5 min: `curl -s .../en/writing/ | grep <article slug>` → 200 hit,
     or check `/{locale}/writing/` listing. Record `T_live = <UTC>`.
   - Agent/owner runs:
     `bash infra/deploy/smoke.sh https://tahamohamadi.ir --expect-cms-origin`
     → all PASS lines include `cms-build-origin=cms`.
4. **Revert honestly**
   - Owner unpublishes/archives the test article via admin UI (Status back to
     draft or archived). Record `T_revert`.
   - Confirm the article disappears from `/writing/` after the triggered
     rebuild (or next scheduled rebuild); record `T_gone`.
5. **Record evidence**
   - Paste T_publish / T_live / T_revert / T_gone + smoke output into a new
     `WORK_LOG` entry (allocate LOG ID per docs/README.md §4 first).
   - Tick board item C1 with that LOG ID.

## Pass criteria

- Zero SSH commands in the whole chain (owner uses browser UI only;
  agent/probe uses read-only HTTPS GETs).
- `T_live − T_publish ≤ ~10 minutes`.
- Smoke with `--expect-cms-origin` fully green.
- Test content removed afterwards; public site returns to prior state.

## Rollback

No schema or infra change involved. If the rebuild does not fire: leave content
unpublished and file the failure in WORK_LOG + known-issues; investigate HMAC
trigger logs at the next attended window.
