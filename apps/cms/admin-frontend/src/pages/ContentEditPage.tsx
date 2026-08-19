import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createContent,
  fetchContentDetail,
  fetchContentSchema,
  isApiError,
  isConflict,
  updateContent,
  type ApiError,
  type ContentDetail,
  type ContentEntitySchema,
  type ContentFieldSpec,
  type ContentLocale,
  type ContentStatus,
} from "../lib/api";
import {
  CONTENT_STATUSES,
  contentEntityLabel,
  isContentEntity,
  isContentLocale,
  isContentStatus,
} from "../lib/entities";
import ProfileNestedEditor from "../components/ProfileNestedEditor";
import ArticleStoryEditor from "../components/ArticleStoryEditor";

type LoadState = "loading" | "ready" | "error" | "invalid";

interface FormValues {
  locale: ContentLocale;
  slug: string;
  title: string;
  status: ContentStatus;
  fields: Record<string, string>;
}

interface FieldErrorInfo {
  messages: string[];
  id: string | undefined;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

function formValuesFromDetail(detail: ContentDetail): FormValues {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(detail.fields)) {
    if (key === "storyId") {
      continue;
    }
    if (typeof value === "boolean") {
      fields[key] = value ? "true" : "false";
    } else {
      fields[key] = value === null ? "" : String(value);
    }
  }
  return {
    locale: isContentLocale(detail.locale) ? detail.locale : "fa",
    slug: detail.slug,
    title: detail.title,
    status: isContentStatus(detail.status) ? detail.status : "draft",
    fields,
  };
}

function fieldValueToPayload(
  spec: ContentFieldSpec,
  value: string
): string | number | boolean {
  if (spec.type === "boolean") {
    return value === "true";
  }
  if (spec.type === "number" && value !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return value;
}

function fieldErrorInfo(
  fieldErrors: Record<string, string[]>,
  key: string
): FieldErrorInfo {
  const messages = fieldErrors[key] ?? [];
  return {
    messages,
    id:
      messages.length > 0 ? `content-form-field-${key}-error` : undefined,
  };
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

function renderFieldControl(
  spec: ContentFieldSpec,
  value: string,
  onValueChange: (value: string) => void,
  errorId: string | undefined
): ReactElement {
  const id = `content-form-field-${spec.key}`;
  const className = "admin-input";
  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    onValueChange(event.target.value);
  };
  if (spec.type === "boolean") {
    return (
      <input
        id={id}
        name={spec.key}
        type="checkbox"
        className="h-4 w-4"
        checked={value === "true"}
        onChange={(event) => onValueChange(event.target.checked ? "true" : "false")}
        aria-invalid={errorId !== undefined}
        aria-describedby={errorId}
      />
    );
  }
  if (spec.type === "textarea") {
    return (
      <textarea
        id={id}
        name={spec.key}
        className={className}
        rows={5}
        value={value}
        onChange={onChange}
        aria-invalid={errorId !== undefined}
        aria-describedby={errorId}
      />
    );
  }
  if (spec.type === "number") {
    return (
      <input
        id={id}
        name={spec.key}
        type="number"
        dir="ltr"
        className={className}
        value={value}
        onChange={onChange}
        aria-invalid={errorId !== undefined}
        aria-describedby={errorId}
      />
    );
  }
  if (spec.type === "date") {
    return (
      <input
        id={id}
        name={spec.key}
        type="date"
        className={className}
        value={value}
        onChange={onChange}
        aria-invalid={errorId !== undefined}
        aria-describedby={errorId}
      />
    );
  }
  return (
    <input
      id={id}
      name={spec.key}
      type="text"
      dir="ltr"
      className={className}
      value={value}
      onChange={onChange}
      aria-invalid={errorId !== undefined}
      aria-describedby={errorId}
    />
  );
}

export default function ContentEditPage(): ReactElement {
  const routeParams = useParams();
  const navigate = useNavigate();
  const entityParam = routeParams.entity ?? "";
  const idParam = routeParams.id;
  const entity = isContentEntity(entityParam) ? entityParam : null;
  const isEditing = idParam !== undefined;
  const id = isEditing ? Number.parseInt(idParam ?? "", 10) : 0;
  const idIsValid =
    !isEditing ||
    (/^\d+$/.test(idParam ?? "") && Number.isFinite(id) && id >= 1);

  const [state, setState] = useState<LoadState>("loading");
  const [schema, setSchema] = useState<ContentEntitySchema | null>(null);
  const [form, setForm] = useState<FormValues | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [storyId, setStoryId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictError, setConflictError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const listUrl = entity === null ? "/content" : `/content/${entity}`;

  useEffect(() => {
    if (entity === null || !idIsValid) {
      setState("invalid");
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      setError(null);
      setFieldErrors({});
      setConflictError(null);
      try {
        const contentSchema = await fetchContentSchema();
        if (cancelled) {
          return;
        }
        const entitySchema = contentSchema.entities[entity];
        if (entitySchema === undefined) {
          const schemaError: ApiError = {
            status: 404,
            code: "NOT_FOUND",
            message: "قالب فیلدهای این نوع محتوا یافت نشد.",
          };
          setError(schemaError);
          setState("error");
          return;
        }
        if (isEditing) {
          const detail = await fetchContentDetail(entity, id);
          if (cancelled) {
            return;
          }
          setSchema(entitySchema);
          setForm(formValuesFromDetail(detail));
          setUpdatedAt(detail.updatedAt);
          const rawStory = detail.fields.storyId;
          setStoryId(
            typeof rawStory === "number"
              ? rawStory
              : typeof rawStory === "string" && rawStory !== ""
                ? Number.parseInt(rawStory, 10)
                : null
          );
        } else if (!cancelled) {
          setSchema(entitySchema);
          const booleanDefaults: Record<string, string> = {};
          for (const spec of entitySchema.fields) {
            if (spec.type === "boolean") {
              booleanDefaults[spec.key] = "true";
            }
          }
          setForm({
            locale: "fa",
            slug: "",
            title: "",
            status: "draft",
            fields: booleanDefaults,
          });
        }
        if (!cancelled) {
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
  }, [entity, isEditing, id, idIsValid, reloadKey]);

  async function reloadVersion(): Promise<void> {
    if (entity === null || !isEditing) {
      return;
    }
    setSaving(false);
    setConflictError(null);
    setError(null);
    setFieldErrors({});
    setState("loading");
    try {
      const detail = await fetchContentDetail(entity, id);
      setForm(formValuesFromDetail(detail));
      setUpdatedAt(detail.updatedAt);
      setState("ready");
    } catch (err) {
      setError(err);
      setState("error");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (entity === null || schema === null || form === null || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setConflictError(null);
    try {
      const schemaKeys = new Set(schema.fields.map((spec) => spec.key));
      const fields: Record<string, string | number | boolean> = {};
      for (const spec of schema.fields) {
        fields[spec.key] = fieldValueToPayload(
          spec,
          form.fields[spec.key] ?? ""
        );
      }
      for (const [key, value] of Object.entries(form.fields)) {
        if (!schemaKeys.has(key)) {
          fields[key] = value;
        }
      }
      if (isEditing) {
        await updateContent(
          entity,
          id,
          {
            title: form.title,
            slug: form.slug,
            status: form.status,
            fields,
          },
          updatedAt
        );
      } else {
        await createContent(entity, {
          locale: form.locale,
          slug: form.slug,
          title: form.title,
          status: form.status,
          fields,
        });
      }
      navigate(`/content/${entity}`);
    } catch (err) {
      if (isApiError(err)) {
        if (err.fields !== undefined) {
          setFieldErrors(err.fields);
        }
        if (isConflict(err) && isEditing) {
          setConflictError(err);
        } else {
          setError(err);
        }
      } else {
        setError(err);
      }
    } finally {
      setSaving(false);
    }
  }

  function updateTitle(value: string): void {
    setForm((prev) => (prev === null ? prev : { ...prev, title: value }));
  }

  function updateSlug(value: string): void {
    setForm((prev) => (prev === null ? prev : { ...prev, slug: value }));
  }

  function updateLocale(value: string): void {
    if (!isContentLocale(value)) {
      return;
    }
    setForm((prev) => (prev === null ? prev : { ...prev, locale: value }));
  }

  function updateStatus(value: string): void {
    if (!isContentStatus(value)) {
      return;
    }
    setForm((prev) => (prev === null ? prev : { ...prev, status: value }));
  }

  function updateField(key: string, value: string): void {
    setForm((prev) =>
      prev === null
        ? prev
        : { ...prev, fields: { ...prev.fields, [key]: value } }
    );
  }

  if (entity === null || !idIsValid) {
    return (
      <div className="admin-card max-w-md" role="alert">
        <p className="mb-4 text-sm">
          نوع محتوا یا شناسه نامعتبر است.
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

  if (state !== "ready" || form === null || schema === null) {
    return (
      <div className="admin-muted py-12 text-center" role="status">
        در حال بارگذاری…
      </div>
    );
  }

  const titleErr = fieldErrorInfo(fieldErrors, "title");
  const slugErr = fieldErrorInfo(fieldErrors, "slug");
  const localeErr = fieldErrorInfo(fieldErrors, "locale");
  const statusErr = fieldErrorInfo(fieldErrors, "status");

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">
            {isEditing ? "ویرایش" : "ایجاد"}{" "}
            {contentEntityLabel(entity)}
          </h1>
          <p className="admin-muted text-sm">
            {isEditing ? "اصلاح محتوای موجود" : "ثبت محتوای جدید"}
          </p>
        </div>
        <Link to={listUrl} className="admin-btn">
          بازگشت
        </Link>
      </div>

      {error !== null && (
        <div
          className="admin-banner-error mb-4"
          role="alert"
          aria-live="polite"
        >
          <p>{toErrorMessage(error, "ذخیره تغییرات با خطا مواجه شد.")}</p>
        </div>
      )}

      {conflictError !== null && (
        <div
          className="admin-banner-error mb-4"
          role="alert"
          aria-live="polite"
        >
          <p className="font-medium">{conflictError.message}</p>
          <p className="mt-1 text-sm">
            این محتوا در جایی دیگر به‌روزرسانی شده است.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => void reloadVersion()}
            >
              بارگذاری نسخه جدید
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => navigate(listUrl)}
            >
              لغو
            </button>
          </div>
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <div className="admin-card">
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <div className="admin-form-row">
              <label htmlFor="content-form-locale" className="admin-label">
                زبان
              </label>
              <select
                id="content-form-locale"
                className="admin-input"
                value={form.locale}
                disabled={isEditing || saving}
                onChange={(event) => updateLocale(event.target.value)}
                aria-invalid={localeErr.id !== undefined}
                aria-describedby={localeErr.id}
              >
                <option value="fa">فارسی</option>
                <option value="en">انگلیسی</option>
              </select>
              <FieldErrorList {...localeErr} />
            </div>
            <div className="admin-form-row">
              <label htmlFor="content-form-status" className="admin-label">
                وضعیت
              </label>
              <select
                id="content-form-status"
                className="admin-input"
                value={form.status}
                disabled={saving}
                onChange={(event) => updateStatus(event.target.value)}
                aria-invalid={statusErr.id !== undefined}
                aria-describedby={statusErr.id}
              >
                {CONTENT_STATUSES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.labelFa}
                  </option>
                ))}
              </select>
              <FieldErrorList {...statusErr} />
            </div>
          </div>

          <div className="admin-form-row">
            <label htmlFor="content-form-title" className="admin-label">
              عنوان
            </label>
            <input
              id="content-form-title"
              type="text"
              className="admin-input"
              value={form.title}
              disabled={saving}
              onChange={(event) => updateTitle(event.target.value)}
              aria-invalid={titleErr.id !== undefined}
              aria-describedby={titleErr.id}
            />
            <FieldErrorList {...titleErr} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="content-form-slug" className="admin-label">
              نامک (Slug)
            </label>
            <input
              id="content-form-slug"
              type="text"
              dir="ltr"
              className="admin-input"
              value={form.slug}
              disabled={saving}
              onChange={(event) => updateSlug(event.target.value)}
              aria-invalid={slugErr.id !== undefined}
              aria-describedby={slugErr.id}
            />
            <FieldErrorList {...slugErr} />
          </div>

          {schema.fields.length === 0 && (
            <p className="admin-muted text-sm">
              فیلد دیگری برای این نوع محتوا تعریف نشده است.
            </p>
          )}

          {schema.fields
            .filter((spec) => spec.key !== "storyId")
            .map((spec) => {
            const info = fieldErrorInfo(fieldErrors, spec.key);
            return (
              <div key={spec.key} className="admin-form-row">
                <label
                  htmlFor={`content-form-field-${spec.key}`}
                  className="admin-label admin-muted"
                  dir="ltr"
                >
                  {spec.label}
                </label>
                {renderFieldControl(
                  spec,
                  form.fields[spec.key] ?? "",
                  (value) => updateField(spec.key, value),
                  info.id
                )}
                <FieldErrorList {...info} />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </button>
          <Link to={listUrl} className="admin-btn">
            بازگشت
          </Link>
        </div>
      </form>
      {isEditing && entity === "profile" && form !== null ? (
        <ProfileNestedEditor locale={form.locale} slug={form.slug} />
      ) : null}
      {isEditing && entity === "article" && form !== null ? (
        <ArticleStoryEditor
          articleId={id}
          locale={form.locale}
          title={form.title}
          storyId={Number.isFinite(storyId) ? storyId : null}
          articleUpdatedAt={updatedAt}
          onArticleUpdated={(next) => {
            setStoryId(next.storyId);
            setUpdatedAt(next.updatedAt);
          }}
        />
      ) : null}
    </div>
  );
}