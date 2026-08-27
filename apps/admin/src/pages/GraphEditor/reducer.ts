// Pure state machine for the Graph Editor screen (Track AF-04).
// Doctrine: reducer-first — every transition is a named action, unit-testable
// without React. (Runner note: apps/admin has no vitest/jest in package.json;
// automated tests are skipped per packet instruction — deps are frozen. The
// reducer stays pure so a future runner can consume it as-is.)
//
// Server-cache vs editor-draft separation: `saved` mirrors the server payload,
// `draft` owns dirty editing state; server cache invalidates only after a
// successful save. Validation UX + activation refinements are AF-05 — this
// packet ships the shell plus basic activate wiring.

import {
  type GraphEdge,
  type GraphIssue,
  type GraphNode,
  type GraphPayload,
  type GraphRelatedRecord,
  type GraphVersionDetail,
  type GraphVersionRow,
} from "../../lib/adminApiExt";
import { nudgedPosition } from "./canvas";

export type GraphEditorPhase = "loading" | "ready" | "loadError";

/** Node fields editable in the inspector (id is immutable identity). */
export type GraphNodeEdit = Partial<
  Pick<
    GraphNode,
    | "label"
    | "type"
    | "summary"
    | "accessibleLabel"
    | "colorRole"
    | "iconRole"
    | "weight"
    | "position"
  >
>;

/** Edge fields editable in the inspector (source/target/id immutable here). */
export type GraphEdgeEdit = Partial<
  Pick<GraphEdge, "relationType" | "directed" | "weight" | "explanation">
>;

export type GraphSelection =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | null;

export type GraphToastText =
  | "saved"
  | "activated"
  | "save-failed"
  | "activate-failed"
  | "load-failed";

export interface GraphEditorToast {
  kind: "success" | "error";
  /** Semantic sentinel resolved to a localized string by the screen (i18n stays out of the pure reducer). */
  text: GraphToastText;
}

export interface GraphEditorState {
  phase: GraphEditorPhase;
  versions: GraphVersionRow[];
  versionsLoaded: boolean;
  /** Loaded version id; null = nothing on the canvas yet. */
  versionId: number | null;
  detailLoading: boolean;
  /** Server snapshot of the loaded version payload. */
  saved: GraphPayload | null;
  /** Working copy; all inspector/canvas edits land here only. */
  draft: GraphPayload | null;
  selection: GraphSelection;
  /** PUT If-Match revision (the version's updatedAt ISO). */
  revision: string;
  readOnly: boolean;
  dirty: boolean;
  saving: boolean;
  activating: boolean;
  /** Non-null opens the RevisionConflictDialog (409 STALE_REVISION on PUT). */
  conflictOpen: boolean;
  /** Non-null opens the basic activate confirm (AF-05 refines the flow). */
  activateConfirmOpen: boolean;
  /** Server validator issues (PUT 400 / activate 409 VALIDATION_BLOCKED). */
  serverIssues: GraphIssue[];
  /** True when serverIssues came from an activate attempt (banner wording). */
  issuesFromActivate: boolean;
  toast: GraphEditorToast | null;
  loadError: "load-failed" | null;
}

export type GraphEditorAction =
  | { type: "VERSIONS_START" }
  | { type: "VERSIONS_SUCCESS"; rows: GraphVersionRow[] }
  | { type: "VERSIONS_ERROR" }
  | { type: "DETAIL_START"; versionId: number }
  | { type: "DETAIL_SUCCESS"; detail: GraphVersionDetail }
  | { type: "DETAIL_ERROR"; versionId: number }
  | { type: "SELECT"; selection: GraphSelection }
  | { type: "PATCH_NODE"; id: string; patch: GraphNodeEdit }
  | { type: "PATCH_EDGE"; id: string; patch: GraphEdgeEdit }
  | { type: "ADD_RELATED"; nodeId: string; entry: GraphRelatedRecord }
  | { type: "REMOVE_RELATED"; nodeId: string; index: number }
  | { type: "NUDGE_NODE"; nodeId: string; dx: number; dy: number }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; revision: string }
  | { type: "SAVE_CONFLICT" }
  | { type: "SAVE_ISSUES"; issues: GraphIssue[] }
  | { type: "SAVE_ERROR" }
  | { type: "ACTIVATE_CONFIRM_OPEN" }
  | { type: "ACTIVATE_CONFIRM_CLOSE" }
  | { type: "ACTIVATE_START" }
  | { type: "ACTIVATE_SUCCESS" }
  | { type: "ACTIVATE_BLOCKED"; issues: GraphIssue[] }
  | { type: "ACTIVATE_ERROR" }
  | { type: "CONFLICT_KEEP_MINE" }
  | { type: "TOAST_DISMISS" };

export function initialGraphEditorState(): GraphEditorState {
  return {
    phase: "loading",
    versions: [],
    versionsLoaded: false,
    versionId: null,
    detailLoading: false,
    saved: null,
    draft: null,
    selection: null,
    revision: "",
    readOnly: true,
    dirty: false,
    saving: false,
    activating: false,
    conflictOpen: false,
    activateConfirmOpen: false,
    serverIssues: [],
    issuesFromActivate: false,
    toast: null,
    loadError: null,
  };
}

export function payloadEquals(a: GraphPayload, b: GraphPayload): boolean {
  return (
    JSON.stringify(a) === JSON.stringify(b)
  );
}

/**
 * Client-side structural mirror of the smallest validator rules (placeholder
 * until AF-05 wires the validation endpoint): duplicate node id + self edge.
 * Codes/messageTokens mirror admin_graph_validate.py (keep in sync).
 */
export function structuralIssues(payload: GraphPayload): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const seen = new Set<string>();
  for (const node of payload.nodes) {
    if (seen.has(node.id)) {
      issues.push({
        code: "DUPLICATE_NODE_ID",
        nodeId: node.id,
        messageToken: "graph.duplicateNodeId",
      });
    }
    seen.add(node.id);
  }
  for (const edge of payload.edges) {
    if (edge.source === edge.target) {
      issues.push({
        code: "SELF_EDGE",
        edgeId: edge.id,
        messageToken: "graph.selfEdge",
      });
    }
  }
  return issues;
}

function mapNode(
  payload: GraphPayload,
  id: string,
  map: (node: GraphNode) => GraphNode
): GraphPayload {
  return { ...payload, nodes: payload.nodes.map((n) => (n.id === id ? map(n) : n)) };
}

function mapEdge(
  payload: GraphPayload,
  id: string,
  map: (edge: GraphEdge) => GraphEdge
): GraphPayload {
  return { ...payload, edges: payload.edges.map((e) => (e.id === id ? map(e) : e)) };
}

/**
 * Applies one draft mutation. No-op detection is by CONTENT (mapNode/mapEdge
 * always allocate a new object), and dirty is always computed against the
 * server snapshot — never assumed.
 */
function patchDraft(
  state: GraphEditorState,
  draft: GraphPayload
): GraphEditorState {
  if (state.draft !== null && payloadEquals(state.draft, draft)) {
    return state;
  }
  return {
    ...state,
    draft,
    dirty: state.saved === null || !payloadEquals(state.saved, draft),
    serverIssues: [],
  };
}

export function graphEditorReducer(
  state: GraphEditorState,
  action: GraphEditorAction
): GraphEditorState {
  switch (action.type) {
    case "VERSIONS_START":
      return { ...state, phase: "loading", loadError: null };
    case "VERSIONS_SUCCESS":
      return { ...state, phase: "ready", versions: action.rows, versionsLoaded: true, loadError: null };
    case "VERSIONS_ERROR":
      return {
        ...state,
        phase: "loadError",
        versionsLoaded: true,
        loadError: "load-failed",
      };
    case "DETAIL_START":
      return {
        ...state,
        detailLoading: true,
        versionId: action.versionId,
        conflictOpen: false,
        activateConfirmOpen: false,
        serverIssues: [],
        toast: null,
        selection: null,
      };
    case "DETAIL_SUCCESS": {
      if (state.versionId !== action.detail.id) {
        return state; // stale response for a previously selected version
      }
      const payload: GraphPayload = {
        nodes: action.detail.nodes,
        edges: action.detail.edges,
        groups: action.detail.groups,
      };
      return {
        ...state,
        phase: "ready",
        detailLoading: false,
        saved: payload,
        draft: payload,
        revision: action.detail.updatedAt,
        readOnly: action.detail.status !== "draft",
        dirty: false,
        selection: null,
        serverIssues: [],
        conflictOpen: false,
        activateConfirmOpen: false,
        loadError: null,
      };
    }
    case "DETAIL_ERROR":
      if (state.versionId !== action.versionId) {
        return state;
      }
      return {
        ...state,
        detailLoading: false,
        saved: null,
        draft: null,
        selection: null,
        readOnly: true,
        dirty: false,
        toast: { kind: "error", text: "load-failed" },
      };
    case "SELECT":
      return { ...state, selection: action.selection };
    case "PATCH_NODE": {
      if (state.phase !== "ready" || state.readOnly || state.draft === null) {
        return state;
      }
      return patchDraft(state, mapNode(state.draft, action.id, (node) => ({
        ...node,
        ...action.patch,
      })));
    }
    case "PATCH_EDGE": {
      if (state.phase !== "ready" || state.readOnly || state.draft === null) {
        return state;
      }
      return patchDraft(state, mapEdge(state.draft, action.id, (edge) => ({
        ...edge,
        ...action.patch,
      })));
    }
    case "ADD_RELATED": {
      if (state.phase !== "ready" || state.readOnly || state.draft === null) {
        return state;
      }
      const entry = action.entry;
      if (entry.family === "" || entry.id.trim() === "") {
        return state; // malformed entry never enters the draft
      }
      return patchDraft(state, mapNode(state.draft, action.nodeId, (node) => {
        const duplicate = node.relatedRecords.some(
          (row) => row.family === entry.family && row.id === entry.id
        );
        if (duplicate) {
          return node; // dedupe: same (family, id) at most once
        }
        return { ...node, relatedRecords: [...node.relatedRecords, entry] };
      }));
    }
    case "REMOVE_RELATED": {
      if (state.phase !== "ready" || state.readOnly || state.draft === null) {
        return state;
      }
      return patchDraft(state, mapNode(state.draft, action.nodeId, (node) => ({
        ...node,
        relatedRecords: node.relatedRecords.filter(
          (_, index) => index !== action.index
        ),
      })));
    }
    case "NUDGE_NODE": {
      if (state.phase !== "ready" || state.readOnly || state.draft === null) {
        return state;
      }
      return patchDraft(state, mapNode(state.draft, action.nodeId, (node) => ({
        ...node,
        position: nudgedPosition(node, action.dx, action.dy),
      })));
    }
    case "SAVE_START":
      return {
        ...state,
        saving: true,
        toast: null,
        serverIssues: [],
        conflictOpen: false,
      };
    case "SAVE_SUCCESS":
      return {
        ...state,
        saving: false,
        revision: action.revision,
        saved: state.draft,
        dirty: false,
        conflictOpen: false,
        serverIssues: [],
        toast: { kind: "success", text: "saved" },
      };
    case "SAVE_CONFLICT":
      return { ...state, saving: false, conflictOpen: true };
    case "SAVE_ISSUES":
      return {
        ...state,
        saving: false,
        serverIssues: action.issues,
        issuesFromActivate: false,
        toast: null,
      };
    case "SAVE_ERROR":
      return { ...state, saving: false, toast: { kind: "error", text: "save-failed" } };
    case "ACTIVATE_CONFIRM_OPEN":
      return { ...state, activateConfirmOpen: true };
    case "ACTIVATE_CONFIRM_CLOSE":
      return { ...state, activateConfirmOpen: false };
    case "ACTIVATE_START":
      return { ...state, activating: true, toast: null, serverIssues: [] };
    case "ACTIVATE_SUCCESS":
      return {
        ...state,
        activating: false,
        activateConfirmOpen: false,
        readOnly: true,
        dirty: false,
        toast: { kind: "success", text: "activated" },
      };
    case "ACTIVATE_BLOCKED":
      return {
        ...state,
        activating: false,
        activateConfirmOpen: false,
        serverIssues: action.issues,
        issuesFromActivate: true,
        toast: null,
      };
    case "ACTIVATE_ERROR":
      return {
        ...state,
        activating: false,
        activateConfirmOpen: false,
        toast: { kind: "error", text: "activate-failed" },
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
