import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchMediaDetail,
  fetchMediaList,
  fetchMediaOrphans,
  isApiError,
  isConflict,
  replaceMedia,
  updateMedia,
  uploadMedia,
  type ApiError,
  type MediaItem,
  type MediaList,
  type MediaListParams,
  type MediaType,
  type MediaPayload,
} from "../lib/api";
import { formatDateTime, formatFileSize, formatNumber } from "../lib/format";
import MediaPicker from "../components/MediaPicker";
import MediaThumb from "../components/MediaThumb";

const PAGE_SIZE = 12;
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

interface UploadFormState {
  file: File | null;
  title: string;
  altTextFa: string;
  altTextEn: string;
}

const EMPTY_UPLOAD_FORM: UploadFormState = {
  file: null,
  title: "",
  altTextFa: "",
  altTextEn: "",
};

function MediaUploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (media: MediaItem) => void;
}): ReactElement | null {
  const [form, setForm] = useState<UploadFormState>(EMPTY_UPLOAD_FORM);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY_UPLOAD_FORM);
      setProgress(0);
      setUploading(false);
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  function updateField(
    key: "title" | "altTextFa" | "altTextEn",
    value: string
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (form.file === null || uploading) {
      return;
    }
    setUploading(true);
    setError(null);
    setFieldErrors({});
    setProgress(0);
    try {
      const media = await uploadMedia(
        form.file,
        form.title,
        form.altTextFa,
        form.altTextEn,
        (percent) => setProgress(percent)
      );
      onUploaded(media);
      onClose();
    } catch (err) {
      if (isApiError(err)) {
        if (err.fields !== undefined) {
          setFieldErrors(err.fields);
        }
        setError(err);
      } else {
        setError(err);
      }
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  if (!open) {
    return null;
  }

  const fileErr = fieldErrors["file"] ?? [];
  const titleErr = fieldErrors["title"] ?? [];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-label="آپلود رسانه جدید"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mb-4 flex items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <h2 className="text-base font-bold">آپلود رسانه جدید</h2>
          <button
            type="button"
            className="admin-btn"
            onClick={onClose}
            autoFocus
          >
            بستن
          </button>
        </div>

        {error !== null && (
          <div
            className="admin-banner-error mb-4"
            role="alert"
            aria-live="polite"
          >
            <p>{toErrorMessage(error, "بارگذاری فایل با خطا مواجه شد.")}</p>
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="admin-form-row">
            <label htmlFor="media-upload-file" className="admin-label">
              فایل
            </label>
            <input
              id="media-upload-file"
              type="file"
              className="admin-input"
              accept="image/*,application/pdf"
              disabled={uploading}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  file: event.target.files?.[0] ?? null,
                }))
              }
              aria-invalid={fileErr.length > 0}
            />
            {fileErr.length > 0 && (
              <ul className="admin-field-error" aria-live="polite">
                {fileErr.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-form-row">
            <label htmlFor="media-upload-title" className="admin-label">
              عنوان
            </label>
            <input
              id="media-upload-title"
              type="text"
              className="admin-input"
              value={form.title}
              disabled={uploading}
              onChange={(event) => updateField("title", event.target.value)}
              aria-invalid={titleErr.length > 0}
            />
            {titleErr.length > 0 && (
              <ul className="admin-field-error" aria-live="polite">
                {titleErr.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <div className="admin-form-row">
              <label htmlFor="media-upload-alt-fa" className="admin-label">
                متن جایگزین (فارسی)
              </label>
              <input
                id="media-upload-alt-fa"
                type="text"
                className="admin-input"
                value={form.altTextFa}
                disabled={uploading}
                onChange={(event) =>
                  updateField("altTextFa", event.target.value)
                }
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="media-upload-alt-en" className="admin-label">
                متن جایگزین (English)
              </label>
              <input
                id="media-upload-alt-en"
                type="text"
                dir="ltr"
                className="admin-input"
                value={form.altTextEn}
                disabled={uploading}
                onChange={(event) =>
                  updateField("altTextEn", event.target.value)
                }
              />
            </div>
          </div>

          {uploading && (
            <div className="admin-form-row">
              <div
                className="admin-progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="پیشرفت بارگذاری"
              >
                <div
                  className="admin-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="admin-muted mt-1 text-xs" aria-live="polite">
                {formatNumber(progress)}٪
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={form.file === null || uploading}
            >
              {uploading ? "در حال بارگذاری…" : "بارگذاری"}
            </button>
            <button type="button" className="admin-btn" onClick={onClose}>
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditFormState {
  title: string;
  altText: string;
  altTextFa: string;
  altTextEn: string;
  isActive: boolean;
}

function editFormFromMedia(media: MediaItem): EditFormState {
  return {
    title: media.title,
    altText: media.altText,
    altTextFa: media.altTextFa,
    altTextEn: media.altTextEn,
    isActive: media.isActive,
  };
}

function MediaEditDrawer({
  media,
  onClose,
  onUpdated,
}: {
  media: MediaItem | null;
  onClose: () => void;
  onUpdated: (media: MediaItem) => void;
}): ReactElement | null {
  const [form, setForm] = useState<EditFormState | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictError, setConflictError] = useState<ApiError | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [replaceError, setReplaceError] = useState<unknown>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (media === null) {
      return;
    }
    setForm(editFormFromMedia(media));
    setUpdatedAt(media.updatedAt);
    setSaving(false);
    setError(null);
    setFieldErrors({});
    setConflictError(null);
  }, [media]);

  useEffect(() => {
    if (media === null) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [media, onClose]);

  function updateField(
    key: "title" | "altText" | "altTextFa" | "altTextEn",
    value: string
  ): void {
    setForm((prev) => (prev === null ? prev : { ...prev, [key]: value }));
  }

  async function reloadVersion(): Promise<void> {
    if (media === null) {
      return;
    }
    setSaving(false);
    setConflictError(null);
    setError(null);
    setFieldErrors({});
    try {
      const detail = await fetchMediaDetail(media.id);
      setForm(editFormFromMedia(detail));
      setUpdatedAt(detail.updatedAt);
    } catch (err) {
      setError(err);
    }
  }

  async function handleReplace(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (media === null || file === undefined || replacing) {
      return;
    }
    if (!window.confirm("آیا فایل این رسانه جایگزین شود؟ (metadata حفظ میشود)")) {
      return;
    }
    setReplacing(true);
    setReplaceProgress(0);
    setReplaceError(null);
    try {
      const updated = await replaceMedia(media.id, file, setReplaceProgress);
      onUpdated(updated);
      setForm(editFormFromMedia(updated));
      setUpdatedAt(updated.updatedAt);
      setReplacing(false);
    } catch (err) {
      setReplacing(false);
      setReplaceError(err);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (media === null || form === null || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setConflictError(null);
    try {
      const payload: MediaPayload = {
        title: form.title,
        altText: form.altText,
        altTextFa: form.altTextFa,
        altTextEn: form.altTextEn,
        isActive: form.isActive,
      };
      const updated = await updateMedia(media.id, payload, updatedAt);
      onUpdated(updated);
      onClose();
    } catch (err) {
      if (isApiError(err)) {
        if (err.fields !== undefined) {
          setFieldErrors(err.fields);
        }
        if (isConflict(err)) {
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

  if (media === null || form === null) {
    return null;
  }

  const titleErr = fieldErrors["title"] ?? [];

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="ویرایش رسانه"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mb-4 flex items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <div>
            <h2 className="text-base font-bold">ویرایش رسانه</h2>
            <p className="admin-muted text-xs">شناسه {formatNumber(media.id)}</p>
          </div>
          <button type="button" className="admin-btn" onClick={onClose} autoFocus>
            بستن
          </button>
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
              این رسانه در جایی دیگر به‌روزرسانی شده است.
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
                onClick={onClose}
              >
                لغو
              </button>
            </div>
          </div>
        )}

        <div className="admin-media-thumb mb-4 max-h-56 rounded-lg">
          <MediaThumb media={media} />
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="admin-form-row">
            <label htmlFor="media-edit-title" className="admin-label">
              عنوان
            </label>
            <input
              id="media-edit-title"
              type="text"
              className="admin-input"
              value={form.title}
              disabled={saving}
              onChange={(event) => updateField("title", event.target.value)}
              aria-invalid={titleErr.length > 0}
            />
            {titleErr.length > 0 && (
              <ul className="admin-field-error" aria-live="polite">
                {titleErr.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-form-row">
            <label htmlFor="media-edit-alt" className="admin-label">
              متن جایگزین (پیش‌فرض)
            </label>
            <input
              id="media-edit-alt"
              type="text"
              className="admin-input"
              value={form.altText}
              disabled={saving}
              onChange={(event) => updateField("altText", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <div className="admin-form-row">
              <label htmlFor="media-edit-alt-fa" className="admin-label">
                متن جایگزین (فارسی)
              </label>
              <input
                id="media-edit-alt-fa"
                type="text"
                className="admin-input"
                value={form.altTextFa}
                disabled={saving}
                onChange={(event) =>
                  updateField("altTextFa", event.target.value)
                }
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="media-edit-alt-en" className="admin-label">
                متن جایگزین (English)
              </label>
              <input
                id="media-edit-alt-en"
                type="text"
                dir="ltr"
                className="admin-input"
                value={form.altTextEn}
                disabled={saving}
                onChange={(event) =>
                  updateField("altTextEn", event.target.value)
                }
              />
            </div>
          </div>

          <div className="admin-form-row">
            <label
              htmlFor="media-edit-active"
              className="flex items-center gap-2"
            >
              <input
                id="media-edit-active"
                type="checkbox"
                className="h-4 w-4"
                checked={form.isActive}
                disabled={saving}
                onChange={(event) => {
                  const next = event.target.checked;
                  if (
                    !next &&
                    !window.confirm(
                      "آیا این رسانه بایگانی شود؟ (غیرفعال برای استفاده عمومی)"
                    )
                  ) {
                    return;
                  }
                  setForm((prev) =>
                    prev === null
                      ? prev
                      : { ...prev, isActive: next }
                  );
                }}
              />
              <span className="text-sm">فعال (قابل استفاده عمومی)</span>
            </label>
          </div>

          <div className="admin-form-row border-t pt-3"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="admin-muted">نوع:</dt>
                <dd dir="ltr">{media.mime}</dd>
              </div>
              <div>
                <dt className="admin-muted">اندازه:</dt>
                <dd>{formatFileSize(media.size)}</dd>
              </div>
              <div>
                <dt className="admin-muted">تعداد استفاده:</dt>
                <dd>{formatNumber(media.usageCount)}</dd>
              </div>
              <div>
                <dt className="admin-muted">آخرین به‌روزرسانی:</dt>
                <dd>{formatDateTime(media.updatedAt)}</dd>
              </div>
            </dl>
            {media.url !== null && (
              <p className="mt-2 break-all" dir="ltr">
                <a
                  className="admin-table-link text-xs"
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {media.url}
                </a>
              </p>
            )}
          </div>

          <div className="admin-form-row border-t pt-3"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <label htmlFor="media-edit-replace" className="admin-label">
              جایگزینی فایل
            </label>
            <div className="flex items-center gap-2">
              <input
                id="media-edit-replace"
                ref={replaceFileRef}
                type="file"
                className="admin-input text-xs"
                accept="image/png,image/jpeg,image/gif,application/pdf"
                disabled={replacing}
                onChange={(event) => void handleReplace(event)}
              />
              {replacing && (
                <div className="admin-progress w-32" aria-live="polite">
                  <div
                    className="admin-progress-bar"
                    style={{ width: `${replaceProgress}%` }}
                  />
                </div>
              )}
            </div>
            {isApiError(replaceError) && (
              <p className="mt-1 text-xs" style={{ color: "var(--admin-danger)" }}>
                {replaceError.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </button>
            <button type="button" className="admin-btn" onClick={onClose}>
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MediaLibraryPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [state, setState] = useState<LoadState>("loading");
  const [list, setList] = useState<MediaList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const q = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const activeParam = searchParams.get("active") ?? "";
  const orphansParam = searchParams.get("orphans") ?? "";
  const page = parsePageParam(searchParams.get("page"));

  const type: "" | MediaType =
    typeParam === "image" || typeParam === "pdf" ? typeParam : "";
  const active: "" | "true" | "false" =
    activeParam === "true" || activeParam === "false" ? activeParam : "";
  const orphans = orphansParam === "1";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedMedia, setPickedMedia] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);

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
        const params: MediaListParams = { page, pageSize: PAGE_SIZE };
        if (q !== "") {
          params.q = q;
        }
        if (type !== "") {
          params.type = type;
        }
        if (!orphans && active !== "") {
          params.active = active;
        }
        const data = orphans
          ? await fetchMediaOrphans(params)
          : await fetchMediaList(params);
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
  }, [q, type, active, orphans, page, reloadKey]);

  function applyFilter(name: "type" | "active", value: string): void {
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

  function toggleOrphans(): void {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get("orphans") === "1") {
          next.delete("orphans");
        } else {
          next.set("orphans", "1");
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

  function handlePicked(media: MediaItem): void {
    setPickedMedia(media);
    console.log("MediaPicker selected", media);
  }

  function handleUploaded(): void {
    setList((prev) =>
      prev === null ? prev : { ...prev, total: prev.total + 1 }
    );
    setUploadOpen(false);
    setReloadKey((key) => key + 1);
  }

  function handleUpdated(media: MediaItem): void {
    setList((prev) =>
      prev === null
        ? prev
        : {
            ...prev,
            items: prev.items.map((item) =>
              item.id === media.id ? media : item
            ),
          }
    );
    setEditMedia(null);
    setReloadKey((key) => key + 1);
  }

  const pageSize = list?.pageSize ?? PAGE_SIZE;
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const displayPage = Math.min(page, totalPages);
  const hasActiveFilters = q !== "" || type !== "" || active !== "" || orphans;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">کتابخانه رسانه</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn"
            onClick={() => setPickerOpen(true)}
          >
            انتخاب رسانه
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setUploadOpen(true)}
          >
            + آپلود جدید
          </button>
        </div>
      </div>

      {pickedMedia !== null && (
        <div
          className="admin-card mb-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm">
            رسانه انتخاب‌شده:{" "}
            <span className="font-medium">
              #{formatNumber(pickedMedia.id)} —{" "}
              {pickedMedia.title === "" ? "بدون عنوان" : pickedMedia.title}
            </span>
          </p>
          <button
            type="button"
            className="admin-btn mt-2 text-xs"
            onClick={() => setPickedMedia(null)}
          >
            پاک کردن انتخاب
          </button>
        </div>
      )}

      <div className="admin-card mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-36">
            <label htmlFor="media-filter-type" className="admin-label">
              نوع
            </label>
            <select
              id="media-filter-type"
              className="admin-input"
              value={type}
              onChange={(event) => applyFilter("type", event.target.value)}
            >
              <option value="">همه</option>
              <option value="image">تصویر</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="w-40">
            <label htmlFor="media-filter-active" className="admin-label">
              وضعیت
            </label>
            <select
              id="media-filter-active"
              className="admin-input"
              value={active}
              disabled={orphans}
              onChange={(event) => applyFilter("active", event.target.value)}
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>
          <div className="min-w-56 flex-1">
            <label htmlFor="media-filter-search" className="admin-label">
              جستجو
            </label>
            <input
              id="media-filter-search"
              type="search"
              className="admin-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جستجو در عنوان"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={orphans}
              onChange={toggleOrphans}
            />
            فقط رسانه‌های بدون استفاده
          </label>
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
            {toErrorMessage(error, "دریافت فهرست رسانه با خطا مواجه شد.")}
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
            : "هنوز رسانه‌ای ثبت نشده است."}
        </div>
      )}

      {state === "ready" && list !== null && list.items.length > 0 && (
        <>
          <div className="admin-media-grid" aria-live="polite">
            {list.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="admin-media-card"
                onClick={() => setEditMedia(item)}
              >
                <div className="admin-media-thumb">
                  <MediaThumb media={item} />
                </div>
                <div className="p-2">
                  <div className="truncate text-sm font-medium" dir="auto">
                    {item.title === "" ? "بدون عنوان" : item.title}
                  </div>
                  <div className="admin-muted mt-1 text-xs">
                    {item.mime} · {formatFileSize(item.size)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`admin-status-badge ${
                        item.isActive
                          ? "admin-status-published"
                          : "admin-status-draft"
                      }`}
                    >
                      {item.isActive ? "فعال" : "غیرفعال"}
                    </span>
                    <span className="admin-muted text-xs">
                      {formatNumber(item.usageCount)} استفاده
                    </span>
                  </div>
                </div>
              </button>
            ))}
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

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePicked}
      />
      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
      />
      <MediaEditDrawer
        media={editMedia}
        onClose={() => setEditMedia(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
