// Home Composer screen (Track AF-01) — composes the pure reducer
// (./reducer), the revision-conflict dialog (./RevisionConflictDialog) and
// the existing SPA kit (admin-* classes, adminApiExt typed client).
// Screen anatomy: locale tabs (fa/en, refetch on switch) → 8 canonical
// module rows (visible checkbox, order via accessible ▲▼ swap, selection_mode
// chip, read-only provenance) → footer (Save / Validate / revision chip).
// RTL: inherits <html dir="rtl">; logical CSS only, no physical left/right.

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  isApiError,
} from "../../lib/api";
import {
  getHomeModules,
  isHomeLocale,
  putHomeModules,
  validateHomeModules,
  type HomeLocale,
  type HomeModuleRow,
  type HomeSelectionMode,
} from "../../lib/adminApiExt";
import {
  fieldTokenMessage,
  homeKeyLabel,
  selectionModeLabel,
  tRedesign,
} from "../../i18n/redesign";
import {
  homeComposerReducer,
  initialHomeComposerState,
  type HomeComposerToast,
} from "./reducer";
import RevisionConflictDialog from "./RevisionConflictDialog";

const TOAST_KEYS: Record<HomeComposerToast["text"], string> = {
  saved: "redesign.home.saved",
  validated: "redesign.home.validated",
  "validation-failed": "redesign.home.validationFailed",
  "save-failed": "redesign.home.saveFailed",
  "load-failed": "redesign.home.loadFailed",
};

const SELECTION_CHIP_CLASS: Record<HomeSelectionMode, string> = {
  manual: "admin-status-badge admin-status-published",
  rule: "admin-status-badge admin-status-scheduled",
  hybrid: "admin-status-badge admin-status-partial",
};

function rowErrorsFor(
  fieldErrors: Record<string, string[]>,
  index: number
): string[] {
  const tokens: string[] = [];
  for (const [path, pathTokens] of Object.entries(fieldErrors)) {
    const match = path.match(/^modules\[(\d+)\]/);
    if (match !== null && Number(match[1]) === index) {
      tokens.push(...pathTokens);
    }
  }
  return tokens;
}

export default function HomeComposerPage(): ReactElement {
  const params = useParams();
  const navigate = useNavigate();
  const rawLocale = params.locale ?? "";
  const locale: HomeLocale = isHomeLocale(rawLocale) ? rawLocale : "fa";

  const [state, dispatch] = useReducer(
    homeComposerReducer,
    locale,
    initialHomeComposerState
  );
  const [conflictServerRows, setConflictServerRows] = useState<
    HomeModuleRow[]
  >([]);
  const [serverEmpty, setServerEmpty] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const load = useCallback(async (target: HomeLocale): Promise<void> => {
    dispatch({ type: "LOAD_START", locale: target });
    try {
      const doc = await getHomeModules(target);
      setServerEmpty(doc.modules.length === 0);
      dispatch({
        type: "LOAD_SUCCESS",
        locale: target,
        revision: doc.revision,
        modules: doc.modules,
      });
    } catch {
      setServerEmpty(false);
      dispatch({ type: "LOAD_ERROR", locale: target, message: "load-failed" });
    }
  }, []);

  useEffect(() => {
    void load(locale);
  }, [locale, load]);

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

  function switchLocaleTab(next: HomeLocale): void {
    if (next === locale) {
      return;
    }
    if (
      stateRef.current.dirty &&
      !window.confirm(tRedesign(locale, "redesign.home.dirtyLeave"))
    ) {
      return;
    }
    navigate(`/home-composer/${next}`);
  }

  async function handleSave(): Promise<void> {
    const current = stateRef.current;
    if (current.saving || !current.dirty || current.phase !== "ready") {
      return;
    }
    dispatch({ type: "SAVE_START" });
    try {
      const revision = await putHomeModules(
        locale,
        current.draft,
        current.revision
      );
      dispatch({ type: "SAVE_SUCCESS", revision });
    } catch (err) {
      if (isApiError(err) && err.code === "STALE_REVISION") {
        dispatch({ type: "SAVE_CONFLICT" });
        void fetchConflictDiff();
      } else {
        dispatch({ type: "SAVE_ERROR", message: "save-failed" });
      }
    }
  }

  async function fetchConflictDiff(): Promise<void> {
    try {
      const doc = await getHomeModules(locale);
      setConflictServerRows([...doc.modules].sort((a, b) => a.order - b.order));
    } catch {
      setConflictServerRows([]);
    }
  }

  async function handleValidate(): Promise<void> {
    const current = stateRef.current;
    if (current.validating || current.phase !== "ready") {
      return;
    }
    dispatch({ type: "VALIDATE_START" });
    try {
      const fields = await validateHomeModules(locale, current.draft);
      if (Object.keys(fields).length === 0) {
        dispatch({ type: "VALIDATE_SUCCESS" });
      } else {
        dispatch({ type: "VALIDATE_ERROR", fields });
      }
    } catch {
      dispatch({ type: "VALIDATE_ERROR", fields: {} });
    }
  }

  function handleConflictReload(): void {
    setConflictServerRows([]);
    void load(locale);
  }

  function handleConflictKeepMine(): void {
    setConflictServerRows([]);
    dispatch({ type: "CONFLICT_KEEP_MINE" });
  }

  if (!isHomeLocale(rawLocale)) {
    return <Navigate to="/home-composer/fa" replace />;
  }

  const t = (key: string): string => tRedesign(locale, key);
  const listLevelErrors = (state.fieldErrors["modules"] ?? []).map((token) =>
    fieldTokenMessage(locale, token)
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">{t("redesign.home.title")}</h1>
        <div className="flex items-center gap-2">
          {state.dirty && (
            <span className="admin-status-badge admin-status-review">
              {t("redesign.home.unsavedBadge")}
            </span>
          )}
          <span
            className="admin-status-badge admin-status-unknown"
            title={state.revision}
          >
            {t("redesign.home.revision")}: {state.revision === "" ? "—" : state.revision}
          </span>
        </div>
      </div>

      <ul className="admin-tabs" role="tablist" aria-label={t("redesign.home.title")}>
        {(["fa", "en"] as const).map((tab) => (
          <li key={tab} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={locale === tab}
              className={`admin-tab ${locale === tab ? "admin-tab-active" : ""}`}
              onClick={() => switchLocaleTab(tab)}
            >
              {t(`redesign.home.locale.${tab}`)}
            </button>
          </li>
        ))}
      </ul>

      {state.phase === "loading" && (
        <p className="admin-muted py-6 text-sm">{t("redesign.home.loading")}</p>
      )}

      {state.phase === "loadError" && (
        <div className="admin-banner-error mb-4" role="alert">
          <p>{t("redesign.home.loadFailed")}</p>
          <button
            type="button"
            className="admin-btn mt-2"
            onClick={() => void load(locale)}
          >
            {t("redesign.home.retry")}
          </button>
        </div>
      )}

      {state.phase === "ready" && (
        <>
          {serverEmpty && (
            <p className="admin-muted mb-3 text-sm">
              {t("redesign.home.emptyServer")}
            </p>
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
              <p>{t(TOAST_KEYS[state.toast.text])}</p>
            </div>
          )}

          {listLevelErrors.length > 0 && (
            <div className="admin-banner-error mb-4" role="alert">
              <p>{t("redesign.home.validationFailed")}</p>
              <ul className="admin-field-error">
                {listLevelErrors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="admin-card">
            {state.draft.map((row, index) => {
              const label = homeKeyLabel(locale, row.key);
              const rowTokens = rowErrorsFor(state.fieldErrors, index);
              const moveUpLabel = `${t("redesign.home.moveUp")}: ${label}`;
              const moveDownLabel = `${t("redesign.home.moveDown")}: ${label}`;
              return (
                <div
                  key={row.key}
                  className="mb-3 border-b pb-3 last:mb-0 last:border-b-0 last:pb-0"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                      <span className="admin-muted text-xs" aria-hidden="true">
                        {row.order}
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                      <span
                        className="admin-muted text-xs"
                        style={{ unicodeBidi: "plaintext" }}
                      >
                        {row.key}
                      </span>
                    </div>

                    <label
                      htmlFor={`home-visible-${row.key}`}
                      className="admin-checkbox-row"
                    >
                      <input
                        id={`home-visible-${row.key}`}
                        type="checkbox"
                        checked={row.visible}
                        onChange={() =>
                          dispatch({ type: "TOGGLE_VISIBLE", key: row.key })
                        }
                      />
                      {t("redesign.home.visible")}
                    </label>

                    <span className="admin-muted text-xs">
                      {t("redesign.home.order")}: {row.order}
                    </span>

                    <span className={SELECTION_CHIP_CLASS[row.selection_mode]}>
                      {selectionModeLabel(locale, row.selection_mode)}
                    </span>

                    <div className="ms-auto flex items-center gap-1">
                      <button
                        type="button"
                        className="admin-btn px-2 py-1"
                        aria-label={moveUpLabel}
                        disabled={index === 0}
                        onClick={() =>
                          dispatch({ type: "MOVE", key: row.key, direction: "up" })
                        }
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="admin-btn px-2 py-1"
                        aria-label={moveDownLabel}
                        disabled={index === state.draft.length - 1}
                        onClick={() =>
                          dispatch({
                            type: "MOVE",
                            key: row.key,
                            direction: "down",
                          })
                        }
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {row.provenance_note !== "" && (
                    <p
                      className="admin-muted mt-1 text-xs leading-6"
                      style={{ unicodeBidi: "plaintext" }}
                    >
                      {t("redesign.home.provenance")}: {row.provenance_note}
                    </p>
                  )}

                  {rowTokens.length > 0 && (
                    <ul className="admin-field-error" aria-live="polite">
                      {rowTokens.map((token, tokenIndex) => (
                        <li key={tokenIndex}>
                          {label}: {fieldTokenMessage(locale, token)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="admin-action-row mt-4 items-center">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={!state.dirty || state.saving}
              onClick={() => void handleSave()}
            >
              {state.saving ? t("redesign.home.saving") : t("redesign.home.save")}
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={state.validating}
              onClick={() => void handleValidate()}
            >
              {state.validating
                ? t("redesign.home.validating")
                : t("redesign.home.validate")}
            </button>
          </div>
        </>
      )}

      <RevisionConflictDialog
        open={state.conflictOpen}
        title={t("redesign.conflict.title")}
        body={t("redesign.conflict.body")}
        serverRowsLabel={t("redesign.conflict.serverRows")}
        reloadLabel={t("redesign.conflict.reload")}
        keepMineLabel={t("redesign.conflict.keepMine")}
        serverRows={conflictServerRows.map(
          (row) => homeKeyLabel(locale, row.key)
        )}
        onReload={handleConflictReload}
        onKeepMine={handleConflictKeepMine}
      />
    </div>
  );
}
