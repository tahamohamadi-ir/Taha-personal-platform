import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import type { ResearchGraphModel } from "../../lib/cms/research-graph";

export interface ResearchGraphIslandLabels {
  interactiveLabel: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  focusHint: string;
  topicKind: string;
  projectKind: string;
  publicationKind: string;
}

export interface ResearchGraphIslandProps {
  graph: ResearchGraphModel;
  dir: "ltr" | "rtl";
  labels: ResearchGraphIslandLabels;
}

const KIND_FILL: Record<string, string> = {
  topic: "var(--color-brand)",
  project: "var(--color-navy-950)",
  publication: "var(--color-research)",
};

const MIN_SCALE = 0.55;
const MAX_SCALE = 2.4;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase();
}

/** Curved edge path: quadratic bezier bowed perpendicular to the midpoint. */
function edgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // fixed-size bow independent of zoom; flip side by column direction
  const bow = Math.min(36, len * 0.12) * (dx >= 0 ? -1 : 1);
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export default function ResearchGraphIsland({
  graph,
  dir,
  labels,
}: ResearchGraphIslandProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );

  const nodeById = useMemo(() => {
    const map = new Map(graph.nodes.map((n) => [n.id, n]));
    return map;
  }, [graph.nodes]);

  const neighborIds = useMemo(() => {
    if (!focusedId) return new Set<string>();
    const set = new Set<string>([focusedId]);
    for (const edge of graph.edges) {
      if (edge.from === focusedId) set.add(edge.to);
      if (edge.to === focusedId) set.add(edge.from);
    }
    return set;
  }, [focusedId, graph.edges]);

  // Titles that appear under more than one kind (e.g. a topic and its
  // companion project share a name) get a kind suffix so the graph does not
  // show two visually identical labels for different entities.
  const ambiguousTitles = useMemo(() => {
    const byTitle = new Map<string, Set<string>>();
    for (const node of graph.nodes) {
      const key = normalizeTitle(node.title);
      const kinds = byTitle.get(key) ?? new Set<string>();
      kinds.add(node.kind);
      byTitle.set(key, kinds);
    }
    const ambiguous = new Set<string>();
    for (const [key, kinds] of byTitle) {
      if (kinds.size > 1) ambiguous.add(key);
    }
    return ambiguous;
  }, [graph.nodes]);

  const displayLabel = (node: (typeof graph.nodes)[number]): string => {
    const base =
      node.title.length > 30
        ? `${node.title.slice(0, 28).trimEnd()}…`
        : node.title;
    if (ambiguousTitles.has(normalizeTitle(node.title))) {
      return `${base} · ${kindLabelOf(node.kind)}`;
    }
    return base;
  };

  const kindLabelOf = (kind: string) => {
    if (kind === "topic") return labels.topicKind;
    if (kind === "project") return labels.projectKind;
    return labels.publicationKind;
  };

  const resetView = useCallback(() => {
    setFocusedId(null);
    if (reduceMotion) {
      setScale(1);
      setTx(0);
      setTy(0);
      return;
    }
    animate(scale, 1, {
      duration: 0.28,
      onUpdate: (v) => setScale(v),
    });
    animate(tx, 0, {
      duration: 0.28,
      onUpdate: (v) => setTx(v),
    });
    animate(ty, 0, {
      duration: 0.28,
      onUpdate: (v) => setTy(v),
    });
  }, [reduceMotion, scale, tx, ty]);

  const zoomBy = useCallback(
    (delta: number) => {
      setScale((s) => clamp(s + delta, MIN_SCALE, MAX_SCALE));
    },
    [],
  );

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const next = clamp(scale + (event.deltaY < 0 ? 0.12 : -0.12), MIN_SCALE, MAX_SCALE);
      setScale(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale]);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("a, button")) return;
    drag.current = { x: event.clientX, y: event.clientY, tx, ty };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    const factor = dir === "rtl" ? -1 : 1;
    setTx(drag.current.tx + dx * factor);
    setTy(drag.current.ty + dy);
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setFocusedId(null);
      resetView();
      return;
    }
    if (!focusedId) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    const current = nodeById.get(focusedId);
    if (!current) return;
    const candidates = graph.nodes.filter((n) => n.id !== focusedId);
    let best: string | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const n of candidates) {
      const dx = n.x - current.x;
      const dy = n.y - current.y;
      let ok = false;
      if (event.key === "ArrowRight") ok = dx > 8;
      if (event.key === "ArrowLeft") ok = dx < -8;
      if (event.key === "ArrowDown") ok = dy > 8;
      if (event.key === "ArrowUp") ok = dy < -8;
      if (!ok) continue;
      const score = Math.hypot(dx, dy);
      if (score < bestScore) {
        bestScore = score;
        best = n.id;
      }
    }
    if (best) {
      setFocusedId(best);
      const link = document.getElementById(`rg-node-${best}`);
      link?.focus();
    }
  };

  return (
    <div
      className="rg-island"
      dir={dir}
      onKeyDown={onKeyDown}
      role="group"
      aria-labelledby={titleId}
    >
      <div className="rg-toolbar">
        <p id={titleId} className="rg-toolbar-title">
          {labels.interactiveLabel}
        </p>
        <div className="rg-toolbar-actions">
          <button type="button" onClick={() => zoomBy(0.15)} aria-label={labels.zoomIn}>
            +
          </button>
          <button type="button" onClick={() => zoomBy(-0.15)} aria-label={labels.zoomOut}>
            −
          </button>
          <button type="button" onClick={resetView}>
            {labels.resetView}
          </button>
        </div>
      </div>
      <p className="rg-hint">{labels.focusHint}</p>
      <div className="rg-legend" aria-hidden="true">
        <span className="rg-legend-item">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill={KIND_FILL.topic} />
          </svg>
          {labels.topicKind}
        </span>
        <span className="rg-legend-item">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <rect x="1.5" y="1.5" width="11" height="11" rx="3" fill={KIND_FILL.project} />
          </svg>
          {labels.projectKind}
        </span>
        <span className="rg-legend-item">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <rect x="2.6" y="2.6" width="8.8" height="8.8" transform="rotate(45 7 7)" fill={KIND_FILL.publication} />
          </svg>
          {labels.publicationKind}
        </span>
      </div>
      <svg
        ref={svgRef}
        className="rg-svg"
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        role="img"
        aria-labelledby={titleId}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          {graph.edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const active =
              !focusedId ||
              neighborIds.has(edge.from) ||
              neighborIds.has(edge.to);
            return (
              <path
                key={edge.id}
                d={edgePath(from.x, from.y, to.x, to.y)}
                fill="none"
                className={active ? "rg-edge rg-edge-active" : "rg-edge"}
              />
            );
          })}
          {graph.nodes.map((node) => {
            const dimmed = Boolean(focusedId) && !neighborIds.has(node.id);
            const focused = focusedId === node.id;
            const r = focused ? 17 : 13;
            const fill = KIND_FILL[node.kind] ?? "currentColor";
            return (
              <g
                key={node.id}
                className={dimmed ? "rg-node rg-node-dim" : "rg-node"}
                transform={`translate(${node.x} ${node.y})`}
                onPointerEnter={() => setFocusedId(node.id)}
              >
                {node.kind === "topic" && (
                  <circle
                    r={r}
                    fill={fill}
                    className={focused ? "rg-node-shape rg-node-focused" : "rg-node-shape"}
                  />
                )}
                {node.kind === "project" && (
                  <rect
                    x={-r + 2}
                    y={-r + 2}
                    width={r * 2 - 4}
                    height={r * 2 - 4}
                    rx={5}
                    fill={fill}
                    className={focused ? "rg-node-shape rg-node-focused" : "rg-node-shape"}
                  />
                )}
                {node.kind === "publication" && (
                  <rect
                    x={-r + 3}
                    y={-r + 3}
                    width={r * 2 - 6}
                    height={r * 2 - 6}
                    transform={`rotate(45)`}
                    fill={fill}
                    className={focused ? "rg-node-shape rg-node-focused" : "rg-node-shape"}
                  />
                )}
                <a
                  id={`rg-node-${node.id}`}
                  href={node.href}
                  className="rg-node-link"
                  onFocus={() => setFocusedId(node.id)}
                  onBlur={() => {
                    /* keep focus highlight until another node or Escape */
                  }}
                  onClick={() => setFocusedId(node.id)}
                  aria-label={`${kindLabelOf(node.kind)}: ${node.title}`}
                >
                  <title>{`${kindLabelOf(node.kind)}: ${node.title}`}</title>
                  <circle r={22} fill="transparent" />
                  <text
                    y={36}
                    textAnchor="middle"
                    className="rg-node-label"
                  >
                    {displayLabel(node)}
                  </text>
                </a>
              </g>
            );
          })}
        </g>
      </svg>
      <style>{`
        .rg-island {
          margin-block: 1rem 1.5rem;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
          padding: 0.75rem 0.75rem 0.5rem;
        }
        .rg-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .rg-toolbar-title {
          margin: 0;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-brand);
        }
        .rg-toolbar-actions {
          display: inline-flex;
          gap: 0.35rem;
        }
        .rg-toolbar-actions button {
          min-height: 2.5rem;
          min-width: 2.5rem;
          padding-inline: 0.75rem;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-ink);
          font: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .rg-toolbar-actions button:focus-visible {
          outline: 2px solid var(--color-brand);
          outline-offset: 2px;
        }
        .rg-hint {
          margin: 0.5rem 0 0.5rem;
          font-size: 0.8125rem;
          color: var(--color-ink-secondary);
        }
        .rg-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem 1.25rem;
          margin: 0 0 0.6rem;
          font-size: 0.8125rem;
          color: var(--color-ink-secondary);
        }
        .rg-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .rg-legend-item svg {
          flex: none;
        }
        .rg-svg {
          display: block;
          width: 100%;
          height: auto;
          max-height: min(70vh, 560px);
          touch-action: none;
          cursor: grab;
          background:
            radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-brand) 8%, transparent), transparent 45%),
            linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 92%, var(--color-navy-950)), var(--color-surface));
          border-radius: var(--radius-md);
        }
        .rg-svg:active {
          cursor: grabbing;
        }
        .rg-edge {
          stroke: var(--color-border-strong);
          stroke-width: 1.5;
          opacity: 0.4;
        }
        .rg-edge-active {
          stroke: color-mix(in srgb, var(--color-brand) 55%, var(--color-border-subtle));
          opacity: 0.95;
        }
        .rg-node-dim {
          opacity: 0.28;
        }
        .rg-node {
          cursor: pointer;
        }
        .rg-node-shape {
          stroke: var(--color-surface);
          stroke-width: 2;
          transition: opacity var(--duration-fast, 140ms) var(--ease-out, ease-out);
        }
        .rg-node-focused {
          stroke: var(--color-signature);
          stroke-width: 3;
        }
        .rg-node-link {
          outline: none;
        }
        .rg-node-link:focus-visible circle:first-of-type,
        .rg-node-link:focus-visible text {
          fill: var(--color-brand);
          font-weight: 700;
        }
        .rg-node-link:focus-visible ~ .rg-node-shape,
        .rg-node:hover .rg-node-shape {
          stroke: var(--color-signature);
          stroke-width: 3;
        }
        .rg-node-label {
          fill: var(--color-ink);
          font-size: 12px;
          font-family: var(--font-body, inherit);
        }
        @media (prefers-reduced-motion: reduce) {
          .rg-edge,
          .rg-node {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
