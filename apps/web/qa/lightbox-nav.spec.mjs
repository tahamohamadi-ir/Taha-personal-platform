import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Remaining-work (LOG-0277 escalation): WF-07D retired the bespoke dialog's
 * prev/next/arrow-nav with it. The shared Lightbox must grow a nav-capable
 * variant: same <dialog>, no-JS anchors stay direct file links, with JS the
 * dialog cycles the anchor's group (opt-in via data-lightbox-group).
 */
const src = readFileSync(new URL("../src/components/Lightbox.astro", import.meta.url), "utf8");

// Nav controls exist inside the dialog bar.
assert(src.includes("site-lightbox-prev"), "Lightbox lacks a previous control");
assert(src.includes("site-lightbox-next"), "Lightbox lacks a next control");

// Group resolution: explicit data-lightbox-group, fallback = page anchors.
assert(src.includes("data-lightbox-group"), "Lightbox has no group concept (data-lightbox-group)");

// Keyboard: arrows cycle, existing Tab focus-trap stays.
assert(src.includes("ArrowLeft") && src.includes("ArrowRight"), "Lightbox lacks arrow-key navigation");
assert(src.includes('"Tab"') || src.includes("'Tab'"), "Lightbox lost its Tab focus-trap");

// No-JS contract intact: anchors keep working as plain links (open only on
// unmodified left-click; dialog enhancement never rewrites hrefs).
assert(src.includes("event.button !== 0"), "Lightbox click guard changed (no-JS/modifier contract)");
assert(src.includes("a[data-lightbox]"), "Lightbox anchor hook changed");

// Pre-existing contracts untouched.
assert(src.includes("restoreFocus"), "Lightbox lost focus restoration");
assert(src.includes("site-lightbox--reduced"), "Lightbox lost reduced-motion handling");

console.log("PASS lightbox-nav (prev/next + group + arrows, no-JS intact)");
