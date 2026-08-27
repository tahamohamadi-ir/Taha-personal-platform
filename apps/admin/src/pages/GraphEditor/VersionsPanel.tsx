// Left panel for the Graph Editor (Track AF-04): versions strip (status pill,
// click loads the payload read-only unless draft) + groups tree (expand/
// collapse with counts; v1 groups are RENDER-ONLY — no group authoring UI).

import { useState, type ReactElement } from "react";
import {
  type GraphGroup,
  type GraphLocale,
  type GraphNode,
  type GraphVersionRow,
} from "../../lib/adminApiExt";

interface VersionsPanelProps {
  versions: GraphVersionRow[];
  loadedVersionId: number | null;
  detailLoading: boolean;
  groups: GraphGroup[];
  nodes: GraphNode[];
  newLocale: GraphLocale;
  creating: boolean;
  t: (key: string) => string;
  onNewLocaleChange: (locale: GraphLocale) => void;
  onCreateDraft: () => void;
  onSelectVersion: (id: number) => void;
}

function statusPillClass(status: string): string {
  return status === "active" ? "admin-status-published" : "admin-status-draft";
}

export default function VersionsPanel({
  versions,
  loadedVersionId,
  detailLoading,
  groups,
  nodes,
  newLocale,
  creating,
  t,
  onNewLocaleChange,
  onCreateDraft,
  onSelectVersion,
}: VersionsPanelProps): ReactElement {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleGroup(name: string): void {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  const labelById = new Map(nodes.map((node) => [node.id, node.label]));

  return (
    <div className="flex flex-col gap-3">
      <section className="admin-card" aria-label={t("redesign.graph.versions")}>
        <h2 className="mb-2 text-sm font-bold">{t("redesign.graph.versions")}</h2>
        <ul className="list-none p-0">
          {versions.map((row) => (
            <li key={row.id} className="mb-1">
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-sm hover:bg-gray-100 ${
                  loadedVersionId === row.id ? "admin-link-active" : ""
                }`}
                aria-current={loadedVersionId === row.id ? "true" : undefined}
                onClick={() => onSelectVersion(row.id)}
              >
                <span style={{ unicodeBidi: "plaintext" }}>#{row.id}</span>
                <span className="admin-muted text-xs">{row.locale}</span>
                <span
                  className={`admin-status-badge ${statusPillClass(row.status)}`}
                >
                  {row.status === "active"
                    ? t("redesign.graph.activeVersion")
                    : t("redesign.graph.draftVersion")}
                </span>
                <span className="admin-muted ms-auto text-xs" dir="ltr">
                  {row.nodeCount}/{row.edgeCount}
                </span>
              </button>
            </li>
          ))}
          {versions.length === 0 && (
            <li className="admin-muted text-xs">{t("redesign.graph.noVersions")}</li>
          )}
        </ul>
        {detailLoading && (
          <p className="admin-muted mt-1 text-xs">{t("redesign.graph.loading")}</p>
        )}
        <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: "var(--admin-border)" }}>
          <label className="sr-only" htmlFor="graph-new-locale">
            {t("redesign.graph.newDraft")}
          </label>
          <select
            id="graph-new-locale"
            className="admin-input"
            value={newLocale}
            onChange={(event) => onNewLocaleChange(event.target.value as GraphLocale)}
          >
            <option value="fa">فارسی</option>
            <option value="en">English</option>
          </select>
          <button
            type="button"
            className="admin-btn px-2 py-1 text-xs"
            disabled={creating}
            onClick={onCreateDraft}
          >
            {t("redesign.graph.newDraft")}
          </button>
        </div>
      </section>

      <section className="admin-card" aria-label={t("redesign.graph.groups")}>
        <h2 className="mb-1 text-sm font-bold">{t("redesign.graph.groups")}</h2>
        <p className="admin-muted mb-2 text-xs">{t("redesign.graph.groupsNote")}</p>
        <ul className="list-none p-0">
          {groups.map((group) => {
            const isOpen = expanded.has(group.name);
            return (
              <li key={group.name} className="mb-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-start text-sm hover:bg-gray-100"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group.name)}
                >
                  <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                  <span className="truncate">{group.name}</span>
                  <span className="admin-status-badge admin-status-unknown">
                    {group.nodeIds.length}
                  </span>
                </button>
                {isOpen && (
                  <ul className="list-none p-0 pe-4">
                    {group.nodeIds.map((nodeId) => (
                      <li
                        key={nodeId}
                        className="admin-muted truncate px-2 py-0.5 text-xs"
                        style={{ unicodeBidi: "plaintext" }}
                      >
                        {labelById.get(nodeId) ?? nodeId}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          {groups.length === 0 && (
            <li className="admin-muted text-xs">—</li>
          )}
        </ul>
      </section>
    </div>
  );
}
