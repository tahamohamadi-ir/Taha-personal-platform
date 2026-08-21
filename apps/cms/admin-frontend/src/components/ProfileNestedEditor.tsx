import { useEffect, useState, type ReactElement } from "react";
import {
  fetchAdminProfile,
  isApiError,
  updateAdminProfile,
  type AdminProfileDocument,
  type ContentLocale,
  type ProfileExperienceRow,
  type ProfileSkillRow,
} from "../lib/api";
import { isContentLocale } from "../lib/entities";
import EntityStoryEditor from "./ArticleStoryEditor";

interface Props {
  locale: string;
  slug: string;
}

function emptySkill(): ProfileSkillRow {
  return { category: "", name: "", source: "" };
}

export default function ProfileNestedEditor({
  locale,
  slug,
}: Props): ReactElement {
  const [document, setDocument] = useState<AdminProfileDocument | null>(null);
  const [skills, setSkills] = useState<ProfileSkillRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await fetchAdminProfile(locale, slug);
        if (cancelled) return;
        setDocument(payload);
        setSkills(
          payload.skills.length > 0 ? payload.skills : [emptySkill()]
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            isApiError(loadError)
              ? loadError.message
              : "بارگذاری مهارت‌ها ناموفق بود."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, slug]);

  async function save(): Promise<void> {
    if (document === null) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const cleaned = skills.filter(
      (row) => row.category.trim() && row.name.trim() && row.source.trim()
    );
    try {
      const next = await updateAdminProfile(
        locale,
        slug,
        { ...document, skills: cleaned },
        document.revision
      );
      setDocument(next);
      setSkills(next.skills.length > 0 ? next.skills : [emptySkill()]);
      setSaved(true);
    } catch (saveError) {
      setError(
        isApiError(saveError)
          ? saveError.message
          : "ذخیره مهارت‌ها ناموفق بود."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateSkill(
    index: number,
    key: keyof ProfileSkillRow,
    value: string
  ): void {
    setSkills((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  }

  async function attachExperienceStory(
    experienceIndex: number,
    storyId: number
  ): Promise<{ updatedAt?: string }> {
    if (document === null) {
      throw new Error("Profile document is not loaded.");
    }
    const experience = document.experience.map((row, index) =>
      index === experienceIndex ? { ...row, storyId } : row
    );
    const cleanedSkills = skills.filter(
      (row) => row.category.trim() && row.name.trim() && row.source.trim()
    );
    const next = await updateAdminProfile(
      locale,
      slug,
      { ...document, skills: cleanedSkills, experience },
      document.revision
    );
    setDocument(next);
    setSkills(next.skills.length > 0 ? next.skills : [emptySkill()]);
    return {};
  }

  const contentLocale: ContentLocale | null = isContentLocale(locale)
    ? locale
    : null;
  const experienceRows: ProfileExperienceRow[] = document?.experience ?? [];

  return (
    <section className="mt-8 border-t border-[var(--admin-border)] pt-6">
      <h2 className="mb-1 text-lg font-bold">مهارت‌ها و بخش‌های تو در تو</h2>
      <p className="admin-muted mb-4 text-sm">
        ذخیره این بخش همهٔ آرایه‌های پروفایل (مهارت، تجربه، تحصیل و …) را با هم
        می‌نویسد تا چیزی پاک نشود.
      </p>
      {error !== null && (
        <div className="admin-banner-error mb-3" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <p className="mb-3 text-sm text-green-700" role="status">
          مهارت‌ها ذخیره شد.
        </p>
      )}
      {document === null && error === null ? (
        <p className="admin-muted">در حال بارگذاری…</p>
      ) : (
        <>
          <div className="space-y-3">
            {skills.map((row, index) => (
              <div
                key={`skill-${index}`}
                className="grid gap-2 rounded border border-[var(--admin-border)] p-3 md:grid-cols-3"
              >
                <label className="admin-form-row">
                  <span className="admin-label">دسته</span>
                  <input
                    className="admin-input"
                    value={row.category}
                    onChange={(event) =>
                      updateSkill(index, "category", event.target.value)
                    }
                  />
                </label>
                <label className="admin-form-row">
                  <span className="admin-label">نام</span>
                  <input
                    className="admin-input"
                    value={row.name}
                    onChange={(event) =>
                      updateSkill(index, "name", event.target.value)
                    }
                  />
                </label>
                <label className="admin-form-row">
                  <span className="admin-label">منبع</span>
                  <input
                    className="admin-input"
                    value={row.source}
                    onChange={(event) =>
                      updateSkill(index, "source", event.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() =>
                    setSkills((current) =>
                      current.filter((_, rowIndex) => rowIndex !== index)
                    )
                  }
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-btn"
              onClick={() => setSkills((current) => [...current, emptySkill()])}
            >
              + مهارت
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={saving || document === null}
              onClick={() => void save()}
            >
              {saving ? "در حال ذخیره…" : "ذخیره مهارت‌ها"}
            </button>
          </div>

          {contentLocale !== null && experienceRows.length > 0 ? (
            <div className="mt-8 space-y-4">
              <h3 className="text-base font-bold">داستان تجربه</h3>
              <p className="admin-muted text-sm">
                برای ردیف‌هایی که slug دارند می‌توانید داستان ترکیبی بسازید. بدون
                slug ابتدا در ویرایشگر پروفایل slug و جزئیات را ذخیره کنید.
              </p>
              {experienceRows.map((row, index) => {
                const experienceSlug = (row.slug ?? "").trim();
                const storyId =
                  typeof row.storyId === "number" && Number.isFinite(row.storyId)
                    ? row.storyId
                    : null;
                if (!experienceSlug) {
                  return (
                    <p key={`exp-story-${index}`} className="admin-muted text-sm">
                      {row.role} @ {row.organization}: بدون slug — داستان در دسترس
                      نیست.
                    </p>
                  );
                }
                return (
                  <EntityStoryEditor
                    key={`exp-story-${index}-${storyId ?? "new"}`}
                    entity="article"
                    entityId={index + 1}
                    locale={contentLocale}
                    title={`${row.role} — ${row.organization}`}
                    storyId={storyId}
                    entityUpdatedAt={String(document?.revision ?? 0)}
                    compositionKey={`profile-${locale}-experience-${experienceSlug}-story`}
                    heading={`داستان تجربه: ${row.role}`}
                    description="بدنهٔ عمومی تجربه از بلوک‌های تک‌زبانه؛ در غیر این صورت detailBody نمایش داده می‌شود."
                    attachStory={(nextStoryId) =>
                      attachExperienceStory(index, nextStoryId)
                    }
                    onEntityUpdated={(next) => {
                      setDocument((current) => {
                        if (current === null) return current;
                        return {
                          ...current,
                          experience: current.experience.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, storyId: next.storyId }
                              : item
                          ),
                        };
                      });
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
