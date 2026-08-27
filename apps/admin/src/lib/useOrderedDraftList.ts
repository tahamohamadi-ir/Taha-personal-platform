// Pure ordered-draft list helpers + a thin standalone hook (Track AF-02).
// Doctrine: reducer-first screens consume the PURE helpers (TimelineEditor
// reducer imports them); the hook is the standalone glue for simpler leaves.
// Runner note: apps/admin has no vitest/jest in package.json; automated tests
// are skipped per packet instruction — deps are frozen. Every helper stays
// pure and framework-free so a future runner can consume them as-is.

import { useCallback, useState } from "react";

export interface OrderedRow {
  order: number;
}

/** Positional renumber: order = index + 1. */
export function renumber<T extends OrderedRow>(rows: T[]): T[] {
  return rows.map((row, index) => ({ ...row, order: index + 1 }));
}

/** Adjacent swap; out-of-range index or edge target returns the input untouched. */
export function moveRowIndex<T>(
  rows: T[],
  index: number,
  direction: "up" | "down"
): T[] {
  if (index < 0 || index >= rows.length) {
    return rows;
  }
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) {
    return rows;
  }
  const next = [...rows];
  const [moved] = next.splice(index, 1);
  if (moved === undefined) {
    return rows;
  }
  next.splice(target, 0, moved);
  return next;
}

/** Insert after afterIndex; null (or out-of-range) appends. */
export function insertAfterIndex<T>(
  rows: T[],
  item: T,
  afterIndex: number | null
): T[] {
  if (afterIndex === null || afterIndex < 0 || afterIndex >= rows.length) {
    return [...rows, item];
  }
  const next = [...rows];
  next.splice(afterIndex + 1, 0, item);
  return next;
}

/** Remove at index; out-of-range returns the input untouched. */
export function removeIndex<T>(rows: T[], index: number): T[] {
  if (index < 0 || index >= rows.length) {
    return rows;
  }
  const next = [...rows];
  next.splice(index, 1);
  return next;
}

export interface OrderedDraftList<T> {
  draft: T[];
  setDraft: (next: T[] | ((current: T[]) => T[])) => void;
  move: (index: number, direction: "up" | "down") => void;
  insertAfter: (item: T, afterIndex: number | null) => void;
  remove: (index: number) => void;
}

/** Standalone useState-based ordered draft; each op renumbers positionally. */
export function useOrderedDraftList<T extends OrderedRow>(
  initial: T[]
): OrderedDraftList<T> {
  const [draft, setDraft] = useState<T[]>(initial);
  const move = useCallback(
    (index: number, direction: "up" | "down") => {
      setDraft((current) => renumber(moveRowIndex(current, index, direction)));
    },
    []
  );
  const insertAfter = useCallback(
    (item: T, afterIndex: number | null) => {
      setDraft((current) => renumber(insertAfterIndex(current, item, afterIndex)));
    },
    []
  );
  const remove = useCallback((index: number) => {
    setDraft((current) => renumber(removeIndex(current, index)));
  }, []);
  return { draft, setDraft, move, insertAfter, remove };
}
