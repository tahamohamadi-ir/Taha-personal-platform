import { useEffect, useState, type ReactElement } from "react";
import {
  fetchAdminProfile,
  isApiError,
  updateAdminProfile,
  type AdminProfileDocument,
  type ProfileSkillRow,
} from "../lib/api";

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
        </>
      )}
    </section>
  );
}
