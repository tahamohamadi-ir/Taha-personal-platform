import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  fetchMediaList,
  isApiError,
  uploadMedia,
  type MediaItem,
  type MediaList,
  type MediaListParams,
  type MediaType,
} from "../lib/api";
import {
  formatFileSize,
  formatNumber,
} from "../lib/format";
import MediaThumb from "./MediaThumb";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

type LoadState = "loading" | "ready" | "error";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
}: MediaPickerProps): ReactElement | null {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | MediaType>("");
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>("loading");
  const [list, setList] = useState<MediaList | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSearchInput("");
    setQuery("");
    setType("");
    setPage(1);
    setUploadOpen(false);
    setFile(null);
    setTitle("");
    setProgress(0);
    setUploadError(null);
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

  useEffect(() => {
    if (searchInput === query) {
      return;
    }
    const timer = window.setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      try {
        const params: MediaListParams = { page, pageSize: PAGE_SIZE };
        if (query !== "") {
          params.q = query;
        }
        if (type !== "") {
          params.type = type;
        }
        const data = await fetchMediaList(params);
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
  }, [open, query, type, page, reloadKey]);

  async function handleUpload(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (file === null || uploading) {
      return;
    }
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    try {
      await uploadMedia(file, title, "", "", (percent) => setProgress(percent));
      setUploadOpen(false);
      setFile(null);
      setTitle("");
      setProgress(0);
      setPage(1);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setUploadError(err);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(item: MediaItem): void {
    onSelect(item);
    onClose();
  }

  if (!open) {
    return null;
  }

  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, PAGE_SIZE)));
  const hasActiveFilters = query !== "" || type !== "";

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب رسانه"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <h2 className="text-base font-bold">انتخاب رسانه</h2>
          <button
            type="button"
            className="admin-btn"
            onClick={onClose}
            autoFocus
          >
            بستن
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="media-picker-search" className="admin-label">
              جستجو
            </label>
            <input
              id="media-picker-search"
              type="search"
              className="admin-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جستجو در عنوان"
            />
          </div>
          <div className="w-36">
            <label htmlFor="media-picker-type" className="admin-label">
              نوع
            </label>
            <select
              id="media-picker-type"
              className="admin-input"
              value={type}
              onChange={(event) => {
                const value = event.target.value;
                setType(value === "image" || value === "pdf" ? value : "");
                setPage(1);
              }}
            >
              <option value="">همه</option>
              <option value="image">تصویر</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setUploadOpen((openValue) => !openValue)}
          >
            {uploadOpen ? "بستن آپلود" : "+ آپلود جدید"}
          </button>
        </div>

        {uploadOpen && (
          <form
            className="admin-card mb-4"
            onSubmit={(event) => void handleUpload(event)}
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-40 flex-1">
                <label htmlFor="media-picker-upload-file" className="admin-label">
                  فایل
                </label>
                <input
                  id="media-picker-upload-file"
                  type="file"
                  className="admin-input"
                  accept="image/*,application/pdf"
                  disabled={uploading}
                  onChange={(event) =>
                    setFile(event.target.files?.[0] ?? null)
                  }
                />
              </div>
              <div className="min-w-40 flex-1">
                <label htmlFor="media-picker-upload-title" className="admin-label">
                  عنوان
                </label>
                <input
                  id="media-picker-upload-title"
                  type="text"
                  className="admin-input"
                  value={title}
                  disabled={uploading}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={file === null || uploading}
              >
                {uploading ? "در حال بارگذاری…" : "بارگذاری"}
              </button>
            </div>
            {uploading && (
              <div className="mt-3">
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
            {uploadError !== null && (
              <p className="mt-3 text-sm" role="alert">
                {toErrorMessage(uploadError, "بارگذاری فایل با خطا مواجه شد.")}
              </p>
            )}
          </form>
        )}

        {state === "loading" && (
          <div className="admin-muted py-10 text-center" role="status">
            در حال بارگذاری…
          </div>
        )}

        {state === "error" && (
          <div className="admin-card" role="alert">
            <p className="mb-3 text-sm">
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
              : "رسانه‌ای برای انتخاب وجود ندارد."}
          </div>
        )}

        {state === "ready" && list !== null && list.items.length > 0 && (
          <div className="admin-media-grid" aria-live="polite">
            {list.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="admin-media-card"
                onClick={() => handleSelect(item)}
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
                </div>
              </button>
            ))}
          </div>
        )}

        {state === "ready" && list !== null && list.items.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="admin-muted text-sm" aria-live="polite">
              {formatNumber(total)} مورد — صفحه {formatNumber(page)} از{" "}
              {formatNumber(totalPages)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-btn"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                قبلی
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
