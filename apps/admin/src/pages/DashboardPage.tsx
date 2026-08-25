import { useCallback, useEffect, useState, type ReactElement } from "react";
import { fetchDashboardSummary, type DashboardSummary } from "../lib/api";

const CONTENT_COUNT_LABELS: Array<{
  key: keyof DashboardSummary["contentCounts"];
  label: string;
}> = [
  { key: "landing", label: "لندینگ" },
  { key: "profile", label: "پروفایل" },
  { key: "article", label: "مقاله" },
  { key: "researchTopic", label: "موضوع پژوهشی" },
  { key: "researchStatement", label: "بیانیه پژوهشی" },
  { key: "project", label: "پروژه" },
  { key: "publication", label: "انتشارات" },
];

type LoadState = "loading" | "ready" | "error";

export default function DashboardPage(): ReactElement {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "loading") {
    return <div className="admin-muted py-12 text-center">در حال بارگذاری…</div>;
  }

  if (state === "error") {
    return (
      <div className="admin-card max-w-md">
        <p className="mb-4 text-sm">دریافت اطلاعات با خطا مواجه شد.</p>
        <button type="button" className="admin-btn" onClick={() => void load()}>
          تلاش دوباره
        </button>
      </div>
    );
  }

  const totalContent = CONTENT_COUNT_LABELS.reduce(
    (total, item) => total + (summary?.contentCounts[item.key] ?? 0),
    0
  );
  const isEmpty =
    totalContent === 0 && (summary?.drafts ?? 0) === 0 && (summary?.published ?? 0) === 0;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">داشبورد</h1>
      <p className="admin-muted mb-6 text-sm">نمای کلی از محتوای سایت</p>

      {isEmpty ? (
        <div className="admin-card admin-muted">هنوز محتوایی ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {CONTENT_COUNT_LABELS.map((item) => (
            <div key={item.key} className="admin-card">
              <div className="admin-muted text-xs">{item.label}</div>
              <div className="admin-stat-value">
                {summary?.contentCounts[item.key] ?? 0}
              </div>
            </div>
          ))}
          <div className="admin-card">
            <div className="admin-muted text-xs">پیش‌نویس‌ها</div>
            <div className="admin-stat-value">{summary?.drafts ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-muted text-xs">منتشرشده</div>
            <div className="admin-stat-value">{summary?.published ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
