// Semantic-list preview panel for the Graph Editor (Track AF-06). PURE:
// deterministic render from props only (no hooks, no fetch, no side effects);
// the page owns the toggle state and passes it down with change callbacks.
// The preview source is the CURRENT in-memory DRAFT payload (camel GraphNode
// / GraphEdge) — it is NOT a server render and NOT the true-site embed (the
// embedded site preview iframe is explicitly DEFERRED to the owner ledger).
//
// Honest-scope decisions (AF-06):
// - The locale toggle does NOT fake a translation: graph versions are
//   per-locale and nodes carry exactly one label, so a selected locale that
//   differs from the loaded version's locale renders the honest mismatch
//   notice instead of the list.
// - The theme toggle does NOT fake dark mode: index.css has a single light
//   token set (:root only, no [data-theme], no prefers-color-scheme), so
//   selecting dark renders the honest unavailability notice and the panel
//   keeps the real admin theme.
// - Relation arrows are ASCII "->" mirrored in RTL via CSS
//   (.graph-preview-arrow in index.css); logical CSS only, no physical
//   left/right anywhere.

import type { ReactElement } from "react";
import type { ContentLocale } from "../../lib/api";
import type { GraphEdge, GraphNode } from "../../lib/adminApiExt";

export type GraphPreviewTheme = "light" | "dark";

interface GraphPreviewPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Selected preview locale (toggle); compared against versionLocale honestly. */
  locale: ContentLocale;
  theme: GraphPreviewTheme;
  /** Locale of the loaded graph version; null = unknown (no mismatch claim). */
  versionLocale: ContentLocale | null;
  t: (key: string) => string;
  onLocaleChange: (locale: ContentLocale) => void;
  onThemeChange: (theme: GraphPreviewTheme) => void;
}

/** Nodes carry one label; empty labels fall back to the node id (screen precedent). */
function displayLabel(node: GraphNode): string {
  return node.label !== "" ? node.label : node.id;
}

export default function GraphPreviewPanel({
  nodes,
  edges,
  locale,
  theme,
  versionLocale,
  t,
  onLocaleChange,
  onThemeChange,
}: GraphPreviewPanelProps): ReactElement {
  // Group by node.type; groups sorted by type name, nodes by weight DESC then
  // label ASC (locale-aware) — deterministic on every draft mutation.
  const byType = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    const group = byType.get(node.type);
    if (group === undefined) {
      byType.set(node.type, [node]);
    } else {
      group.push(node);
    }
  }
  const types = Array.from(byType.keys()).sort((a, b) => a.localeCompare(b));
  for (const group of byType.values()) {
    group.sort(
      (a, b) =>
        b.weight - a.weight ||
        displayLabel(a).localeCompare(displayLabel(b), locale)
    );
  }

  const labelById = new Map(nodes.map((node) => [node.id, displayLabel(node)]));

  return (
    <section
      className="admin-card"
      aria-label={t("redesign.graph.preview.title")}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold">
          {t("redesign.graph.preview.title")}
        </h2>
        <ul
          className="admin-tabs"
          role="tablist"
          aria-label={t("redesign.graph.preview.title")}
        >
          {(["fa", "en"] as const).map((tab) => (
            <li key={`locale-${tab}`} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={locale === tab}
                className={`admin-tab ${locale === tab ? "admin-tab-active" : ""}`}
                onClick={() => onLocaleChange(tab)}
              >
                {t(`redesign.home.locale.${tab}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {(["light", "dark"] as const).map((option) => (
          <button
            key={`theme-${option}`}
            type="button"
            className={`admin-btn px-2 py-1 text-xs ${theme === option ? "admin-link-active" : ""}`}
            aria-pressed={theme === option}
            onClick={() => onThemeChange(option)}
          >
            {option === "light"
              ? t("redesign.graph.preview.theme.light")
              : t("redesign.graph.preview.theme.dark")}
          </button>
        ))}
        {theme === "dark" && (
          <p className="admin-muted text-xs" role="note">
            {t("redesign.graph.preview.themeUnavailable")}
          </p>
        )}
      </div>

      {versionLocale !== null && locale !== versionLocale ? (
        <p className="admin-muted text-sm" role="note">
          {t("redesign.graph.preview.localeMismatch").split("{locale}").join(
            t(`redesign.home.locale.${versionLocale}`)
          )}
        </p>
      ) : (
        <>
          {nodes.length === 0 && <p className="admin-muted text-sm">—</p>}
          {types.map((type) => (
            <div key={type} className="mb-3">
              <h3
                className="mb-1 text-sm font-semibold"
                style={{ unicodeBidi: "plaintext" }}
              >
                {type}
              </h3>
              <ol className="list-decimal space-y-1 ps-6">
                {(byType.get(type) ?? []).map((node) => (
                  <li key={node.id}>
                    <span style={{ unicodeBidi: "plaintext" }}>
                      {displayLabel(node)}
                    </span>
                    {node.accessibleLabel !== "" && (
                      <span className="admin-muted block text-xs">
                        {node.accessibleLabel}
                      </span>
                    )}
                    <span className="admin-muted block text-xs">
                      {t("redesign.graph.preview.relatedCount")
                        .split("{count}")
                        .join(String(node.relatedRecords.length))}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <h3 className="mb-1 text-sm font-semibold">
            {t("redesign.graph.preview.relations")}
          </h3>
          {edges.length === 0 ? (
            <p className="admin-muted text-sm">—</p>
          ) : (
            <ul className="list-disc space-y-1 ps-6">
              {edges.map((edge) => (
                <li key={edge.id}>
                  <span style={{ unicodeBidi: "plaintext" }}>
                    {labelById.get(edge.source) ?? edge.source}{" "}
                    <span className="graph-preview-arrow" aria-hidden="true">
                      {"->"}
                    </span>{" "}
                    {labelById.get(edge.target) ?? edge.target} (
                    {edge.relationType})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
