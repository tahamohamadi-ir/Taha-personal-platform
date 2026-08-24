/**
 * Bilingual formatting utilities — dates and numbers for `/fa` and `/en` pages.
 *
 * Binding rules (reDesign_plan.md §۱.۳, DESIGN-CONTRACT.md §4):
 * - `fa`: Jalali calendar + Persian digits via `Intl` (`fa-IR-u-ca-persian`),
 *   resolved at build time. A raw ISO string must never reach a rendered fa page.
 * - `en`: Gregorian calendar + Latin digits (`en-IE` display, `en-GB` numeric style).
 *
 * All formatters pin `timeZone: 'UTC'` so build output is deterministic regardless
 * of the build machine's timezone (date-only ISO strings parse as UTC midnight —
 * without an explicit zone they can render as the previous day west of UTC).
 */

export type Locale = 'fa' | 'en';

const DATE_LONG: Record<Locale, Intl.DateTimeFormat> = {
  fa: new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
  en: new Intl.DateTimeFormat('en-IE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
};

const DATE_SHORT: Record<Locale, Intl.DateTimeFormat> = {
  fa: new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }),
  en: new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }),
};

const NUMBER: Record<Locale, Intl.NumberFormat> = {
  fa: new Intl.NumberFormat('fa-IR'),
  en: new Intl.NumberFormat('en-IE'),
};

/** Parse an ISO date string; return `null` for anything unusable (never throws).
 *
 * Some engines leniently roll over impossible calendar dates (e.g. `2026-02-30`
 * or `2026-13-01`) instead of returning Invalid Date, so date-prefixed inputs
 * are additionally checked to round-trip through their UTC components.
 */
function parseIsoDate(iso: string): Date | null {
  if (typeof iso !== 'string') return null;
  const trimmed = iso.trim();
  if (trimmed === '') return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (
    m !== null &&
    (date.getUTCFullYear() !== Number(m[1]) ||
      date.getUTCMonth() !== Number(m[2]) - 1 ||
      date.getUTCDate() !== Number(m[3]))
  ) {
    return null;
  }
  return date;
}

/**
 * Localized display date.
 * - `fa`:  `'2026-08-24'` → `«۲ شهریور ۱۴۰۵»` (Jalali, Persian digits)
 * - `en`:  `'2026-08-24'` → `"24 August 2026"`
 * Returns `''` for invalid input.
 */
export function formatDate(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso);
  return date === null ? '' : DATE_LONG[locale].format(date);
}

/**
 * Localized numeric-style date.
 * - `fa`:  `'2026-08-24'` → `«۱۴۰۵/۰۶/۰۲»`
 * - `en`:  `'2026-08-24'` → `"24 Aug 2026"` (dd MMM yyyy)
 * Returns `''` for invalid input.
 */
export function formatDateShort(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso);
  return date === null ? '' : DATE_SHORT[locale].format(date);
}

/**
 * Localized number.
 * - `fa`:  `12345` → `«۱۲٬۳۴۵»` (Persian digits)
 * - `en`:  `12345` → `"12,345"`
 * Returns `''` for non-finite input.
 */
export function formatNumber(n: number, locale: Locale): string {
  if (!Number.isFinite(n)) return '';
  return NUMBER[locale].format(n);
}
