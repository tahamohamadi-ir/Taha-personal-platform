import { describe, expect, it } from 'vitest';

import { formatDate, formatDateShort, formatNumber } from './format';

// Persian digits U+06F0–U+06F9 (Extended Arabic-Indic), used by fa-IR.
const PERSIAN_DIGITS = /[\u06F0-\u06F9]/;

describe('formatDate', () => {
  it('converts Gregorian ISO dates to Jalali month names for fa', () => {
    // 2026-08-24 → ۲ شهریور ۱۴۰۵
    expect(formatDate('2026-08-24', 'fa')).toBe('۲ شهریور ۱۴۰۵');
    // Nowruz boundary: 2026-03-21 is 1 Farvardin 1405
    expect(formatDate('2026-03-21', 'fa')).toContain('فروردین');
  });

  it('emits Persian digits and no Latin digits for fa', () => {
    const out = formatDate('2026-08-24', 'fa');
    expect(out).toMatch(PERSIAN_DIGITS);
    expect(out).not.toMatch(/[0-9]/);
  });

  it('stays Gregorian with Latin digits for en', () => {
    expect(formatDate('2026-08-24', 'en')).toContain('August');
    const out = formatDate('2026-08-24', 'en');
    expect(out).toMatch(/^[0-9]/); // starts with a Latin digit
    expect(out).not.toMatch(PERSIAN_DIGITS);
    expect(out).not.toMatch(/[\u0621-\u064A]/); // no Arabic-script letters
  });

  it('handles the Gregorian leap day 2024-02-29 in both locales', () => {
    // 2024-02-29 → Esfand 1402 in the Jalali calendar
    expect(formatDate('2024-02-29', 'fa')).toContain('اسفند');
    expect(formatDate('2024-02-29', 'fa')).toContain('۱۴۰۲');
    expect(formatDate('2024-02-29', 'en')).toContain('February');
  });

  it('returns empty string for invalid input instead of throwing', () => {
    for (const bad of ['', '   ', 'not-a-date', '2026-13-01', '2026-02-30']) {
      expect(formatDate(bad, 'fa')).toBe('');
      expect(formatDate(bad, 'en')).toBe('');
    }
  });
});

describe('formatDateShort', () => {
  it('renders a numeric fa date with Persian digits', () => {
    expect(formatDateShort('2026-08-24', 'fa')).toBe('۱۴۰۵/۰۶/۰۲');
    expect(formatDateShort('2026-08-24', 'fa')).not.toMatch(/[0-9]/);
  });

  it('renders dd MMM yyyy style for en', () => {
    expect(formatDateShort('2026-08-24', 'en')).toBe('24 Aug 2026');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDateShort('garbage', 'fa')).toBe('');
    expect(formatDateShort('', 'en')).toBe('');
  });
});

describe('formatNumber', () => {
  it('uses Persian digits with fa grouping for fa', () => {
    expect(formatNumber(12345, 'fa')).toBe('۱۲٬۳۴۵');
    expect(formatNumber(12345, 'fa')).toMatch(PERSIAN_DIGITS);
    expect(formatNumber(12345, 'fa')).not.toMatch(/[0-9]/);
  });

  it('formats decimals with the Persian decimal separator', () => {
    expect(formatNumber(3.14, 'fa')).toBe('۳٫۱۴'); // U+066B Arabic decimal separator
  });

  it('keeps Latin digits and standard grouping for en', () => {
    expect(formatNumber(12345, 'en')).toBe('12,345');
    expect(formatNumber(12345, 'en')).not.toMatch(PERSIAN_DIGITS);
  });

  it('returns empty string for non-finite numbers', () => {
    expect(formatNumber(Number.NaN, 'fa')).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY, 'en')).toBe('');
  });
});
