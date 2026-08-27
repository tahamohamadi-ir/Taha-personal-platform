// Graph Editor screen (Tracks AF-04/AF-05) — composes the pure reducer
// (./reducer), the pure viewport math (./canvas), the SVG canvas
// (./GraphCanvas), the versions/groups panel (./VersionsPanel), the inspector
// (./InspectorPanel) and the existing SPA kit (RevisionConflictDialog
// additive reuse, AdminDialog for the activate confirm, which now lists
// blocking issues when present).
// Screen anatomy: left versions+groups -> center canvas -> right inspector ->
// bottom bar (SERVER validation chips: per-code error counts from the
// debounced GET /graph/validation/{id} poll, spinner while pending, honest
// validation-unavailable chip on failure; Save draft; Activate gated on
// dirty AND on the latest server validation result).
// The screen has no locale route segment: the version row owns the locale, so
// UI chrome resolves the fa-first dictionary (document dir is rtl globally).
// Draft autosave is OFF v1 — explicit Save only + leave guard.

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { isApiError, type AdminIssue, type ContentLocale } from "../../lib/api";
import {
  GRAPH_ISSUE_CODES,
  GRAPH_ISSUE_TOKENS,
  activateGraphVersion,
  createGraphVersion,
  getGraphPayload,
  getGraphVersions,
  putGraphPayload,
  validateGraphVersion,
  type GraphIssue,
  type GraphIssueCode,
  type GraphLocale,
  type GraphNode,
  type GraphVersionRow,
} from "../../lib/adminApiExt";
import { graphIssueMessage, tRedesign } from "../../i18n/redesign";
import {
  graphEditorReducer,
  initialGraphEditorState,
} from "./reducer";
import GraphCanvas from "./GraphCanvas";
import InspectorPanel from "./InspectorPanel";
import VersionsPanel from "./VersionsPanel";
import RevisionConflictDialog from "../HomeComposer/RevisionConflictDialog";
import AdminDialog from "../../components/AdminDialog";

const UI_LOCALE: ContentLocale = "fa";

/** Normalizes raw ApiError issues into GraphIssue (messageToken guaranteed). */
function toGraphIssues(raw: AdminIssue[]): GraphIssue[] {
  return raw.map((issue) => ({
    code: issue.code,
    nodeId: issue.nodeId,
    edgeId: issue.edgeId,
    messageToken:
      issue.messageToken ??
      GRAPH_ISSUE_TOKENS[issue.code as GraphIssueCode] ??
      issue.code,
  }));
}

/** Localized validator issue list (fieldTokenMessage-style mapping via graphIssueMessage). */
function GraphIssueList(props: { issues: GraphIssue[] }): ReactElement {
  return (
    <ul className="admin-field-error">
      {props.issues.map((issue, index) => (
        <li key={index} className="flex flex-wrap items-center gap-1">
          <span>{graphIssueMessage(UI_LOCALE, issue)}</span>
          {issue.nodeId !== undefined && (
            <span className="admin-muted" style={{ unicodeBidi: "plaintext" }}>
              [{issue.nodeId}]
            </span>
          )}
          {issue.edgeId !== undefined && (
            <span className="admin-muted" style={{ unicodeBidi: "plaintext" }}>
              [{issue.edgeId}]
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function GraphEditorPage(): ReactElement {
  const t = useCallback((key: string) => tRedesign(UI_LOCALE, key), []);
  const [state, dispatch] = useReducer(
    graphEditorReducer,
    undefined,
    initialGraphEditorState
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const [conflictServerLabels, setConflictServerLabels] = useState<string[]>([]);
  const [newLocale, setNewLocale] = useState<GraphLocale>("fa");
  const [creating, setCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const loadDetail = useCallback(async (versionId: number): Promise<void> => {
    dispatch({ type: "DETAIL_START", versionId });
    try {
      const detail = await getGraphPayload(versionId);
      dispatch({ type: "DETAIL_SUCCESS", detail });
    } catch {
      dispatch({ type: "DETAIL_ERROR", versionId });
    }
  }, []);

  const refreshVersions = useCallback(async (): Promise<GraphVersionRow[]> => {
    try {
      const rows = await getGraphVersions();
      dispatch({ type: "VERSIONS_SUCCESS", rows });
      return rows;
    } catch {
      dispatch({ type: "VERSIONS_ERROR" });
      return [];
    }
  }, []);

  useEffect(() => {
    void (async () => {
      dispatch({ type: "VERSIONS_START" });
      const rows = await refreshVersions();
      const first = rows[0];
      if (first !== undefined) {
        await loadDetail(first.id);
      }
    })();
  }, [refreshVersions, loadDetail]);

  useEffect(() => {
    if (!state.dirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.dirty]);

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

  // ---- AF-05 server-validation polling ---------------------------------
  // Debounced 800ms auto-poll of GET /graph/validation/{id} after every
  // draft mutation. In-flight cancellation is token-based: each run takes a
  // sequence number; a response only lands when its sequence is still the
  // newest AND the loaded version has not changed in between. The debounce
  // effect also cancels queued-but-not-fired polls by clearing the timer on
  // every draft change (re-scheduled by the next render's effect).
  const validationSeqRef = useRef(0);

  const runValidation = useCallback(async (): Promise<void> => {
    const versionId = stateRef.current.versionId;
    if (versionId === null || stateRef.current.draft === null) {
      return;
    }
    const seq = ++validationSeqRef.current;
    dispatch({ type: "VALIDATION_START" });
    try {
      const issues = await validateGraphVersion(versionId);
      if (
        seq !== validationSeqRef.current ||
        stateRef.current.versionId !== versionId
      ) {
        return; // superseded by a newer edit or a version switch
      }
      dispatch({ type: "VALIDATION_SUCCESS", issues });
    } catch {
      if (
        seq !== validationSeqRef.current ||
        stateRef.current.versionId !== versionId
      ) {
        return;
      }
      dispatch({ type: "VALIDATION_ERROR" });
    }
  }, []);

  useEffect(() => {
    if (
      state.phase !== "ready" ||
      state.versionId === null ||
      state.draft === null
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      void runValidation();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [state.draft, state.phase, state.versionId, runValidation]);

  const draft = state.draft;
  const selectedNode =
    draft !== null &&
    state.selection !== null &&
    state.selection.kind === "node"
      ? draft.nodes.find((node) => node.id === state.selection?.id) ?? null
      : null;
  const selectedEdge =
    draft !== null &&
    state.selection !== null &&
    state.selection.kind === "edge"
      ? draft.edges.find((edge) => edge.id === state.selection?.id) ?? null
      : null;

  // Bottom-bar chips: per-code counts of the LATEST SERVER validation result
  // (every validator code is an error per the backend; no severity split).
  const validationCounts = useMemo(() => {
    const counts = new Map<GraphIssueCode, number>();
    for (const issue of state.validationIssues) {
      const code = issue.code as GraphIssueCode;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return counts;
  }, [state.validationIssues]);
  const validationIssueCount =
    state.validation === "ready" ? state.validationIssues.length : 0;

  function selectVersion(versionId: number): void {
    const current = stateRef.current;
    if (current.versionId === versionId || current.detailLoading) {
      return;
    }
    if (current.dirty && !window.confirm(t("redesign.graph.dirtyLeave"))) {
      return;
    }
    void loadDetail(versionId);
  }

  async function handleSave(): Promise<void> {
    const current = stateRef.current;
    if (
      current.saving ||
      !current.dirty ||
      current.readOnly ||
      current.versionId === null ||
      current.draft === null
    ) {
      return;
    }
    const versionId = current.versionId;
    dispatch({ type: "SAVE_START" });
    try {
      const result = await putGraphPayload(
        versionId,
        current.draft,
        current.revision
      );
      dispatch({ type: "SAVE_SUCCESS", revision: result.revision });
      void refreshVersions();
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 400 && Array.isArray(err.issues) && err.issues.length > 0) {
          dispatch({ type: "SAVE_ISSUES", issues: toGraphIssues(err.issues) });
          return;
        }
        if (err.status === 409 && err.code === "STALE_REVISION") {
          dispatch({ type: "SAVE_CONFLICT" });
          void fetchConflictLabels(versionId);
          return;
        }
        if (err.status === 409 && err.code === "IMMUTABLE_ACTIVE") {
          // Someone activated meanwhile — resync server state honestly.
          dispatch({ type: "SAVE_ERROR" });
          await refreshVersions();
          await loadDetail(versionId);
          return;
        }
      }
      dispatch({ type: "SAVE_ERROR" });
    }
  }

  async function handleActivate(): Promise<void> {
    const current = stateRef.current;
    if (
      current.activating ||
      current.readOnly ||
      current.dirty ||
      current.versionId === null
    ) {
      return;
    }
    const versionId = current.versionId;
    dispatch({ type: "ACTIVATE_START" });
    try {
      await activateGraphVersion(versionId);
      dispatch({ type: "ACTIVATE_SUCCESS" });
      await refreshVersions();
      await loadDetail(versionId);
    } catch (err) {
      if (
        isApiError(err) &&
        err.status === 409 &&
        err.code === "VALIDATION_BLOCKED" &&
        Array.isArray(err.issues)
      ) {
        dispatch({ type: "ACTIVATE_BLOCKED", issues: toGraphIssues(err.issues) });
        return;
      }
      if (isApiError(err) && err.status === 409 && err.code === "ALREADY_ACTIVE") {
        dispatch({ type: "ACTIVATE_ERROR" });
        await refreshVersions();
        await loadDetail(versionId);
        return;
      }
      dispatch({ type: "ACTIVATE_ERROR" });
    }
  }

  async function handleCreateDraft(): Promise<void> {
    if (creating) {
      return;
    }
    setCreating(true);
    setCreateFailed(false);
    try {
      const row = await createGraphVersion(newLocale);
      await refreshVersions();
      await loadDetail(row.id);
    } catch {
      setCreateFailed(true);
    } finally {
      setCreating(false);
    }
  }

  async function fetchConflictLabels(versionId: number): Promise<void> {
    try {
      const fresh = await getGraphPayload(versionId);
      setConflictServerLabels(
        fresh.nodes.map((node) => (node.label !== "" ? node.label : node.id))
      );
    } catch {
      setConflictServerLabels([]);
    }
  }

  function handleConflictReload(): void {
    const versionId = stateRef.current.versionId;
    setConflictServerLabels([]);
    if (versionId !== null) {
      void loadDetail(versionId);
    }
  }

  function handleConflictKeepMine(): void {
    setConflictServerLabels([]);
    dispatch({ type: "CONFLICT_KEEP_MINE" });
  }

  const nodeAriaLabel = useCallback(
    (node: GraphNode) =>
      `${node.label !== "" ? node.label : node.id} — ${node.type}`,
    []
  );

  const toastTextKey: Record<string, string> = {
    saved: "redesign.graph.saved",
    activated: "redesign.graph.activated",
    "save-failed": "redesign.graph.saveFailed",
    "activate-failed": "redesign.graph.activateFailed",
    "load-failed": "redesign.graph.loadFailed",
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">{t("redesign.graph.title")}</h1>
        <div className="flex items-center gap-2">
          {state.dirty && (
            <span className="admin-status-badge admin-status-review">
              {t("redesign.graph.unsavedBadge")}
            </span>
          )}
          {state.versionId !== null && (
            <span
              className="admin-status-badge admin-status-unknown"
              title={state.revision}
            >
              {t("redesign.graph.revision")}:{" "}
              {state.revision === "" ? "—" : state.revision}
            </span>
          )}
        </div>
      </div>

      {state.phase === "loading" && (
        <p className="admin-muted py-6 text-sm">{t("redesign.graph.loading")}</p>
      )}

      {state.phase === "loadError" && (
        <div className="admin-banner-error mb-4" role="alert">
          <p>{t("redesign.graph.loadFailed")}</p>
          <button
            type="button"
            className="admin-btn mt-2"
            onClick={() => {
              void (async () => {
                const rows = await refreshVersions();
                const current = stateRef.current;
                if (current.versionId !== null) {
                  await loadDetail(current.versionId);
                } else {
                  const first = rows[0];
                  if (first !== undefined) {
                    await loadDetail(first.id);
                  }
                }
              })();
            }}
          >
            {t("redesign.graph.retry")}
          </button>
        </div>
      )}

      {state.phase === "ready" && (
        <>
          {state.readOnly && state.versionId !== null && !state.detailLoading && (
            <div className="admin-banner-error mb-4" role="status">
              <p>{t("redesign.graph.readOnlyBanner")}</p>
            </div>
          )}

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
              <p>{t(toastTextKey[state.toast.text])}</p>
            </div>
          )}

          {state.serverIssues.length > 0 && (
            <div className="admin-banner-error mb-4" role="alert">
              <p className="font-medium">
                {state.issuesFromActivate
                  ? t("redesign.graph.blocked")
                  : t("redesign.graph.issuesTitle")}
              </p>
              <GraphIssueList issues={state.serverIssues} />
            </div>
          )}

          {createFailed && (
            <div className="admin-banner-error mb-4" role="alert">
              <p>{t("redesign.graph.createFailed")}</p>
            </div>
          )}

          <div className="graph-editor-grid">
            <VersionsPanel
              versions={state.versions}
              loadedVersionId={state.versionId}
              detailLoading={state.detailLoading}
              groups={draft?.groups ?? []}
              nodes={draft?.nodes ?? []}
              newLocale={newLocale}
              creating={creating}
              t={t}
              onNewLocaleChange={setNewLocale}
              onCreateDraft={() => void handleCreateDraft()}
              onSelectVersion={selectVersion}
            />

            <div className="flex min-w-0 flex-col gap-2">
              {draft === null ? (
                <div className="graph-canvas-wrap flex items-center justify-center">
                  <p className="admin-muted text-sm">
                    {t("redesign.graph.emptyCanvas")}
                  </p>
                </div>
              ) : (
                <GraphCanvas
                  versionId={state.versionId}
                  nodes={draft.nodes}
                  edges={draft.edges}
                  selected={state.selection}
                  labels={{
                    aria: t("redesign.graph.canvasAria"),
                    fallbackTitle: t("redesign.graph.canvasFallback"),
                    fallbackOverflow: t("redesign.graph.canvasFallbackOverflow"),
                  }}
                  nodeAriaLabel={nodeAriaLabel}
                  onNodeSelect={(nodeId) =>
                    dispatch({
                      type: "SELECT",
                      selection:
                        nodeId === null
                          ? null
                          : { kind: "node", id: nodeId },
                    })
                  }
                  onEdgeSelect={(edgeId) =>
                    dispatch({
                      type: "SELECT",
                      selection: { kind: "edge", id: edgeId },
                    })
                  }
                  onNudge={(nodeId, dx, dy) =>
                    dispatch({ type: "NUDGE_NODE", nodeId, dx, dy })
                  }
                />
              )}
              <p className="admin-muted text-xs">{t("redesign.graph.keyboardHelp")}</p>
            </div>

            <InspectorPanel
              node={selectedNode}
              edge={selectedEdge}
              readOnly={state.readOnly}
              t={t}
              onPatchNode={(id, patch) =>
                dispatch({ type: "PATCH_NODE", id, patch })
              }
              onPatchEdge={(id, patch) =>
                dispatch({ type: "PATCH_EDGE", id, patch })
              }
              onAddRelated={(nodeId, family, id) =>
                dispatch({ type: "ADD_RELATED", nodeId, entry: { family, id } })
              }
              onRemoveRelated={(nodeId, index) =>
                dispatch({ type: "REMOVE_RELATED", nodeId, index })
              }
            />
          </div>

          <div className="admin-action-row mt-4 items-center">
            <span className="admin-muted text-xs">{t("redesign.graph.issues")}:</span>
            {state.validation === "loading" && (
              <span
                className="admin-status-badge admin-status-unknown"
                role="status"
                aria-live="polite"
              >
                {t("redesign.graph.validating")}
              </span>
            )}
            {state.validation === "unavailable" && (
              <span
                className="admin-status-badge admin-status-missing"
                title={t("redesign.graph.validationUnavailable")}
              >
                {t("redesign.graph.validationUnavailable")}
              </span>
            )}
            {state.validation === "ready" && validationIssueCount === 0 && (
              <span className="admin-status-badge admin-status-unknown">
                {t("redesign.graph.issuesNone")}
              </span>
            )}
            {state.validation === "ready" && validationIssueCount > 0 && (
              <>
                <span className="admin-status-badge admin-status-missing">
                  {validationIssueCount} {t("redesign.graph.issuesCount")}
                </span>
                {GRAPH_ISSUE_CODES.filter((code) => validationCounts.has(code)).map(
                  (code) => (
                    <span
                      key={code}
                      className="admin-status-badge admin-status-missing"
                    >
                      {validationCounts.get(code)} × {t(GRAPH_ISSUE_TOKENS[code])}
                    </span>
                  )
                )}
              </>
            )}
            <div className="ms-auto flex items-center gap-2">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={state.readOnly || !state.dirty || state.saving}
                onClick={() => void handleSave()}
              >
                {state.saving
                  ? t("redesign.graph.saving")
                  : t("redesign.graph.saveDraft")}
              </button>
              <button
                type="button"
                className="admin-btn"
                title={
                  state.dirty
                    ? t("redesign.graph.activateNeedsSave")
                    : validationIssueCount > 0
                      ? t("redesign.graph.activateHasIssues")
                      : undefined
                }
                disabled={
                  state.readOnly ||
                  state.dirty ||
                  state.saving ||
                  state.activating ||
                  state.versionId === null ||
                  validationIssueCount > 0
                }
                onClick={() => dispatch({ type: "ACTIVATE_CONFIRM_OPEN" })}
              >
                {state.activating
                  ? t("redesign.graph.activating")
                  : t("redesign.graph.activate")}
              </button>
            </div>
          </div>
        </>
      )}

      <AdminDialog
        open={state.activateConfirmOpen}
        title={t("redesign.graph.activate")}
        onClose={() => dispatch({ type: "ACTIVATE_CONFIRM_CLOSE" })}
        footer={
          <>
            <button
              type="button"
              className="admin-btn"
              onClick={() => dispatch({ type: "ACTIVATE_CONFIRM_CLOSE" })}
            >
              {t("redesign.graph.cancel")}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={state.activating}
              onClick={() => void handleActivate()}
            >
              {state.activating
                ? t("redesign.graph.activating")
                : t("redesign.graph.confirm")}
            </button>
          </>
        }
      >
        <p className="admin-muted text-sm leading-7">
          {t("redesign.graph.activateConfirmBody")}
        </p>
        {state.serverIssues.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">{t("redesign.graph.blocked")}</p>
            <GraphIssueList issues={state.serverIssues} />
          </div>
        )}
      </AdminDialog>

      <RevisionConflictDialog
        open={state.conflictOpen}
        title={t("redesign.conflict.title")}
        body={t("redesign.conflict.body")}
        serverRowsLabel={t("redesign.conflict.serverRows")}
        reloadLabel={t("redesign.conflict.reload")}
        keepMineLabel={t("redesign.conflict.keepMine")}
        serverRows={conflictServerLabels}
        onReload={handleConflictReload}
        onKeepMine={handleConflictKeepMine}
        idPrefix="graph-conflict"
      />
    </div>
  );
}
