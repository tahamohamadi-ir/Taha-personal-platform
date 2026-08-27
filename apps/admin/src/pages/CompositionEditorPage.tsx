import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createComposition,
  fetchCompositionDetail,
  fetchCompositionSchema,
  isApiError,
  isConflict,
  updateComposition,
  type CompositionDetail,
  type CompositionFieldSpec,
  type CompositionKind,
  type CompositionLayout,
  type CompositionSchema,
  type ContentLocale,
  type ContentStatus,
  type MediaItem,
} from "../lib/api";
import MediaPicker from "../components/MediaPicker";
import ItemListField, { itemsOf } from "../components/ItemListField";
import {
  blockLabel,
  emptyBlock,
  emptySection,
  isValidKey,
  ratioLabel,
  ratioOptionsFor,
  requiredFieldsFor,
} from "../lib/composition";

interface EditorBlock {
  blockType: string;
  settings: Record<string, unknown>;
  enabled: boolean;
}

interface EditorSection {
  layout: CompositionLayout;
  ratio: string;
  enabled: boolean;
  blocks: EditorBlock[];
}

function toEditorSections(detail: CompositionDetail): EditorSection[] {
  return detail.sections.map((s) => ({
    layout: s.layout,
    ratio: s.ratio,
    enabled: s.enabled,
    blocks: s.blocks.map((b) => ({
      blockType: b.blockType,
      settings: b.settings,
      enabled: b.enabled,
    })),
  }));
}

function settingsValue(block: EditorBlock, key: string): string {
  const v = block.settings[key];
  return typeof v === "string" ? v : "";
}

function mediaIdsOf(block: EditorBlock): number[] {
  const v = block.settings.mediaIds;
  return Array.isArray(v) ? (v as number[]) : [];
}

export default function CompositionEditorPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const editing = id !== undefined && id !== "";
  const navigate = useNavigate();

  const [schema, setSchema] = useState<CompositionSchema | null>(null);
  const [key, setKey] = useState("");
  const [locale, setLocale] = useState<ContentLocale>("fa");
  const [kind, setKind] = useState<CompositionKind>("landing");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [updatedAt, setUpdatedAt] = useState("");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [mediaById, setMediaById] = useState<Record<number, MediaItem>>({});
  const [pendingMediaFor, setPendingMediaFor] = useState<{
    sectionIndex: number;
    blockIndex: number;
    key: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictError, setConflictError] = useState<unknown>(null);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cleanRef = useRef("");

  function currentSignature(): string {
    return JSON.stringify({ key, locale, title, status, sections });
  }

  function storeCleanFromDetail(detail: CompositionDetail): void {
    cleanRef.current = JSON.stringify({
      key: detail.key,
      locale: detail.locale,
      title: detail.title,
      status: detail.status,
      sections: toEditorSections(detail),
    });
    setDirty(false);
  }

  async function loadDetail(compId: number): Promise<void> {
    const detail = await fetchCompositionDetail(compId);
    setKey(detail.key);
    setKind(detail.kind);
    setLocale(detail.locale);
    setTitle(detail.title);
    setStatus(detail.status);
    setUpdatedAt(detail.updatedAt);
    setSections(toEditorSections(detail));
    storeCleanFromDetail(detail);
  }

  useEffect(() => {
    let cancelled = false;
    async function init(): Promise<void> {
      try {
        if (editing && id !== undefined) {
          const detail = await fetchCompositionDetail(Number(id));
          if (cancelled) {
            return;
          }
          const s = await fetchCompositionSchema(detail.kind);
          if (cancelled) {
            return;
          }
          setSchema(s);
          await loadDetail(Number(id));
        } else {
          const s = await fetchCompositionSchema(kind);
          if (cancelled) {
            return;
          }
          setSchema(s);
          const fresh = [emptySection()];
          setSections(fresh);
          cleanRef.current = JSON.stringify({
            key: "",
            locale: "fa",
            title: "",
            status: "draft",
            sections: fresh,
          });
          setDirty(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, id]);

  useEffect(() => {
    setDirty(currentSignature() !== cleanRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale, title, status, sections]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent): void => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (loading) {
    return <div className="admin-card p-4">در حال بارگذاری…</div>;
  }

  if (isApiError(loadError)) {
    return (
      <div className="admin-card p-4">
        <p style={{ color: "var(--admin-danger)" }}>{loadError.message}</p>
        <Link to="/composition" className="admin-btn mt-3 inline-block">
          بازگشت به فهرست
        </Link>
      </div>
    );
  }

  function markField(keyPath: string): void {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[keyPath];
      return next;
    });
  }

  function updateSection(index: number, patch: Partial<EditorSection>): void {
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[index], ...patch };
      if (patch.layout !== undefined && patch.layout !== next[index].layout) {
        const ratios = ratioOptionsFor(schema as CompositionSchema, patch.layout);
        if (!ratios.includes(section.ratio)) {
          section.ratio = ratios[0] ?? "";
        }
      }
      next[index] = section;
      return next;
    });
  }

  function addSection(): void {
    setSections((prev) => [...prev, emptySection()]);
  }

  function moveSection(index: number, dir: -1 | 1): void {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeSection(index: number): void {
    if (!window.confirm("این بخش و همهی بلوکهایش حذف شود؟")) {
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addBlock(sectionIndex: number, blockType: string): void {
    if (!blockType) {
      return;
    }
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[sectionIndex] };
      section.blocks = [...section.blocks, emptyBlock(blockType)];
      next[sectionIndex] = section;
      return next;
    });
  }

  function updateBlock(
    sectionIndex: number,
    blockIndex: number,
    patch: Partial<EditorBlock>
  ): void {
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[sectionIndex] };
      const blocks = [...section.blocks];
      blocks[blockIndex] = { ...blocks[blockIndex], ...patch };
      section.blocks = blocks;
      next[sectionIndex] = section;
      return next;
    });
  }

  function moveBlock(sectionIndex: number, blockIndex: number, dir: -1 | 1): void {
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[sectionIndex] };
      const blocks = [...section.blocks];
      const target = blockIndex + dir;
      if (target < 0 || target >= blocks.length) {
        return prev;
      }
      [blocks[blockIndex], blocks[target]] = [blocks[target], blocks[blockIndex]];
      section.blocks = blocks;
      next[sectionIndex] = section;
      return next;
    });
  }

  function removeBlock(sectionIndex: number, blockIndex: number): void {
    if (!window.confirm("این بلوک حذف شود؟")) {
      return;
    }
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[sectionIndex] };
      section.blocks = section.blocks.filter((_, i) => i !== blockIndex);
      next[sectionIndex] = section;
      return next;
    });
  }

  function setFieldValue(
    sectionIndex: number,
    blockIndex: number,
    fieldKey: string,
    value: unknown
  ): void {
    const block = sections[sectionIndex].blocks[blockIndex];
    updateBlock(sectionIndex, blockIndex, {
      settings: { ...block.settings, [fieldKey]: value },
    });
    markField(`sections[${sectionIndex}].blocks[${blockIndex}].settings`);
  }

  function openMediaPicker(
    sectionIndex: number,
    blockIndex: number,
    fieldKey: string
  ): void {
    setPendingMediaFor({ sectionIndex, blockIndex, key: fieldKey });
  }

  function onMediaSelected(media: MediaItem): void {
    if (pendingMediaFor === null) {
      return;
    }
    const { sectionIndex, blockIndex, key } = pendingMediaFor;
    setMediaById((prev) => ({ ...prev, [media.id]: media }));
    const block = sections[sectionIndex].blocks[blockIndex];
    if (key === "mediaIds") {
      const maxItems = block.blockType === "slider" ? 12 : 8;
      const current = mediaIdsOf(block);
      if (current.length >= maxItems || current.includes(media.id)) {
        setPendingMediaFor(null);
        return;
      }
      setFieldValue(sectionIndex, blockIndex, "mediaIds", [...current, media.id]);
    } else if (key === "mediaId" || key === "beforeMediaId" || key === "afterMediaId") {
      setFieldValue(sectionIndex, blockIndex, key, media.id);
    }
    setPendingMediaFor(null);
  }

  function removeMediaId(sectionIndex: number, blockIndex: number, mediaId: number): void {
    const block = sections[sectionIndex].blocks[blockIndex];
    setFieldValue(
      sectionIndex,
      blockIndex,
      "mediaIds",
      mediaIdsOf(block).filter((m) => m !== mediaId)
    );
  }

  function validateClient(): Record<string, string[]> | null {
    const errors: Record<string, string[]> = {};
    for (let i = 0; i < sections.length; i += 1) {
      for (let j = 0; j < sections[i].blocks.length; j += 1) {
        const block = sections[i].blocks[j];
        const required = requiredFieldsFor(schema ?? { blockTypes: [], sectionLayouts: [] }, block.blockType);
        if (required.length === 0) {
          continue;
        }
        const path = `sections[${i}].blocks[${j}].settings`;
        for (const fieldKey of required) {
          const value = block.settings[fieldKey];
          const missing =
            fieldKey === "mediaIds"
              ? !(Array.isArray(value) && value.length >= 1)
              : fieldKey === "mediaId" ||
                  fieldKey === "beforeMediaId" ||
                  fieldKey === "afterMediaId"
                ? typeof value !== "number"
                : fieldKey === "items"
                  ? !(Array.isArray(value) && value.length >= 1)
                  : typeof value !== "string" || value.trim() === "";
          if (missing) {
            errors[path] = [`فیلد «${fieldKey}» الزامی است.`];
            break;
          }
        }
      }
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (saving || schema === null) {
      return;
    }
    if (!isValidKey(key)) {
      setFieldErrors({ key: ["key فقط شامل حروف لاتین کوچک، عدد و خط تیره است."] });
      return;
    }
    const clientErrors = validateClient();
    if (clientErrors !== null) {
      setFieldErrors(clientErrors);
      setSaveError({
        status: 400,
        code: "VALIDATION",
        message: "برخی فیلدهای الزامی بلوکها خالیاند.",
      });
      return;
    }
    setSaving(true);
    setSaveError(null);
    setFieldErrors({});
    setConflictError(null);
    const documentPayload = {
      title,
      status,
      sections: sections.map((s) => ({
        layout: s.layout,
        ratio: s.ratio,
        enabled: s.enabled,
        blocks: s.blocks.map((b) => ({
          blockType: b.blockType,
          settings: b.settings,
          enabled: b.enabled,
        })),
      })),
    };
    try {
      if (editing && id !== undefined) {
        const updated = await updateComposition(Number(id), documentPayload, updatedAt);
        storeCleanFromDetail(updated);
      } else {
        const created = await createComposition({ key, locale, title, status, kind });
        if (sections.length > 0) {
          const updated = await updateComposition(
            created.id,
            documentPayload,
            created.updatedAt
          );
          storeCleanFromDetail(updated);
        } else {
          storeCleanFromDetail(created);
        }
      }
      navigate("/composition");
    } catch (err) {
      if (isApiError(err)) {
        if (err.fields !== undefined) {
          setFieldErrors(err.fields);
        }
        if (isConflict(err)) {
          setConflictError(err);
        } else {
          setSaveError(err);
        }
      } else {
        setSaveError(err);
      }
    } finally {
      setSaving(false);
    }
  }

  async function reloadVersion(): Promise<void> {
    if (!editing || id === undefined) {
      return;
    }
    setSaving(false);
    setConflictError(null);
    setSaveError(null);
    setFieldErrors({});
    try {
      await loadDetail(Number(id));
    } catch (err) {
      setSaveError(err);
    }
  }

  const fieldErrorAt = (path: string): string | undefined => {
    const v = fieldErrors[path];
    return v !== undefined && v.length > 0 ? v[0] : undefined;
  };

  function renderField(
    spec: CompositionFieldSpec,
    sectionIndex: number,
    blockIndex: number,
    block: EditorBlock
  ): ReactElement {
    const value = settingsValue(block, spec.key);
    const error = fieldErrorAt(
      `sections[${sectionIndex}].blocks[${blockIndex}].settings`
    );
    if (spec.type === "textarea") {
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label" htmlFor={`f-${sectionIndex}-${blockIndex}-${spec.key}`}>
            {spec.label}
          </label>
          <textarea
            id={`f-${sectionIndex}-${blockIndex}-${spec.key}`}
            className="admin-input"
            rows={4}
            dir="auto"
            value={value}
            onChange={(event) =>
              setFieldValue(sectionIndex, blockIndex, spec.key, event.target.value)
            }
          />
          {error !== undefined && <p className="admin-field-error">{error}</p>}
        </div>
      );
    }
    if (spec.type === "select") {
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label" htmlFor={`f-${sectionIndex}-${blockIndex}-${spec.key}`}>
            {spec.label}
          </label>
          <select
            id={`f-${sectionIndex}-${blockIndex}-${spec.key}`}
            className="admin-input"
            value={value}
            onChange={(event) =>
              setFieldValue(sectionIndex, blockIndex, spec.key, event.target.value)
            }
          >
            {(spec.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {error !== undefined && <p className="admin-field-error">{error}</p>}
        </div>
      );
    }
    if (spec.type === "media" || spec.type === "mediaList") {
      const mediaId =
        spec.type === "media"
          ? (block.settings[spec.key] as number | undefined)
          : undefined;
      const ids = spec.type === "mediaList" ? mediaIdsOf(block) : [];
      const maxItems = block.blockType === "slider" ? 12 : 8;
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label">{spec.label}</label>
          {spec.type === "media" && (
            <div className="flex items-center gap-2">
              {mediaId !== undefined && (
                <span className="admin-muted text-xs" dir="ltr">
                  {mediaById[mediaId] !== undefined
                    ? `${mediaById[mediaId].title} (#${mediaId})`
                    : `#${mediaId}`}
                </span>
              )}
              <button
                type="button"
                className="admin-btn"
                onClick={() => openMediaPicker(sectionIndex, blockIndex, spec.key)}
              >
                انتخاب رسانه
              </button>
              {mediaId !== undefined && (
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setFieldValue(sectionIndex, blockIndex, spec.key, null)}
                >
                  حذف
                </button>
              )}
            </div>
          )}
          {spec.type === "mediaList" && (
            <div>
              <div className="flex flex-wrap gap-2">
                {ids.map((m) => (
                  <span key={m} className="admin-muted inline-flex items-center gap-1 text-xs" dir="ltr">
                    {mediaById[m] !== undefined ? mediaById[m].title : `#${m}`}
                    <button
                      type="button"
                      className="admin-btn px-1 text-xs"
                      onClick={() => removeMediaId(sectionIndex, blockIndex, m)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="admin-btn mt-1"
                onClick={() => openMediaPicker(sectionIndex, blockIndex, "mediaIds")}
                disabled={ids.length >= maxItems}
              >
                افزودن تصویر ({ids.length}/{maxItems})
              </button>
            </div>
          )}
          {error !== undefined && <p className="admin-field-error">{error}</p>}
        </div>
      );
    }
    if (spec.type === "itemList") {
      const listItems = itemsOf(block.settings, spec.key);
      const seeded =
        listItems.length > 0
          ? listItems
          : spec.minItems === 2
            ? [{ label: "", body: "" }, { label: "", body: "" }]
            : [{ title: "", body: "" }];
      return (
        <ItemListField
          key={spec.key}
          spec={spec}
          items={seeded}
          error={error}
          onChange={(next) => setFieldValue(sectionIndex, blockIndex, spec.key, next)}
        />
      );
    }
    return (
      <div key={spec.key} className="admin-form-row">
        <label className="admin-label" htmlFor={`f-${sectionIndex}-${blockIndex}-${spec.key}`}>
          {spec.label}
        </label>
        <input
          id={`f-${sectionIndex}-${blockIndex}-${spec.key}`}
          className="admin-input"
          type={spec.type === "number" ? "number" : "text"}
          dir="ltr"
          value={value}
          onChange={(event) =>
            setFieldValue(
              sectionIndex,
              blockIndex,
              spec.key,
              spec.type === "number"
                ? event.target.value === ""
                  ? ""
                  : Number(event.target.value)
                : event.target.value
            )
          }
        />
        {error !== undefined && <p className="admin-field-error">{error}</p>}
      </div>
    );
  }

  function previewGrid(section: EditorSection): React.CSSProperties {
    if (section.layout === "1col") {
      return { display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" };
    }
    if (section.layout === "2col") {
      const map: Record<string, string> = { "1:1": "1fr 1fr", "1:2": "1fr 2fr", "2:1": "2fr 1fr" };
      return { display: "grid", gridTemplateColumns: map[section.ratio] ?? "1fr 1fr", gap: "0.5rem" };
    }
    return { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" };
  }

  function renderPreviewBlock(block: EditorBlock): ReactElement {
    const s = block.settings;
    switch (block.blockType) {
      case "hero":
        return (
          <div>
            <div className="text-base font-bold" dir="auto">{String(s.titleFa ?? "")}</div>
            <div className="text-base font-bold" dir="ltr">{String(s.titleEn ?? "")}</div>
            <p className="text-xs admin-muted" dir="auto">{String(s.leadFa ?? "")}</p>
            <p className="text-xs admin-muted" dir="ltr">{String(s.leadEn ?? "")}</p>
          </div>
        );
      case "heading": {
        const level = String(s.level ?? "h2") as "h2" | "h3" | "h4";
        return (
          <div>
            <div className="font-bold" dir="auto">{String(s.textFa ?? "")}</div>
            <div className="font-bold" dir="ltr">{String(s.textEn ?? "")}</div>
            <span className="admin-muted text-xs">({level})</span>
          </div>
        );
      }
      case "text":
        return (
          <div>
            <p className="text-sm" dir="auto">{String(s.bodyFa ?? s.body ?? "")}</p>
            {s.bodyEn !== undefined && (
              <p className="text-sm" dir="ltr">{String(s.bodyEn ?? "")}</p>
            )}
          </div>
        );
      case "quote":
        return (
          <blockquote className="border-r-2 pr-2 text-sm" dir="auto">
            {String(s.bodyFa ?? "")}
            <footer className="admin-muted text-xs">{String(s.sourceFa ?? "")}</footer>
          </blockquote>
        );
      case "cta":
        return (
          <div className="flex items-center gap-2 text-sm">
            <span dir="auto">{String(s.labelFa ?? "")}</span>
            <a className="admin-table-link" href={String(s.url ?? "")} dir="ltr">
              {String(s.url ?? "")}
            </a>
          </div>
        );
      case "gallery": {
        const ids = mediaIdsOf(block);
        return (
          <div className="flex flex-wrap gap-1">
            {ids.map((m) => (
              <span key={m} className="admin-muted text-xs" dir="ltr">
                {mediaById[m] !== undefined ? mediaById[m].title : `#${m}`}
              </span>
            ))}
          </div>
        );
      }
      case "divider":
        return <hr style={{ borderColor: "var(--admin-border)" }} />;
      default:
        return <span className="admin-muted text-xs">{block.blockType}</span>;
    }
  }

  const blockTypeOptions =
    schema?.blockTypes.map((b) => b.type) ?? [];

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{editing ? "ویرایش صفحه" : "ساخت صفحه جدید"}</h1>
          <Link to="/composition" className="admin-table-link text-sm">
            بازگشت به فهرست
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="admin-btn"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "بستن پیشنمایش" : "پیشنمایش"}
          </button>
          <button
            type="submit"
            form="composition-form"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </button>
        </div>
      </div>

      {isApiError(saveError) && (
        <div className="mt-3 rounded border px-3 py-2 text-sm" style={{ color: "var(--admin-danger)" }}>
          {saveError.message}
        </div>
      )}

      {isApiError(conflictError) && (
        <div className="mt-3 rounded border px-3 py-2 text-sm" style={{ color: "var(--admin-danger)" }}>
          این صفحه توسط شخص دیگری ویرایش شده است.
          <button type="button" className="admin-btn ml-2 text-xs" onClick={() => void reloadVersion()}>
            بارگذاری نسخه جدید
          </button>
          <Link to="/composition" className="admin-btn ml-1 text-xs">
            لغو
          </Link>
        </div>
      )}

      <form id="composition-form" onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="admin-form-row">
            <label htmlFor="comp-key" className="admin-label">
              key
            </label>
            <input
              id="comp-key"
              className="admin-input"
              dir="ltr"
              value={key}
              disabled={editing}
              onChange={(event) => setKey(event.target.value)}
            />
            {fieldErrorAt("key") !== undefined && (
              <p className="admin-field-error">{fieldErrorAt("key")}</p>
            )}
          </div>
          <div className="admin-form-row">
            <label htmlFor="comp-title" className="admin-label">
              عنوان
            </label>
            <input
              id="comp-title"
              className="admin-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="comp-locale" className="admin-label">
              زبان
            </label>
            <select
              id="comp-locale"
              className="admin-input"
              value={locale}
              disabled={editing}
              onChange={(event) => setLocale(event.target.value as ContentLocale)}
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="comp-kind" className="admin-label">
              نوع
            </label>
            <select
              id="comp-kind"
              className="admin-input"
              value={kind}
              disabled={editing}
              onChange={(event) => {
                const next = event.target.value as CompositionKind;
                setKind(next);
                void fetchCompositionSchema(next).then((s) => {
                  setSchema(s);
                  setSections([emptySection()]);
                });
              }}
            >
              <option value="landing">لندینگ</option>
              <option value="story">داستان</option>
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="comp-status" className="admin-label">
              وضعیت
            </label>
            <select
              id="comp-status"
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as ContentStatus)}
            >
              <option value="draft">پیشنویس</option>
              <option value="review">در بازبینی</option>
              <option value="published">منتشرشده</option>
              <option value="archived">بایگانی</option>
            </select>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">بخشها</h2>
            <button type="button" className="admin-btn" onClick={addSection}>
              + افزودن بخش
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="admin-section-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="admin-muted text-xs">بخش {sectionIndex + 1}</span>
                <select
                  className="admin-input w-32"
                  value={section.layout}
                  aria-label="چیدمان بخش"
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      layout: event.target.value as CompositionLayout,
                    })
                  }
                >
                  <option value="1col">۱ ستون</option>
                  <option value="2col">۲ ستون</option>
                  <option value="3col">۳ ستون</option>
                </select>
                {ratioOptionsFor(schema as CompositionSchema, section.layout).length > 0 && (
                  <select
                    className="admin-input w-32"
                    value={section.ratio}
                    aria-label="نسبت ستونها"
                    onChange={(event) =>
                      updateSection(sectionIndex, { ratio: event.target.value })
                    }
                  >
                    {ratioOptionsFor(schema as CompositionSchema, section.layout).map((r) => (
                      <option key={r} value={r}>
                        {ratioLabel(r)}
                      </option>
                    ))}
                  </select>
                )}
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(event) =>
                      updateSection(sectionIndex, { enabled: event.target.checked })
                    }
                  />
                  فعال
                </label>
                <span className="grow" />
                <button
                  type="button"
                  className="admin-btn px-2"
                  onClick={() => moveSection(sectionIndex, -1)}
                  disabled={sectionIndex === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-btn px-2"
                  onClick={() => moveSection(sectionIndex, 1)}
                  disabled={sectionIndex === sections.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-btn px-2"
                  onClick={() => removeSection(sectionIndex)}
                >
                  حذف
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {section.blocks.map((block, blockIndex) => {
                  const spec = schema?.blockTypes.find((b) => b.type === block.blockType);
                  return (
                    <div key={blockIndex} className="admin-block-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {blockLabel(schema as CompositionSchema, block.blockType)}
                        </span>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={block.enabled}
                            onChange={(event) =>
                              updateBlock(sectionIndex, blockIndex, {
                                enabled: event.target.checked,
                              })
                            }
                          />
                          فعال
                        </label>
                        <span className="grow" />
                        <button
                          type="button"
                          className="admin-btn px-2"
                          onClick={() => moveBlock(sectionIndex, blockIndex, -1)}
                          disabled={blockIndex === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-btn px-2"
                          onClick={() => moveBlock(sectionIndex, blockIndex, 1)}
                          disabled={blockIndex === section.blocks.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="admin-btn px-2"
                          onClick={() => removeBlock(sectionIndex, blockIndex)}
                        >
                          حذف
                        </button>
                      </div>
                      {(spec?.fields ?? []).map((field) =>
                        renderField(field, sectionIndex, blockIndex, block)
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center gap-2">
                  <select
                    className="admin-input w-44"
                    defaultValue=""
                    aria-label="نوع بلوک جدید"
                    id={`add-block-${sectionIndex}`}
                  >
                    <option value="" disabled>
                      نوع بلوک…
                    </option>
                    {blockTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {blockLabel(schema as CompositionSchema, t)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => {
                      const sel = document.getElementById(
                        `add-block-${sectionIndex}`
                      ) as HTMLSelectElement | null;
                      addBlock(sectionIndex, sel?.value ?? "");
                      if (sel !== null) {
                        sel.value = "";
                      }
                    }}
                  >
                    + افزودن بلوک
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>

      {showPreview && (
        <div className="admin-composer-preview mt-6">
          <h2 className="mb-2 text-sm font-bold">پیشنمایش</h2>
          <div className="space-y-4">
            {sections
              .filter((s) => s.enabled)
              .map((section, i) => (
                <div key={i} style={previewGrid(section)}>
                  {section.blocks
                    .filter((b) => b.enabled)
                    .map((b, j) => (
                      <div key={j} className="rounded border p-2" style={{ borderColor: "var(--admin-border)" }}>
                        {renderPreviewBlock(b)}
                      </div>
                    ))}
                </div>
              ))}
            {sections.filter((s) => s.enabled).length === 0 && (
              <p className="admin-muted text-sm">بخشی فعال نیست.</p>
            )}
          </div>
        </div>
      )}

      <MediaPicker
        open={pendingMediaFor !== null}
        onClose={() => setPendingMediaFor(null)}
        onSelect={onMediaSelected}
      />
    </div>
  );
}
