import { useEffect, useState, type ReactElement } from "react";
import {
  fetchMediaDetail,
  fetchProjectCaseMedia,
  isApiError,
  setProjectDiagramImage,
  setProjectScreenshotImage,
  type MediaItem,
  type ProjectDiagramRow,
  type ProjectScreenshotRow,
} from "../lib/api";
import MediaPicker from "./MediaPicker";
import MediaThumb from "./MediaThumb";

interface Props {
  projectId: number;
}

type PickerTarget =
  | { kind: "diagram"; id: number }
  | { kind: "screenshot"; id: number }
  | null;

function MediaRef({ mediaId }: { mediaId: number | null }): ReactElement {
  const [item, setItem] = useState<MediaItem | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (mediaId === null) {
      setItem(null);
      return;
    }
    void fetchMediaDetail(mediaId)
      .then((row) => {
        if (!cancelled) setItem(row);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });
    return () => {
      cancelled = true;
    };
  }, [mediaId]);
  if (mediaId === null) {
    return <span className="admin-muted text-sm">بدون تصویر</span>;
  }
  if (item === null) {
    return (
      <span className="admin-muted text-sm" dir="ltr">
        Media #{mediaId}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <MediaThumb media={item} />
      <span className="text-sm" dir="ltr">
        {item.title}
      </span>
    </div>
  );
}

export default function ProjectCaseMediaEditor({
  projectId,
}: Props): ReactElement {
  const [diagrams, setDiagrams] = useState<ProjectDiagramRow[]>([]);
  const [screenshots, setScreenshots] = useState<ProjectScreenshotRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerTarget>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await fetchProjectCaseMedia(projectId);
        if (cancelled) return;
        setDiagrams(payload.diagrams);
        setScreenshots(payload.screenshots);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            isApiError(loadError)
              ? loadError.message
              : "بارگذاری دیاگرام/اسکرین‌شات ناموفق بود."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function assignDiagram(
    diagramId: number,
    mediaId: number | null
  ): Promise<void> {
    setBusyKey(`d-${diagramId}`);
    setError(null);
    try {
      const next = await setProjectDiagramImage(projectId, diagramId, mediaId);
      setDiagrams((rows) =>
        rows.map((row) => (row.id === diagramId ? next : row))
      );
    } catch (saveError) {
      setError(
        isApiError(saveError)
          ? saveError.message
          : "ذخیره تصویر دیاگرام ناموفق بود."
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function assignScreenshot(
    screenshotId: number,
    mediaId: number | null
  ): Promise<void> {
    setBusyKey(`s-${screenshotId}`);
    setError(null);
    try {
      const next = await setProjectScreenshotImage(
        projectId,
        screenshotId,
        mediaId
      );
      setScreenshots((rows) =>
        rows.map((row) => (row.id === screenshotId ? next : row))
      );
    } catch (saveError) {
      setError(
        isApiError(saveError)
          ? saveError.message
          : "ذخیره تصویر اسکرین‌شات ناموفق بود."
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="admin-card mt-6 space-y-4 p-4">
      <h2 className="text-lg font-semibold">رسانهٔ کیس‌استادی</h2>
      <p className="admin-muted text-sm">
        تصویر دیاگرام و اسکرین‌شات از کتابخانهٔ Media انتخاب می‌شود (نه Wagtail
        Images).
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        <h3 className="font-medium">دیاگرام‌ها</h3>
        {diagrams.length === 0 ? (
          <p className="admin-muted text-sm">
            هنوز دیاگرامی ثبت نشده (از Wagtail یا seed ایجاد کنید).
          </p>
        ) : (
          diagrams.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-3"
            >
              <div>
                <div className="font-medium">{row.title}</div>
                <div className="admin-muted text-xs" dir="ltr">
                  v{row.version} · {row.visibility}
                </div>
                <MediaRef mediaId={row.diagramImageId} />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busyKey === `d-${row.id}`}
                  onClick={() => setPicker({ kind: "diagram", id: row.id })}
                >
                  انتخاب Media
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={
                    busyKey === `d-${row.id}` || row.diagramImageId === null
                  }
                  onClick={() => void assignDiagram(row.id, null)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">اسکرین‌شات‌ها</h3>
        {screenshots.length === 0 ? (
          <p className="admin-muted text-sm">هنوز اسکرین‌شاتی ثبت نشده.</p>
        ) : (
          screenshots.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-3"
            >
              <div>
                <div className="font-medium">
                  {row.caption || `Screenshot #${row.id}`}
                </div>
                <div className="admin-muted text-xs" dir="ltr">
                  {row.visibility}
                </div>
                <MediaRef mediaId={row.screenshotImageId} />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busyKey === `s-${row.id}`}
                  onClick={() => setPicker({ kind: "screenshot", id: row.id })}
                >
                  انتخاب Media
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={
                    busyKey === `s-${row.id}` || row.screenshotImageId === null
                  }
                  onClick={() => void assignScreenshot(row.id, null)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(media) => {
          const target = picker;
          setPicker(null);
          if (target === null) return;
          if (target.kind === "diagram") {
            void assignDiagram(target.id, media.id);
          } else {
            void assignScreenshot(target.id, media.id);
          }
        }}
      />
    </section>
  );
}
