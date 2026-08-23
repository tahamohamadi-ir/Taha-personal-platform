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
  publication: "var(--color-ink-secondary)",
};

const MIN_SCALE = 0.55;
const MAX_SCALE = 2.4;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
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

  const kindLabel = (kind: string) => {
    if (kind === "topic") return labels.topicKind;
    if (kind === "project") return labels.projectKind;
    return labels.publicationKind;
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
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={active ? "rg-edge rg-edge-active" : "rg-edge"}
              />
            );
          })}
          {graph.nodes.map((node) => {
            const dimmed = Boolean(focusedId) && !neighborIds.has(node.id);
            const focused = focusedId === node.id;
            const r = focused ? 18 : 14;
            return (
              <g
                key={node.id}
                className={dimmed ? "rg-node rg-node-dim" : "rg-node"}
                transform={`translate(${node.x} ${node.y})`}
              >
                <circle
                  r={r}
                  fill={KIND_FILL[node.kind] ?? "currentColor"}
                  className={focused ? "rg-node-circle rg-node-focused" : "rg-node-circle"}
                />
                <a
                  id={`rg-node-${node.id}`}
                  href={node.href}
                  className="rg-node-link"
                  onFocus={() => setFocusedId(node.id)}
                  onBlur={() => {
                    /* keep focus highlight until another node or Escape */
                  }}
                  onClick={() => setFocusedId(node.id)}
                  aria-label={`${kindLabel(node.kind)}: ${node.title}`}
                >
                  <title>{node.title}</title>
                  <circle r={22} fill="transparent" />
                  <text
                    y={36}
                    textAnchor="middle"
                    className="rg-node-label"
                  >
                    {node.title.length > 28
                      ? `${node.title.slice(0, 26).trimEnd()}…`
                      : node.title}
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
          margin: 0.5rem 0 0.75rem;
          font-size: 0.8125rem;
          color: var(--color-ink-secondary);
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
          stroke: var(--color-border-subtle);
          stroke-width: 1.5;
          opacity: 0.35;
        }
        .rg-edge-active {
          stroke: color-mix(in srgb, var(--color-brand) 55%, var(--color-border-subtle));
          opacity: 0.95;
        }
        .rg-node-dim {
          opacity: 0.28;
        }
        .rg-node-circle {
          stroke: var(--color-surface);
          stroke-width: 2;
        }
        .rg-node-focused {
          stroke: var(--color-brand);
          stroke-width: 3;
        }
        .rg-node-link {
          outline: none;
        }
        .rg-node-link:focus-visible circle:first-of-type,
        .rg-node-link:focus-visible ~ .rg-node-circle {
          /* focus ring via surrounding transparent hit target + label color */
        }
        .rg-node-link:focus-visible text {
          fill: var(--color-brand);
          font-weight: 700;
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
