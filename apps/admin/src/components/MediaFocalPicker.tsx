// Focal-point picker for the media presentation section (Track AF-03).
// The media image is overlaid with an SVG crosshair; click/drag computes
// physical image-space percentages (0..100, rounded to 2dp, matching the
// AB-04 Decimal(5,2) quantization) from the bounding box. SVG coordinates are
// direction-agnostic, so the marker stays correct in the RTL document without
// any physical left/right CSS. Each axis is a focusable role="slider" handle:
// arrow keys nudge ±1 (Shift ±10) in the marker's physical direction,
// Home/End jump to 0/100.

import {
  useEffect,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
} from "react";
import { tRedesign } from "../i18n/redesign";
import type { ContentLocale } from "../lib/api";

export interface FocalPoint {
  x: number | null;
  y: number | null;
}

export type FocalAxis = "x" | "y";

const FOCAL_MIN = 0;
const FOCAL_MAX = 100;

/** Clamp to 0..100 and round to two decimals (AB-04 quantization mirror). */
export function clampFocal(value: number): number {
  if (value < FOCAL_MIN) {
    return FOCAL_MIN;
  }
  if (value > FOCAL_MAX) {
    return FOCAL_MAX;
  }
  return Math.round(value * 100) / 100;
}

/** Pure coordinate math (unit-test seam): pointer position → 0..100 pair. */
export function computeFocalPercent(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  return {
    x: clampFocal(((clientX - rect.left) / width) * 100),
    y: clampFocal(((clientY - rect.top) / height) * 100),
  };
}

/** Two-decimal round-trip format for the numeric inputs and aria-valuetext. */
export function formatFocal(value: number): string {
  return clampFocal(value).toFixed(2);
}

interface MediaFocalPickerProps {
  locale: ContentLocale;
  url: string;
  focal: FocalPoint;
  /** Reports the next pair plus the axes the interaction changed. */
  onChange: (next: FocalPoint, axes: FocalAxis[]) => void;
  disabled?: boolean;
}

function FocalAxisInput({
  id,
  label,
  value,
  disabled,
  onCommit,
}: {
  id: string;
  label: string;
  value: number | null;
  disabled: boolean;
  onCommit: (next: number | null) => void;
}): ReactElement {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value === null ? "" : formatFocal(value));

  useEffect(() => {
    if (!focused) {
      setText(value === null ? "" : formatFocal(value));
    }
  }, [value, focused]);

  function handleChange(raw: string): void {
    setText(raw);
    const trimmed = raw.trim();
    if (trimmed === "") {
      onCommit(null);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      onCommit(clampFocal(parsed));
    }
  }

  return (
    <div className="w-28">
      <label htmlFor={id} className="admin-label">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={100}
        step={1}
        dir="ltr"
        className="admin-input"
        value={focused ? text : value === null ? "" : formatFocal(value)}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setText(value === null ? "" : formatFocal(value));
        }}
      />
    </div>
  );
}

export default function MediaFocalPicker({
  locale,
  url,
  focal,
  onChange,
  disabled = false,
}: MediaFocalPickerProps): ReactElement {
  const t = (key: string): string => tRedesign(locale, key);
  const [dragging, setDragging] = useState(false);
  const [focusedAxis, setFocusedAxis] = useState<FocalAxis | null>(null);

  const x = focal.x;
  const y = focal.y;
  const crosshair = x !== null && y !== null;

  function setAxis(axis: FocalAxis, value: number | null): void {
    onChange(
      axis === "x" ? { ...focal, x: value } : { ...focal, y: value },
      [axis]
    );
  }

  function applyPointer(event: PointerEvent<SVGSVGElement>): void {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = computeFocalPercent(rect, event.clientX, event.clientY);
    onChange({ x: point.x, y: point.y }, ["x", "y"]);
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>): void {
    if (disabled || event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    applyPointer(event);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>): void {
    if (!dragging || disabled) {
      return;
    }
    applyPointer(event);
  }

  function endDrag(event: PointerEvent<SVGSVGElement>): void {
    if (!dragging) {
      return;
    }
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleSliderKeyDown(
    axis: FocalAxis,
    event: KeyboardEvent<SVGGElement>
  ): void {
    const current = axis === "x" ? x : y;
    if (current === null) {
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    let next: number;
    if (axis === "x") {
      if (event.key === "ArrowLeft") {
        next = clampFocal(current - step);
      } else if (event.key === "ArrowRight") {
        next = clampFocal(current + step);
      } else if (event.key === "Home") {
        next = FOCAL_MIN;
      } else if (event.key === "End") {
        next = FOCAL_MAX;
      } else {
        return;
      }
    } else {
      // y measures percent from the image top, so ArrowUp moves up (−).
      if (event.key === "ArrowUp") {
        next = clampFocal(current - step);
      } else if (event.key === "ArrowDown") {
        next = clampFocal(current + step);
      } else if (event.key === "Home") {
        next = FOCAL_MIN;
      } else if (event.key === "End") {
        next = FOCAL_MAX;
      } else {
        return;
      }
    }
    event.preventDefault();
    setAxis(axis, next);
  }

  function renderSlider(
    axis: FocalAxis,
    value: number,
    orientation: "horizontal" | "vertical",
    ariaLabelKey: string
  ): ReactElement {
    const focused = focusedAxis === axis;
    return (
      <g
        role="slider"
        tabIndex={disabled ? undefined : 0}
        aria-label={t(ariaLabelKey)}
        aria-orientation={orientation}
        aria-valuemin={FOCAL_MIN}
        aria-valuemax={FOCAL_MAX}
        aria-valuenow={value}
        aria-valuetext={`${formatFocal(value)}٪`}
        pointerEvents="none"
        onKeyDown={(event) => handleSliderKeyDown(axis, event)}
        onFocus={() => setFocusedAxis(axis)}
        onBlur={() => setFocusedAxis((prev) => (prev === axis ? null : prev))}
      >
        {focused && (
          <circle
            cx={axis === "x" ? value : x ?? 0}
            cy={axis === "y" ? value : y ?? 0}
            r={2.5}
            fill="none"
            stroke="var(--admin-accent)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    );
  }

  return (
    <div>
      <div className="relative inline-block max-w-full">
        <img
          src={url}
          alt=""
          draggable={false}
          className="block max-h-64 max-w-full select-none"
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="group"
          aria-label={t("redesign.media.focal")}
          className={`absolute inset-0 h-full w-full touch-none ${
            disabled ? "cursor-default" : "cursor-crosshair"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {crosshair && (
            <g pointerEvents="none">
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={100}
                stroke="var(--admin-accent)"
                strokeWidth={1}
                opacity={0.85}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={0}
                y1={y}
                x2={100}
                y2={y}
                stroke="var(--admin-accent)"
                strokeWidth={1}
                opacity={0.85}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={x}
                cy={y}
                r={0.7}
                fill="var(--admin-accent)"
              />
            </g>
          )}
          {crosshair && x !== null &&
            renderSlider("x", x, "horizontal", "redesign.media.focalAriaX")}
          {crosshair && y !== null &&
            renderSlider("y", y, "vertical", "redesign.media.focalAriaY")}
        </svg>
      </div>
      <p className="admin-muted mt-1 text-xs">{t("redesign.media.focalHelp")}</p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <FocalAxisInput
          id="media-focal-x"
          label={t("redesign.media.focalX")}
          value={focal.x}
          disabled={disabled}
          onCommit={(next) => setAxis("x", next)}
        />
        <FocalAxisInput
          id="media-focal-y"
          label={t("redesign.media.focalY")}
          value={focal.y}
          disabled={disabled}
          onCommit={(next) => setAxis("y", next)}
        />
      </div>
    </div>
  );
}
