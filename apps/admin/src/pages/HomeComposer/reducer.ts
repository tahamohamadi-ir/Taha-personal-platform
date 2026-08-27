// Pure state machine for the Home Composer screen (Track AF-01).
// Doctrine: reducer-first for interactive screens — every transition is a
// named action, unit-testable without React. (Runner note: apps/admin has no
// vitest/jest in package.json; automated reducer tests are skipped per packet
// instruction — deps are frozen. The reducer stays pure so a future runner
// can consume it as-is.)

import {
  HOME_MODULE_KEYS,
  type HomeKey,
  type HomeLocale,
  type HomeModuleRow,
} from "../../lib/adminApiExt";

export type HomeComposerPhase = "loading" | "ready" | "loadError";

export interface HomeComposerToast {
  kind: "success" | "error";
  /** Semantic sentinel resolved to a localized string by the screen (i18n stays out of the pure reducer). */
  text: "saved" | "validated" | "validation-failed" | "save-failed" | "load-failed";
}

export interface HomeComposerState {
  phase: HomeComposerPhase;
  locale: HomeLocale;
  /** Working copy; array order IS the display/save order (order = index + 1). */
  draft: HomeModuleRow[];
  revision: string;
  dirty: boolean;
  saving: boolean;
  validating: boolean;
  /** Non-null opens the RevisionConflictDialog (409 STALE_REVISION). */
  conflictOpen: boolean;
  toast: HomeComposerToast | null;
  /** ProblemDetails field map from POST /validate → {path: [token]}. */
  fieldErrors: Record<string, string[]>;
  /** Semantic sentinel resolved to a localized string by the screen (i18n stays out of the pure reducer). */
  loadError: "load-failed" | null;
}

export type HomeComposerAction =
  | { type: "LOAD_START"; locale: HomeLocale }
  | {
      type: "LOAD_SUCCESS";
      locale: HomeLocale;
      revision: string;
      modules: HomeModuleRow[];
    }
  | { type: "LOAD_ERROR"; locale: HomeLocale; message: "load-failed" }
  | { type: "TOGGLE_VISIBLE"; key: HomeKey }
  | { type: "MOVE"; key: HomeKey; direction: "up" | "down" }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; revision: string }
  | { type: "SAVE_CONFLICT" }
  | { type: "SAVE_ERROR"; message: "save-failed" }
  | { type: "VALIDATE_START" }
  | { type: "VALIDATE_SUCCESS" }
  | { type: "VALIDATE_ERROR"; fields: Record<string, string[]> }
  | { type: "CONFLICT_KEEP_MINE" }
  | { type: "TOAST_DISMISS" };

function renumber(rows: HomeModuleRow[]): HomeModuleRow[] {
  return rows.map((row, index) => ({ ...row, order: index + 1 }));
}

/**
 * Merges server rows (sorted by order) into the canonical 8-key frame so the
 * composer always shows exactly the canonical module slots — fresh locales
 * (empty modules) yield the 8 defaults in canonical order.
 */
export function ensureCanonicalRows(
  modules: HomeModuleRow[]
): HomeModuleRow[] {
  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const known = new Set(sorted.map((row) => row.key));
  const filled = [...sorted];
  for (const key of HOME_MODULE_KEYS) {
    if (!known.has(key)) {
      filled.push({
        key,
        visible: false,
        order: 0,
        selection_mode: "manual",
        provenance_note: "",
      });
    }
  }
  return renumber(filled);
}

/** Adjacent swap + renumber; edges (top/bottom) return the input untouched. */
export function moveRow(
  rows: HomeModuleRow[],
  key: HomeKey,
  direction: "up" | "down"
): HomeModuleRow[] {
  const index = rows.findIndex((row) => row.key === key);
  if (index < 0) {
    return rows;
  }
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) {
    return rows;
  }
  const next = [...rows];
  const [moved] = next.splice(index, 1);
  if (moved === undefined) {
    return rows;
  }
  next.splice(target, 0, moved);
  return renumber(next);
}

export function initialHomeComposerState(
  locale: HomeLocale
): HomeComposerState {
  return {
    phase: "loading",
    locale,
    draft: [],
    revision: "",
    dirty: false,
    saving: false,
    validating: false,
    conflictOpen: false,
    toast: null,
    fieldErrors: {},
    loadError: null,
  };
}

export function homeComposerReducer(
  state: HomeComposerState,
  action: HomeComposerAction
): HomeComposerState {
  switch (action.type) {
    case "LOAD_START":
      // Locale switch or conflict-reload: everything server-owned resets.
      return {
        ...state,
        phase: "loading",
        locale: action.locale,
        conflictOpen: false,
        loadError: null,
        saving: false,
        validating: false,
        fieldErrors: {},
        toast: null,
      };
    case "LOAD_SUCCESS":
      if (action.locale !== state.locale) {
        return state; // stale response for a previous tab
      }
      return {
        ...state,
        phase: "ready",
        draft: ensureCanonicalRows(action.modules),
        revision: action.revision,
        dirty: false,
        conflictOpen: false,
        loadError: null,
        fieldErrors: {},
        toast: null,
      };
    case "LOAD_ERROR":
      if (action.locale !== state.locale) {
        return state;
      }
      return {
        ...state,
        phase: "loadError",
        loadError: action.message,
        conflictOpen: false,
      };
    case "TOGGLE_VISIBLE": {
      if (state.phase !== "ready") {
        return state;
      }
      let changed = false;
      const draft = state.draft.map((row) => {
        if (row.key !== action.key) {
          return row;
        }
        changed = true;
        return { ...row, visible: !row.visible };
      });
      if (!changed) {
        return state;
      }
      return { ...state, draft, dirty: true };
    }
    case "MOVE": {
      if (state.phase !== "ready") {
        return state;
      }
      const draft = moveRow(state.draft, action.key, action.direction);
      if (draft === state.draft) {
        return state; // edge: already at top/bottom
      }
      return { ...state, draft, dirty: true };
    }
    case "SAVE_START":
      return { ...state, saving: true, toast: null, fieldErrors: {} };
    case "SAVE_SUCCESS":
      return {
        ...state,
        saving: false,
        revision: action.revision,
        dirty: false,
        conflictOpen: false,
        fieldErrors: {},
        toast: { kind: "success", text: "saved" },
      };
    case "SAVE_CONFLICT":
      return { ...state, saving: false, conflictOpen: true };
    case "SAVE_ERROR":
      return {
        ...state,
        saving: false,
        toast: { kind: "error", text: action.message },
      };
    case "VALIDATE_START":
      return { ...state, validating: true, toast: null, fieldErrors: {} };
    case "VALIDATE_SUCCESS":
      return {
        ...state,
        validating: false,
        fieldErrors: {},
        toast: { kind: "success", text: "validated" },
      };
    case "VALIDATE_ERROR":
      return {
        ...state,
        validating: false,
        fieldErrors: action.fields,
        toast: { kind: "error", text: "validation-failed" },
      };
    case "CONFLICT_KEEP_MINE":
      // Keeps editing the current draft; revision stays stale until a
      // successful reload-then-save cycle.
      return { ...state, conflictOpen: false };
    case "TOAST_DISMISS":
      return { ...state, toast: null };
    default: {
      const exhaustive: never = action;
      void exhaustive;
      return state;
    }
  }
}
