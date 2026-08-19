import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  createFeatured,
  deleteFeatured,
  fetchFeatured,
  isApiError,
  isConflict,
  updateFeatured,
  type ContentLocale,
  type FeaturedItem,
  type FeaturedList,
  type FeaturedListParams,
  type FeaturedPayload,
} from "../lib/api";
import {
  CONTENT_ENTITIES,
  contentEntityLabel,
  isContentEntity,
  isContentLocale,
} from "../lib/entities";
import { formatDateTime, formatNumber } from "../lib/format";

const PAGE_SIZE = 20;

type LoadState = "loading" | "ready" | "error";

interface FeaturedDraft {
  title: string;
  targetEntity: string;
  targetSlug: string;
  locale: ContentLocale;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

const EMPTY_DRAFT: FeaturedDraft = {
  title: "",
  targetEntity: "article",
  targetSlug: "",
  locale: "fa",
  startAt: "",
  endAt: "",
  isActive: true,
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDatetimeLocal(value: string | null): string {
  if (value === null || value === "") {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  if (value === "") {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

function draftFromItem(item: FeaturedItem): FeaturedDraft {
  return {
    title: item.title,
    targetEntity: item.targetEntity,
    targetSlug: item.targetSlug,
    locale: item.locale,
    startAt: toDatetimeLocal(item.startAt),
    endAt: toDatetimeLocal(item.endAt),
    isActive: item.isActive,
  };
}

function validateDraft(draft: FeaturedDraft): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (draft.title.trim() === "") {
    errors.title = ["عنوان الزامی است."];
  }
  if (draft.targetSlug.trim() === "") {
    errors.targetSlug = ["نامک مقصد الزامی است."];
  }
  if (draft.startAt === "") {
    errors.startAt = ["زمان شروع الزامی است."];
  }
  if (draft.startAt !== "" && draft.endAt !== "" && draft.endAt < draft.startAt) {
    errors.endAt = ["زمان پایان نمی‌تواند قبل از شروع باشد."];
  }
  return errors;
}

function draftToPayload(draft: FeaturedDraft): FeaturedPayload {
  return {
    title: draft.title,
    targetEntity: draft.targetEntity,
    targetSlug: draft.targetSlug,
    locale: draft.locale,
    startAt: fromDatetimeLocal(draft.startAt),
    endAt: draft.endAt === "" ? null : fromDatetimeLocal(draft.endAt),
    isActive: draft.isActive,
  };
}

function entityLabel(entity: string): string {
  return isContentEntity(entity) ? contentEntityLabel(entity) : entity;
}

function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return 1;
}

function setPageParam(params: URLSearchParams, page: number): void {
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

interface FieldErrorListProps {
  messages: string[];
  id?: string;
}

function FieldErrorList({
  messages,
  id,
}: FieldErrorListProps): ReactElement | null {
  if (messages.length === 0) {
    return null;
  }
  return (
    <ul id={id} className="admin-field-error" aria-live="polite">
      {messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
}

interface DraftFieldsProps {
  draft: FeaturedDraft;
  disabled: boolean;
  fieldErrors: Record<string, string[]>;
  prefix: string;
  onChange: (patch: Partial<FeaturedDraft>) => void;
}

function DraftFields({
  draft,
  disabled,
  fieldErrors,
  prefix,
  onChange,
}: DraftFieldsProps): ReactElement {
  function errorInfo(key: string): { messages: string[]; id: string | undefined } {
    const messages = fieldErrors[key] ?? [];
    return {
      messages,
      id: messages.length > 0 ? `${prefix}-${key}-error` : undefined,
    };
  }
  const titleErr = errorInfo("title");
  const entityErr = errorInfo("targetEntity");
  const slugErr = errorInfo("targetSlug");
  const localeErr = errorInfo("locale");
  const startErr = errorInfo("startAt");
  const endErr = errorInfo("endAt");
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
      <div className="md:col-span-2">
        <label htmlFor={`${prefix}-title`} className="admin-label">
          عنوان
        </label>
        <input
          id={`${prefix}-title`}
          type="text"
          className="admin-input"
          value={draft.title}
          disabled={disabled}
          onChange={(event) => onChange({ title: event.target.value })}
          aria-invalid={titleErr.id !== undefined}
          aria-describedby={titleErr.id}
        />
        <FieldErrorList {...titleErr} />
      </div>
      <div>
        <label htmlFor={`${prefix}-entity`} className="admin-label">
          نوع محتوا
        </label>
        <select
          id={`${prefix}-entity`}
          className="admin-input"
          value={draft.targetEntity}
          disabled={disabled}
          onChange={(event) => onChange({ targetEntity: event.target.value })}
          aria-invalid={entityErr.id !== undefined}
          aria-describedby={entityErr.id}
        >
          {CONTENT_ENTITIES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.labelFa}
            </option>
          ))}
        </select>
        <FieldErrorList {...entityErr} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`${prefix}-slug`} className="admin-label">
          نامک مقصد
        </label>
        <input
          id={`${prefix}-slug`}
          type="text"
          dir="ltr"
          className="admin-input"
          value={draft.targetSlug}
          disabled={disabled}
          onChange={(event) => onChange({ targetSlug: event.target.value })}
          aria-invalid={slugErr.id !== undefined}
          aria-describedby={slugErr.id}
        />
        <FieldErrorList {...slugErr} />
      </div>
      <div>
        <label htmlFor={`${prefix}-locale`} className="admin-label">
          زبان
        </label>
        <select
          id={`${prefix}-locale`}
          className="admin-input"
          value={draft.locale}
          disabled={disabled}
          onChange={(event) => {
            if (isContentLocale(event.target.value)) {
              onChange({ locale: event.target.value });
            }
          }}
          aria-invalid={localeErr.id !== undefined}
          aria-describedby={localeErr.id}
        >
          <option value="fa">فارسی</option>
          <option value="en">انگلیسی</option>
        </select>
        <FieldErrorList {...localeErr} />
      </div>
      <div>
        <label htmlFor={`${prefix}-start`} className="admin-label">
          شروع
        </label>
        <input
          id={`${prefix}-start`}
          type="datetime-local"
          className="admin-input"
          value={draft.startAt}
          disabled={disabled}
          onChange={(event) => onChange({ startAt: event.target.value })}
          aria-invalid={startErr.id !== undefined}
          aria-describedby={startErr.id}
        />
        <FieldErrorList {...startErr} />
      </div>
      <div>
        <label htmlFor={`${prefix}-end`} className="admin-label">
          پایان (اختیاری)
        </label>
        <input
          id={`${prefix}-end`}
          type="datetime-local"
          className="admin-input"
          value={draft.endAt}
          disabled={disabled}
          onChange={(event) => onChange({ endAt: event.target.value })}
          aria-invalid={endErr.id !== undefined}
          aria-describedby={endErr.id}
        />
        <FieldErrorList {...endErr} />
      </div>
      <div className="flex items-end">
        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            checked={draft.isActive}
            disabled={disabled}
            onChange={(event) => onChange({ isActive: event.target.checked })}
          />
          فعال
        </label>
      </div>
    </div>
  );
}

export default function FeaturedPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<LoadState>("loading");
  const [list, setList] = useState<FeaturedList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeParam = searchParams.get("active") ?? "";
  const active: "" | "true" | "false" =
    activeParam === "true" || activeParam === "false" ? activeParam : "";
  const current = searchParams.get("current") === "true";
  const page = parsePageParam(searchParams.get("page"));

  const [createDraft, setCreateDraft] = useState<FeaturedDraft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<
    Record<string, string[]>
  >({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<FeaturedDraft | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<
    Record<string, string[]>
  >({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editConflict, setEditConflict] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      try {
        const params: FeaturedListParams = { page, pageSize: PAGE_SIZE };
        if (active !== "") {
          params.active = active;
        }
        if (current) {
          params.current = "true";
        }
        const data = await fetchFeatured(params);
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
  }, [active, current, page, reloadKey]);

  function applyFilter(name: "active" | "current", value: string): void {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (name === "current") {
          if (value === "true") {
            next.set("current", "true");
          } else {
            next.delete("current");
          }
        } else if (value === "") {
          next.delete("active");
        } else {
          next.set("active", value);
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

  function updateCreateDraft(patch: Partial<FeaturedDraft>): void {
    setCreateDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (creating) {
      return;
    }
    const validation = validateDraft(createDraft);
    setCreateError(null);
    setCreateFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }
    setCreating(true);
    try {
      await createFeatured(draftToPayload(createDraft));
      setCreateDraft(EMPTY_DRAFT);
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isApiError(err)) {
        if (err.fields !== undefined) {
          setCreateFieldErrors(err.fields);
        } else {
          setCreateError(err);
        }
      } else {
        setCreateError(err);
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: FeaturedItem): void {
    setEditingId(item.id);
    setEditDraft(draftFromItem(item));
    setEditConflict(false);
    setActionError(null);
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditDraft(null);
    setEditConflict(false);
  }

  function updateEditDraft(patch: Partial<FeaturedDraft>): void {
    setEditDraft((prev) => (prev === null ? prev : { ...prev, ...patch }));
  }

  async function saveEdit(item: FeaturedItem): Promise<void> {
    if (editDraft === null || savingId !== null) {
      return;
    }
    const validation = validateDraft(editDraft);
    setActionError(null);
    setEditConflict(false);
    if (Object.keys(validation).length > 0) {
      setEditFieldErrors(validation);
      return;
    }
    setEditFieldErrors({});
    setSavingId(item.id);
    try {
      await updateFeatured(item.id, draftToPayload(editDraft), item.updatedAt);
      cancelEdit();
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isApiError(err) && isConflict(err)) {
        setEditConflict(true);
        setActionError(err);
      } else {
        setActionError(err);
      }
    } finally {
      setSavingId(null);
    }
  }

  function reloadAfterConflict(): void {
    cancelEdit();
    setReloadKey((key) => key + 1);
  }

  async function handleDelete(item: FeaturedItem): Promise<void> {
    if (!window.confirm(`برگزیده «${item.title}» حذف شود؟`)) {
      return;
    }
    setSavingId(item.id);
    setActionError(null);
    try {
      await deleteFeatured(item.id);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err);
    } finally {
      setSavingId(null);
    }
  }

  const pageSize = list?.pageSize ?? PAGE_SIZE;
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const displayPage = Math.min(page, totalPages);
  const hasActiveFilters = active !== "" || current;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">برگزیده‌ها</h1>
          <p className="admin-muted text-sm">
            نمایش برجسته محتوا در صفحه اصلی با بازه زمانی
          </p>
        </div>
      </div>

      <form
        className="admin-card mb-4"
        onSubmit={(event) => void handleCreate(event)}
      >
        <h2 className="mb-3 text-base font-bold">+ افزودن برگزیده</h2>
        <DraftFields
          draft={createDraft}
          disabled={creating}
          fieldErrors={createFieldErrors}
          prefix="featured-create"
          onChange={updateCreateDraft}
        />
        <div className="mt-4">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={creating}
          >
            {creating ? "در حال ثبت…" : "افزودن"}
          </button>
        </div>
      </form>

      {createError !== null && (
        <div className="admin-banner-error mb-4" role="alert" aria-live="polite">
          <p>{toErrorMessage(createError, "ثبت برگزیده ناموفق بود.")}</p>
        </div>
      )}

      {actionError !== null && (
        <div className="admin-banner-error mb-4" role="alert" aria-live="polite">
          <p>{toErrorMessage(actionError, "عملیات روی برگزیده ناموفق بود.")}</p>
          {editConflict && (
            <div className="mt-2 flex gap-2">
              <button type="button" className="admin-btn" onClick={reloadAfterConflict}>
                بارگذاری نسخه جدید
              </button>
              <button type="button" className="admin-btn" onClick={cancelEdit}>
                لغو
              </button>
            </div>
          )}
        </div>
      )}

      <div className="admin-card mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label htmlFor="featured-filter-active" className="admin-label">
              وضعیت
            </label>
            <select
              id="featured-filter-active"
              className="admin-input"
              value={active}
              onChange={(event) => applyFilter("active", event.target.value)}
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={current}
                onChange={(event) =>
                  applyFilter("current", event.target.checked ? "true" : "")
                }
              />
              فقط جاری
            </label>
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
              "دریافت فهرست برگزیده‌ها با خطا مواجه شد."
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
            : "هنوز برگزیده‌ای ثبت نشده است."}
        </div>
      )}

      {state === "ready" && list !== null && list.items.length > 0 && (
        <>
          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">فهرست برگزیده‌ها</caption>
              <thead>
                <tr>
                  <th scope="col">عنوان</th>
                  <th scope="col">نوع</th>
                  <th scope="col">نامک مقصد</th>
                  <th scope="col">زبان</th>
                  <th scope="col">شروع</th>
                  <th scope="col">پایان</th>
                  <th scope="col">وضعیت</th>
                  <th scope="col">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => {
                  const isEditing = editingId === item.id;
                  const isSaving = savingId === item.id;
                  return (
                    <tr key={item.id}>
                      {isEditing && editDraft !== null ? (
                        <td colSpan={8}>
                          <DraftFields
                            draft={editDraft}
                            disabled={isSaving}
                            fieldErrors={editFieldErrors}
                            prefix={`featured-edit-${item.id}`}
                            onChange={updateEditDraft}
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="admin-btn admin-btn-primary"
                              disabled={isSaving || creating}
                              onClick={() => void saveEdit(item)}
                            >
                              {isSaving ? "در حال ذخیره…" : "ذخیره"}
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary"
                              disabled={isSaving}
                              onClick={cancelEdit}
                            >
                              لغو
                            </button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td>{item.title}</td>
                          <td>{entityLabel(item.targetEntity)}</td>
                          <td dir="ltr" className="admin-table-slug">
                            {item.targetSlug}
                          </td>
                          <td>{item.locale === "fa" ? "فارسی" : "انگلیسی"}</td>
                          <td>{formatDateTime(item.startAt)}</td>
                          <td>{formatDateTime(item.endAt)}</td>
                          <td>
                            <span
                              className={`admin-status-badge ${
                                item.isActive
                                  ? "admin-badge-active"
                                  : "admin-badge-inactive"
                              }`}
                            >
                              {item.isActive ? "فعال" : "غیرفعال"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-action-row">
                              <button
                                type="button"
                                className="admin-btn"
                                disabled={savingId !== null || creating}
                                onClick={() => startEdit(item)}
                              >
                                ویرایش
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                disabled={savingId !== null || creating}
                                onClick={() => void handleDelete(item)}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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
