import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchContentDetail,
  isApiError,
  type ContentDetail,
  type ContentFieldValue,
} from "../lib/api";
import {
  contentEntityLabel,
  contentStatusMeta,
  isContentEntity,
} from "../lib/entities";
import { formatDateTime } from "../lib/format";

type LoadState = "loading" | "ready" | "error" | "not-found" | "invalid";

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

function isLongValue(text: string): boolean {
  return text.length > 120 || text.includes("\n");
}

function renderFieldValue(value: ContentFieldValue): ReactNode {
  if (value === null || value === "") {
    return "—";
  }
  const text = typeof value === "number" ? String(value) : value;
  if (isLongValue(text)) {
    return <div className="admin-field-long">{text}</div>;
  }
  return text;
}

export default function ContentDetailPage(): ReactElement {
  const routeParams = useParams();
  const entityParam = routeParams.entity ?? "";
  const idParam = routeParams.id ?? "";
  const id = Number.parseInt(idParam, 10);
  const entity = isContentEntity(entityParam) ? entityParam : null;
  const idIsValid =
    /^\d+$/.test(idParam) && Number.isFinite(id) && id >= 1;

  const [state, setState] = useState<LoadState>("loading");
  const [detail, setDetail] = useState<ContentDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (entity === null || !idIsValid) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      try {
        const data = await fetchContentDetail(entity, id);
        if (!cancelled) {
          setDetail(data);
          setState("ready");
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (isApiError(err) && err.status === 404) {
          setState("not-found");
        } else {
          setError(err);
          setState("error");
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [entity, id, idIsValid, reloadKey]);

  const listUrl = entity === null ? "/content" : `/content/${entity}`;

  if (entity === null || !idIsValid) {
    return (
      <div className="admin-card max-w-md" role="alert">
        <p className="mb-4 text-sm">نوع محتوا یا شناسه نامعتبر است.</p>
        <Link to={listUrl} className="admin-btn">
          به فهرست
        </Link>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="admin-card max-w-md" role="alert">
        <h1 className="mb-1 text-lg font-bold">یافت نشد</h1>
        <p className="admin-muted mb-4 text-sm">
          این محتوا وجود ندارد یا حذف شده است.
        </p>
        <Link to={listUrl} className="admin-btn">
          به فهرست
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="admin-card max-w-md" role="alert">
        <p className="mb-4 text-sm">
          {toErrorMessage(
            error,
            "دریافت اطلاعات محتوا با خطا مواجه شد."
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            تلاش مجدد
          </button>
          <Link to={listUrl} className="admin-btn">
            به فهرست
          </Link>
        </div>
      </div>
    );
  }

  if (state !== "ready" || detail === null) {
    return (
      <div className="admin-muted py-12 text-center" role="status">
        در حال بارگذاری…
      </div>
    );
  }

  const statusMeta = contentStatusMeta(detail.status);
  const localeLabel =
    detail.locale === "fa"
      ? "فارسی"
      : detail.locale === "en"
        ? "انگلیسی"
        : detail.locale;
  const fieldEntries = Object.entries(detail.fields);

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link to={listUrl} className="admin-btn">
          به فهرست
        </Link>
      </div>

      <div className="admin-card">
        <p className="admin-muted mb-1 text-sm">
          {contentEntityLabel(entity)}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-bold" dir="auto">
            {detail.title === "" ? "بدون عنوان" : detail.title}
          </h1>
          <span className={`admin-status-badge ${statusMeta.className}`}>
            {statusMeta.labelFa}
          </span>
        </div>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="admin-muted">زبان:</dt>
            <dd>{localeLabel}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="admin-muted">نامک:</dt>
            <dd dir="ltr">
              {detail.slug === "" ? "—" : detail.slug}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="admin-muted">تاریخ انتشار:</dt>
            <dd>{formatDateTime(detail.publishedAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="admin-muted">آخرین به‌روزرسانی:</dt>
            <dd>{formatDateTime(detail.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="admin-card mt-4">
        <h2 className="mb-2 text-base font-bold">فیلدها</h2>
        {fieldEntries.length === 0 ? (
          <p className="admin-muted text-sm">فیلدی برای نمایش نیست.</p>
        ) : (
          <dl className="admin-fields">
            {fieldEntries.map(([key, value]) => (
              <div key={key} className="admin-field-row">
                <dt dir="ltr" className="admin-field-key">
                  {key}
                </dt>
                <dd dir="ltr" className="admin-field-value">
                  {renderFieldValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
