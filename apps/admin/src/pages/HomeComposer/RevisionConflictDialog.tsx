// Minimal accessible dialog for 409 STALE_REVISION (Track AF-01).
// Reuses the existing admin-modal-overlay/admin-modal classes (MediaPicker
// precedent) and adds what the kit lacked: focus trap, Esc-to-close, focus
// restore. "Reload server state" replaces rows+revision from the server;
// "Keep mine" only closes the dialog and keeps editing the draft — it never
// re-PUTs with the server revision.

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactElement,
} from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface RevisionConflictDialogProps {
  open: boolean;
  title: string;
  body: string;
  /** Optional (additive, AF-03): omitted hides the server-rows section for
   * screens (e.g. media) whose conflicted resource has no row list. */
  serverRowsLabel?: string;
  reloadLabel: string;
  keepMineLabel: string;
  serverRows?: string[];
  onReload: () => void;
  onKeepMine: () => void;
  /** Additive (AF-02): aria id prefix so a second dialog instance on another
   * screen cannot collide with the Home Composer ids. Defaults unchanged. */
  idPrefix?: string;
}

export default function RevisionConflictDialog({
  open,
  title,
  body,
  serverRowsLabel,
  reloadLabel,
  keepMineLabel,
  serverRows,
  onReload,
  onKeepMine,
  idPrefix = "home-conflict",
}: RevisionConflictDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();
    return () => {
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onKeepMine();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="admin-modal-overlay">
      <div
        ref={dialogRef}
        className="admin-modal max-w-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${idPrefix}-title`}
        aria-describedby={`${idPrefix}-body`}
        onKeyDown={handleKeyDown}
      >
        <h2 id={`${idPrefix}-title`} className="mb-3 text-base font-bold">
          {title}
        </h2>
        <p id={`${idPrefix}-body`} className="admin-muted mb-3 text-sm leading-7">
          {body}
        </p>
        {serverRows !== undefined && (
          <div className="admin-section-card mb-4">
            <div className="admin-muted mb-1 text-xs font-medium">
              {serverRowsLabel}
            </div>
            <ol className="list-inside list-decimal text-sm">
              {serverRows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="admin-action-row justify-end">
          <button type="button" className="admin-btn" onClick={onReload}>
            {reloadLabel}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={onKeepMine}
          >
            {keepMineLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
