import { useEffect, useRef, useState, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchCompositionPages,
  isApiError,
  type ContentLocale,
  type ContentStatus,
} from "../lib/api";
import { formatDateTime, formatNumber } from "../lib/format";

type LocaleFilter = ContentLocale | "";
type StatusFilter = ContentStatus | "";

export default function CompositionListPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<
    Awaited<ReturnType<typeof fetchCompositionPages>>["items"]
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [locale, setLocale] = useState<LocaleFilter>(
    (searchParams.get("locale") as LocaleFilter) ?? ""
  );
  const [status, setStatus] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) ?? ""
  );
  const [debouncedQ, setDebouncedQ] = useState(q);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQ(q);
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [q]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ !== "") params.set("q", debouncedQ);
    if (locale !== "") params.set("locale", locale);
    if (status !== "") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedQ, locale, status, page, setSearchParams]);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompositionPages({
        q: debouncedQ,
        locale,
        status,
        page,
        pageSize: 20,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, locale, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">صفحات (Composition)</h1>
          <p className="admin-muted text-sm">بخش‌ها و بلوک‌های هر صفحه را بسازید.</p>
        </div>
        <Link to="/composition/new" className="admin-btn admin-btn-primary">
          + ساخت صفحه
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="admin-input w-56"
          placeholder="جستجو (key یا عنوان)…"
          dir="ltr"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          aria-label="جستجو"
        />
        <select
          className="admin-input w-36"
          value={locale}
          onChange={(event) => {
            setPage(1);
            setLocale(event.target.value as LocaleFilter);
          }}
          aria-label="زبان"
        >
          <option value="">همه زبان‌ها</option>
          <option value="fa">فارسی</option>
          <option value="en">English</option>
        </select>
        <select
          className="admin-input w-36"
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as StatusFilter);
          }}
          aria-label="وضعیت"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="draft">پیش‌نویس</option>
          <option value="review">در بازبینی</option>
          <option value="published">منتشرشده</option>
          <option value="archived">بایگانی</option>
        </select>
      </div>

      <p className="admin-muted mt-2 text-xs" aria-live="polite">
        {loading ? "در حال بارگذاری…" : `${formatNumber(total)} صفحه`}
      </p>

      {isApiError(error) && (
        <div
          role="alert"
          className="mt-3 rounded border px-3 py-2 text-sm"
          style={{ color: "var(--admin-danger)" }}
        >
          {error.message}
          <button type="button" className="admin-btn ml-2 text-xs" onClick={() => void load()}>
            تلاش مجدد
          </button>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mt-6 text-center text-sm admin-muted">
          صفحه‌ای یافت نشد.
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>key</th>
              <th>زبان</th>
              <th>وضعیت</th>
              <th>به‌روزرسانی</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link className="admin-table-link" to={`/composition/${item.id}/edit`}>
                    {item.title}
                  </Link>
                </td>
                <td dir="ltr" className="admin-muted text-xs">{item.key}</td>
                <td>{item.locale === "fa" ? "فارسی" : "English"}</td>
                <td>
                  <span className={`admin-status-badge admin-status-${item.status}`}>
                    {item.status === "draft" && "پیش‌نویس"}
                    {item.status === "review" && "در بازبینی"}
                    {item.status === "published" && "منتشرشده"}
                    {item.status === "archived" && "بایگانی"}
                  </span>
                </td>
                <td className="admin-muted text-xs">{formatDateTime(item.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="admin-btn"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          قبلی
        </button>
        <span className="text-xs admin-muted" aria-live="polite">
          صفحه {formatNumber(page)} از {formatNumber(totalPages)}
        </span>
        <button
          type="button"
          className="admin-btn"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
