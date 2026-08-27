/** WF-08 Graph Phase 1 consumer adapter (BK-05 public read).

Consumed by the locale home pages (HomeTemplate "graph" slot) and the
research index: GET /api/graph/{locale} ->
{ nodes: GraphNodePublic (camelCase), edges: GraphEdgePublic (camelCase) }.

Fail-closed consumer contract (mirrors the other CMS adapters):
- CMS_API_BASE unset -> null immediately (snapshot mode: the graph block is
  omitted honestly, local/offline builds never invent one).
- transport/timeout/5xx -> CmsOriginError (ADR-0027 Slice 3: an unhealthy
  origin fails the build; never a silent partial graph).
- 404 -> null (BK-05 is 404 fail-closed when no active version is
  published; an absent graph is an expected state, not a build failure).
- unexpected other 4xx -> CmsOriginError.
- 200 with a malformed/unexpected payload shape -> null via the pure parser
  (omit-honestly; never render an untrusted shape, never fail a build over
  content shape - only origin health fails builds).

The pure parser is also the consumer-side honesty layer (WF-08 QA row):
missing-label nodes are dropped, orphan edge endpoints are dropped against
the surviving node id set, duplicate edge ids collapse first-wins, and
blank relatedRecords entries are dropped. relatedRecords stay {family, id}
verbatim - they carry no slug, so no URL may be invented here (escalated:
related-slugs resolution belongs to a later packet). */

import { cmsFetchJson, CmsOriginError, throwIfCmsError } from "./client";

export interface GraphRelatedRecordDto {
  family: string;
  id: string;
}

export interface GraphNodePositionDto {
  x: number;
  y: number;
  z?: number;
}

export interface GraphNodeDto {
  id: string;
  type: string;
  label: string;
  accessibleLabel: string;
  weight: number;
  summary?: string;
  colorRole?: string;
  iconRole?: string;
  position?: GraphNodePositionDto;
  relatedRecords: GraphRelatedRecordDto[];
}

export interface GraphEdgeDto {
  id: string;
  source: string;
  target: string;
  relationType: string;
  directed: boolean;
  weight: number;
  explanation?: string;
}

export interface ResearchGraph {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
}

type Locale = "fa" | "en";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalText(value: unknown): string | undefined {
  return nonEmptyText(value) ? value : undefined;
}

function parseRelatedRecords(value: unknown): GraphRelatedRecordDto[] {
  if (!Array.isArray(value)) return [];
  const records: GraphRelatedRecordDto[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    if (!nonEmptyText(entry.family) || !nonEmptyText(entry.id)) continue;
    records.push({ family: entry.family, id: entry.id });
  }
  return records;
}

function parseNode(value: unknown): GraphNodeDto | null {
  if (!isRecord(value)) return null;
  // Fail-closed: a node without a stable id or a readable label never renders.
  if (!nonEmptyText(value.id) || !nonEmptyText(value.label)) return null;
  const node: GraphNodeDto = {
    id: value.id,
    type: nonEmptyText(value.type) ? value.type : "",
    label: value.label.trim(),
    accessibleLabel:
      typeof value.accessibleLabel === "string" ? value.accessibleLabel.trim() : "",
    weight: typeof value.weight === "number" ? value.weight : 0,
    relatedRecords: parseRelatedRecords(value.relatedRecords),
  };
  const summary = optionalText(value.summary);
  if (summary) node.summary = summary;
  const colorRole = optionalText(value.colorRole);
  if (colorRole) node.colorRole = colorRole;
  const iconRole = optionalText(value.iconRole);
  if (iconRole) node.iconRole = iconRole;
  if (
    isRecord(value.position) &&
    typeof value.position.x === "number" &&
    typeof value.position.y === "number"
  ) {
    const position: GraphNodePositionDto = {
      x: value.position.x,
      y: value.position.y,
    };
    if (typeof value.position.z === "number") position.z = value.position.z;
    node.position = position;
  }
  return node;
}

function parseEdge(value: unknown, knownIds: Set<string>): GraphEdgeDto | null {
  if (!isRecord(value)) return null;
  if (!nonEmptyText(value.id) || !nonEmptyText(value.source) || !nonEmptyText(value.target)) {
    return null;
  }
  // Fail-closed: an edge touching an unknown node id is an orphan and is dropped.
  if (!knownIds.has(value.source) || !knownIds.has(value.target)) return null;
  const edge: GraphEdgeDto = {
    id: value.id,
    source: value.source,
    target: value.target,
    relationType: nonEmptyText(value.relationType) ? value.relationType : "",
    directed: value.directed === true,
    weight: typeof value.weight === "number" ? value.weight : 0,
  };
  const explanation = optionalText(value.explanation);
  if (explanation) edge.explanation = explanation;
  return edge;
}

/**
 * Pure mapper for the 200 path: validate the {nodes, edges} envelope, drop
 * fail-closed rows (missing labels, orphan endpoints, duplicate edge ids,
 * blank related records), and order nodes by weight (heavier first, id as a
 * deterministic tie-break). Returns null for a malformed payload so the
 * caller omits the graph block honestly.
 */
export function parseGraphPayload(payload: unknown): ResearchGraph | null {
  if (!isRecord(payload)) return null;
  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) return null;

  const nodes: GraphNodeDto[] = [];
  const knownIds = new Set<string>();
  for (const entry of payload.nodes) {
    const node = parseNode(entry);
    if (node === null || knownIds.has(node.id)) continue;
    nodes.push(node);
    knownIds.add(node.id);
  }
  if (nodes.length === 0) return null;

  const edges: GraphEdgeDto[] = [];
  const seenEdgeIds = new Set<string>();
  for (const entry of payload.edges) {
    const edge = parseEdge(entry, knownIds);
    if (edge === null || seenEdgeIds.has(edge.id)) continue;
    edges.push(edge);
    seenEdgeIds.add(edge.id);
  }

  nodes.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
  return { nodes, edges };
}

/**
 * Active research graph for a locale.
 * - CMS_API_BASE unset -> null (snapshot mode).
 * - 200 + valid payload -> fail-closed {nodes, edges} (null when empty).
 * - 200 + malformed payload -> null (omit-honestly).
 * - 404 -> null (no active version published).
 * - transport/5xx/other 4xx -> CmsOriginError (fails the build).
 */
export async function getResearchGraph(locale: Locale): Promise<ResearchGraph | null> {
  const result = await cmsFetchJson<unknown>(`/api/graph/${locale}`);
  throwIfCmsError(result, `graph/${locale}`);
  if (result.kind === "unset") return null;
  if (result.kind === "http") {
    if (result.status === 404) return null;
    throw new CmsOriginError(
      `graph/${locale}: unexpected HTTP ${result.status}`,
      result.status,
    );
  }
  return parseGraphPayload(result.data);
}
