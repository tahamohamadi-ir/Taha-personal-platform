import { useMemo, useRef, useState } from "react";

/* research/ResearchGraphIsland - G7 interactive 2D island (LOG-0281 owner
   queue item 9). Hand-rolled SVG over the SAME payload the semantic Astro
   list renders (props-in, never fetches): pan (drag), zoom (wheel
   cursor-centered 0.25-3 + keyboard buttons + reset), focus selection with
   keyboard<->pointer parity (click == Enter/Space select the same node and
   reveal the same endpoint-resolved related URLs from data props).
   Zero new runtime deps (React already ships; no three/gsap/d3). No
   autonomous motion exists (no rAF/timers), so reduced-motion is honest by
   construction. No-JS renders nothing here - the Astro list is the
   fallback. Selection is never color-only (stroke-width + aria-pressed).
   Control labels stay English like the shared Lightbox precedent; fa
   labels ride the composed-fa owner review. */

export interface IslandRelatedRecord {
  family: string;
  id: string;
}

export interface IslandNode {
  id: string;
  type: string;
  label: string;
  accessibleLabel: string;
  weight: number;
  position?: { x: number; y: number };
  relatedRecords: IslandRelatedRecord[];
}

export interface IslandEdge {
  id: string;
  source: string;
  target: string;
  relationType: string;
  directed: boolean;
}

interface Props {
  nodes: IslandNode[];
  edges: IslandEdge[];
  relatedUrls: Record<string, string>;
  label: string;
}

export interface Pt {
  x: number;
  y: number;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const PIN_SCALE = 40;
const RING_RADIUS = 120;

/** Deterministic layout: pinned payload positions (scaled) win, the rest
 *  share a ring in input order. Pure - unit-testable without a DOM. */
export function layoutGraph(
  nodes: IslandNode[],
): Record<string, Pt> {
  const out: Record<string, Pt> = {};
  const floating = nodes.filter(
    (node) => typeof node.position?.x !== "number" || typeof node.position?.y !== "number",
  );
  for (const node of nodes) {
    if (typeof node.position?.x === "number" && typeof node.position?.y === "number") {
      out[node.id] = { x: node.position.x * PIN_SCALE, y: node.position.y * PIN_SCALE };
    }
  }
  floating.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(floating.length, 1);
    out[node.id] = {
      x: RING_RADIUS * Math.cos(angle),
      y: RING_RADIUS * Math.sin(angle),
    };
  });
  return out;
}

export default function ResearchGraphIsland({ nodes, edges, relatedUrls, label }: Props) {
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const positions = useMemo(() => layoutGraph(nodes), [nodes]);
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selected = selectedId !== null ? byId.get(selectedId) ?? null : null;

  const bounds = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of nodes) {
      const pt = positions[node.id] ?? { x: 0, y: 0 };
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    }
    if (!nodes.length) return { x: -160, y: -120, w: 320, h: 240 };
    const pad = 90;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }, [nodes, positions]);

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    setView((prev) => {
      const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev.k * factor));
      const tx = px - ((px - prev.tx) * k) / prev.k;
      const ty = py - ((py - prev.ty) * k) / prev.k;
      return { k, tx, ty };
    });
  }

  function select(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const selectedLinks =
    selected !== null
      ? selected.relatedRecords.flatMap((record) => {
          const url = relatedUrls[`${record.family}:${record.id}`];
          return url ? [{ key: `${record.family}:${record.id}`, url }] : [];
        })
      : [];

  return (
    <div className="research-graph-island" data-research-graph-island>
      <svg
        ref={svgRef}
        viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
        role="img"
        aria-label={label}
        style={{ width: "100%", height: "auto", display: "block", touchAction: "pan-y" }}
        onWheel={(event) => {
          zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.15 : 1 / 1.15);
        }}
        onPointerDown={(event) => {
          (event.target as Element).setPointerCapture?.(event.pointerId);
          dragRef.current = { x: event.clientX, y: event.clientY, tx: view.tx, ty: view.ty };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          setView((prev) => ({
            ...prev,
            tx: drag.tx + (event.clientX - drag.x),
            ty: drag.ty + (event.clientY - drag.y),
          }));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      >
        <defs>
          <marker
            id="rg-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill="var(--color-ink-tertiary)" />
          </marker>
        </defs>
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
          {edges.map((edge) => {
            const a = positions[edge.source];
            const b = positions[edge.target];
            if (!a || !b) return null;
            return (
              <line
                key={edge.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-ink-tertiary)"
                strokeWidth={1.5}
                markerEnd={edge.directed ? "url(#rg-arrow)" : undefined}
              />
            );
          })}
          {nodes.map((node) => {
            const pt = positions[node.id] ?? { x: 0, y: 0 };
            const active = selectedId === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${pt.x} ${pt.y})`}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={node.accessibleLabel || node.label}
                data-graph-node={node.id}
                onClick={() => select(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    select(node.id);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={10 + Math.min(node.weight, 8)}
                  fill="var(--color-surface)"
                  stroke={active ? "var(--color-brand)" : "var(--color-ink)"}
                  strokeWidth={active ? 4 : 1.5}
                />
                <text
                  y={24 + Math.min(node.weight, 8)}
                  textAnchor="middle"
                  fill="var(--color-ink)"
                  fontSize={13}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="research-graph-island__controls" role="group" aria-label="Graph view">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setView((prev) => ({ ...prev, k: Math.min(ZOOM_MAX, prev.k * 1.25) }))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setView((prev) => ({ ...prev, k: Math.max(ZOOM_MIN, prev.k / 1.25) }))}
        >
          -
        </button>
        <button type="button" aria-label="Reset view" onClick={() => setView({ k: 1, tx: 0, ty: 0 })}>
          Reset
        </button>
      </div>
      <div className="research-graph-island__details" aria-live="polite">
        {selected !== null &&
          selectedLinks.map((link) => (
            <a key={link.key} href={link.url}>
              {link.key}
            </a>
          ))}
      </div>
    </div>
  );
}
