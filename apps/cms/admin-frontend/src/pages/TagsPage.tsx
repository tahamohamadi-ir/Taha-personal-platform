import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  createTag,
  deleteTag,
  fetchTags,
  isApiError,
  isDuplicate,
  updateTag,
  type ContentLocale,
  type TagItem,
  type TagList,
} from "../lib/api";
import { formatNumber } from "../lib/format";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type LoadState = "loading" | "ready" | "error";

interface TagDraft {
  name: string;
  slug: string;
  locale: ContentLocale;
}

const EMPTY_DRAFT: TagDraft = { name: "", slug: "", locale: "fa" };

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

function isLocale(value: string): value is ContentLocale {
  return value === "fa" || value === "en";
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.code === "IN_USE") {
      return "این تگ به مقاله‌ها متصل است.";
    }
    if (isDuplicate(error)) {
      return "تگی با این نام یا نامک در این زبان وجود دارد.";
    }
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

export default function TagsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [state, setState] = useState<LoadState>("loading");
  const [list, setList] = useState<TagList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const localeParam = searchParams.get("locale") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = parsePageParam(searchParams.get("page"));
  const locale: ContentLocale | "" = isLocale(localeParam) ? localeParam : "";

  const [createForm, setCreateForm] = useState<TagDraft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<
    Record<string, string[]>
  >({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<TagDraft | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

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
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      try {
        const data = await fetchTags({
          page,
          pageSize: PAGE_SIZE,
          q,
          locale,
        });
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
  }, [locale, q, page, reloadKey]);

  function applyLocaleFilter(value: string): void {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "") {
          next.delete("locale");
        } else {
          next.set("locale", value);
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

  function updateCreateField(key: keyof TagDraft, value: string): void {
    if (key === "locale" && !isLocale(value)) {
      return;
    }
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (creating) {
      return;
    }
    setCreating(true);
    setCreateError(null);
    setCreateFieldErrors({});
    try {
      await createTag({
        name: createForm.name,
        ...(createForm.slug.trim() !== "" ? { slug: createForm.slug } : {}),
        locale: createForm.locale,
      });
      setCreateForm(EMPTY_DRAFT);
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

  function startEdit(item: TagItem): void {
    setEditingId(item.id);
    setEditDraft({ name: item.name, slug: item.slug, locale: item.locale });
    setActionError(null);
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditDraft(null);
  }

  function updateEditField(key: keyof TagDraft, value: string): void {
    if (key === "locale" && !isLocale(value)) {
      return;
    }
    setEditDraft((prev) => (prev === null ? prev : { ...prev, [key]: value }));
  }

  async function saveEdit(item: TagItem): Promise<void> {
    if (editDraft === null || savingId !== null) {
      return;
    }
    setSavingId(item.id);
    setActionError(null);
    try {
      await updateTag(
        item.id,
        {
          name: editDraft.name,
          slug: editDraft.slug,
          locale: editDraft.locale,
        },
        ""
      );
      cancelEdit();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: TagItem): Promise<void> {
    if (!window.confirm(`تگ «${item.name}» حذف شود؟`)) {
      return;
    }
    setSavingId(item.id);
    setActionError(null);
    try {
      await deleteTag(item.id);
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
  const hasActiveFilters = q !== "" || locale !== "";

  const nameErr = createFieldErrors["name"] ?? [];
  const slugErr = createFieldErrors["slug"] ?? [];
  const localeErr = createFieldErrors["locale"] ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">تگ‌ها</h1>
          <p className="admin-muted text-sm">
            برچسب‌گذاری نوشته‌ها برای فیلتر و دسته‌بندی
          </p>
        </div>
      </div>

      <form
        className="admin-card mb-4"
        onSubmit={(event) => void handleCreate(event)}
      >
        <h2 className="mb-3 text-base font-bold">+ افزودن تگ</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-48 flex-1">
            <label htmlFor="tags-create-name" className="admin-label">
              نام
            </label>
            <input
              id="tags-create-name"
              type="text"
              className="admin-input"
              value={createForm.name}
              disabled={creating}
              onChange={(event) => updateCreateField("name", event.target.value)}
              aria-invalid={nameErr.length > 0}
              aria-describedby={
                nameErr.length > 0 ? "tags-create-name-error" : undefined
              }
            />
            <FieldErrorList
              messages={nameErr}
              id={nameErr.length > 0 ? "tags-create-name-error" : undefined}
            />
          </div>
          <div className="min-w-48 flex-1">
            <label htmlFor="tags-create-slug" className="admin-label">
              نامک (اختیاری)
            </label>
            <input
              id="tags-create-slug"
              type="text"
              dir="ltr"
              className="admin-input"
              value={createForm.slug}
              disabled={creating}
              onChange={(event) => updateCreateField("slug", event.target.value)}
              aria-invalid={slugErr.length > 0}
              aria-describedby={
                slugErr.length > 0 ? "tags-create-slug-error" : undefined
              }
            />
            <FieldErrorList
              messages={slugErr}
              id={slugErr.length > 0 ? "tags-create-slug-error" : undefined}
            />
          </div>
          <div className="w-32">
            <label htmlFor="tags-create-locale" className="admin-label">
              زبان
            </label>
            <select
              id="tags-create-locale"
              className="admin-input"
              value={createForm.locale}
              disabled={creating}
              onChange={(event) =>
                updateCreateField("locale", event.target.value)
              }
              aria-invalid={localeErr.length > 0}
              aria-describedby={
                localeErr.length > 0 ? "tags-create-locale-error" : undefined
              }
            >
              <option value="fa">فارسی</option>
              <option value="en">انگلیسی</option>
            </select>
            <FieldErrorList
              messages={localeErr}
              id={localeErr.length > 0 ? "tags-create-locale-error" : undefined}
            />
          </div>
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
          <p>{toErrorMessage(createError, "ثبت تگ ناموفق بود.")}</p>
        </div>
      )}

      {actionError !== null && (
        <div className="admin-banner-error mb-4" role="alert" aria-live="polite">
          <p>{toErrorMessage(actionError, "عملیات روی تگ ناموفق بود.")}</p>
        </div>
      )}

      <div className="admin-card mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label htmlFor="tags-filter-locale" className="admin-label">
              زبان
            </label>
            <select
              id="tags-filter-locale"
              className="admin-input"
              value={locale}
              onChange={(event) => applyLocaleFilter(event.target.value)}
            >
              <option value="">همه</option>
              <option value="fa">فارسی</option>
              <option value="en">انگلیسی</option>
            </select>
          </div>
          <div className="min-w-56 flex-1">
            <label htmlFor="tags-filter-search" className="admin-label">
              جستجو
            </label>
            <input
              id="tags-filter-search"
              type="search"
              className="admin-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جستجو در نام یا نامک"
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
            {toErrorMessage(error, "دریافت فهرست تگ‌ها با خطا مواجه شد.")}
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
            : "هنوز تگی ثبت نشده است."}
        </div>
      )}

      {state === "ready" && list !== null && list.items.length > 0 && (
        <>
          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">فهرست تگ‌ها</caption>
              <thead>
                <tr>
                  <th scope="col">نام</th>
                  <th scope="col">نامک</th>
                  <th scope="col">زبان</th>
                  <th scope="col">نوشته‌ها</th>
                  <th scope="col">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => {
                  const isEditing = editingId === item.id;
                  const isSaving = savingId === item.id;
                  const draft = isEditing
                    ? editDraft ?? {
                        name: item.name,
                        slug: item.slug,
                        locale: item.locale,
                      }
                    : null;
                  return (
                    <tr key={item.id}>
                      <td>
                        {isEditing && draft !== null ? (
                          <input
                            type="text"
                            className="admin-input"
                            value={draft.name}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateEditField("name", event.target.value)
                            }
                            aria-label={`نام تگ ${item.name}`}
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td dir="ltr" className="admin-table-slug">
                        {isEditing && draft !== null ? (
                          <input
                            type="text"
                            dir="ltr"
                            className="admin-input"
                            value={draft.slug}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateEditField("slug", event.target.value)
                            }
                            aria-label="نامک تگ"
                          />
                        ) : (
                          item.slug
                        )}
                      </td>
                      <td>
                        {isEditing && draft !== null ? (
                          <select
                            className="admin-input"
                            value={draft.locale}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateEditField("locale", event.target.value)
                            }
                            aria-label="زبان تگ"
                          >
                            <option value="fa">فارسی</option>
                            <option value="en">انگلیسی</option>
                          </select>
                        ) : item.locale === "fa" ? (
                          "فارسی"
                        ) : (
                          "انگلیسی"
                        )}
                      </td>
                      <td>{formatNumber(item.articleCount)}</td>
                      <td>
                        {isEditing ? (
                          <div className="admin-action-row">
                            <button
                              type="button"
                              className="admin-btn admin-btn-primary"
                              disabled={isSaving || creating}
                              onClick={() => void saveEdit(item)}
                            >
                              {isSaving ? "…" : "ذخیره"}
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
                        ) : (
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
                        )}
                      </td>
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
