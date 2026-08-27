# Taha mark — conservative polish

Status: review candidate; not yet approved for runtime replacement.

## Preserved

- Existing interlocking monogram and visual recognition.
- Horizontal crossbar, upper counter, open lower stem and right-hand bowl.
- Geometric, outlined character of the original mark.

## Refined

- All structural points sit on a four-pixel grid.
- Top and right chamfers use consistent 16/20-pixel geometry.
- Crossbar, stem and counters use aligned widths and baselines.
- Three-layer outline is deterministic: 18 px outer, 12 px separator and
  3 px inner keyline.
- The right counter and lower opening have more consistent optical weight.
- Canvas is tightly normalized to `256 × 240` with no baked-in whitespace.

## Files

- `taha-mark-refined.svg` — primary light-surface colorway.
- `taha-mark-refined-dark.svg` — dark-surface colorway.
- `taha-mark-refined-mono.svg` — one-color master for stamps and masks.
- `taha-mark-refined-1024.png` — transparent primary PNG export.
- `taha-mark-refined-dark-1024.png` — transparent dark-surface PNG export.
- `taha-mark-refined-mono-1024.png` — transparent monochrome PNG export.
- `taha-mark-refined-64.png` — transparent small-size review export.
- `review-board.html` / `review-board.png` — original/refined comparison and
  16–96 px optical-size review.

## Core colors

- Deep navy: `#071225`
- Turquoise: `#19B8AC`
- Warm ivory: `#F7F4EE`
- Dark-mode outline: `#E8FFFC`

## Approval gate

Do not replace `apps/web/public/logo.png`, favicon files or live header/footer
assets until the owner approves this geometry after visual comparison at
16, 24, 32, 48, 64 and 256 pixels.
