// Add-row dialog (Track AF-02). Position select implements "add after
// selected" (after_id) with append as default; attach comes from the active
// profile filter. Client validation mirrors the frozen server tokens so
// invalid payloads never reach the API.

import { useEffect, useState, type ReactElement } from "react";
import {
  TIMELINE_TYPES,
  TIMELINE_WEIGHT_MAX,
  isValidTimelineDetailUrl,
  type TimelineCreateInput,
  type TimelineRecord,
  type TimelineType,
} from "../../lib/adminApiExt";
import AdminDialog from "../../components/AdminDialog";

interface CreateRowDialogProps {
  open: boolean;
  rows: TimelineRecord[];
  attachProfile: number | null;
  submitting: boolean;
  serverTokens: string[];
  t: (key: string) => string;
  typeLabel: (type: TimelineType) => string;
  tokenMessage: (token: string) => string;
  onSubmit: (input: TimelineCreateInput) => void;
  onCancel: () => void;
}

export default function CreateRowDialog({
  open,
  rows,
  attachProfile,
  submitting,
  serverTokens,
  t,
  typeLabel,
  tokenMessage,
  onSubmit,
  onCancel,
}: CreateRowDialogProps): ReactElement | null {
  const [type, setType] = useState<TimelineType>("experience");
  const [label, setLabel] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [role, setRole] = useState("");
  const [weightText, setWeightText] = useState("0");
  const [detailUrl, setDetailUrl] = useState("");
  const [body, setBody] = useState("");
  const [afterId, setAfterId] = useState("");

  useEffect(() => {
    if (open) {
      setType("experience");
      setLabel("");
      setPeriodLabel("");
      setRole("");
      setWeightText("0");
      setDetailUrl("");
      setBody("");
      setAfterId("");
    }
  }, [open]);

  const parsedWeight = Number(weightText);
  const weightValid =
    weightText !== "" &&
    Number.isInteger(parsedWeight) &&
    parsedWeight >= 0 &&
    parsedWeight <= TIMELINE_WEIGHT_MAX;
  const labelValid = label.trim() !== "";
  const urlValid = isValidTimelineDetailUrl(detailUrl);

  const clientTokens: string[] = [];
  if (!labelValid) {
    clientTokens.push("EMPTY_LABEL");
  }
  if (!weightValid) {
    clientTokens.push("BAD_WEIGHT");
  }
  if (!urlValid) {
    clientTokens.push("INVALID_DETAIL_URL");
  }
  const tokens = [...new Set([...clientTokens, ...serverTokens])];

  function handleSubmit(): void {
    if (tokens.length > 0 || submitting) {
      return;
    }
    onSubmit({
      type,
      label: label.trim(),
      period_label: periodLabel,
      role,
      body,
      weight: parsedWeight,
      detail_url: detailUrl.trim(),
      attach: attachProfile,
      ...(afterId === "" ? {} : { after_id: Number(afterId) }),
    });
  }

  return (
    <AdminDialog
      open={open}
      title={t("redesign.timeline.createTitle")}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="admin-btn" onClick={onCancel}>
            {t("redesign.timeline.cancel")}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={tokens.length > 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? t("redesign.timeline.saving")
              : t("redesign.timeline.add")}
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="timeline-create-type" className="admin-label">
            {t("redesign.timeline.column.type")}
          </label>
          <select
            id="timeline-create-type"
            className="admin-input"
            value={type}
            onChange={(event) => {
              const next = event.target.value;
              if (TIMELINE_TYPES.some((candidate) => candidate === next)) {
                setType(next as (typeof TIMELINE_TYPES)[number]);
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
        <div>
          <label htmlFor="timeline-create-position" className="admin-label">
            {t("redesign.timeline.createPosition")}
          </label>
          <select
            id="timeline-create-position"
            className="admin-input"
            value={afterId}
            onChange={(event) => setAfterId(event.target.value)}
          >
            <option value="">
              {t("redesign.timeline.createPositionAppend")}
            </option>
            {rows.map((row, index) => (
              <option key={row.id} value={String(row.id)}>
                {index + 1}. {row.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="timeline-create-label" className="admin-label">
            {t("redesign.timeline.column.label")}
          </label>
          <input
            id="timeline-create-label"
            className="admin-input"
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="timeline-create-period" className="admin-label">
            {t("redesign.timeline.column.period")}
          </label>
          <input
            id="timeline-create-period"
            className="admin-input"
            type="text"
            value={periodLabel}
            onChange={(event) => setPeriodLabel(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="timeline-create-role" className="admin-label">
            {t("redesign.timeline.column.role")}
          </label>
          <input
            id="timeline-create-role"
            className="admin-input"
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="timeline-create-weight" className="admin-label">
            {t("redesign.timeline.column.weight")}
          </label>
          <input
            id="timeline-create-weight"
            className="admin-input"
            type="number"
            min={0}
            max={TIMELINE_WEIGHT_MAX}
            step={1}
            value={weightText}
            onChange={(event) => setWeightText(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="timeline-create-detail" className="admin-label">
            {t("redesign.timeline.column.detailUrl")}
          </label>
          <input
            id="timeline-create-detail"
            className="admin-input"
            type="text"
            dir="ltr"
            value={detailUrl}
            onChange={(event) => setDetailUrl(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="timeline-create-body" className="admin-label">
            {t("redesign.timeline.column.body")}
          </label>
          <textarea
            id="timeline-create-body"
            className="admin-input"
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
      </div>

      {tokens.length > 0 && (
        <ul className="admin-field-error" aria-live="polite">
          {tokens.map((token, index) => (
            <li key={index}>{tokenMessage(token)}</li>
          ))}
        </ul>
      )}
    </AdminDialog>
  );
}
