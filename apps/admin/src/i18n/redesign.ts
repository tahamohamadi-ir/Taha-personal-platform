// Selector helpers for the redesign-area dictionaries (Track AF).
// The SPA itself is fa-first RTL (index.html lang="fa" dir="rtl"); the screen
// inherits document dir — no per-screen dir switching, logical CSS only.

import type { ContentLocale } from "../lib/api";
import type {
  HomeKey,
  HomeLocale,
  HomeSelectionMode,
} from "../lib/adminApiExt";
import { redesignFa } from "./redesign.fa";
import { redesignEn } from "./redesign.en";

const DICTS: Record<HomeLocale, Record<string, string>> = {
  fa: redesignFa,
  en: redesignEn,
};

export function tRedesign(locale: ContentLocale, key: string): string {
  return DICTS[locale][key] ?? DICTS.fa[key] ?? key;
}

export function homeKeyLabel(locale: ContentLocale, key: HomeKey): string {
  return tRedesign(locale, `redesign.module.${key}`);
}

export function selectionModeLabel(
  locale: ContentLocale,
  mode: HomeSelectionMode
): string {
  return tRedesign(locale, `redesign.home.mode.${mode}`);
}

/** Maps a stable ProblemDetails token to a localized message; unknown tokens stay structural. */
export function fieldTokenMessage(
  locale: ContentLocale,
  token: string
): string {
  const dictKey = `redesign.token.${token}`;
  const mapped = DICTS[locale][dictKey] ?? DICTS.fa[dictKey];
  return mapped ?? token;
}
