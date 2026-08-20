import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  createComposition,
  fetchCompositionDetail,
  fetchCompositionSchema,
  isApiError,
  isConflict,
  updateComposition,
  updateContent,
  type CompositionFieldSpec,
  type CompositionLayout,
  type CompositionSchema,
  type ContentEntity,
  type ContentLocale,
  type ContentStatus,
  type MediaItem,
} from "../lib/api";
import MediaPicker from "./MediaPicker";
import {
  blockLabel,
  emptyBlock,
  emptySection,
  ratioLabel,
  ratioOptionsFor,
  requiredFieldsFor,
} from "../lib/composition";

export type StoryContentEntity = Extract<
  ContentEntity,
  "article" | "project" | "research-topic" | "research-statement"
>;

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

const STORY_COPY: Record<StoryContentEntity, { heading: string; description: string }> = {
  article: {
    heading: "داستان مقاله",
    description:
      "بدنهٔ عمومی از بلوک‌های تک‌زبانه ساخته می‌شود. اگر داستان منتشر نشده باشد، متن غنی فعلی نمایش داده می‌شود.",
  },
  project: {
    heading: "داستان پروژه",
    description:
      "بدنهٔ عمومی از بلوک‌های تک‌زبانه ساخته می‌شود. اگر داستان منتشر نشده باشد، فیلدهای فعلی پروژه نمایش داده می‌شوند.",
  },
  "research-topic": {
    heading: "داستان موضوع پژوهشی",
    description:
      "بدنهٔ عمومی از بلوک‌های تک‌زبانه ساخته می‌شود. اگر داستان منتشر نشده باشد، فیلدهای فعلی موضوع نمایش داده می‌شوند.",
  },
  "research-statement": {
    heading: "داستان بیانیه پژوهشی",
    description:
      "بدنهٔ عمومی از بلوک‌های تک‌زبانه ساخته می‌شود. اگر داستان منتشر نشده باشد، متن غنی فعلی نمایش داده می‌شود.",
  },
};

export interface EntityStoryEditorProps {
  entity: StoryContentEntity;
  entityId: number;
  locale: ContentLocale;
  title: string;
  storyId: number | null;
  entityUpdatedAt: string;
  onEntityUpdated: (next: { storyId: number; updatedAt: string }) => void;
  /** Override composition key (e.g. profile experience slug). */
  compositionKey?: string;
  /** Custom attach path (profile experience) instead of content PUT. */
  attachStory?: (storyId: number) => Promise<{ updatedAt?: string } | void>;
  heading?: string;
  description?: string;
}

/** @deprecated Prefer EntityStoryEditor; kept for call-site compatibility. */
export type ArticleStoryEditorProps = Omit<EntityStoryEditorProps, "entity" | "entityId" | "entityUpdatedAt" | "onEntityUpdated"> & {
  articleId: number;
  articleUpdatedAt: string;
  onArticleUpdated: (next: { storyId: number; updatedAt: string }) => void;
};

function toEditorSections(detail: {
  sections: Array<{
    layout: CompositionLayout;
    ratio: string;
    enabled: boolean;
    blocks: Array<{
      blockType: string;
      settings: Record<string, unknown>;
      enabled: boolean;
    }>;
  }>;
}): EditorSection[] {
  return detail.sections.map((section) => ({
    layout: section.layout,
    ratio: section.ratio,
    enabled: section.enabled,
    blocks: section.blocks.map((block) => ({
      blockType: block.blockType,
      settings: block.settings,
      enabled: block.enabled,
    })),
  }));
}

export default function EntityStoryEditor({
  entity,
  entityId,
  locale,
  title,
  storyId,
  entityUpdatedAt,
  onEntityUpdated,
  compositionKey,
  attachStory,
  heading,
  description,
}: EntityStoryEditorProps): ReactElement {
  const copy = STORY_COPY[entity];
  const headingText = heading ?? copy.heading;
  const descriptionText = description ?? copy.description;
  const headingId = `${entity}-story-heading`;
  const statusId = `${entity}-story-status`;
  const [schema, setSchema] = useState<CompositionSchema | null>(null);
  const [pageId, setPageId] = useState<number | null>(storyId);
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
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const nextSchema = await fetchCompositionSchema("story");
        if (cancelled) {
          return;
        }
        setSchema(nextSchema);
        if (storyId !== null) {
          const detail = await fetchCompositionDetail(storyId);
          if (cancelled) {
            return;
          }
          setPageId(detail.id);
          setStatus(detail.status);
          setUpdatedAt(detail.updatedAt);
          setSections(toEditorSections(detail));
        } else {
          setPageId(null);
          setSections([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(isApiError(err) ? err.message : "بارگذاری داستان ناموفق بود.");
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
  }, [storyId]);

  async function createStory(): Promise<void> {
    setCreating(true);
    setError(null);
    try {
      const key =
        compositionKey ??
        `${entity}-${entityId}-story`;
      const created = await createComposition({
        key,
        locale,
        title: title.trim() || `${entity}-${entityId}`,
        status: "draft",
        kind: "story",
      });
      let nextUpdatedAt = entityUpdatedAt;
      if (attachStory) {
        const attached = await attachStory(created.id);
        if (attached?.updatedAt) {
          nextUpdatedAt = attached.updatedAt;
        }
      } else {
        const updated = await updateContent(
          entity,
          entityId,
          { fields: { storyId: created.id } },
          entityUpdatedAt
        );
        nextUpdatedAt = updated.updatedAt;
      }
      setPageId(created.id);
      setStatus(created.status);
      setUpdatedAt(created.updatedAt);
      setSections(created.sections.length > 0 ? toEditorSections(created) : [emptySection()]);
      onEntityUpdated({ storyId: created.id, updatedAt: nextUpdatedAt });
    } catch (err) {
      setError(isApiError(err) ? err.message : "ساخت داستان ناموفق بود.");
    } finally {
      setCreating(false);
    }
  }

  function updateSection(index: number, patch: Partial<EditorSection>): void {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, ...patch } : section))
    );
  }

  function updateBlock(
    sectionIndex: number,
    blockIndex: number,
    patch: Partial<EditorBlock>
  ): void {
    setSections((prev) =>
      prev.map((section, i) =>
        i !== sectionIndex
          ? section
          : {
              ...section,
              blocks: section.blocks.map((block, j) =>
                j !== blockIndex ? block : { ...block, ...patch }
              ),
            }
      )
    );
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
  }

  function onMediaSelected(media: MediaItem): void {
    if (pendingMediaFor === null) {
      return;
    }
    const { sectionIndex, blockIndex, key } = pendingMediaFor;
    setMediaById((prev) => ({ ...prev, [media.id]: media }));
    if (key === "mediaId") {
      setFieldValue(sectionIndex, blockIndex, "mediaId", media.id);
    } else if (key === "mediaIds") {
      const current = sections[sectionIndex].blocks[blockIndex].settings.mediaIds;
      const ids = Array.isArray(current) ? (current as number[]) : [];
      if (ids.length < 8 && !ids.includes(media.id)) {
        setFieldValue(sectionIndex, blockIndex, "mediaIds", [...ids, media.id]);
      }
    }
    setPendingMediaFor(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pageId === null || schema === null) {
      return;
    }
    const errors: string[] = [];
    sections.forEach((section, i) => {
      section.blocks.forEach((block, j) => {
        for (const fieldKey of requiredFieldsFor(schema, block.blockType)) {
          const value = block.settings[fieldKey];
          const missing =
            fieldKey === "mediaIds"
              ? !(Array.isArray(value) && value.length >= 1)
              : fieldKey === "mediaId"
                ? typeof value !== "number"
                : typeof value !== "string" || value.trim() === "";
          if (missing) {
            errors.push(`بخش ${i + 1} بلوک ${j + 1}: ${fieldKey}`);
          }
        }
      });
    });
    if (errors.length > 0) {
      setError(`فیلدهای الزامی خالی‌اند: ${errors[0]}`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateComposition(
        pageId,
        {
          status,
          sections: sections.map((section) => ({
            layout: section.layout,
            ratio: section.ratio,
            enabled: section.enabled,
            blocks: section.blocks.map((block) => ({
              blockType: block.blockType,
              settings: block.settings,
              enabled: block.enabled,
            })),
          })),
        },
        updatedAt
      );
      setUpdatedAt(updated.updatedAt);
      setStatus(updated.status);
      setSections(toEditorSections(updated));
    } catch (err) {
      if (isConflict(err)) {
        setError("داستان هم‌زمان ویرایش شده است. صفحه را دوباره بارگذاری کنید.");
      } else {
        setError(isApiError(err) ? err.message : "ذخیره داستان ناموفق بود.");
      }
    } finally {
      setSaving(false);
    }
  }

  function renderField(
    spec: CompositionFieldSpec,
    sectionIndex: number,
    blockIndex: number,
    block: EditorBlock
  ): ReactElement {
    const raw = block.settings[spec.key];
    const value = typeof raw === "string" ? raw : "";
    if (spec.type === "textarea") {
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label">{spec.label}</label>
          <textarea
            className="admin-input"
            rows={4}
            dir="auto"
            value={value}
            onChange={(event) =>
              setFieldValue(sectionIndex, blockIndex, spec.key, event.target.value)
            }
          />
        </div>
      );
    }
    if (spec.type === "select") {
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label">{spec.label}</label>
          <select
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
        </div>
      );
    }
    if (spec.type === "media" || spec.type === "mediaList") {
      const mediaId = spec.type === "media" ? (block.settings.mediaId as number | undefined) : undefined;
      const ids = spec.type === "mediaList" && Array.isArray(block.settings.mediaIds)
        ? (block.settings.mediaIds as number[])
        : [];
      return (
        <div key={spec.key} className="admin-form-row">
          <label className="admin-label">{spec.label}</label>
          {spec.type === "media" && (
            <div className="flex items-center gap-2">
              {mediaId !== undefined && (
                <span className="admin-muted text-xs" dir="ltr">
                  {mediaById[mediaId]?.title ?? `#${mediaId}`}
                </span>
              )}
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  setPendingMediaFor({ sectionIndex, blockIndex, key: "mediaId" })
                }
              >
                انتخاب رسانه
              </button>
            </div>
          )}
          {spec.type === "mediaList" && (
            <div>
              <div className="flex flex-wrap gap-2">
                {ids.map((id) => (
                  <span key={id} className="admin-muted text-xs" dir="ltr">
                    {mediaById[id]?.title ?? `#${id}`}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="admin-btn mt-1"
                onClick={() =>
                  setPendingMediaFor({ sectionIndex, blockIndex, key: "mediaIds" })
                }
              >
                افزودن رسانه
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div key={spec.key} className="admin-form-row">
        <label className="admin-label">{spec.label}</label>
        <input
          className="admin-input"
          dir="auto"
          value={value}
          onChange={(event) =>
            setFieldValue(sectionIndex, blockIndex, spec.key, event.target.value)
          }
        />
      </div>
    );
  }

  return (
    <section className="admin-card mt-4" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-sm font-bold">
        {headingText}
      </h2>
      <p className="admin-muted mt-1 text-xs">
        {descriptionText}
      </p>
      {error !== null && (
        <p className="mt-2 text-sm" style={{ color: "var(--admin-danger)" }}>
          {error}
        </p>
      )}
      {loading ? (
        <p className="admin-muted mt-3 text-sm">در حال بارگذاری…</p>
      ) : pageId === null ? (
        <button
          type="button"
          className="admin-btn admin-btn-primary mt-3"
          disabled={creating}
          onClick={() => void createStory()}
        >
          {creating ? "در حال ساخت…" : "ایجاد داستان"}
        </button>
      ) : schema === null ? null : (
        <form className="mt-3 space-y-4" onSubmit={(event) => void handleSave(event)}>
          <div className="admin-form-row">
            <label className="admin-label" htmlFor={statusId}>
              وضعیت داستان
            </label>
            <select
              id={statusId}
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as ContentStatus)}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="review">در بازبینی</option>
              <option value="published">منتشرشده</option>
              <option value="archived">بایگانی</option>
            </select>
          </div>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="admin-section-card">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="admin-input w-32"
                  value={section.layout}
                  aria-label="چیدمان بخش"
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      layout: event.target.value as CompositionLayout,
                      ratio: "",
                    })
                  }
                >
                  <option value="1col">۱ ستون</option>
                  <option value="2col">۲ ستون</option>
                  <option value="3col">۳ ستون</option>
                </select>
                {ratioOptionsFor(schema, section.layout).length > 0 && (
                  <select
                    className="admin-input w-32"
                    value={section.ratio}
                    aria-label="نسبت ستون‌ها"
                    onChange={(event) =>
                      updateSection(sectionIndex, { ratio: event.target.value })
                    }
                  >
                    {ratioOptionsFor(schema, section.layout).map((ratio) => (
                      <option key={ratio} value={ratio}>
                        {ratioLabel(ratio)}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() =>
                    updateSection(sectionIndex, {
                      blocks: [
                        ...section.blocks,
                        emptyBlock(schema.blockTypes[0]?.type ?? "text"),
                      ],
                    })
                  }
                >
                  + بلوک
                </button>
              </div>
              {section.blocks.map((block, blockIndex) => {
                const spec = schema.blockTypes.find((item) => item.type === block.blockType);
                return (
                  <div key={blockIndex} className="mt-3 rounded border p-2">
                    <select
                      className="admin-input mb-2"
                      value={block.blockType}
                      onChange={(event) =>
                        updateBlock(sectionIndex, blockIndex, {
                          blockType: event.target.value,
                          settings: {},
                        })
                      }
                    >
                      {schema.blockTypes.map((item) => (
                        <option key={item.type} value={item.type}>
                          {blockLabel(schema, item.type)}
                        </option>
                      ))}
                    </select>
                    {(spec?.fields ?? []).map((field) =>
                      renderField(field, sectionIndex, blockIndex, block)
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <button
            type="button"
            className="admin-btn"
            onClick={() => setSections((prev) => [...prev, emptySection()])}
          >
            + بخش
          </button>
          <div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "در حال ذخیره…" : "ذخیره داستان"}
            </button>
          </div>
        </form>
      )}
      <MediaPicker
        open={pendingMediaFor !== null}
        onClose={() => setPendingMediaFor(null)}
        onSelect={onMediaSelected}
      />
    </section>
  );
}
