// Presentation section of the media edit drawer (Track AF-03).
// Contract source of truth: apps/cms/apps/api/admin_media_ext.py (FROZEN — AF
// consumes, never redefines). The frozen AB-04 contract is write-only (PATCH
// + licenses; no presentation READ endpoint), so the section starts from an
// unknown server state, tracks which fields the user edited this session and
// PATCHes exactly that changed subset; explicit nulls clear nullable fields
// server-side. The SPA is fa-first single-dir (index.html dir="rtl"), so the
// locale fields render stacked with fa/en lang labels (drawer precedent).

import { useEffect, useState, type ReactElement } from "react";
import {
  fetchMediaDetail,
  isApiError,
  type ContentLocale,
  type MediaItem,
} from "../lib/api";
import {
  getMediaLicenses,
  updateMediaPresentation,
  type MediaLicenseRow,
  type MediaPresentationPatch,
} from "../lib/adminApiExt";
import { fieldTokenMessage, tRedesign } from "../i18n/redesign";
import MediaFocalPicker, {
  type FocalAxis,
  type FocalPoint,
} from "./MediaFocalPicker";
import RevisionConflictDialog from "../pages/HomeComposer/RevisionConflictDialog";

// fa-first single-dir admin (redesign.ts docstring); en dictionary exists for
// the i18n parity gate.
const LOCALE: ContentLocale = "fa";

// admin_media_ext.py CAPTION_MAX (Media.caption_* CharField bound).
const CAPTION_MAX = 300;

type PresentationField =
  | "focal_x"
  | "focal_y"
  | "rights_statement_fa"
  | "rights_statement_en"
  | "license_id"
  | "caption_fa"
  | "caption_en";

const PRESENTATION_FIELDS: readonly PresentationField[] = [
  "focal_x",
  "focal_y",
  "rights_statement_fa",
  "rights_statement_en",
  "license_id",
  "caption_fa",
  "caption_en",
];

/** Draft keyed by the API field names; unknown server state = null / "". */
interface PresentationDraft {
  focal_x: number | null;
  focal_y: number | null;
  rights_statement_fa: string;
  rights_statement_en: string;
  license_id: number | null;
  caption_fa: string;
  caption_en: string;
}

const EMPTY_DRAFT: PresentationDraft = {
  focal_x: null,
  focal_y: null,
  rights_statement_fa: "",
  rights_statement_en: "",
  license_id: null,
  caption_fa: "",
  caption_en: "",
};

function toErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
}

interface MediaPresentationSectionProps {
  media: MediaItem;
  /** Current If-Match revision (the drawer keeps it fresh across endpoints). */
  revision: string;
  onRevisionChange: (updatedAt: string) => void;
  /** Lets the host gate its own Escape handling while the dialog is open. */
  onConflictOpenChange?: (open: boolean) => void;
}

export default function MediaPresentationSection({
  media,
  revision,
  onRevisionChange,
  onConflictOpenChange,
}: MediaPresentationSectionProps): ReactElement {
  const t = (key: string): string => tRedesign(LOCALE, key);
  const [draft, setDraft] = useState<PresentationDraft>(EMPTY_DRAFT);
  const [touched, setTouched] = useState<ReadonlySet<PresentationField>>(
    new Set()
  );
  const [licenses, setLicenses] = useState<MediaLicenseRow[] | null>(null);
  const [licensesError, setLicensesError] = useState(false);
  const [licensesReloadKey, setLicensesReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictOpen, setConflictOpen] = useState(false);

  useEffect(() => {
    setDraft(EMPTY_DRAFT);
    setTouched(new Set());
    setSaving(false);
    setSaved(false);
    setError(null);
    setFieldErrors({});
    setConflictOpen(false);
    onConflictOpenChange?.(false);
  }, [media.id]);

  useEffect(() => {
    if (!saved) {
      return;
    }
    const timer = window.setTimeout(() => setSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    let cancelled = false;
    getMediaLicenses()
      .then((rows) => {
        if (!cancelled) {
          setLicenses(rows);
          setLicensesError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLicensesError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [licensesReloadKey]);

  function markTouched(fields: readonly PresentationField[]): void {
    setTouched((prev) => {
      const next = new Set(prev);
      for (const field of fields) {
        next.add(field);
      }
      return next;
    });
  }

  function editField<K extends keyof PresentationDraft>(
    field: K,
    value: PresentationDraft[K]
  ): void {
    setDraft((prev) => ({ ...prev, [field]: value }));
    markTouched([field as PresentationField]);
    setSaved(false);
  }

  function handleFocalChange(next: FocalPoint, axes: FocalAxis[]): void {
    setDraft((prev) => ({
      ...prev,
      focal_x: next.x,
      focal_y: next.y,
    }));
    markTouched(
      axes.map(
        (axis): PresentationField => (axis === "x" ? "focal_x" : "focal_y")
      )
    );
    setSaved(false);
  }

  function clearFocal(): void {
    setDraft((prev) => ({ ...prev, focal_x: null, focal_y: null }));
    markTouched(["focal_x", "focal_y"]);
    setSaved(false);
  }

  function openConflict(): void {
    setConflictOpen(true);
    onConflictOpenChange?.(true);
  }

  function closeConflict(): void {
    setConflictOpen(false);
    onConflictOpenChange?.(false);
  }

  const hasChanges = touched.size > 0;

  async function handleSave(): Promise<void> {
    if (saving || !hasChanges) {
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    const patch: MediaPresentationPatch = {};
    if (touched.has("focal_x")) {
      patch.focal_x = draft.focal_x;
    }
    if (touched.has("focal_y")) {
      patch.focal_y = draft.focal_y;
    }
    if (touched.has("rights_statement_fa")) {
      patch.rights_statement_fa = draft.rights_statement_fa;
    }
    if (touched.has("rights_statement_en")) {
      patch.rights_statement_en = draft.rights_statement_en;
    }
    if (touched.has("license_id")) {
      patch.license_id = draft.license_id;
    }
    if (touched.has("caption_fa")) {
      patch.caption_fa = draft.caption_fa;
    }
    if (touched.has("caption_en")) {
      patch.caption_en = draft.caption_en;
    }
    try {
      const result = await updateMediaPresentation(media.id, patch, revision);
      onRevisionChange(result.updatedAt);
      setTouched(new Set());
      setSaved(true);
    } catch (err) {
      if (isApiError(err) && err.code === "STALE_REVISION") {
        openConflict();
      } else if (isApiError(err) && err.status === 400 && err.code === "VALIDATION") {
        setFieldErrors(err.fields ?? {});
      } else {
        setError(err);
      }
    } finally {
      setSaving(false);
    }
  }

  // 409 recovery: the frozen contract exposes no presentation read state, so
  // "reload" refreshes the If-Match revision from the media row and keeps the
  // session's draft edits for retry.
  async function reloadRevision(): Promise<void> {
    closeConflict();
    setError(null);
    try {
      const fresh = await fetchMediaDetail(media.id);
      onRevisionChange(fresh.updatedAt);
    } catch (err) {
      setError(err);
    }
  }

  function renderFieldErrors(field: string): ReactElement | null {
    const messages = (fieldErrors[field] ?? []).map((token) =>
      fieldTokenMessage(LOCALE, token)
    );
    if (messages.length === 0) {
      return null;
    }
    return (
      <ul className="admin-field-error" aria-live="polite">
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    );
  }

  const strayErrors = Object.entries(fieldErrors)
    .filter(([key]) => !PRESENTATION_FIELDS.includes(key as PresentationField))
    .flatMap(([, tokens]) =>
      tokens.map((token) => fieldTokenMessage(LOCALE, token))
    );

  const isImage = media.mime.startsWith("image/");
  const focalSet = draft.focal_x !== null || draft.focal_y !== null;

  return (
    <section
      className="admin-section-card mt-4"
      aria-labelledby="media-presentation-title"
    >
      <h3 id="media-presentation-title" className="mb-3 text-sm font-bold">
        {t("redesign.media.presentation")}
      </h3>

      {saved && (
        <div className="admin-banner-success mb-3" role="status">
          {t("redesign.media.presentationSaved")}
        </div>
      )}

      {error !== null && (
        <div className="admin-banner-error mb-3" role="alert">
          <p>{toErrorMessage(error, t("redesign.home.saveFailed"))}</p>
        </div>
      )}

      {isImage && media.url !== null && (
        <div className="admin-form-row">
          <span className="admin-label">{t("redesign.media.focal")}</span>
          <MediaFocalPicker
            locale={LOCALE}
            url={media.url}
            focal={{ x: draft.focal_x, y: draft.focal_y }}
            disabled={saving}
            onChange={handleFocalChange}
          />
          {focalSet && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary mt-2 text-xs"
              disabled={saving}
              onClick={clearFocal}
            >
              {t("redesign.media.focalClear")}
            </button>
          )}
          {renderFieldErrors("focal_x")}
          {renderFieldErrors("focal_y")}
        </div>
      )}

      <h4 className="mb-3 mt-1 text-sm font-semibold">
        {t("redesign.media.rights")}
      </h4>

      <div className="admin-form-row">
        <label htmlFor="media-presentation-rights-fa" className="admin-label">
          {t("redesign.media.rightsFa")}
        </label>
        <textarea
          id="media-presentation-rights-fa"
          className="admin-input"
          rows={3}
          value={draft.rights_statement_fa}
          disabled={saving}
          onChange={(event) =>
            editField("rights_statement_fa", event.target.value)
          }
        />
        {renderFieldErrors("rights_statement_fa")}
      </div>

      <div className="admin-form-row">
        <label htmlFor="media-presentation-rights-en" className="admin-label">
          {t("redesign.media.rightsEn")}
        </label>
        <textarea
          id="media-presentation-rights-en"
          className="admin-input"
          rows={3}
          dir="ltr"
          value={draft.rights_statement_en}
          disabled={saving}
          onChange={(event) =>
            editField("rights_statement_en", event.target.value)
          }
        />
        {renderFieldErrors("rights_statement_en")}
      </div>

      <div className="admin-form-row">
        <label htmlFor="media-presentation-licence" className="admin-label">
          {t("redesign.media.licence")}
        </label>
        {licensesError ? (
          <div>
            <p className="text-sm" role="alert">
              {t("redesign.media.licenceFailed")}
            </p>
            <button
              type="button"
              className="admin-btn mt-2 text-xs"
              onClick={() => setLicensesReloadKey((key) => key + 1)}
            >
              {t("redesign.home.retry")}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="media-presentation-licence"
              className={`admin-input ${
                draft.license_id === null ? "opacity-60" : ""
              }`}
              value={draft.license_id === null ? "" : String(draft.license_id)}
              disabled={saving || licenses === null}
              onChange={(event) => {
                const raw = event.target.value;
                editField("license_id", raw === "" ? null : Number(raw));
              }}
            >
              <option value="">{t("redesign.media.licenceEmpty")}</option>
              {(licenses ?? []).map((row) => (
                <option key={row.id} value={String(row.id)}>
                  {row.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-btn admin-btn-secondary text-xs"
              disabled={saving || draft.license_id === null}
              onClick={() => editField("license_id", null)}
            >
              {t("redesign.media.licenceClear")}
            </button>
          </div>
        )}
        {renderFieldErrors("license_id")}
      </div>

      <div className="admin-form-row">
        <label htmlFor="media-presentation-caption-fa" className="admin-label">
          {t("redesign.media.captionFa")}
        </label>
        <input
          id="media-presentation-caption-fa"
          type="text"
          className="admin-input"
          maxLength={CAPTION_MAX}
          value={draft.caption_fa}
          disabled={saving}
          onChange={(event) => editField("caption_fa", event.target.value)}
        />
        {renderFieldErrors("caption_fa")}
      </div>

      <div className="admin-form-row">
        <label htmlFor="media-presentation-caption-en" className="admin-label">
          {t("redesign.media.captionEn")}
        </label>
        <input
          id="media-presentation-caption-en"
          type="text"
          className="admin-input"
          dir="ltr"
          maxLength={CAPTION_MAX}
          value={draft.caption_en}
          disabled={saving}
          onChange={(event) => editField("caption_en", event.target.value)}
        />
        {renderFieldErrors("caption_en")}
      </div>

      {strayErrors.length > 0 && (
        <ul className="admin-field-error mb-2" role="alert">
          {strayErrors.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}

      <div className="admin-action-row">
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={!hasChanges || saving}
          onClick={() => void handleSave()}
        >
          {saving ? t("redesign.home.saving") : t("redesign.home.save")}
        </button>
      </div>

      <RevisionConflictDialog
        open={conflictOpen}
        title={t("redesign.conflict.title")}
        body={t("redesign.media.conflictBody")}
        reloadLabel={t("redesign.conflict.reload")}
        keepMineLabel={t("redesign.conflict.keepMine")}
        idPrefix="media-presentation-conflict"
        onReload={() => void reloadRevision()}
        onKeepMine={closeConflict}
      />
    </section>
  );
}
