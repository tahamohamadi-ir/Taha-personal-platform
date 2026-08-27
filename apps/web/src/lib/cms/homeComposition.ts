/** WF-07A CMS home-composition adapter (BK-01 public read, LAUNCH-CRITICAL).

Consumed by the locale home pages to drive HomeTemplate's guarded block
order from the published CMS composition:
GET /api/home-composition/{locale} -> { revision, modules: [{ key, order }] }
(published + visible rows only, per-locale, ordered; 404 fail-closed when
nothing is published).

ALLOW-404 endpoint: unlike the other CMS adapters, an absent composition is
an EXPECTED state, so every failure shape resolves { order: null } and this
module never throws (the word is absent from this file on purpose - the QA
spec asserts it). The caller logs one console.warn per build and falls back
to the documented DEFAULT_HOME_ORDER from data/site. Snapshot mode
(CMS_API_BASE unset) resolves null immediately without a network call. */

import { cmsFetchJson } from "./client";
import type { HomeBlock, LocaleCode } from "../../data/site";

/** BK-01 public projection DTO (snake_case on the wire, key+order only). */
interface HomeCompositionDto {
  revision: string;
  modules: { key: string; order: number }[];
}

export interface HomeComposition {
  /** Published subset permutation of the canonical blocks; null = absent. */
  order: HomeBlock[] | null;
}

/** Canonical block keys (agent-kit templates.json homepageOrder). The
    guarded HomeTemplate rejects unknown names, so unknown keys are dropped
    here before they can reach the template. */
const CANONICAL_KEYS: HomeBlock[] = [
  "lead",
  "graph",
  "researchFit",
  "journey",
  "projects",
  "publications",
  "previews",
  "cta",
];

/** Narrative frame blocks (HomeTemplate REQUIRED_BLOCKS): a published plan
    that drops either one is invalid and resolves null (documented default)
    instead of failing the build. */
const FRAME_KEYS: HomeBlock[] = ["lead", "cta"];

/** Pure mapper for the 200 path: order the modules by their `order` value,
    drop unknown keys, collapse duplicates to the first slot, and require the
    narrative frame. An absent or invalid payload resolves null so the caller
    falls back to the documented default order. */
export function parseHomeComposition(
  payload: HomeCompositionDto | null | undefined,
): HomeBlock[] | null {
  if (!payload || !Array.isArray(payload.modules)) return null;
  const seen = new Set<HomeBlock>();
  const ordered: HomeBlock[] = [];
  for (const module of [...payload.modules].sort((a, b) => a.order - b.order)) {
    const key = module?.key as HomeBlock;
    if (!CANONICAL_KEYS.includes(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }
  for (const frame of FRAME_KEYS) {
    if (!seen.has(frame)) return null;
  }
  return ordered;
}

/**
 * Published home composition for a locale.
 * - CMS_API_BASE unset -> { order: null } immediately (snapshot mode).
 * - 200 -> mapped ordered keys (invalid payload -> null).
 * - 404/absent -> { order: null } (no published composition; NEVER a build
 *   failure - the caller warns once and uses DEFAULT_HOME_ORDER).
 * - transport/5xx -> { order: null } with a console.warn (content loaders
 *   already fail the build on a CMS outage; the order hint must not).
 */
export async function fetchHomeComposition(
  locale: LocaleCode,
): Promise<HomeComposition> {
  const result = await cmsFetchJson<HomeCompositionDto>(
    `/api/home-composition/${locale}`,
  );

  if (result.kind === "unset") {
    return { order: null };
  }

  if (result.kind === "error") {
    console.warn(
      `[home] home-composition ${locale} unreachable: ${result.message}`,
    );
    return { order: null };
  }

  if (result.kind === "http") {
    // ALLOW-404: nothing published for this locale -> documented default.
    if (result.status === 404) {
      return { order: null };
    }
    console.warn(
      `[home] home-composition ${locale}: unexpected HTTP ${result.status}`,
    );
    return { order: null };
  }

  return { order: parseHomeComposition(result.data) };
}
