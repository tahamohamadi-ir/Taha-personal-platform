import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  fetchSiteSettings,
  isApiError,
  isConflict,
  updateSiteSettings,
  type ApiError,
  type ContentLocale,
  type CurrentDocument,
  type MediaItem,
  type NavLink,
  type SiteSettings,
} from "../lib/api";
import MediaPicker from "../components/MediaPicker";
import { formatFileSize } from "../lib/format";

type LoadState = "loading" | "ready" | "error";

const MAX_NAV_LINKS = 20;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const FALLBACK_COLOR = "#2563eb";

interface SettingsForm {
  brandName: string;
  tagline: string;
  footerText: string;
  primaryColor: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  navLinks: NavLink[];
  currentCvMediaId: number | null;
  currentResumeMediaId: number | null;
  currentCv: CurrentDocument | null;
  currentResume: CurrentDocument | null;
}

function formFromSettings(settings: SiteSettings): SettingsForm {
  return {
    brandName: settings.brandName,
    tagline: settings.tagline,
    footerText: settings.footerText,
    primaryColor: settings.primaryColor,
    seoDefaultTitle: settings.seoDefaultTitle,
    seoDefaultDescription: settings.seoDefaultDescription,
    navLinks: settings.navLinks.map((link) => ({ ...link })),
    currentCvMediaId: settings.currentCvMediaId,
    currentResumeMediaId: settings.currentResumeMediaId,
    currentCv: settings.currentCv,
    currentResume: settings.currentResume,
  };
}

function isLocale(value: string): value is ContentLocale {
  return value === "fa" || value === "en";
}

function isValidHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
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

export default function SettingsPage(): ReactElement {
  const [state, setState] = useState<LoadState>("loading");
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictError, setConflictError] = useState<ApiError | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [cvPickerOpen, setCvPickerOpen] = useState(false);
  const [resumePickerOpen, setResumePickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setState("loading");
      setError(null);
      setFieldErrors({});
      setConflictError(null);
      try {
        const settings = await fetchSiteSettings();
        if (cancelled) {
          return;
        }
        setForm(formFromSettings(settings));
        setUpdatedAt(settings.updatedAt);
        setState("ready");
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
  }, [reloadKey]);

  async function reloadVersion(): Promise<void> {
    setSaving(false);
    setConflictError(null);
    setError(null);
    setFieldErrors({});
    setSuccessNote(null);
    setState("loading");
    try {
      const settings = await fetchSiteSettings();
      setForm(formFromSettings(settings));
      setUpdatedAt(settings.updatedAt);
      setState("ready");
    } catch (err) {
      setError(err);
      setState("error");
    }
  }

  function updateField(key: keyof SettingsForm, value: string): void {
    setForm((prev) => (prev === null ? prev : { ...prev, [key]: value }));
  }

  function updateNavLink(index: number, patch: Partial<NavLink>): void {
    setForm((prev) => {
      if (prev === null) {
        return prev;
      }
      const navLinks = prev.navLinks.map((link, itemIndex) =>
        itemIndex === index ? { ...link, ...patch } : link
      );
      return { ...prev, navLinks };
    });
  }

  function removeNavLink(index: number): void {
    setForm((prev) => {
      if (prev === null) {
        return prev;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function addNavLink(): void {
    setForm((prev) => {
      if (prev === null || prev.navLinks.length >= MAX_NAV_LINKS) {
        return prev;
      }
      return {
        ...prev,
        navLinks: [...prev.navLinks, { label: "", href: "", locale: "fa" }],
      };
    });
  }

  function applyDocumentSelection(
    slot: "cv" | "resume",
    media: MediaItem
  ): void {
    if (media.mime !== "application/pdf") {
      setFieldErrors((prev) => ({
        ...prev,
        [slot === "cv" ? "currentCvMediaId" : "currentResumeMediaId"]: [
          "سند جاری باید یک فایل PDF از کتابخانهٔ رسانه باشد.",
        ],
      }));
      return;
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[slot === "cv" ? "currentCvMediaId" : "currentResumeMediaId"];
      return next;
    });
    const doc: CurrentDocument = {
      id: media.id,
      title: media.title,
      mime: media.mime,
      size: media.size,
      isActive: media.isActive,
      url: media.url ?? "",
      updatedAt: media.updatedAt,
    };
    setForm((prev) => {
      if (prev === null) {
        return prev;
      }
      if (slot === "cv") {
        return {
          ...prev,
          currentCvMediaId: media.id,
          currentCv: doc,
        };
      }
      return {
        ...prev,
        currentResumeMediaId: media.id,
        currentResume: doc,
      };
    });
  }

  function clearDocument(slot: "cv" | "resume"): void {
    setForm((prev) => {
      if (prev === null) {
        return prev;
      }
      if (slot === "cv") {
        return { ...prev, currentCvMediaId: null, currentCv: null };
      }
      return { ...prev, currentResumeMediaId: null, currentResume: null };
    });
  }

  function errorInfo(
    key: string
  ): { messages: string[]; id: string | undefined } {
    const messages = fieldErrors[key] ?? [];
    return {
      messages,
      id: messages.length > 0 ? `settings-field-${key}-error` : undefined,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (form === null || saving) {
      return;
    }
    const navLinks = form.navLinks.filter(
      (link) => link.label.trim() !== "" || link.href.trim() !== ""
    );
    const nextFieldErrors: Record<string, string[]> = {};
    if (form.primaryColor !== "" && !isValidHexColor(form.primaryColor)) {
      nextFieldErrors.primaryColor = [
        "رنگ اصلی باید به شکل #RRGGBB باشد (مثلاً #2563eb).",
      ];
    }
    if (navLinks.length > MAX_NAV_LINKS) {
      nextFieldErrors.navLinks = [
        `حداکثر ${MAX_NAV_LINKS} پیوند پشتیبانی می‌شود.`,
      ];
    }
    setSaving(true);
    setError(null);
    setSuccessNote(null);
    setConflictError(null);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSaving(false);
      return;
    }
    setFieldErrors({});
    try {
      const saved = await updateSiteSettings(
        {
          brandName: form.brandName,
          tagline: form.tagline,
          footerText: form.footerText,
          primaryColor: form.primaryColor,
          navLinks,
          seoDefaultTitle: form.seoDefaultTitle,
          seoDefaultDescription: form.seoDefaultDescription,
          currentCvMediaId: form.currentCvMediaId,
          currentResumeMediaId: form.currentResumeMediaId,
        },
        updatedAt
      );
      setUpdatedAt(saved.updatedAt);
      setForm(formFromSettings(saved));
      setSuccessNote("تنظیمات با موفقیت ذخیره شد.");
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

  if (state === "error") {
    return (
      <div className="admin-card max-w-md" role="alert">
        <p className="mb-4 text-sm">
          {toErrorMessage(
            error,
            "دریافت تنظیمات سایت با خطا مواجه شد."
          )}
        </p>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (state !== "ready" || form === null) {
    return (
      <div className="admin-muted py-12 text-center" role="status">
        در حال بارگذاری…
      </div>
    );
  }

  const navLinkErrors: string[] = [];
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (key === "navLinks" || key.startsWith("navLinks.")) {
      navLinkErrors.push(...messages);
    }
  }
  const summaryErrors = Object.values(fieldErrors).flat();

  const brandNameErr = errorInfo("brandName");
  const taglineErr = errorInfo("tagline");
  const footerTextErr = errorInfo("footerText");
  const primaryColorErr = errorInfo("primaryColor");
  const seoTitleErr = errorInfo("seoDefaultTitle");
  const seoDescriptionErr = errorInfo("seoDefaultDescription");
  const currentCvErr = errorInfo("currentCvMediaId");
  const currentResumeErr = errorInfo("currentResumeMediaId");

  function renderDocumentSlot(
    slot: "cv" | "resume",
    label: string,
    help: string,
    doc: CurrentDocument | null,
    fieldErr: { messages: string[]; id: string | undefined }
  ): ReactElement {
    return (
      <div className="admin-form-row">
        <label className="admin-label">{label}</label>
        <p className="admin-muted mb-2 text-sm">{help}</p>
        {doc !== null ? (
          <div className="mb-2 rounded border border-[var(--admin-border)] p-3 text-sm">
            <p className="font-medium">{doc.title}</p>
            <p className="admin-muted mt-1">
              PDF · {formatFileSize(doc.size)}
              {doc.isActive ? "" : " · غیرفعال (در سایت عمومی نمایش داده نمی‌شود)"}
            </p>
          </div>
        ) : (
          <p className="admin-muted mb-2 text-sm">هنوز سندی انتخاب نشده است.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={saving}
            onClick={() =>
              slot === "cv" ? setCvPickerOpen(true) : setResumePickerOpen(true)
            }
          >
            انتخاب از کتابخانه
          </button>
          {doc !== null && (
            <button
              type="button"
              className="admin-btn"
              disabled={saving}
              onClick={() => clearDocument(slot)}
            >
              پاک کردن
            </button>
          )}
        </div>
        <FieldErrorList {...fieldErr} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">تنظیمات سایت</h1>
          <p className="admin-muted text-sm">
            نام برند، رنگ اصلی، سند جاری CV/رزومه، پیوندهای منو و متاداده‌های
            پیش‌فرض
          </p>
        </div>
      </div>

      {error !== null && (
        <div
          className="admin-banner-error mb-4"
          role="alert"
          aria-live="polite"
        >
          <p>{toErrorMessage(error, "ذخیره تنظیمات با خطا مواجه شد.")}</p>
        </div>
      )}

      {successNote !== null && (
        <div
          className="admin-banner-success mb-4"
          role="status"
          aria-live="polite"
        >
          <p>{successNote}</p>
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
            این تنظیمات در جایی دیگر به‌روزرسانی شده است.
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
              onClick={() => setConflictError(null)}
            >
              لغو
            </button>
          </div>
        </div>
      )}

      {summaryErrors.length > 0 && (
        <div
          className="admin-banner-error mb-4"
          role="alert"
          aria-live="polite"
        >
          <p className="font-medium">برخی فیلدها نامعتبر هستند:</p>
          <ul className="mt-1 list-disc ps-4">
            {summaryErrors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <div className="admin-card">
          <div className="admin-form-row">
            <label htmlFor="settings-brand-name" className="admin-label">
              نام برند
            </label>
            <input
              id="settings-brand-name"
              type="text"
              className="admin-input"
              value={form.brandName}
              disabled={saving}
              onChange={(event) => updateField("brandName", event.target.value)}
              aria-invalid={brandNameErr.id !== undefined}
              aria-describedby={brandNameErr.id}
            />
            <FieldErrorList {...brandNameErr} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="settings-tagline" className="admin-label">
              شعار (Tagline)
            </label>
            <input
              id="settings-tagline"
              type="text"
              className="admin-input"
              value={form.tagline}
              disabled={saving}
              onChange={(event) => updateField("tagline", event.target.value)}
              aria-invalid={taglineErr.id !== undefined}
              aria-describedby={taglineErr.id}
            />
            <FieldErrorList {...taglineErr} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="settings-footer-text" className="admin-label">
              متن فوتر
            </label>
            <textarea
              id="settings-footer-text"
              className="admin-input"
              rows={3}
              value={form.footerText}
              disabled={saving}
              onChange={(event) => updateField("footerText", event.target.value)}
              aria-invalid={footerTextErr.id !== undefined}
              aria-describedby={footerTextErr.id}
            />
            <FieldErrorList {...footerTextErr} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="settings-primary-color" className="admin-label">
              رنگ اصلی سایت
            </label>
            <div className="admin-color-row">
              <input
                id="settings-primary-color-swatch"
                type="color"
                className="admin-color-swatch"
                value={
                  isValidHexColor(form.primaryColor)
                    ? form.primaryColor
                    : FALLBACK_COLOR
                }
                disabled={saving}
                onChange={(event) =>
                  updateField("primaryColor", event.target.value)
                }
                aria-label="انتخاب رنگ اصلی"
              />
              <input
                id="settings-primary-color"
                type="text"
                dir="ltr"
                className="admin-input admin-color-text"
                value={form.primaryColor}
                disabled={saving}
                onChange={(event) =>
                  updateField("primaryColor", event.target.value)
                }
                placeholder="#2563eb"
                aria-invalid={primaryColorErr.id !== undefined}
                aria-describedby={primaryColorErr.id}
              />
            </div>
            <FieldErrorList {...primaryColorErr} />
          </div>

          {renderDocumentSlot(
            "cv",
            "سند جاری CV دانشگاهی",
            "حداکثر یک PDF فعال از کتابخانهٔ رسانه. جایگزین دانلودهای ثابت در صفحات CV می‌شود.",
            form.currentCv,
            currentCvErr
          )}

          {renderDocumentSlot(
            "resume",
            "سند جاری رزومهٔ حرفه‌ای",
            "حداکثر یک PDF فعال از کتابخانهٔ رسانه برای رزومهٔ صنعت.",
            form.currentResume,
            currentResumeErr
          )}

          <div className="admin-form-row">
            <label className="admin-label">پیوندهای ناوبری</label>
            {form.navLinks.length === 0 && (
              <p className="admin-muted mb-2 text-sm">
                هنوز پیوندی ثبت نشده است.
              </p>
            )}
            {form.navLinks.map((link, index) => (
              <div key={index} className="admin-nav-link-row">
                <div>
                  <label
                    htmlFor={`settings-nav-label-${index}`}
                    className="admin-label"
                  >
                    برچسب
                  </label>
                  <input
                    id={`settings-nav-label-${index}`}
                    type="text"
                    className="admin-input"
                    value={link.label}
                    disabled={saving}
                    onChange={(event) =>
                      updateNavLink(index, { label: event.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`settings-nav-href-${index}`}
                    className="admin-label"
                  >
                    آدرس
                  </label>
                  <input
                    id={`settings-nav-href-${index}`}
                    type="text"
                    dir="ltr"
                    className="admin-input"
                    value={link.href}
                    disabled={saving}
                    onChange={(event) =>
                      updateNavLink(index, { href: event.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`settings-nav-locale-${index}`}
                    className="admin-label"
                  >
                    زبان
                  </label>
                  <select
                    id={`settings-nav-locale-${index}`}
                    className="admin-input"
                    value={link.locale}
                    disabled={saving}
                    onChange={(event) => {
                      if (isLocale(event.target.value)) {
                        updateNavLink(index, { locale: event.target.value });
                      }
                    }}
                  >
                    <option value="fa">فارسی</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    disabled={saving}
                    onClick={() => removeNavLink(index)}
                    aria-label={`حذف پیوند ${index + 1}`}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn"
              disabled={saving || form.navLinks.length >= MAX_NAV_LINKS}
              onClick={addNavLink}
            >
              + افزودن پیوند
            </button>
            <FieldErrorList
              messages={navLinkErrors}
              id={
                navLinkErrors.length > 0
                  ? "settings-field-navLinks-error"
                  : undefined
              }
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="settings-seo-title" className="admin-label">
              عنوان پیش‌فرض SEO
            </label>
            <input
              id="settings-seo-title"
              type="text"
              className="admin-input"
              value={form.seoDefaultTitle}
              disabled={saving}
              onChange={(event) =>
                updateField("seoDefaultTitle", event.target.value)
              }
              aria-invalid={seoTitleErr.id !== undefined}
              aria-describedby={seoTitleErr.id}
            />
            <FieldErrorList {...seoTitleErr} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="settings-seo-description" className="admin-label">
              توضیح پیش‌فرض SEO
            </label>
            <textarea
              id="settings-seo-description"
              className="admin-input"
              rows={3}
              value={form.seoDefaultDescription}
              disabled={saving}
              onChange={(event) =>
                updateField("seoDefaultDescription", event.target.value)
              }
              aria-invalid={seoDescriptionErr.id !== undefined}
              aria-describedby={seoDescriptionErr.id}
            />
            <FieldErrorList {...seoDescriptionErr} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
          </button>
        </div>
      </form>

      <MediaPicker
        open={cvPickerOpen}
        onClose={() => setCvPickerOpen(false)}
        onSelect={(media) => {
          applyDocumentSelection("cv", media);
          setCvPickerOpen(false);
        }}
      />
      <MediaPicker
        open={resumePickerOpen}
        onClose={() => setResumePickerOpen(false)}
        onSelect={(media) => {
          applyDocumentSelection("resume", media);
          setResumePickerOpen(false);
        }}
      />
    </div>
  );
}
