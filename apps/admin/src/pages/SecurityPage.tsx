import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  confirmMfa,
  disableMfa,
  fetchMfaStatus,
  isApiError,
  regenerateMfaCodes,
  type MfaStatus,
} from "../lib/api";

export default function SecurityPage(): ReactElement {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [token, setToken] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload(): Promise<void> {
    const next = await fetchMfaStatus();
    setStatus(next);
  }

  useEffect(() => {
    void reload().catch((loadError) => {
      setError(
        isApiError(loadError) ? loadError.message : "بارگذاری وضعیت MFA ناموفق بود."
      );
    });
  }, []);

  async function onConfirm(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await confirmMfa(token);
      setCodes(result.codes);
      setToken("");
      await reload();
    } catch (confirmError) {
      setError(
        isApiError(confirmError) ? confirmError.message : "تأیید کد ناموفق بود."
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRegenerate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await regenerateMfaCodes(token);
      setCodes(result.codes);
      setToken("");
      await reload();
    } catch (regenerateError) {
      setError(
        isApiError(regenerateError)
          ? regenerateError.message
          : "تولید دوبارهٔ کدها ناموفق بود."
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDisable(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await disableMfa(token);
      setCodes([]);
      setToken("");
      await reload();
    } catch (disableError) {
      setError(
        isApiError(disableError) ? disableError.message : "غیرفعال‌سازی ناموفق بود."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold">امنیت و تأیید دو مرحله‌ای</h1>
      <p className="admin-muted mb-4 text-sm">
        مسیر اصلی enrollment همین صفحه است (SPA). مسیر HTML واگتِیل فقط rollback
        موقت است. کدهای بازیابی فقط یک‌بار نمایش داده می‌شوند.
      </p>
      {error !== null && (
        <div className="admin-banner-error mb-3" role="alert">
          {error}
        </div>
      )}
      {status === null ? (
        <p className="admin-muted">در حال بارگذاری…</p>
      ) : status.enrolled ? (
        <>
          <p className="mb-3">
            تأیید دو مرحله‌ای فعال است. کدهای استفاده‌نشده:{" "}
            {status.unusedRecoveryCodes}
          </p>
          <form className="space-y-3" onSubmit={(event) => void onRegenerate(event)}>
            <label className="admin-form-row">
              <span className="admin-label">کد فعلی یا بازیابی</span>
              <input
                className="admin-input"
                dir="ltr"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="one-time-code"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="admin-btn admin-btn-primary" disabled={busy} type="submit">
                تولید دوبارهٔ کدهای بازیابی
              </button>
              <button
                className="admin-btn"
                type="button"
                disabled={busy}
                onClick={(event) => void onDisable(event)}
              >
                غیرفعال‌سازی
              </button>
            </div>
          </form>
        </>
      ) : (
        <form className="space-y-3" onSubmit={(event) => void onConfirm(event)}>
          {status.manualSecret ? (
            <p className="admin-muted text-sm" dir="ltr">
              Secret: {status.manualSecret}
            </p>
          ) : null}
          {status.configUrl ? (
            <p className="break-all text-sm" dir="ltr">
              {status.configUrl}
            </p>
          ) : null}
          <label className="admin-form-row">
            <span className="admin-label">کد احراز هویت</span>
            <input
              className="admin-input"
              dir="ltr"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="one-time-code"
            />
          </label>
          <button className="admin-btn admin-btn-primary" disabled={busy} type="submit">
            فعال‌سازی
          </button>
        </form>
      )}
      {codes.length > 0 && (
        <div className="mt-4 rounded border border-[var(--admin-border)] p-3">
          <p className="mb-2 font-medium">کدهای بازیابی — فقط همین یک‌بار</p>
          <ul className="space-y-1 font-mono text-sm" dir="ltr">
            {codes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
