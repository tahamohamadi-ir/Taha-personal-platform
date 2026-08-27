// SVG graph canvas (Track AF-04) — hand-rolled, zero new runtime deps.
// Rendering uses per-element SCREEN coordinates (worldToScreen + dpr snapping
// from ./canvas) so strokes stay crisp on HiDPI and stroke widths do not scale
// with zoom. Interactions: wheel zoom centered on the cursor (passive:false +
// preventDefault), background pointer-drag pan, node click/keyboard select
// (single select v1), arrow-key nudge of the selected node (Shift = ×10).
// Accessibility: role="img" + aria-label on the svg, plus a visually-hidden
// <ul> fallback listing up to 200 nodes with an overflow notice.
// colorRole → CSS mapping reuses EXISTING admin status classes via
// fill="currentColor" (no hexes invented here); unknown roles fall back to the
// neutral class. iconRole is stored but not visually mapped in v1 (reported).

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from "react";
import type { GraphEdge, GraphNode } from "../../lib/adminApiExt";
import type { GraphSelection } from "./reducer";
import {
  defaultViewport,
  panBy,
  snapToDevicePixels,
  wheelZoomFactor,
  worldToScreen,
  zoomAt,
  type Viewport,
} from "./canvas";

const NODE_WIDTH = 150;
const NODE_HEIGHT = 44;
const FALLBACK_CAP = 200;
const CLICK_DRAG_THRESHOLD = 3;

/**
 * Name-mirror of design token roles onto the EXISTING admin status classes
 * (color never invented here). Keys are lowercased colorRole strings; anything
 * unmapped — including the empty string — renders neutral.
 */
const COLOR_ROLE_CLASSES: Record<string, string> = {
  brand: "admin-status-partial",
  accent: "admin-status-partial",
  success: "admin-status-published",
  warning: "admin-status-review",
  danger: "admin-status-missing",
  muted: "admin-status-unknown",
};

function colorClassFor(colorRole: string): string {
  return COLOR_ROLE_CLASSES[colorRole.trim().toLowerCase()] ?? "admin-status-unknown";
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

interface GraphCanvasProps {
  versionId: number | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selected: GraphSelection;
  labels: {
    aria: string;
    fallbackTitle: string;
    fallbackOverflow: string;
  };
  nodeAriaLabel: (node: GraphNode) => string;
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string) => void;
  onNudge: (nodeId: string, dx: number, dy: number) => void;
}

export default function GraphCanvas({
  versionId,
  nodes,
  edges,
  selected,
  labels,
  nodeAriaLabel,
  onNodeSelect,
  onEdgeSelect,
  onNudge,
}: GraphCanvasProps): ReactElement {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Viewport>(defaultViewport());
  const [panning, setPanning] = useState(false);
  const panState = useRef<{
    pointerId: number | null;
    lastX: number;
    lastY: number;
    travelled: number;
  } | null>(null);

  // New version loaded → reset the view.
  useEffect(() => {
    setViewport(defaultViewport());
  }, [versionId]);

  // Wheel zoom must preventDefault (page scroll) → non-passive listener.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap === null) {
      return;
    }
    const handler = (event: WheelEvent): void => {
      event.preventDefault();
      const rect = wrap.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      setViewport((current) =>
        zoomAt(current, sx, sy, wheelZoomFactor(event.deltaY))
      );
    };
    wrap.addEventListener("wheel", handler, { passive: false });
    return () => wrap.removeEventListener("wheel", handler);
  }, []);

  const dpr =
    typeof window === "undefined" || window.devicePixelRatio <= 0
      ? 1
      : window.devicePixelRatio;

  const nodeScreen = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    // Nodes without a stored position render at the world origin so they stay
    // visible, selectable and nudgeable (the validator flags them otherwise).
    const wx = node.position !== undefined ? node.position.x : 0;
    const wy = node.position !== undefined ? node.position.y : 0;
    const point = worldToScreen(viewport, wx, wy);
    nodeScreen.set(node.id, {
      x: snapToDevicePixels(point.x, dpr),
      y: snapToDevicePixels(point.y, dpr),
    });
  }

  function handleBackgroundPointerDown(
    event: ReactPointerEvent<SVGRectElement>
  ): void {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    panState.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      travelled: 0,
    };
    setPanning(true);
  }

  function handleBackgroundPointerMove(
    event: ReactPointerEvent<SVGRectElement>
  ): void {
    const pan = panState.current;
    if (pan === null || pan.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - pan.lastX;
    const dy = event.clientY - pan.lastY;
    pan.lastX = event.clientX;
    pan.lastY = event.clientY;
    pan.travelled += Math.abs(dx) + Math.abs(dy);
    if (dx !== 0 || dy !== 0) {
      setViewport((current) => panBy(current, dx, dy));
    }
  }

  function handleBackgroundPointerUp(
    event: ReactPointerEvent<SVGRectElement>
  ): void {
    const pan = panState.current;
    if (pan === null || pan.pointerId !== event.pointerId) {
      return;
    }
    panState.current = null;
    setPanning(false);
    if (pan.travelled < CLICK_DRAG_THRESHOLD) {
      onNodeSelect(null); // plain background click clears the selection
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (selected === null || selected.kind !== "node") {
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    let dx = 0;
    let dy = 0;
    switch (event.key) {
      case "ArrowLeft":
        dx = -step;
        break;
      case "ArrowRight":
        dx = step;
        break;
      case "ArrowUp":
        dy = -step;
        break;
      case "ArrowDown":
        dy = step;
        break;
      default:
        return;
    }
    event.preventDefault();
    onNudge(selected.id, dx, dy);
  }

  const fallbackNodes = nodes.slice(0, FALLBACK_CAP);
  const fallbackOverflow = nodes.length > FALLBACK_CAP;

  return (
    <div
      ref={wrapRef}
      className={`graph-canvas-wrap${panning ? " graph-canvas-panning" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <svg
        className="graph-canvas-svg"
        role="img"
        aria-label={labels.aria}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id="graph-editor-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--admin-text-muted)" />
          </marker>
        </defs>

        {/* Pan/zoom background: captures pointer drags and clear-clicks. */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="transparent"
          onPointerDown={handleBackgroundPointerDown}
          onPointerMove={handleBackgroundPointerMove}
          onPointerUp={handleBackgroundPointerUp}
          onPointerCancel={handleBackgroundPointerUp}
        />

        {edges.map((edge) => {
          const from = nodeScreen.get(edge.source);
          const to = nodeScreen.get(edge.target);
          if (from === undefined || to === undefined) {
            return null; // endpoint missing/positionless — validator flags it
          }
          const isEdgeSelected =
            selected !== null && selected.kind === "edge" && selected.id === edge.id;
          return (
            <g key={edge.id} className="graph-canvas-edge" onClick={() => onEdgeSelect(edge.id)}>
              {/* Invisible wide stroke = click hit area (visible stroke is 1.5px). */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="transparent"
                strokeWidth={12}
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isEdgeSelected ? "var(--admin-accent)" : "var(--admin-text-muted)"}
                strokeWidth={isEdgeSelected ? 2.5 : 1.5}
                markerEnd={edge.directed ? "url(#graph-editor-arrow)" : undefined}
              />
            </g>
          );
        })}

        {nodes.map((node) => {
          const point = nodeScreen.get(node.id);
          if (point === undefined) {
            return null;
          }
          const isSelected =
            selected !== null && selected.kind === "node" && selected.id === node.id;
          return (
            <g
              key={node.id}
              className="graph-canvas-node"
              transform={`translate(${point.x}, ${point.y})`}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={nodeAriaLabel(node)}
              onFocus={() => {
                if (!isSelected) {
                  onNodeSelect(node.id);
                }
              }}
              onClick={() => onNodeSelect(node.id)}
            >
              <rect
                x={-NODE_WIDTH / 2}
                y={-NODE_HEIGHT / 2}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                ry={8}
                stroke={isSelected ? "var(--admin-accent)" : "var(--admin-border)"}
                strokeWidth={isSelected ? 2 : 1}
              />
              <circle
                className={colorClassFor(node.colorRole)}
                cx={-NODE_WIDTH / 2 + 12}
                cy={-NODE_HEIGHT / 2 + 12}
                r={5}
                fill="currentColor"
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y={4}
                fontSize={12.5}
                fill="var(--admin-text)"
              >
                {truncate(node.label !== "" ? node.label : node.id, 18)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="sr-only">
        <p>{labels.fallbackTitle}</p>
        <ul>
          {fallbackNodes.map((node) => (
            <li key={node.id}>{nodeAriaLabel(node)}</li>
          ))}
          {fallbackOverflow && <li>{labels.fallbackOverflow}</li>}
        </ul>
      </div>
    </div>
  );
}
