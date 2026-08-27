// Pure viewport math for the Graph Editor canvas (Track AF-04).
// No React, no DOM: every function takes plain numbers/objects so a future
// test runner can consume them as-is. (Runner note: apps/admin has no
// vitest/jest in package.json — automated tests are skipped per packet
// instruction, deps frozen; see reducer.ts header for the same precedent.)
//
// Screen space = CSS pixels inside the canvas wrapper (origin top-left).
// World space = graph payload coordinates (GraphNode.position).
// viewport {scale, tx, ty}: screen = world * scale + t.

import type { GraphNode, GraphNodePosition } from "../../lib/adminApiExt";

export const GRAPH_MIN_SCALE = 0.25;
export const GRAPH_MAX_SCALE = 3;
export const GRAPH_DEFAULT_SCALE = 1;

export interface Viewport {
  scale: number;
  tx: number;
  ty: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) {
    return GRAPH_DEFAULT_SCALE;
  }
  return Math.min(GRAPH_MAX_SCALE, Math.max(GRAPH_MIN_SCALE, scale));
}

export function defaultViewport(): Viewport {
  return { scale: GRAPH_DEFAULT_SCALE, tx: 0, ty: 0 };
}

/** screen -> world (inverse transform). */
export function screenToWorld(vp: Viewport, sx: number, sy: number): Point {
  return { x: (sx - vp.tx) / vp.scale, y: (sy - vp.ty) / vp.scale };
}

/** world -> screen (forward transform). */
export function worldToScreen(vp: Viewport, wx: number, wy: number): Point {
  return { x: wx * vp.scale + vp.tx, y: wy * vp.scale + vp.ty };
}

/**
 * Wheel zoom centered on the cursor: the world point under (sx, sy) stays
 * fixed while the scale is multiplied by `factor` (clamped 0.25..3).
 */
export function zoomAt(vp: Viewport, sx: number, sy: number, factor: number): Viewport {
  const nextScale = clampScale(vp.scale * factor);
  const applied = nextScale / vp.scale;
  return {
    scale: nextScale,
    tx: sx - (sx - vp.tx) * applied,
    ty: sy - (sy - vp.ty) * applied,
  };
}

/** Pan by a screen-space delta (drag). */
export function panBy(vp: Viewport, dx: number, dy: number): Viewport {
  return { scale: vp.scale, tx: vp.tx + dx, ty: vp.ty + dy };
}

/**
 * Bounding box of every node that carries a numeric x/y position; nodes
 * without a usable position are skipped. Returns null when no node qualifies.
 */
export function worldBoundingBox(
  nodes: Array<Pick<GraphNode, "position">>
): BoundingBox | null {
  let box: BoundingBox | null = null;
  for (const node of nodes) {
    const position = node.position;
    if (
      position === undefined ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y)
    ) {
      continue;
    }
    if (box === null) {
      box = {
        minX: position.x,
        minY: position.y,
        maxX: position.x,
        maxY: position.y,
      };
      continue;
    }
    box.minX = Math.min(box.minX, position.x);
    box.minY = Math.min(box.minY, position.y);
    box.maxX = Math.max(box.maxX, position.x);
    box.maxY = Math.max(box.maxY, position.y);
  }
  return box;
}

/**
 * DevicePixelRatio crispness for SVG strokes: snap a screen-space coordinate
 * onto the physical pixel grid so 1px hairlines stay sharp on HiDPI displays.
 */
export function snapToDevicePixels(value: number, dpr: number): number {
  const ratio = dpr > 0 ? dpr : 1;
  return Math.round(value * ratio) / ratio;
}

/** Per-wheel-tick zoom curve: smooth, direction-correct, delta-scale agnostic. */
export function wheelZoomFactor(deltaY: number): number {
  return Math.exp(-deltaY * 0.0015);
}

/**
 * Nudge helper: returns the node position shifted by (dx, dy), clamped to a
 * generous client-side sanity bound (the contract itself is unbounded float;
 * the clamp only prevents runaway values from stray keys). A node without a
 * position starts from the world origin — nudging gives it one.
 */
export const GRAPH_WORLD_LIMIT = 100000;

export function nudgedPosition(
  node: Pick<GraphNode, "position">,
  dx: number,
  dy: number
): GraphNodePosition {
  const base: Point =
    node.position === undefined
      ? { x: 0, y: 0 }
      : { x: node.position.x, y: node.position.y };
  const clamp = (value: number): number =>
    Math.min(GRAPH_WORLD_LIMIT, Math.max(-GRAPH_WORLD_LIMIT, value));
  return { x: clamp(base.x + dx), y: clamp(base.y + dy) };
}
