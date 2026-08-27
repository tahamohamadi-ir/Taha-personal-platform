// Pure state machine for the Timeline Editor screen (Track AF-02).
// Doctrine: reducer-first — every transition is a named action, unit-testable
// without React. Ordered-list math delegates to the pure helpers in
// src/lib/useOrderedDraftList.ts. (Runner note: apps/admin has no vitest/jest
// in package.json; automated tests are skipped per packet instruction — deps
// are frozen. The reducer stays pure so a future runner can consume it as-is.)

import {
  type TimelineLocale,
  type TimelinePatchInput,
  type TimelineRecord,
  type TimelineType,
} from "../../lib/adminApiExt";
import {
  insertAfterIndex,
  moveRowIndex,
  renumber,
  removeIndex,
} from "../../lib/useOrderedDraftList";

export type TimelineEditorPhase = "loading" | "ready" | "loadError";

export type TimelineToastText =
  | "saved"
  | "created"
  | "deleted"
  | "order-saved"
  | "save-failed"
  | "create-failed"
  | "delete-failed"
  | "order-save-failed"
  | "load-failed";

export interface TimelineEditorToast {
  kind: "success" | "error";
  /** Semantic sentinel resolved to a localized string by the screen (i18n stays out of the pure reducer). */
  text: TimelineToastText;
}

/** Row fields the editor edits inline (attach stays create-only in AF-02). */
export interface TimelineRowValues {
  type: TimelineType;
  label: string;
  period_label: string;
  body: string;
  role: string;
  weight: number;
  detail_url: string;
}

const CONTENT_FIELDS = [
  "type",
  "label",
  "period_label",
  "body",
  "role",
  "weight",
  "detail_url",
] as const satisfies readonly (keyof TimelineRowValues)[];

/**
 * Content-field dirty check. Excludes id/updatedAt (server-owned), order
 * (bulk-reorder operation only) and attach (not row-editable in AF-02).
 * A weight edit that has not parsed yet (sentinel -1) counts as dirty.
 */
export function isRowDirty(
  saved: TimelineRecord | undefined,
  draft: TimelineRecord
): boolean {
  if (saved === undefined) {
    return true;
  }
  return CONTENT_FIELDS.some((field) => draft[field] !== saved[field]);
}

/** Builds the minimal PATCH body for the changed content fields. */
export function timelinePatch(
  saved: TimelineRecord | undefined,
  draft: TimelineRecord
): TimelinePatchInput {
  if (saved === undefined) {
    return {};
  }
  const patch: TimelinePatchInput = {};
  const target = patch as Record<string, unknown>;
  for (const field of CONTENT_FIELDS) {
    if (draft[field] !== saved[field]) {
      target[field] = draft[field];
    }
  }
  return patch;
}

/** Server rows arrive ordered by (order, id); keep that canonical. */
export function sortServerRows(rows: TimelineRecord[]): TimelineRecord[] {
  return [...rows].sort((a, b) => a.order - b.order || a.id - b.id);
}

/**
 * Conflict-reload merge: the conflicting row adopts the server version; every
 * other local draft row keeps BOTH its content edits and its (possibly stale)
 * updatedAt so a later save still gets the correct optimistic 409 if the
 * server truly moved on. Rows deleted server-side disappear.
 */
export function mergeReload(
  draft: TimelineRecord[],
  rows: TimelineRecord[],
  conflictId: number
): TimelineRecord[] {
  const draftById = new Map(draft.map((row) => [row.id, row]));
  const merged = sortServerRows(rows).map((serverRow) => {
    if (serverRow.id === conflictId) {
      return serverRow;
    }
    return draftById.get(serverRow.id) ?? serverRow;
  });
  return renumber(merged);
}

export interface TimelineEditorState {
  phase: TimelineEditorPhase;
  locale: TimelineLocale;
  /** Applied profile filter ("" = all rows of the locale). */
  profileFilter: string;
  /** Server snapshot sorted by (order, id). */
  saved: TimelineRecord[];
  /** Working copy; array position is the display order. */
  draft: TimelineRecord[];
  reorderMode: boolean;
  savingRowIds: number[];
  savingOrder: boolean;
  creating: boolean;
  /** Server 400 VALIDATION tokens per row id (ProblemDetails fields flattened). */
  rowErrors: Record<number, string[]>;
  /** Server 400 VALIDATION tokens for the create dialog. */
  createErrors: string[];
  /** Non-null opens the ConfirmDeleteDialog for this row. */
  deleteCandidateId: number | null;
  /** Non-null opens the RevisionConflictDialog for this row (409/DELETE 409). */
  conflictId: number | null;
  toast: TimelineEditorToast | null;
  loadError: "load-failed" | null;
}

export type TimelineEditorAction =
  | { type: "LOAD_START"; locale: TimelineLocale; profileFilter: string }
  | {
      type: "LOAD_SUCCESS";
      locale: TimelineLocale;
      profileFilter: string;
      rows: TimelineRecord[];
    }
  | { type: "LOAD_ERROR"; locale: TimelineLocale; profileFilter: string }
  | { type: "APPLY_PROFILE_FILTER"; value: string }
  | { type: "ROW_CHANGE"; id: number; patch: Partial<TimelineRowValues> }
  | { type: "ROW_SAVE_START"; id: number }
  | { type: "ROW_SAVE_SUCCESS"; row: TimelineRecord }
  | { type: "ROW_SAVE_CONFLICT"; id: number }
  | { type: "ROW_SAVE_ERROR"; id: number; tokens: string[] }
  | { type: "CREATE_START" }
  | { type: "CREATE_SUCCESS"; row: TimelineRecord; afterId: number | null }
  | { type: "CREATE_ERROR"; tokens: string[] }
  | { type: "DELETE_REQUEST"; id: number }
  | { type: "DELETE_CANCEL" }
  | { type: "DELETE_START"; id: number }
  | { type: "DELETE_SUCCESS"; id: number }
  | { type: "DELETE_ERROR"; id: number }
  | { type: "TOGGLE_REORDER" }
  | { type: "REORDER_MOVE"; index: number; direction: "up" | "down" }
  | { type: "ORDER_SAVE_START" }
  | { type: "ORDER_SAVE_SUCCESS"; rows: TimelineRecord[] }
  | { type: "ORDER_SAVE_ERROR" }
  | {
      type: "RELOAD_SUCCESS";
      locale: TimelineLocale;
      rows: TimelineRecord[];
      conflictId: number;
    }
  | { type: "RELOAD_ERROR"; locale: TimelineLocale }
  | { type: "CONFLICT_KEEP_MINE" }
  | { type: "TOAST_DISMISS" };

export function initialTimelineEditorState(
  locale: TimelineLocale
): TimelineEditorState {
  return {
    phase: "loading",
    locale,
    profileFilter: "",
    saved: [],
    draft: [],
    reorderMode: false,
    savingRowIds: [],
    savingOrder: false,
    creating: false,
    rowErrors: {},
    createErrors: [],
    deleteCandidateId: null,
    conflictId: null,
    toast: null,
    loadError: null,
  };
}

function patchRow(
  rows: TimelineRecord[],
  id: number,
  map: (row: TimelineRecord) => TimelineRecord
): TimelineRecord[] {
  return rows.map((row) => (row.id === id ? map(row) : row));
}

export function anyRowDirty(state: TimelineEditorState): boolean {
  const savedById = new Map(state.saved.map((row) => [row.id, row]));
  return state.draft.some((row) => isRowDirty(savedById.get(row.id), row));
}

export function timelineEditorReducer(
  state: TimelineEditorState,
  action: TimelineEditorAction
): TimelineEditorState {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        phase: "loading",
        locale: action.locale,
        profileFilter: action.profileFilter,
        conflictId: null,
        deleteCandidateId: null,
        loadError: null,
        reorderMode: false,
        savingRowIds: [],
        savingOrder: false,
        rowErrors: {},
        createErrors: [],
        toast: null,
      };
    case "LOAD_SUCCESS": {
      if (
        action.locale !== state.locale ||
        action.profileFilter !== state.profileFilter
      ) {
        return state; // stale response for a previous tab/filter
      }
      const rows = renumber(sortServerRows(action.rows));
      return {
        ...state,
        phase: "ready",
        saved: rows,
        draft: rows,
        conflictId: null,
        deleteCandidateId: null,
        loadError: null,
        reorderMode: false,
        rowErrors: {},
        createErrors: [],
        toast: null,
      };
    }
    case "LOAD_ERROR": {
      if (
        action.locale !== state.locale ||
        action.profileFilter !== state.profileFilter
      ) {
        return state;
      }
      return {
        ...state,
        phase: "loadError",
        loadError: "load-failed",
        conflictId: null,
        deleteCandidateId: null,
      };
    }
    case "APPLY_PROFILE_FILTER":
      return { ...state, profileFilter: action.value };
    case "ROW_CHANGE": {
      if (state.phase !== "ready") {
        return state;
      }
      const nextErrors = { ...state.rowErrors };
      delete nextErrors[action.id];
      return {
        ...state,
        draft: patchRow(state.draft, action.id, (row) => ({
          ...row,
          ...action.patch,
        })),
        rowErrors: nextErrors,
      };
    }
    case "ROW_SAVE_START":
      return {
        ...state,
        savingRowIds: [...state.savingRowIds, action.id],
        rowErrors: { ...state.rowErrors, [action.id]: [] },
        toast: null,
      };
    case "ROW_SAVE_SUCCESS": {
      const fresh = action.row;
      return {
        ...state,
        savingRowIds: state.savingRowIds.filter((id) => id !== fresh.id),
        saved: patchRow(state.saved, fresh.id, () => fresh),
        draft: patchRow(state.draft, fresh.id, () => fresh),
        conflictId:
          state.conflictId === fresh.id ? null : state.conflictId,
        toast: { kind: "success", text: "saved" },
      };
    }
    case "ROW_SAVE_CONFLICT":
      return {
        ...state,
        savingRowIds: state.savingRowIds.filter((id) => id !== action.id),
        conflictId: action.id,
      };
    case "ROW_SAVE_ERROR":
      return {
        ...state,
        savingRowIds: state.savingRowIds.filter((id) => id !== action.id),
        rowErrors:
          action.tokens.length > 0
            ? { ...state.rowErrors, [action.id]: action.tokens }
            : state.rowErrors,
        toast: { kind: "error", text: "save-failed" },
      };
    case "CREATE_START":
      return { ...state, creating: true, createErrors: [], toast: null };
    case "CREATE_SUCCESS": {
      const anchorIndex =
        action.afterId === null
          ? null
          : state.draft.findIndex((row) => row.id === action.afterId);
      return {
        ...state,
        creating: false,
        draft: renumber(
          insertAfterIndex(state.draft, action.row, anchorIndex)
        ),
        saved: sortServerRows([...state.saved, action.row]),
        toast: { kind: "success", text: "created" },
      };
    }
    case "CREATE_ERROR":
      return {
        ...state,
        creating: false,
        createErrors: action.tokens,
        toast:
          action.tokens.length > 0
            ? state.toast
            : { kind: "error", text: "create-failed" },
      };
    case "DELETE_REQUEST":
      return { ...state, deleteCandidateId: action.id };
    case "DELETE_CANCEL":
      return { ...state, deleteCandidateId: null };
    case "DELETE_START":
      return state;
    case "DELETE_ERROR":
      return {
        ...state,
        deleteCandidateId: null,
        toast: { kind: "error", text: "delete-failed" },
      };
    case "DELETE_SUCCESS":
    case "DELETE_SUCCESS":
      return {
        ...state,
        deleteCandidateId: null,
        draft: removeIndex(
          state.draft,
          state.draft.findIndex((row) => row.id === action.id)
        ),
        saved: state.saved.filter((row) => row.id !== action.id),
        conflictId: state.conflictId === action.id ? null : state.conflictId,
        toast: { kind: "success", text: "deleted" },
      };
    case "TOGGLE_REORDER": {
      if (state.phase !== "ready" || anyRowDirty(state)) {
        return state; // reorder must not silently discard unsaved field edits
      }
      return { ...state, reorderMode: !state.reorderMode };
    }
    case "REORDER_MOVE": {
      if (state.phase !== "ready" || !state.reorderMode) {
        return state;
      }
      return {
        ...state,
        draft: renumber(
          moveRowIndex(state.draft, action.index, action.direction)
        ),
      };
    }
    case "ORDER_SAVE_START":
      return {
        ...state,
        savingOrder: true,
        toast: null,
      };
    case "ORDER_SAVE_SUCCESS": {
      const rows = renumber(sortServerRows(action.rows));
      return {
        ...state,
        savingOrder: false,
        saved: rows,
        draft: rows,
        toast: { kind: "success", text: "order-saved" },
      };
    }
    case "ORDER_SAVE_ERROR":
      return {
        ...state,
        savingOrder: false,
        toast: { kind: "error", text: "order-save-failed" },
      };
    case "RELOAD_SUCCESS": {
      if (action.locale !== state.locale) {
        return state;
      }
      return {
        ...state,
        saved: sortServerRows(action.rows),
        draft: mergeReload(state.draft, action.rows, action.conflictId),
        conflictId: null,
        savingRowIds: state.savingRowIds.filter((id) => id !== action.conflictId),
        rowErrors: { ...state.rowErrors, [action.conflictId]: [] },
      };
    }
    case "RELOAD_ERROR":
      if (action.locale !== state.locale) {
        return state;
      }
      return {
        ...state,
        conflictId: null,
        toast: { kind: "error", text: "load-failed" },
      };
    case "CONFLICT_KEEP_MINE":
      // Keeps editing the current draft row; its updatedAt stays stale until a
      // successful reload, so a retry still surfaces the conflict honestly.
      return { ...state, conflictId: null };
    case "TOAST_DISMISS":
      return { ...state, toast: null };
    default: {
      const exhaustive: never = action;
      void exhaustive;
      return state;
    }
  }
}
