// Timeline Editor screen (Track AF-02b) — composes the EXISTING parts:
// the pure reducer (./reducer), the inline row editor (./TimelineRow), the
// add-row dialog (./CreateRowDialog), the count-confirm delete dialog
// (./ConfirmDeleteDialog) and the shared conflict dialog
// (../HomeComposer/RevisionConflictDialog, additive idPrefix).
// Screen anatomy: locale tabs (fa/en, dirty-confirm on switch, refetch) →
// optional numeric profile filter (apply refetches; empty = all rows) →
// inline-editable rows (If-Match = row.updatedAt) → reorder mode (▲▼ mutate
// the draft only; explicit save posts /reorder) → footer actions.
// Error paths: 409 STALE_REVISION → RevisionConflictDialog (reload merges via
// RELOAD_SUCCESS / keep-mine keeps editing); 428 PRECONDITION_REQUIRED → one
// silent retry with a fresh revision fetched from the list, then an honest
// error; 400 VALIDATION → field tokens per row / create dialog.
// RTL: inherits <html dir="rtl">; logical CSS only, no physical left/right.

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { isApiError } from "../../lib/api";
import {
  createTimeline,
  deleteTimeline,
  isHomeLocale,
  isValidationProblem,
  listTimeline,
  reorderTimeline,
  updateTimeline,
  type TimelineCreateInput,
  type TimelineLocale,
  type TimelinePatchInput,
  type TimelineRecord,
} from "../../lib/adminApiExt";
import { fieldTokenMessage, tRedesign } from "../../i18n/redesign";
import {
  anyRowDirty,
  initialTimelineEditorState,
  isRowDirty,
  sortServerRows,
  timelineEditorReducer,
  timelinePatch,
  type TimelineEditorState,
  type TimelineRowValues,
  type TimelineToastText,
} from "./reducer";
import TimelineRow from "./TimelineRow";
import CreateRowDialog from "./CreateRowDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import RevisionConflictDialog from "../HomeComposer/RevisionConflictDialog";

/** Reducer toast sentinels → localized dictionary keys (static references so the qa:tokens guard sees them). */
const TOAST_KEYS: Record<TimelineToastText, string> = {
  saved: "redesign.timeline.saved",
  created: "redesign.timeline.created",
  deleted: "redesign.timeline.deleted",
  "order-saved": "redesign.timeline.orderSaved",
  "save-failed": "redesign.timeline.saveFailed",
  "create-failed": "redesign.timeline.createFailed",
  "delete-failed": "redesign.timeline.deleteFailed",
  "order-save-failed": "redesign.timeline.orderSaveFailed",
  "load-failed": "redesign.timeline.loadFailed",
};

/**
 * Pending-REORDER detection: the draft id sequence differs from the saved
 * canonical sequence (adjacent moves / not-yet-saved create positions).
 * Content dirty is covered by anyRowDirty; this covers unsaved order only.
 */
function orderDirty(state: TimelineEditorState): boolean {
  return (
    state.draft.length === state.saved.length &&
    state.draft.some((row, index) => state.saved[index]?.id !== row.id)
  );
}

/** Anything un-persisted: field edits, pending rows, unsaved order. */
function editorDirty(state: TimelineEditorState): boolean {
  return anyRowDirty(state) || orderDirty(state);
}

/** ProblemDetails fields → flat token list (400 VALIDATION). */
function flattenTokens(
  fields: Record<string, string[]> | undefined
): string[] {
  return fields === undefined ? [] : Object.values(fields).flat();
}

function isStaleRevision(err: unknown): boolean {
  return (
    isApiError(err) && (err.code === "STALE_REVISION" || err.status === 409)
  );
}

function isPreconditionRequired(err: unknown): boolean {
  return (
    isApiError(err) &&
    (err.code === "PRECONDITION_REQUIRED" || err.status === 428)
  );
}

export default function TimelineEditorPage(): ReactElement {
  const params = useParams();
  const navigate = useNavigate();
  const rawLocale = params.locale ?? "";
  const locale: TimelineLocale = isHomeLocale(rawLocale) ? rawLocale : "fa";

  const [state, dispatch] = useReducer(
    timelineEditorReducer,
    locale,
    initialTimelineEditorState
  );
  const [profileInput, setProfileInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [conflictServerLabels, setConflictServerLabels] = useState<string[]>(
    []
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const t = (key: string): string => tRedesign(locale, key);
  const tokenMessage = (token: string): string =>
    fieldTokenMessage(locale, token);
  const typeLabel = (type: TimelineRecord["type"]): string =>
    t(`redesign.timeline.type.${type}`);

  const load = useCallback(
    async (
      target: TimelineLocale,
      profileFilter: string
    ): Promise<void> => {
      dispatch({ type: "LOAD_START", locale: target, profileFilter });
      try {
        const rows = await listTimeline(
          target,
          profileFilter === "" ? undefined : Number(profileFilter)
        );
        dispatch({ type: "LOAD_SUCCESS", locale: target, profileFilter, rows });
      } catch {
        dispatch({ type: "LOAD_ERROR", locale: target, profileFilter });
      }
    },
    []
  );

  // Locale tab + profile-filter loads: APPLY_PROFILE_FILTER updates
  // state.profileFilter, which refires this effect with the new filter.
  useEffect(() => {
    void load(locale, state.profileFilter);
  }, [locale, state.profileFilter, load]);

  const dirty = editorDirty(state);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (state.toast === null) {
      return;
    }
    const timer = window.setTimeout(
      () => dispatch({ type: "TOAST_DISMISS" }),
      4000
    );
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const savedById = useMemo(
    () => new Map(state.saved.map((row) => [row.id, row])),
    [state.saved]
  );

  function confirmDirtyLeave(): boolean {
    return (
      !editorDirty(stateRef.current) ||
      window.confirm(tRedesign(locale, "redesign.timeline.dirtyLeave"))
    );
  }

  function switchLocaleTab(next: TimelineLocale): void {
    if (next === locale) {
      return;
    }
    if (!confirmDirtyLeave()) {
      return;
    }
    navigate(`/timeline-editor/${next}`);
  }

  function applyProfileFilter(): void {
    const value = profileInput.trim();
    if (!/^\d*$/.test(value) || value === stateRef.current.profileFilter) {
      return;
    }
    if (!confirmDirtyLeave()) {
      return;
    }
    dispatch({ type: "APPLY_PROFILE_FILTER", value });
  }

  function clearProfileFilter(): void {
    if (stateRef.current.profileFilter === "") {
      return;
    }
    if (!confirmDirtyLeave()) {
      return;
    }
    setProfileInput("");
    dispatch({ type: "APPLY_PROFILE_FILTER", value: "" });
  }

  async function fetchConflictDiff(): Promise<void> {
    const current = stateRef.current;
    try {
      const rows = await listTimeline(
        locale,
        current.profileFilter === ""
          ? undefined
          : Number(current.profileFilter)
      );
      setConflictServerLabels(
        sortServerRows(rows).map((row) => row.label)
      );
    } catch {
      setConflictServerLabels([]);
    }
  }

  async function attemptRowSave(
    row: TimelineRecord,
    patch: TimelinePatchInput,
    retryBudget: number
  ): Promise<void> {
    try {
      const fresh = await updateTimeline(locale, row.id, patch, row.updatedAt);
      dispatch({ type: "ROW_SAVE_SUCCESS", row: fresh });
    } catch (err) {
      if (isPreconditionRequired(err) && retryBudget > 0) {
        // 428 PRECONDITION_REQUIRED: retry once with a fresh revision fetched
        // from the list; the local edit state is preserved untouched.
        try {
          const current = stateRef.current;
          const rows = await listTimeline(
            locale,
            current.profileFilter === ""
              ? undefined
              : Number(current.profileFilter)
          );
          const freshRow = rows.find(
            (candidate) => candidate.id === row.id
          );
          if (freshRow !== undefined) {
            await attemptRowSave(
              { ...row, updatedAt: freshRow.updatedAt },
              patch,
              retryBudget - 1
            );
            return;
          }
        } catch {
          // fall through to the honest error below
        }
        dispatch({ type: "ROW_SAVE_ERROR", id: row.id, tokens: [] });
        return;
      }
      if (isStaleRevision(err)) {
        dispatch({ type: "ROW_SAVE_CONFLICT", id: row.id });
        void fetchConflictDiff();
        return;
      }
      if (isApiError(err) && isValidationProblem(err)) {
        dispatch({
          type: "ROW_SAVE_ERROR",
          id: row.id,
          tokens: flattenTokens(err.fields),
        });
        return;
      }
      dispatch({ type: "ROW_SAVE_ERROR", id: row.id, tokens: [] });
    }
  }

  async function saveRow(row: TimelineRecord): Promise<void> {
    const current = stateRef.current;
    if (
      current.phase !== "ready" ||
      current.reorderMode ||
      current.savingRowIds.includes(row.id)
    ) {
      return;
    }
    const savedRow = current.saved.find(
      (candidate) => candidate.id === row.id
    );
    const patch = timelinePatch(savedRow, row);
    if (Object.keys(patch).length === 0) {
      return;
    }
    dispatch({ type: "ROW_SAVE_START", id: row.id });
    await attemptRowSave(row, patch, 1);
  }

  async function handleCreate(input: TimelineCreateInput): Promise<void> {
    dispatch({ type: "CREATE_START" });
    try {
      const row = await createTimeline(locale, input);
      dispatch({
        type: "CREATE_SUCCESS",
        row,
        afterId: input.after_id ?? null,
      });
      setCreateOpen(false);
    } catch (err) {
      if (isApiError(err) && isValidationProblem(err)) {
        // Dialog stays open with the server tokens; the draft input is kept.
        dispatch({
          type: "CREATE_ERROR",
          tokens: flattenTokens(err.fields),
        });
        return;
      }
      dispatch({ type: "CREATE_ERROR", tokens: [] });
    }
  }

  async function retryDeleteWithFreshRevision(id: number): Promise<boolean> {
    try {
      const current = stateRef.current;
      const rows = await listTimeline(
        locale,
        current.profileFilter === ""
          ? undefined
          : Number(current.profileFilter)
      );
      const fresh = rows.find((candidate) => candidate.id === id);
      if (fresh === undefined) {
        return false;
      }
      await deleteTimeline(locale, id, fresh.updatedAt);
      dispatch({ type: "DELETE_SUCCESS", id });
      return true;
    } catch (err) {
      if (isStaleRevision(err)) {
        dispatch({ type: "DELETE_CONFLICT", id });
        void fetchConflictDiff();
      }
      return false;
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    const current = stateRef.current;
    const id = current.deleteCandidateId;
    if (id === null || current.phase !== "ready") {
      return;
    }
    const row =
      current.draft.find((candidate) => candidate.id === id) ??
      current.saved.find((candidate) => candidate.id === id);
    if (row === undefined) {
      dispatch({ type: "DELETE_CANCEL" });
      return;
    }
    setDeletePending(true);
    try {
      await deleteTimeline(locale, id, row.updatedAt);
      setDeletePending(false);
      dispatch({ type: "DELETE_SUCCESS", id });
    } catch (err) {
      setDeletePending(false);
      if (isPreconditionRequired(err)) {
        const retried = await retryDeleteWithFreshRevision(id);
        if (retried) {
          return;
        }
        dispatch({ type: "DELETE_ERROR", id });
        return;
      }
      if (isStaleRevision(err)) {
        dispatch({ type: "DELETE_CONFLICT", id });
        void fetchConflictDiff();
        return;
      }
      dispatch({ type: "DELETE_ERROR", id });
    }
  }

  async function handleOrderSave(): Promise<void> {
    const current = stateRef.current;
    if (
      current.phase !== "ready" ||
      !current.reorderMode ||
      current.savingOrder
    ) {
      return;
    }
    dispatch({ type: "ORDER_SAVE_START" });
    try {
      const rows = await reorderTimeline(
        locale,
        current.draft.map((row) => row.id)
      );
      dispatch({ type: "ORDER_SAVE_SUCCESS", rows });
    } catch {
      dispatch({ type: "ORDER_SAVE_ERROR" });
    }
  }

  function handleConflictReload(): void {
    const conflictId = stateRef.current.conflictId;
    setConflictServerLabels([]);
    if (conflictId === null) {
      return;
    }
    void (async () => {
      try {
        const current = stateRef.current;
        const rows = await listTimeline(
          locale,
          current.profileFilter === ""
            ? undefined
            : Number(current.profileFilter)
        );
        dispatch({ type: "RELOAD_SUCCESS", locale, rows, conflictId });
      } catch {
        dispatch({ type: "RELOAD_ERROR", locale });
      }
    })();
  }

  function handleConflictKeepMine(): void {
    setConflictServerLabels([]);
    dispatch({ type: "CONFLICT_KEEP_MINE" });
  }

  if (!isHomeLocale(rawLocale)) {
    return <Navigate to="/timeline-editor/fa" replace />;
  }

  const deleteRow =
    state.deleteCandidateId === null
      ? undefined
      : state.draft.find((row) => row.id === state.deleteCandidateId) ??
        state.saved.find((row) => row.id === state.deleteCandidateId);
  const contentDirtyForReorder = anyRowDirty(state);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">{t("redesign.timeline.title")}</h1>
        {dirty && (
          <span className="admin-status-badge admin-status-review">
            {t("redesign.timeline.unsavedBadge")}
          </span>
        )}
      </div>

      <ul
        className="admin-tabs"
        role="tablist"
        aria-label={t("redesign.timeline.title")}
      >
        {(["fa", "en"] as const).map((tab) => (
          <li key={tab} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={locale === tab}
              className={`admin-tab ${locale === tab ? "admin-tab-active" : ""}`}
              onClick={() => switchLocaleTab(tab)}
            >
              {t(`redesign.timeline.locale.${tab}`)}
            </button>
          </li>
        ))}
      </ul>

      {state.phase === "loading" && (
        <p className="admin-muted py-6 text-sm">
          {t("redesign.timeline.loading")}
        </p>
      )}

      {state.phase === "loadError" && (
        <div className="admin-banner-error mb-4" role="alert">
          <p>{t("redesign.timeline.loadFailed")}</p>
          <button
            type="button"
            className="admin-btn mt-2"
            onClick={() => void load(locale, state.profileFilter)}
          >
            {t("redesign.timeline.retry")}
          </button>
        </div>
      )}

      {state.phase === "ready" && (
        <>
          <div className="admin-section-card mb-4 flex flex-wrap items-end gap-x-3 gap-y-2">
            <div>
              <label
                htmlFor="timeline-profile-filter"
                className="admin-label mb-1"
              >
                {t("redesign.timeline.profileFilter")}
              </label>
              <input
                id="timeline-profile-filter"
                className="admin-input"
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={profileInput}
                onChange={(event) => {
                  if (/^\d*$/.test(event.target.value)) {
                    setProfileInput(event.target.value);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyProfileFilter();
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="admin-btn"
              onClick={applyProfileFilter}
            >
              {t("redesign.timeline.profileApply")}
            </button>
            {state.profileFilter !== "" && (
              <button
                type="button"
                className="admin-btn"
                onClick={clearProfileFilter}
              >
                {t("redesign.timeline.profileClear")}
              </button>
            )}
            <p className="admin-muted w-full text-xs sm:w-auto">
              {t("redesign.timeline.profileHint")}
            </p>
          </div>

          {state.toast !== null && (
            <div
              className={`mb-4 ${
                state.toast.kind === "success"
                  ? "admin-banner-success"
                  : "admin-banner-error"
              }`}
              role="status"
              aria-live="polite"
            >
              <p>{t(TOAST_KEYS[state.toast.text])}</p>
            </div>
          )}

          {state.draft.length === 0 && (
            <p className="admin-muted mb-3 text-sm">
              {t("redesign.timeline.empty")}
            </p>
          )}

          <div>
            {state.draft.map((row, index) => (
              <div key={row.id} className="mb-3">
                <TimelineRow
                  row={row}
                  index={index}
                  total={state.draft.length}
                  dirty={isRowDirty(savedById.get(row.id), row)}
                  saving={state.savingRowIds.includes(row.id)}
                  reorderMode={state.reorderMode}
                  savingOrder={state.savingOrder}
                  tokens={state.rowErrors[row.id] ?? []}
                  t={t}
                  typeLabel={typeLabel}
                  tokenMessage={tokenMessage}
                  onChange={(patch: Partial<TimelineRowValues>) =>
                    dispatch({ type: "ROW_CHANGE", id: row.id, patch })
                  }
                  onSave={() => void saveRow(row)}
                  onDelete={() =>
                    dispatch({ type: "DELETE_REQUEST", id: row.id })
                  }
                  onMove={(direction) =>
                    dispatch({ type: "REORDER_MOVE", index, direction })
                  }
                />
              </div>
            ))}
          </div>

          <div className="admin-action-row mt-4 items-center">
            {!state.reorderMode && (
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={state.creating}
                onClick={() => {
                  dispatch({ type: "CREATE_ERRORS_CLEAR" });
                  setCreateOpen(true);
                }}
              >
                {t("redesign.timeline.add")}
              </button>
            )}
            <button
              type="button"
              className="admin-btn"
              onClick={() => dispatch({ type: "TOGGLE_REORDER" })}
            >
              {state.reorderMode
                ? t("redesign.timeline.exitReorder")
                : t("redesign.timeline.reorder")}
            </button>
            {state.reorderMode && (
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={state.savingOrder}
                onClick={() => void handleOrderSave()}
              >
                {state.savingOrder
                  ? t("redesign.timeline.orderSaving")
                  : t("redesign.timeline.orderSave")}
              </button>
            )}
            {!state.reorderMode && contentDirtyForReorder && (
              <span className="admin-muted text-xs">
                {t("redesign.timeline.reorderDirtyHint")}
              </span>
            )}
          </div>
        </>
      )}

      <CreateRowDialog
        open={createOpen}
        rows={state.draft}
        attachProfile={
          state.profileFilter === "" ? null : Number(state.profileFilter)
        }
        submitting={state.creating}
        serverTokens={state.createErrors}
        t={t}
        typeLabel={typeLabel}
        tokenMessage={tokenMessage}
        onSubmit={(input) => void handleCreate(input)}
        onCancel={() => {
          setCreateOpen(false);
          dispatch({ type: "CREATE_ERRORS_CLEAR" });
        }}
      />

      <ConfirmDeleteDialog
        open={state.deleteCandidateId !== null && deleteRow !== undefined}
        rowLabel={deleteRow?.label ?? ""}
        typeLabel={deleteRow === undefined ? "" : typeLabel(deleteRow.type)}
        pending={deletePending}
        t={t}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (!deletePending) {
            dispatch({ type: "DELETE_CANCEL" });
          }
        }}
      />

      <RevisionConflictDialog
        open={state.conflictId !== null}
        title={t("redesign.conflict.title")}
        body={t("redesign.conflict.body")}
        serverRowsLabel={t("redesign.conflict.serverRows")}
        reloadLabel={t("redesign.conflict.reload")}
        keepMineLabel={t("redesign.conflict.keepMine")}
        serverRows={conflictServerLabels}
        onReload={handleConflictReload}
        onKeepMine={handleConflictKeepMine}
        idPrefix="timeline-conflict"
      />
    </div>
  );
}
