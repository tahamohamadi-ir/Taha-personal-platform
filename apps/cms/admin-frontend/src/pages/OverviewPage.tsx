import { useCallback, useEffect, useState, type ReactElement } from "react";
import {
  fetchContentHealth,
  fetchTranslationQueue,
  isApiError,
  type ContentHealth,
  type TranslationQueue,
} from "../lib/api";
import {
  contentEntityLabel,
  isContentEntity,
} from "../lib/entities";
import { formatNumber } from "../lib/format";

type LoadState = "loading" | "ready" | "error";

const HEALTH_CARDS: Array<{ key: keyof ContentHealth; label: string }> = [
  { key: "published", label: "منتشرشده" },
  { key: "drafts", label: "پیش‌نویس‌ها" },
  { key: "review", label: "در بازبینی" },
  { key: "archived", label: "بایگانی" },
  { key: "incompleteTranslations", label: "ترجمه‌های ناقص" },
  { key: "missingAltMedia", label: "رسانه بدون متن جایگزین" },
  { key: "orphanMedia", label: "رسانه یتیم" },
];

interface TranslationStatusMeta {
  labelFa: string;
  className: string;
}

function translationStatusMeta(status: string): TranslationStatusMeta {
  switch (status) {
    case "complete":
      return { labelFa: "کامل", className: "admin-status-complete" };
    case "incomplete":
      return { labelFa: "ناقص", className: "admin-status-incomplete" };
    case "missing":
      return { labelFa: "در دسترس نیست", className: "admin-status-missing" };
    case "partial":
      return { labelFa: "جزئی", className: "admin-status-partial" };
    default:
      return { labelFa: status, className: "admin-status-unknown" };
  }
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

export default function OverviewPage(): ReactElement {
  const [state, setState] = useState<LoadState>("loading");
  const [health, setHealth] = useState<ContentHealth | null>(null);
  const [queue, setQueue] = useState<TranslationQueue | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (): Promise<void> => {
    setState("loading");
    setError(null);
    try {
      const [healthData, queueData] = await Promise.all([
        fetchContentHealth(),
        fetchTranslationQueue(),
      ]);
      setHealth(healthData);
      setQueue(queueData);
      setState("ready");
    } catch (err) {
      setError(err);
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "loading") {
    return (
      <div className="admin-muted py-12 text-center" role="status">
        در حال بارگذاری…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="admin-card max-w-md" role="alert">
        <p className="mb-4 text-sm">
          {toErrorMessage(error, "دریافت اطلاعات نظارت با خطا مواجه شد.")}
        </p>
        <button type="button" className="admin-btn" onClick={() => void load()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">بهداشت و ترجمه</h1>
      <p className="admin-muted mb-6 text-sm">صف ترجمه و سلامت محتوا</p>

      <h2 className="mb-3 text-base font-bold">بهداشت محتوا</h2>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {HEALTH_CARDS.map((card) => (
          <div key={card.key} className="admin-card">
            <div className="admin-muted text-xs">{card.label}</div>
            <div className="admin-stat-value">
              {formatNumber(health?.[card.key] ?? 0)}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-base font-bold">صف ترجمه</h2>
      {queue === null || queue.items.length === 0 ? (
        <div className="admin-card admin-muted" role="status">
          صف ترجمه خالی است.
        </div>
      ) : (
        <>
          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">صف ترجمه</caption>
              <thead>
                <tr>
                  <th scope="col">نوع محتوا</th>
                  <th scope="col">نامک</th>
                  <th scope="col">فارسی</th>
                  <th scope="col">انگلیسی</th>
                  <th scope="col">وضعیت کلی</th>
                </tr>
              </thead>
              <tbody>
                {queue.items.map((item, index) => {
                  const entityLabel = isContentEntity(item.entity)
                    ? contentEntityLabel(item.entity)
                    : item.entity;
                  const faMeta = translationStatusMeta(item.fa.status);
                  const enMeta = translationStatusMeta(item.en.status);
                  const groupMeta = translationStatusMeta(item.status);
                  return (
                    <tr key={`${item.entity}-${item.slug}-${index}`}>
                      <td>{entityLabel}</td>
                      <td dir="ltr" className="admin-table-slug">
                        {item.slug}
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${faMeta.className}`}
                        >
                          {faMeta.labelFa}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${enMeta.className}`}
                        >
                          {enMeta.labelFa}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${groupMeta.className}`}
                        >
                          {groupMeta.labelFa}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {queue.truncated && (
            <p className="admin-muted mt-3 text-sm" aria-live="polite">
              فهرست به‌صورت محدود نمایش داده شده است.
            </p>
          )}
        </>
      )}
    </div>
  );
}