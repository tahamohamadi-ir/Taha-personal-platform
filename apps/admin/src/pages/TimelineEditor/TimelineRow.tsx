// One inline-editable timeline row (Track AF-02). Leaf component: local UI
// state only for the weight text; all content lives in the screen's pure
// reducer draft. ▲▼ move buttons render exclusively in reorder mode.

import { type ReactElement } from "react";
import {
  TIMELINE_TYPES,
  TIMELINE_WEIGHT_MAX,
  type TimelineRecord,
} from "../../lib/adminApiExt";
import type { TimelineRowValues } from "./reducer";

interface TimelineRowProps {
  row: TimelineRecord;
  index: number;
  total: number;
  dirty: boolean;
  saving: boolean;
  reorderMode: boolean;
  savingOrder: boolean;
  tokens: string[];
  t: (key: string) => string;
  typeLabel: (type: TimelineRecord["type"]) => string;
  tokenMessage: (token: string) => string;
  onChange: (patch: Partial<TimelineRowValues>) => void;
  onSave: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

export default function TimelineRow({
  row,
  index,
  total,
  dirty,
  saving,
  reorderMode,
  savingOrder,
  tokens,
  t,
  typeLabel,
  tokenMessage,
  onChange,
  onSave,
  onDelete,
  onMove,
}: TimelineRowProps): ReactElement {
  const id = String(row.id);
  return (
    <div
      className="admin-section-card"
      style={
        dirty && !reorderMode
          ? { borderColor: "var(--admin-accent)" }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="admin-muted text-xs" aria-hidden="true">
          {index + 1}
        </span>
        <span className="admin-muted text-xs" title={row.updatedAt}>
          #{id}
        </span>

        <div>
          <label htmlFor={`timeline-type-${id}`} className="admin-label mb-1">
            {t("redesign.timeline.column.type")}
          </label>
          <select
            id={`timeline-type-${id}`}
            className="admin-input"
            value={row.type}
            disabled={reorderMode}
            onChange={(event) => {
              const next = event.target.value;
              if (TIMELINE_TYPES.some((candidate) => candidate === next)) {
                onChange({ type: next as (typeof TIMELINE_TYPES)[number] });
              }
            }}
          >
            {TIMELINE_TYPES.map((candidate) => (
              <option key={candidate} value={candidate}>
                {typeLabel(candidate)}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48 flex-1">
          <label htmlFor={`timeline-label-${id}`} className="admin-label mb-1">
            {t("redesign.timeline.column.label")}
          </label>
          <input
            id={`timeline-label-${id}`}
            className="admin-input"
            type="text"
            value={row.label}
            disabled={reorderMode}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </div>

        <div className="ms-auto flex items-center gap-1">
          {reorderMode && (
            <>
              <button
                type="button"
                className="admin-btn px-2 py-1"
                aria-label={`${t("redesign.home.moveUp")}: ${row.label}`}
                disabled={index === 0 || savingOrder}
                onClick={() => onMove("up")}
              >
                ▲
              </button>
              <button
                type="button"
                className="admin-btn px-2 py-1"
                aria-label={`${t("redesign.home.moveDown")}: ${row.label}`}
                disabled={index === total - 1 || savingOrder}
                onClick={() => onMove("down")}
              >
                ▼
              </button>
            </>
          )}
          {!reorderMode && (
            <>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={!dirty || saving || tokens.length > 0}
                onClick={onSave}
              >
                {saving ? t("redesign.timeline.saving") : t("redesign.timeline.save")}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                disabled={saving}
                onClick={onDelete}
              >
                {t("redesign.timeline.delete")}
              </button>
            </>
          )}
        </div>
      </div>

      {!reorderMode && (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`timeline-period-${id}`}
                className="admin-label mb-1"
              >
                {t("redesign.timeline.column.period")}
              </label>
              <input
                id={`timeline-period-${id}`}
                className="admin-input"
                type="text"
                value={row.period_label}
                onChange={(event) =>
                  onChange({ period_label: event.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor={`timeline-role-${id}`} className="admin-label mb-1">
                {t("redesign.timeline.column.role")}
              </label>
              <input
                id={`timeline-role-${id}`}
                className="admin-input"
                type="text"
                value={row.role}
                onChange={(event) => onChange({ role: event.target.value })}
              />
            </div>
            <div>
              <label
                htmlFor={`timeline-weight-${id}`}
                className="admin-label mb-1"
              >
                {t("redesign.timeline.column.weight")}
              </label>
              <input
                id={`timeline-weight-${id}`}
                className="admin-input"
                type="number"
                min={0}
                max={TIMELINE_WEIGHT_MAX}
                step={1}
                value={row.weight < 0 ? "" : String(row.weight)}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  onChange({
                    weight:
                      event.target.value === "" || Number.isNaN(parsed)
                        ? -1
                        : parsed,
                  });
                }}
              />
            </div>
            <div>
              <label
                htmlFor={`timeline-detail-${id}`}
                className="admin-label mb-1"
              >
                {t("redesign.timeline.column.detailUrl")}
              </label>
              <input
                id={`timeline-detail-${id}`}
                className="admin-input"
                type="text"
                dir="ltr"
                value={row.detail_url}
                onChange={(event) =>
                  onChange({ detail_url: event.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`timeline-body-${id}`} className="admin-label mb-1">
                {t("redesign.timeline.column.body")}
              </label>
              <textarea
                id={`timeline-body-${id}`}
                className="admin-input"
                rows={3}
                value={row.body}
                onChange={(event) => onChange({ body: event.target.value })}
              />
            </div>
          </div>

          {row.attach !== null && (
            <p className="admin-muted mt-2 text-xs">
              {t("redesign.timeline.attach")}: {row.attach}
            </p>
          )}
        </>
      )}

      {tokens.length > 0 && (
        <ul className="admin-field-error" aria-live="polite">
          {tokens.map((token, tokenIndex) => (
            <li key={tokenIndex}>{tokenMessage(token)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
