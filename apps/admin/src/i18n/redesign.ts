// Selector helpers for the redesign-area dictionaries (Track AF).
// The SPA itself is fa-first RTL (index.html lang="fa" dir="rtl"); the screen
// inherits document dir — no per-screen dir switching, logical CSS only.

import type { ContentLocale } from "../lib/api";
import type {
  GraphIssueCode,
  HomeKey,
  HomeLocale,
  HomeSelectionMode,
} from "../lib/adminApiExt";
import { GRAPH_ISSUE_TOKENS } from "../lib/adminApiExt";
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

/**
 * fieldTokenMessage-style mapping for graph validator issues (AF-05): the
 * server `messageToken` is the dict key (graph.* namespace, mirrored in
 * GRAPH_ISSUE_TOKENS); resolution order = server token, then the client
 * code-to-token mirror, then the raw code. Unknown tokens never render as
 * raw English on the fa UI beyond the structural code itself.
 */
export function graphIssueMessage(
  locale: ContentLocale,
  issue: { code: string; messageToken: string }
): string {
  const token =
    issue.messageToken !== ""
      ? issue.messageToken
      : (GRAPH_ISSUE_TOKENS[issue.code as GraphIssueCode] ?? issue.code);
  return DICTS[locale][token] ?? DICTS.fa[token] ?? issue.code;
}
