// Right-hand inspector for the Graph Editor (Track AF-04). Forms switch on
// the selection kind (node | edge); every change dispatches a draft-only
// reducer action (server cache untouched until Save). colorRole/iconRole are
// text inputs restricted to token-ish strings ([a-z0-9-]); weight is a 0|1
// select mirroring the integral-weight validator rule. Groups are render-only
// in v1 (see VersionsPanel) — no group editing here.

import { useState, type ReactElement } from "react";
import {
  GRAPH_RELATED_FAMILIES,
  type GraphEdge,
  type GraphNode,
  type GraphRelatedFamily,
} from "../../lib/adminApiExt";
import type { GraphEdgeEdit, GraphNodeEdit } from "./reducer";

interface InspectorPanelProps {
  node: GraphNode | null;
  edge: GraphEdge | null;
  readOnly: boolean;
  t: (key: string) => string;
  onPatchNode: (id: string, patch: GraphNodeEdit) => void;
  onPatchEdge: (id: string, patch: GraphEdgeEdit) => void;
  onAddRelated: (nodeId: string, family: GraphRelatedFamily, id: string) => void;
  onRemoveRelated: (nodeId: string, index: number) => void;
}

function tokenized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export default function InspectorPanel({
  node,
  edge,
  readOnly,
  t,
  onPatchNode,
  onPatchEdge,
  onAddRelated,
  onRemoveRelated,
}: InspectorPanelProps): ReactElement {
  const [relatedFamily, setRelatedFamily] = useState<GraphRelatedFamily>("article");
  const [relatedId, setRelatedId] = useState("");

  return (
    <aside className="admin-card" aria-label={t("redesign.graph.inspector")}>
      <h2 className="mb-3 text-sm font-bold">{t("redesign.graph.inspector")}</h2>

      {node === null && edge === null && (
        <p className="admin-muted text-sm">{t("redesign.graph.noSelection")}</p>
      )}

      {node !== null && (
        <div>
          <p className="admin-muted mb-2 text-xs" style={{ unicodeBidi: "plaintext" }}>
            {t("redesign.graph.nodeSection")}: {node.id}
          </p>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-label">
              {t("redesign.graph.label")}
            </label>
            <input
              id="graph-node-label"
              className="admin-input"
              type="text"
              value={node.label}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { label: event.target.value })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-type">
              {t("redesign.graph.type")}
            </label>
            <input
              id="graph-node-type"
              className="admin-input"
              type="text"
              value={node.type}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { type: tokenized(event.target.value) })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-summary">
              {t("redesign.graph.summary")}
            </label>
            <textarea
              id="graph-node-summary"
              className="admin-input"
              rows={2}
              value={node.summary ?? ""}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { summary: event.target.value })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-accessible">
              {t("redesign.graph.accessibleLabel")}
            </label>
            <input
              id="graph-node-accessible"
              className="admin-input"
              type="text"
              value={node.accessibleLabel}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { accessibleLabel: event.target.value })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-color">
              {t("redesign.graph.colorRole")}
            </label>
            <input
              id="graph-node-color"
              className="admin-input"
              type="text"
              value={node.colorRole}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { colorRole: tokenized(event.target.value) })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-icon">
              {t("redesign.graph.iconRole")}
            </label>
            <input
              id="graph-node-icon"
              className="admin-input"
              type="text"
              value={node.iconRole}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { iconRole: tokenized(event.target.value) })
              }
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-node-weight">
              {t("redesign.graph.weight")}
            </label>
            <select
              id="graph-node-weight"
              className="admin-input"
              value={String(node.weight)}
              disabled={readOnly}
              onChange={(event) =>
                onPatchNode(node.id, { weight: Number(event.target.value) })
              }
            >
              <option value="1">1</option>
              <option value="0">0</option>
            </select>
          </div>

          <fieldset className="admin-form-row" disabled={readOnly}>
            <legend className="admin-label">{t("redesign.graph.position")}</legend>
            <div className="flex items-center gap-2">
              <label className="admin-muted text-xs" htmlFor="graph-node-pos-x">
                X
              </label>
              <input
                id="graph-node-pos-x"
                className="admin-input"
                type="number"
                step="any"
                value={node.position !== undefined ? String(node.position.x) : ""}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  if (raw === "") {
                    return;
                  }
                  const parsed = Number(raw);
                  if (Number.isFinite(parsed)) {
                    onPatchNode(node.id, {
                      position: {
                        x: parsed,
                        y: node.position !== undefined ? node.position.y : 0,
                        ...(node.position?.z !== undefined
                          ? { z: node.position.z }
                          : {}),
                      },
                    });
                  }
                }}
              />
              <label className="admin-muted text-xs" htmlFor="graph-node-pos-y">
                Y
              </label>
              <input
                id="graph-node-pos-y"
                className="admin-input"
                type="number"
                step="any"
                value={node.position !== undefined ? String(node.position.y) : ""}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  if (raw === "") {
                    return;
                  }
                  const parsed = Number(raw);
                  if (Number.isFinite(parsed)) {
                    onPatchNode(node.id, {
                      position: {
                        x: node.position !== undefined ? node.position.x : 0,
                        y: parsed,
                        ...(node.position?.z !== undefined
                          ? { z: node.position.z }
                          : {}),
                      },
                    });
                  }
                }}
              />
              <label className="admin-muted text-xs" htmlFor="graph-node-pos-z">
                Z
              </label>
              <input
                id="graph-node-pos-z"
                className="admin-input"
                type="number"
                step="any"
                value={node.position?.z !== undefined ? String(node.position.z) : ""}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  if (raw === "") {
                    return;
                  }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed) || node.position === undefined) {
                    return;
                  }
                  onPatchNode(node.id, {
                    position: { x: node.position.x, y: node.position.y, z: parsed },
                  });
                }}
              />
            </div>
          </fieldset>

          <div className="admin-form-row">
            <span className="admin-label">{t("redesign.graph.relatedRecords")}</span>
            <ul className="mb-1 list-none p-0">
              {node.relatedRecords.map((record, index) => (
                <li
                  key={`${record.family}:${record.id}`}
                  className="mb-1 flex items-center gap-2 text-xs"
                >
                  <span className="admin-muted">{record.family}</span>
                  <span style={{ unicodeBidi: "plaintext" }}>{record.id}</span>
                  <button
                    type="button"
                    className="admin-btn px-2 py-0.5 text-xs"
                    disabled={readOnly}
                    aria-label={`${t("redesign.graph.relatedRemove")}: ${record.family}:${record.id}`}
                    onClick={() => onRemoveRelated(node.id, index)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {node.relatedRecords.length === 0 && (
                <li className="admin-muted text-xs">—</li>
              )}
            </ul>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="graph-related-family">
                {t("redesign.graph.relatedFamily")}
              </label>
              <select
                id="graph-related-family"
                className="admin-input"
                value={relatedFamily}
                disabled={readOnly}
                onChange={(event) =>
                  setRelatedFamily(event.target.value as GraphRelatedFamily)
                }
              >
                {GRAPH_RELATED_FAMILIES.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="graph-related-id">
                {t("redesign.graph.relatedId")}
              </label>
              <input
                id="graph-related-id"
                className="admin-input"
                type="text"
                style={{ unicodeBidi: "plaintext" }}
                value={relatedId}
                disabled={readOnly}
                onChange={(event) => setRelatedId(event.target.value)}
              />
              <button
                type="button"
                className="admin-btn px-2 py-1 text-xs"
                disabled={readOnly || relatedId.trim() === ""}
                onClick={() => {
                  onAddRelated(node.id, relatedFamily, relatedId.trim());
                  setRelatedId("");
                }}
              >
                {t("redesign.graph.relatedAdd")}
              </button>
            </div>
          </div>
        </div>
      )}

      {edge !== null && (
        <div>
          <p className="admin-muted mb-2 text-xs" style={{ unicodeBidi: "plaintext" }}>
            {t("redesign.graph.edgeSection")}: {edge.source} → {edge.target}
          </p>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-edge-relation">
              {t("redesign.graph.relationType")}
            </label>
            <input
              id="graph-edge-relation"
              className="admin-input"
              type="text"
              value={edge.relationType}
              disabled={readOnly}
              onChange={(event) =>
                onPatchEdge(edge.id, {
                  relationType: tokenized(event.target.value),
                })
              }
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="graph-edge-directed" className="admin-checkbox-row">
              <input
                id="graph-edge-directed"
                type="checkbox"
                checked={edge.directed}
                disabled={readOnly}
                onChange={(event) =>
                  onPatchEdge(edge.id, { directed: event.target.checked })
                }
              />
              {t("redesign.graph.directed")}
            </label>
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-edge-weight">
              {t("redesign.graph.weight")}
            </label>
            <select
              id="graph-edge-weight"
              className="admin-input"
              value={String(edge.weight)}
              disabled={readOnly}
              onChange={(event) =>
                onPatchEdge(edge.id, { weight: Number(event.target.value) })
              }
            >
              <option value="1">1</option>
              <option value="0">0</option>
            </select>
          </div>

          <div className="admin-form-row">
            <label className="admin-label" htmlFor="graph-edge-explanation">
              {t("redesign.graph.explanation")}
            </label>
            <textarea
              id="graph-edge-explanation"
              className="admin-input"
              rows={3}
              value={edge.explanation ?? ""}
              disabled={readOnly}
              onChange={(event) =>
                onPatchEdge(edge.id, { explanation: event.target.value })
              }
            />
          </div>
        </div>
      )}
    </aside>
  );
}
