// Delete-with-confirmation dialog (Track AF-02). Count-confirm pattern from
// the bulk-archive precedent: it states the affected count (always one row
// here) and the permanence of the hard delete before the request fires.

import type { ReactElement } from "react";
import AdminDialog from "../../components/AdminDialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  rowLabel: string;
  typeLabel: string;
  pending: boolean;
  t: (key: string) => string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  rowLabel,
  typeLabel,
  pending,
  t,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps): ReactElement | null {
  return (
    <AdminDialog
      open={open}
      title={t("redesign.timeline.deleteConfirmTitle")}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="admin-btn" onClick={onCancel}>
            {t("redesign.timeline.cancel")}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            disabled={pending}
            onClick={onConfirm}
          >
            {t("redesign.timeline.delete")}
          </button>
        </>
      }
    >
      <div className="admin-section-card mb-3">
        <p className="text-sm font-medium">
          {typeLabel}: {rowLabel}
        </p>
        <p className="admin-muted mt-1 text-xs">
          {t("redesign.timeline.deleteCount")}: 1
        </p>
      </div>
      <p className="admin-muted text-sm leading-7">
        {t("redesign.timeline.deleteConfirmBody")}
      </p>
    </AdminDialog>
  );
}
