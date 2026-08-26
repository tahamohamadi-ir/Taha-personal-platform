# Page-family and component matrix

Status: **implementation handoff / no runtime change**  
Visual authority: P14 Light Editorial and Dark Scientific Atlas  
Content authority: published locale-specific CMS records

The PNG concepts define hierarchy and art direction. This document defines the
repeatable templates and runtime behavior. Raster text is never copied into
production content.

## Route-to-template matrix

| Public family | Canonical path | Primary template | Required blocks | Optional blocks | No-JavaScript baseline | Enhanced interaction | Empty/error behavior |
|---|---|---|---|---|---|---|---|
| Home | `/{locale}/` | Home narrative | Identity lead, research graph/list, research fit, journey, selected records, collaboration CTA | Gallery/Writing/Learning previews | Ordered semantic sections with graph represented as linked list | 3D graph, selected-work carousel, restrained scroll reveals | Omit unpublished previews; preserve identity lead and contact/CV actions |
| Research | `/{locale}/research/` | Collection index / academic variant | Research lead, local tabs, directions, fit, related records | Statement, collaborators, datasets | Direction links and publication previews are ordinary lists | Graph node filtering, local-tab enhancement | Explain when a filter has no published records; retain unfiltered list link |
| Publications | `/{locale}/publications/` | Collection index / citation variant | Citation rows, type/status filters, pagination | Files, identifiers, citation export | Complete citation list with links and server pagination | URL-synced filters and copy/export affordance | Never infer metadata; unavailable files are omitted, not disabled theatre |
| Publication detail | `/{locale}/publications/{slug}/` | Long-form detail / publication variant | Title, verified citation metadata, abstract/summary, status, canonical link | Files, DOI, citation formats, related research | Entire record readable and downloadable where authorized | Copy citation, expandable metadata | Unpublished locale returns unavailable-translation pattern, not fallback copy |
| Projects | `/{locale}/projects/` | Collection index / evidence variant | Disclosure, featured selection, filters, sanitized records, pagination | Evidence-availability strip | Linked project list and server-side filters | URL-synced filters, selected-project carousel | Suppress confidential fields; show honest no-result state |
| Project detail | `/{locale}/projects/{slug}/` | Evidence/case-study detail | Context, contribution, approach, outputs, limitations/confidentiality | Media, code/demo/docs, related records | Complete sanitized case study | Media viewer, section progress, related-record carousel | Preview-only if meaningful detail is not approved; no empty shell route |
| Gallery | `/{locale}/creative/` | Collection index / visual variant | Collection lead, featured work, filters, stable media grid, pagination | Collection/series rail | Ordered figure/list with captions and real links | Filter disclosure, media prefetch, gentle grid transition | No-results pattern and reset; failed media keeps caption and record link |
| Visual-work detail | `/{locale}/creative/{slug}/` | Visual-work detail | Lead media, metadata, sequence, captions, credits/licence, related work | Process, before/after, downloads | Figures and captions remain in document order | Keyboard-safe lightbox and explicit next/previous | Broken media never removes title/caption; unavailable metadata is omitted |
| Writing | `/{locale}/writing/` | Editorial index | Independent editorial lead, featured article, writing list, taxonomy, pagination | Series, archive, feed, optional updates | Chronological semantic article list | URL-synced filters/search and progressive pagination | No-result state distinguishes empty filter from no published writing |
| Writing detail | `/{locale}/writing/{slug}/` | Long-form detail | Title, summary, metadata, article body, authoring/rights note | Cover, TOC, footnotes, citations, related writing | Full article, headings, figures, notes, and links | Reading progress, copy link, in-page TOC | Missing related items do not affect article; unavailable locale is explicit |
| Learning | `/{locale}/teaching/` | Editorial index / learning variant | Learning lead, featured path, filters, resource list, path anatomy | Updates, prerequisites, levels | Linked resources and paths in editorial order | Topic/level filters, expandable path steps | Honest empty-library and no-result patterns; no fake learner state |
| Learning detail | `/{locale}/teaching/{slug}/` | Long-form detail / learning variant | Objectives, content, resources, references | Prerequisites, lessons, exercises, downloads | Complete lesson/guide in document order | In-page navigation, code copy, resource filters | Omit unapproved metadata; do not imply completion or certification |
| About | `/{locale}/about/` | Profile/CV narrative | Identity, principles, journey, record previews, skills, outputs | Languages, interests, downloads | All groups in semantic sequence with real detail links | Local tabs, timeline reveal | Unapproved record details are omitted or represented by an honest pending state in preview builds only |
| CV | `/{locale}/cv/` | Document index | Approved CV variants and supporting records | Print/export guidance | Direct file links and document metadata | Preview/download selection | Missing document variant is omitted; never generate a replacement |
| Contact | `/{locale}/contact/` | Contact/collaboration | Purpose choice, approved contact channels, form/privacy or direct-email path | FAQ, CV alternative, attachments when configured | Contact methods and standard form submit remain usable | Inline validation and send state | Failure preserves typed fields; no public message archive |

All index and detail routes use self-referencing canonicals. Alternate-locale
links are emitted only when that locale record is published. `/blog/**` remains
redirect-only and is not a canonical family.

## Shared component matrix

| Component | Anatomy | Rest / hover | Focus / active | Disabled / loading / error | Reduced motion |
|---|---|---|---|---|---|
| `Header` | Owner mark, primary nav, contact action, theme, language | Calm transparent/opaque surface; hover changes color or underline | 2px visible focus ring; active route uses text plus rule | Language item disabled only when locale unavailable; never hide current route | No sliding header; instant surface change |
| `Breadcrumbs` | Ordered ancestors, current label | Links underline on hover | Focus ring follows link box | Missing ancestor is removed, not plain fake text | No animated separators |
| `SectionLead` | Eyebrow, H1, summary, primary and optional secondary CTA, media | CTAs use shared button response | One primary action; active language-safe label | Media error falls back to tinted surface and alt/summary | Hero media and copy appear without transform |
| `LocalTabs` | Labelled tablist or navigation links | Hover border/text | Focus-visible ring; active uses underline and `aria-current` or selected state | Overflow becomes scroll/disclosure; loading does not erase labels | Instant panel change |
| `FeaturedRecord` | Label, title, summary, metadata/tags, media, CTA | Border and media scale at most 1.02 | Entire record is not one giant focus target; CTA and title link remain distinct | Omit if selection window is inactive; media failure keeps record link | No scale; opacity/color only |
| `FilterBar` | Search, taxonomy filters, sort, clear/reset, result summary | Control surface darkens/lightens | Native control focus plus visible ring; selected filter has text and icon | Busy state announces update; invalid query retains prior results and error note | Results replace without positional animation |
| `ContentRow` | Type, title, excerpt, metadata, tags, status, arrow | Row border/accent response | Title and trailing action both keyboard reachable only when they differ | Missing optional data collapses; error does not create placeholder facts | No horizontal shift |
| `MediaGrid` | Figures, captions, record links, aspect metadata | Media tint and border response | Focus parity with hover; current lightbox item labelled | Failed asset uses captioned fallback; loading reserves aspect ratio | Stable layout, no shuffle animation |
| `PublicationRow` | Type/status, title, authors, venue/date/identifier slots, details/files | Subtle row surface response | Links/buttons have separate focus; copied state announced | Omit unverified fields and unavailable file button | No row movement |
| `MetadataGroup` | Definition list of label/value pairs | No decorative hover | Links inside values focus normally | Empty values are omitted in production; em dashes only in design references | Not animated |
| `Timeline` | Ordered nodes, label, period, summary, detail link | Node accent response | Current/selected node labelled and focusable only if interactive | Unknown dates remain absent; list remains valid | Entire sequence visible; no scroll-trigger dependency |
| `TOC` | Label, nested heading links, current section | Hover underline | Focus ring; current heading uses text plus marker | Hidden only when article has too few headings; observer failure keeps static list | No animated tracking |
| `RelatedContent` | Editorially selected records, relationship label, links | Shared record response | Keyboard order matches reading order | Whole section omitted when no approved relationships | No carousel auto-advance |
| `ContactCTA` | Collaboration statement, one primary action, optional CV | Shared button response | Visible focus; primary action first in DOM | If contact is disabled, show approved direct channel only | No ambient pulse |
| `ContactForm` | Purpose, name, email, subject, message, consent, anti-spam, submit | Inputs show border change | Label remains visible; error summary receives focus after submit | Preserve values on failure; sending disables duplicate submit; success exposes next action | Status text updates without motion |
| `Footer` | Owner identity, explore/resources/connect groups, rights | Link underline/color | Clear focus ring | Unpublished links omitted | Not animated |

## Detail-link eligibility

A record receives its own public detail URL only when all of the following are
true:

1. the locale-specific record is published;
2. the slug and canonical family are valid;
3. the detail body contains meaningful approved material;
4. privacy/confidentiality review permits every public field and asset;
5. all required media rights, alt text, and file visibility states are set.

Otherwise the item may remain a non-linked preview or be excluded from public
selection. The frontend must not create an empty detail shell.

## Progressive-enhancement contract

- Filters and pagination are ordinary query URLs before client enhancement.
- Graph nodes are mirrored by a semantic linked list.
- Carousels expose all records as links and never auto-advance.
- Lightbox media remains a normal linked figure sequence.
- Timeline and scroll reveals never gate content visibility.
- Contact submit has a server path; client validation is additive.
- Theme and locale choices work without depending on animation libraries.

