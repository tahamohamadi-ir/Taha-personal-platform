# Responsive, RTL, state, and motion specification

Status: **implementation handoff / representative concepts only**

## Breakpoint recomposition

Breakpoints are design checks, not assumptions about device models. Components
use fluid sizing between checks and logical CSS properties throughout.

| Width | Grid and shell | Navigation | Lead and media | Lists, filters, and timelines | Graph and long-form behavior |
|---|---|---|---|---|---|
| 320 CSS px | 4 columns, 16px inline gutter, 24–32px section gap | Mark + menu + language icon; theme inside menu; 44px targets | Single column; media follows critical copy and CTA | Filters in labelled disclosure; one-column records; vertical timeline | Semantic graph list is primary; TOC in flow; no sticky sidebars |
| 390 CSS px | 4 columns, 20px gutter | Same as 320 with visible contact shortcut only if space remains | Featured media may use edge-to-edge inner crop | Two compact chips per row where readable; stable one-column gallery | Optional static graph preview above linked node list |
| 768 CSS px | 8 columns, 32px gutter | Compact desktop nav or menu based on measured labels | 4/4 or stacked 8-column split | Two-column visual grid; filter disclosure may become horizontal groups; vertical or compact horizontal timeline | TOC remains in flow; graph preview plus two-column list |
| 1024 CSS px | 12 columns, 40px gutter | Full navigation if both locales fit at 200% zoom | 5/7 or 6/6 split; no forced viewport-height hero | Mixed editorial list; filters visible with wrap; timeline horizontal if labels do not collide | Optional sticky TOC starts; 2D graph is default enhanced view |
| 1280 CSS px | 12 columns, max 1184–1200px content | Full navigation and compact utilities | Approved desktop compositions | Asymmetric gallery/evidence grids; max 4 publication actions per row | Sticky TOC; optional 3D graph with adjacent list fallback |
| 1440 CSS px | 12 columns, max 1280px shell | Full approved header geometry | Approved PF concept hierarchy | Full filter bars and calm negative space | 3D graph may use wider orbit; reading measure remains capped |

No section uses fixed viewport height as a content requirement. At 200% zoom,
the layout follows the same reflow rules as the equivalent narrow viewport.

## RTL and bidirectional rules

- Set `dir` on the locale document and use `margin-inline`, `padding-inline`,
  `inset-inline`, `border-inline`, and `text-align: start`.
- The logo geometry never mirrors. Decorative orbital artwork may mirror only
  when composition needs it; meaning-bearing graph topology does not.
- Back/forward, previous/next, disclosure chevrons, breadcrumb separators, and
  timeline travel arrows flip in RTL. Download, external-link, mail, search,
  media, and status icons do not.
- Persian headings and prose use the approved Persian type stack; Latin
  identifiers, code, DOI-like identifiers, emails, dates, and file names use
  `<bdi>` or explicit LTR isolation.
- Numbers follow locale formatting policy, but stored identifiers are never
  transliterated.
- Mixed-language metadata uses a definition list so label/value order remains
  stable. Do not align by spaces or punctuation.
- The mobile menu opens from the logical end edge. Focus order remains DOM
  order and is never reversed with CSS.
- Gallery captions, footnotes, code, and publication citations each declare
  their own direction when different from the page locale.
- If a translation is unavailable, show the locale-specific unavailable state
  and an explicit link to the available locale; do not silently substitute it.

## Family-specific responsive behavior

### Gallery and visual detail

- Desktop asymmetric grids become one strong lead followed by a stable
  one-column or two-column sequence; source order matches reading order.
- The lightbox is never the only way to inspect media. Thumbnails become a
  horizontally scrollable labelled list at narrow widths, with visible
  previous/next controls.
- Captions remain adjacent to their figures; counters announce `current/total`.

### Writing and learning

- Article rows keep title and excerpt together; thumbnails move above text at
  320–390px and remain beside text from 768px when space permits.
- Topic filters use a labelled disclosure, not an unlabeled filter icon.
- Long-form TOC enters the document flow immediately after the article lead.
- Learning-path steps become an ordered vertical sequence; they never imply
  visitor completion.

### Projects, research, and publications

- Evidence and citation rows collapse in the order: type/status, title,
  essential metadata, optional actions.
- A publication never shrinks citation text to retain side-by-side buttons;
  actions wrap under the record.
- Sanitization/confidentiality notices remain before project records.

### About and CV

- The interdisciplinary journey becomes a vertical ordered list below 768px.
- Alternating experience/education records become one chronological column;
  visual alternation never changes reading order.
- Skill groups wrap as semantic lists and never use percentage bars.

### Contact

- Purpose selectors become a 2x2 grid at 390–768px and one column at 320px.
- Contact methods precede the form only when they are published; otherwise the
  form lead is first.
- Error summary appears above the form and receives focus after failed submit.

## Graph behavior

### Phase 1 — required

- Admin uses a two-dimensional node editor with canvas pan/zoom, node create,
  edit, duplicate, connect, disconnect, reorder, group, hide, and locale fields.
- Public site renders a semantic SVG/Canvas-enhanced 2D graph plus an always
  available linked-list equivalent.
- Each node has stable ID, localized label/summary, type, color role, icon,
  related-record links, weight, visibility, position, and accessibility label.
- Each edge has stable ID, source, target, relation type, direction, weight,
  visibility, and optional localized explanation.
- Keyboard users can traverse the list representation and select the same
  filtered result as pointer users.

### Phase 2 — optional enhancement

- The public graph may use WebGL/Three.js depth, camera easing, node focus, and
  restrained glow while consuming the same graph payload.
- The admin preview shows 3D output but editing remains 2D for precision.
- 3D is disabled for reduced motion, coarse pointers when it harms usability,
  low-power mode when detectable, unsupported WebGL, or explicit user choice.
- 3D failure immediately falls back to 2D/list without losing navigation.

## Component state contract

Every interactive component defines:

- rest, hover, focus-visible, active/selected, visited where appropriate;
- disabled only for a real unavailable action;
- loading with stable geometry and an announced label;
- empty/no-results as different states;
- recoverable error with retained input/selection;
- unavailable translation;
- reduced-motion and high-contrast behavior.

### Loading

- Server-rendered pages return content or an honest state. Skeletons are only
  for client-enhanced transitions and reserve the final geometry.
- Media uses intrinsic dimensions/aspect ratio to prevent layout shift.
- Graph loading never blocks the linked-list navigation.

### Empty and no results

- `Empty` means no published records exist in the current locale.
- `No results` means current filters exclude published records.
- `Unavailable translation` means another locale may exist but this locale is
  unpublished.
- Each state explains the condition and offers one relevant recovery action.

### Error

- Preserve the last successful result set during recoverable filter failures.
- Contact failures preserve entered fields, move focus to the error summary,
  and provide retry or approved direct-contact guidance.
- Media failures retain record title, caption, alt-equivalent description, and
  detail link.

## Motion specification

| Pattern | Default | Limit | Reduced motion |
|---|---|---|---|
| Page entrance | 160–240ms opacity plus 8–16px transform | One initial sequence; content already present | No transform; immediate content |
| Section reveal | 220–360ms opacity/translate after visibility | Never hides unread content before JS | Fully visible |
| Hover/focus | 120–180ms color, border, shadow | Scale max 1.02; focus parity | Instant or 80ms color only |
| Gallery transition | 220–320ms cross-fade after activation | No autoplay | Instant swap |
| Timeline | 300–500ms progressive line/node reveal | One pass, no scroll-jacking | Complete static timeline |
| 3D graph | 300–600ms camera/node focus easing | No continuous forced orbit; bounded pointer response | Static 2D/list fallback |
| Pointer light | Desktop fine-pointer decoration only | Max 24px travel influence; never over reading text | Disabled |

GSAP or Three.js may implement these enhancements, but the component contract
does not depend on a specific library. Native CSS/HTML behavior remains the
baseline.

## Accessibility verification gates

- Keyboard path reaches every navigation, filter, record, media, and form
  action without a trap.
- Focus indicator remains visible in both themes and over glass/media.
- Text contrast, non-text contrast, error identification, target size, heading
  order, landmark structure, and accessible names are verified in runtime.
- Meaning never depends on color, glow, hover, or spatial position alone.
- Screen-reader checks cover graph fallback, filter result announcements,
  lightbox dialog behavior, TOC current state, and form status.

