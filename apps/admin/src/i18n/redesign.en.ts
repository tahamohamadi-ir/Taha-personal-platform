// English strings for the redesign area (Track AF).
// Keys must mirror src/i18n/redesign.fa.ts exactly (i18n parity gate).

export const redesignEn: Record<string, string> = {
  // nav
  "redesign.nav.group": "Redesign",
  "redesign.nav.homeComposer": "Home Composer",
  // screen chrome
  "redesign.home.title": "Home Composer",
  "redesign.home.locale.fa": "Persian",
  "redesign.home.locale.en": "English",
  "redesign.home.loading": "Loading…",
  "redesign.home.loadFailed": "Failed to load.",
  "redesign.home.retry": "Retry",
  "redesign.home.revision": "Revision",
  "redesign.home.emptyServer": "No rows stored for this locale yet; defaults for all eight modules are shown.",
  // row anatomy
  "redesign.home.column.module": "Module",
  "redesign.home.visible": "Visible on site",
  "redesign.home.order": "Order",
  "redesign.home.selectionMode": "Selection mode",
  "redesign.home.provenance": "Provenance",
  "redesign.home.moveUp": "Move up",
  "redesign.home.moveDown": "Move down",
  // selection_mode chip trio
  "redesign.home.mode.manual": "Manual",
  "redesign.home.mode.rule": "Rule",
  "redesign.home.mode.hybrid": "Hybrid",
  // footer actions
  "redesign.home.save": "Save",
  "redesign.home.validate": "Validate",
  "redesign.home.saving": "Saving…",
  "redesign.home.validating": "Validating…",
  "redesign.home.saved": "Saved.",
  "redesign.home.saveFailed": "Save failed.",
  "redesign.home.validated": "Validation passed.",
  "redesign.home.validationFailed": "Validation failed.",
  "redesign.home.dirtyLeave": "You have unsaved changes. Switching the locale tab discards them. Continue?",
  "redesign.home.unsavedBadge": "Unsaved",
  // conflict dialog
  "redesign.conflict.title": "Version conflict — the server version has changed",
  "redesign.conflict.reload": "Reload server state",
  "redesign.conflict.keepMine": "Keep mine",
  "redesign.conflict.body": "The server copy changed after your last load. “Reload server state” replaces the rows and revision from the server and discards your edits; “Keep mine” continues editing your current changes.",
  "redesign.conflict.serverRows": "Current server state",
  // module key labels (composed; owner review noted in WORK_LOG)
  "redesign.module.identity": "Identity",
  "redesign.module.graph": "Graph",
  "redesign.module.research-fit": "Research fit",
  "redesign.module.journey": "Journey",
  "redesign.module.projects": "Projects",
  "redesign.module.publications": "Publications",
  "redesign.module.previews": "Previews",
  "redesign.module.cta": "CTA",
  // stable field tokens → localized messages
  "redesign.token.UNKNOWN_KEY": "Unknown key",
  "redesign.token.DUPLICATE_ORDER": "Duplicate order",
  "redesign.token.BAD_ENUM": "Invalid value",
  "redesign.token.DUPLICATE_KEY": "Duplicate key",
  "redesign.token.TOO_LONG": "Text is too long",
};
