import { useEffect, useState, type ReactElement } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  fetchContentList,
  isApiError,
  type ContentEntity,
  type ContentList,
  type ContentListParams,
  type ContentLocale,
  type ContentStatus,
} from "../lib/api";
import {
  CONTENT_ENTITIES,
  CONTENT_STATUSES,
  DEFAULT_CONTENT_ENTITY,
  contentEntityLabel,
  contentStatusMeta,
  isContentEntity,
  isContentLocale,
  isContentStatus,
} from "../lib/entities";
import { formatDateTime, formatNumber } from "../lib/format";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type LoadState = "loading" | "ready" | "error";

function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return 1;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

function setPageParam(params: URLSearchParams, page: number): void {
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
}

function renderTabs(activeEntity: ContentEntity | null): ReactElement {
  return (
    <nav aria-label="نوع محتوا" className="mb-4">
      <ul className="admin-tabs">
        {CONTENT_ENTITIES.map((item) => {
          const isActive = item.key === activeEntity;
          return (
            <li key={item.key}>
              <Link
                to={`/content/${item.key}`}
                className={`admin-tab${isActive ? " admin-tab-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.labelFa}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function ContentListPage(): ReactElement {
  const routeParams = useParams();
  const entityParam = routeParams.entity ?? null;
  const entity: ContentEntity | null =
    entityParam === null
      ? DEFAULT_CONTENT_ENTITY
      : isContentEntity(entityParam)
        ? entityParam
        : null;

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [state, setState] = useState<LoadState>("loading");
  const [list, setList] = useState<ContentList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const localeParam = searchParams.get("locale") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = parsePageParam(searchParams.get("page"));

  const locale: ContentLocale | "" = isContentLocale(localeParam)
    ? localeParam
    : "";
  const status: ContentStatus | "" = isContentStatus(statusParam)
    ? statusParam
    : "";

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    if (searchInput === q) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput === "") {
            next.delete("q");
          } else {
            next.set("q", searchInput);
          }
          setPageParam(next, 1);
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput, q, setSearchParams]);

  useEffect(() => {
    if (entity === null) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      try {
        const params: ContentListParams = { page, pageSize: PAGE_SIZE };
        if (locale !== "") {
          params.locale = locale;
        }
        if (status !== "") {
          params.status = status;
        }
        if (q !== "") {
          params.q = q;
        }
        const data = await fetchContentList(entity, params);
        if (!cancelled) {
          setList(data);
          setState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setState("error");
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [entity, locale, status, q, page, reloadKey]);

  function applyFilter(name: "locale" | "status", value: string): void {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "") {
          next.delete(name);
        } else {
          next.set(name, value);
        }
        setPageParam(next, 1);
        return next;
      },
      { replace: true }
    );
  }

  function goToPage(nextPage: number): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      setPageParam(next, nextPage);
      return next;
    });
  }

  if (entity === null) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-bold">مدیریت محتوا</h1>
        {renderTabs(null)}
        <div className="admin-card max-w-md" role="alert">
          <p className="mb-4 text-sm">نوع محتوا نامعتبر است.</p>
          <Link to="/content" className="admin-btn">
            نمایش فهرست محتوا
          </Link>
        </div>
      </div>
    );
  }

  const pageSize = list?.pageSize ?? PAGE_SIZE;
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const displayPage = Math.min(page, totalPages);
  const hasActiveFilters = q !== "" || locale !== "" || status !== "";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">مدیریت محتوا</h1>
        <Link
          to={`/content/${entity}/new`}
          className="admin-btn admin-btn-primary"
        >
          + ساخت
        </Link>
      </div>
      {renderTabs(entity)}

      <div className="admin-card mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label htmlFor="content-filter-locale" className="admin-label">
              زبان
            </label>
            <select
              id="content-filter-locale"
              className="admin-input"
              value={locale}
              onChange={(event) => applyFilter("locale", event.target.value)}
            >
              <option value="">همه</option>
              <option value="fa">فارسی</option>
              <option value="en">انگلیسی</option>
            </select>
          </div>
          <div className="w-44">
            <label htmlFor="content-filter-status" className="admin-label">
              وضعیت
            </label>
            <select
              id="content-filter-status"
              className="admin-input"
              value={status}
              onChange={(event) => applyFilter("status", event.target.value)}
            >
              <option value="">همه</option>
              {CONTENT_STATUSES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.labelFa}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-56 flex-1">
            <label htmlFor="content-filter-search" className="admin-label">
              جستجو
            </label>
            <input
              id="content-filter-search"
              type="search"
              className="admin-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جستجو در عنوان یا نامک"
            />
          </div>
        </div>
      </div>

      {state === "loading" && (
        <div className="admin-muted py-12 text-center" role="status">
          در حال بارگذاری…
        </div>
      )}

      {state === "error" && (
        <div className="admin-card max-w-md" role="alert">
          <p className="mb-4 text-sm">
            {toErrorMessage(
              error,
              "دریافت فهرست محتوا با خطا مواجه شد."
            )}
          </p>
          <button
            type="button"
            className="admin-btn"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {state === "ready" && (list === null || list.items.length === 0) && (
        <div className="admin-card admin-muted" role="status">
          {hasActiveFilters
            ? "نتیجه‌ای برای فیلترهای فعلی یافت نشد."
            : "هنوز محتوایی ثبت نشده است."}
        </div>
      )}

      {state === "ready" && list !== null && list.items.length > 0 && (
        <>
          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">
                فهرست محتوای {contentEntityLabel(entity)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">عنوان</th>
                  <th scope="col">نامک</th>
                  <th scope="col">زبان</th>
                  <th scope="col">وضعیت</th>
                  <th scope="col">آخرین به‌روزرسانی</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => {
                  const statusMeta = contentStatusMeta(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link
                          to={`/content/${entity}/${item.id}`}
                          className="admin-table-link"
                        >
                          {item.title === "" ? "بدون عنوان" : item.title}
                        </Link>
                      </td>
                      <td dir="ltr" className="admin-table-slug">
                        {item.slug}
                      </td>
                      <td>{item.locale === "fa" ? "فارسی" : "انگلیسی"}</td>
                      <td>
                        <span
                          className={`admin-status-badge ${statusMeta.className}`}
                        >
                          {statusMeta.labelFa}
                        </span>
                      </td>
                      <td>{formatDateTime(item.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="admin-muted text-sm" aria-live="polite">
              {formatNumber(total)} مورد — صفحه {formatNumber(displayPage)} از{" "}
              {formatNumber(totalPages)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-btn"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                قبلی
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                بعدی
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
