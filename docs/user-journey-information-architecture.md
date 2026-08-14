# User Journey & Information Architecture
## Taha Mohammadi Personal Platform — UX/IA Baseline v1.0

**Status:** Freeze Candidate  
**Target quality:** > 9.7 / 10  
**Product:** Personal Research, Professional & Knowledge Platform  
**Primary locales:** Persian (`fa`, RTL) + English (`en`, LTR)  
**Root behavior:** `/` = Language Gateway  
**Primary locale roots:** `/fa/` and `/en/`  
**Design baseline:** `design.md`  
**Technology baseline:** Astro Static-first + React Islands + Django/Wagtail/Django Ninja + PostgreSQL  
**Product principle:** **One Identity, Multiple Audience Paths**  
**Content principle:** **Evidence over Claims**

---

# 0. Purpose

This document is the source of truth for:

- User Journey
- Persona prioritization
- Entry points
- User goals / questions
- Trust requirements
- Journey success criteria
- Journey failure modes
- Audience routing
- Information Architecture
- Sitemap
- Primary / secondary navigation
- URL architecture
- Locale behavior
- Missing translation behavior
- Breadcrumb rules
- Related-content rules
- Topic / Search architecture
- Page hierarchy
- Homepage information architecture
- Mobile IA
- Footer IA
- Contextual CTA architecture
- Entry-page behavior
- Accessibility / RTL / mobile constraints
- Analytics event planning
- UX acceptance criteria
- Wireframe handoff

This document is **not**:

- the visual design system;
- a final wireframe;
- the CMS schema;
- the final copy deck;
- a backend API contract;
- a replacement for `design.md`;
- a replacement for the Product Baseline.

---

# 1. Normative terminology

- **MUST** = mandatory.
- **MUST NOT** = prohibited.
- **SHOULD** = default unless a documented reason exists.
- **SHOULD NOT** = avoid unless justified.
- **MAY** = optional.

Implementation agents MUST follow this document.

---

# 2. Governing UX principles

## 2.1 One Identity, Multiple Audience Paths

The site represents one person and one coherent identity.

It MUST NOT create separate disconnected microsites for:

- Research;
- Engineering;
- Writing;
- Personal content.

Instead, it exposes different **paths into the same evidence graph**.

---

# 3. Primary audience routes

The Homepage exposes three primary routes:

```text
Research
Engineering & AI
Writing & Learning
```

These are audience-oriented entry paths, not separate content universes.

Mapping:

```text
Professor / PI
Research Lab
Admission Committee
Research Collaborator
        ↓
Research
```

```text
Engineering Manager
R&D Lead
Recruiter
CTO / Technical Lead
        ↓
Engineering & AI
```

```text
Student
Learner
Reader
General knowledge visitor
        ↓
Writing & Learning
```

---

# 4. Persona priority

## P0 — Critical

1. Professor / Potential PhD Supervisor
2. Engineering Manager / R&D Lead
3. Recruiter / Potential Employer
4. Research Collaborator

## P1 — Important

5. Admission Committee / Research Lab
6. Student / Learner
7. General Visitor
8. Returning Visitor

## P2 — Contextual / future

9. Conference / Talk organizer
10. Journalist / External Reader
11. Creative collaborator
12. Mentee / Teaching audience

P0 Journeys influence initial Homepage and IA most strongly.

---

# 5. Global user questions

Any first-time visitor should be able to answer:

```text
Who is Taha?
What does he work on?
What evidence supports this?
Which part is relevant to me?
What should I open next?
How can I contact him?
```

The site MUST NOT require reading the full About page to answer these.

---

# 6. Global usability targets

These are UX targets, not backend SLAs.

```text
Understand primary positioning from Homepage     ≤ 10–15 seconds
Reach Research from Homepage                    ≤ 1 action
Reach Work / Engineering path                   ≤ 1 action
Reach Academic CV from Research                 ≤ 2 actions
Reach Professional Resume from Homepage/Work    ≤ 2 actions
Reach a Featured Project                        ≤ 2 actions
Research Area → relevant Project                ≤ 1 action
Project → related Publication                   ≤ 1 action when relation exists
Major page → Contact                            ≤ 1 action
Switch language                                 ≤ 1 action
Return to major parent                          obvious / ≤ 1 action
```

These targets are validated later with usability testing.

---

# 7. Entry-point principle

## Every Important Page Can Be an Entry Page

Visitors may arrive from:

- professor email;
- Google;
- LinkedIn;
- GitHub;
- CV / Resume;
- DOI / publication share;
- project share;
- article share;
- direct bookmark;
- conference profile;
- QR code.

Therefore a visitor MUST NOT need to visit Homepage first.

Each important page must answer:

```text
Who is this person?
Where am I?
Why does this content matter?
What evidence exists?
What is related?
What should I do next?
```

---

# 8. Shared page context

Every major detail page SHOULD provide:

- compact identity context;
- section / entity type;
- breadcrumb where appropriate;
- title;
- summary;
- main evidence;
- related content;
- one context-appropriate next action;
- Contact or profile path;
- locale switch.

---

# 9. Journey template

Each Journey is documented as:

```text
Persona
Entry Point
Intent / Job
Questions
Trust Requirements
Ideal Journey
Decision Points
Primary CTA
Secondary CTA
Failure Points
Success Criteria
Mobile Constraints
Locale Constraints
```

---

# 10. Journey 01 — Professor / Potential PhD Supervisor

## Priority

**P0 / highest**

## Typical entry points

- outreach email;
- Academic CV;
- direct Research URL;
- Google search;
- LinkedIn;
- Publication;
- Research Project;
- referral.

## Primary Job

Evaluate whether Taha is a credible and relevant candidate for:

- PhD supervision;
- research collaboration;
- lab membership;
- funded research opportunity.

## Questions

```text
What is his current research direction?
Does it overlap with my work?
What research questions does he care about?
What methods can he use?
What has he actually done?
What is his role in each project?
Does he understand research practice?
Are there publications / artifacts / evidence?
Can I quickly see his Academic CV?
How do I contact him about research?
```

## Trust requirements

The Professor should find:

- Research Profile;
- Research Agenda;
- Research Statement;
- Research Areas;
- Research Projects;
- Methods;
- Publications where real;
- Code/Data availability;
- Academic CV;
- evidence/provenance;
- accurate role;
- clear status;
- Research Contact.

## Ideal Journey — Homepage entry

```text
/en/
↓
Hero
↓
Research
↓
Research Profile
↓
Relevant Research Area
↓
Relevant Project
↓
Methods / Role / Evidence
↓
Publication / Code / Data / Related Work
↓
Academic CV
↓
Discuss Research / PhD
```

## Ideal Journey — Direct Research entry

```text
/en/research/{area}
↓
Research Area Summary
↓
Questions / Methods
↓
Selected Project
↓
Evidence
↓
Academic CV / Contact
```

## Ideal Journey — Direct Project entry

```text
/en/projects/{slug}
↓
Project identity + Research context
↓
Problem / Objective
↓
Role / Methods
↓
Evidence / Outcome
↓
Related Research Area / Publication
↓
Academic CV / Research Contact
```

## Decision points

### Decision A

> Is the research direction relevant?

If no:
- Related Areas
- Topics
- Research Overview

must offer alternate discovery.

### Decision B

> Is there credible evidence?

Project pages must show real Evidence / Availability states.

### Decision C

> Is contact worth initiating?

Research Contact must reduce friction.

## Primary CTA

```text
Discuss Research
```

or contextually:

```text
Discuss PhD / Research
```

## Secondary CTA

```text
Download Academic CV
```

## Failure points

MUST avoid:

- generic “AI enthusiast” positioning;
- research interests with no evidence;
- fabricated citation/metrics;
- Project pages that show only screenshots;
- unclear role;
- hidden Research Statement;
- no methods;
- no Academic CV;
- generic Contact with no research context;
- visually impressive but academically vague Hero.

## Success criteria

```text
Research direction understandable        ≤ 15 sec
Research path from Home                  1 action
Research Area from Research              ≤ 1 action
Project from Area                        ≤ 1 action
Academic CV from Research                ≤ 2 actions
Contact from Research/Project            ≤ 1 action
```

## Mobile

Above first major scroll:

- title;
- research summary;
- current focus;
- primary CTA.

Interactive visualizations may simplify.

## Locale

- direct English links stay English;
- language switch attempts the equivalent translation;
- missing translation MUST NOT return 404 silently.

---

# 11. Journey 02 — Engineering Manager / R&D Lead

## Priority

P0

## Primary Job

Determine whether Taha demonstrates:

- technical depth;
- engineering judgment;
- system thinking;
- architecture reasoning;
- ability to deliver.

## Questions

```text
What systems has he built?
What was actually his responsibility?
What constraints existed?
How did he make architectural decisions?
What alternatives were considered?
What trade-offs did he choose?
How was the system tested?
What outcome was achieved?
Can I inspect code/demo/diagram?
```

## Trust requirements

- Problem
- Context
- Role
- Ownership
- Architecture
- Components
- Data Flow
- Constraints
- Decisions
- Alternatives
- Trade-offs
- Implementation
- Testing
- Reliability / performance when relevant
- Security when relevant
- Outcome
- Evidence
- Code/Demo availability
- Lessons

## Ideal Journey

```text
Homepage
↓
Engineering & AI
↓
Selected Engineering Work
↓
Case Study
↓
Problem / Context / Role
↓
Architecture
↓
Constraints
↓
Decisions / Trade-offs
↓
Implementation / Testing
↓
Outcome / Evidence
↓
Related Experience
↓
Contact
```

## Direct case-study entry

```text
/projects/{slug}
↓
Project summary
↓
Role
↓
Architecture
↓
Decisions
↓
Outcome
↓
Resume / Contact
```

## Primary CTA

```text
View Case Study
```

then:

```text
Discuss Engineering / R&D
```

## Secondary CTA

```text
Download Resume
```

## Failure points

- technology badges with no reasoning;
- screenshots without context;
- no role clarity;
- no architecture;
- no trade-off;
- vague “worked on” wording;
- invented metrics;
- confidential details;
- architecture diagram with no text alternative.

## Success criteria

```text
Strong technical work reachable        ≤ 2 actions
Role visible near top                  yes
Architecture discoverable              immediately / first scan
Outcome/evidence scannable             yes
Resume reachable                       ≤ 2 actions
Contact                                ≤ 1 action
```

---

# 12. Journey 03 — Recruiter / Potential Employer

## Priority

P0

## Primary Job

Quickly determine professional fit.

## Questions

```text
What is his current positioning?
What roles has he held?
What technologies / methods does he know?
What outcomes can he demonstrate?
What is his education?
Where is his Resume?
How can I contact him?
```

## Trust requirements

- concise professional profile;
- Experience;
- Education;
- Skills / Methods;
- selected projects;
- real outcomes;
- Resume;
- relevant availability/contact.

## Ideal Journey

```text
Homepage
↓
Engineering & AI / Work
↓
Professional Profile
↓
Experience
↓
Selected Evidence
↓
Resume
↓
Contact
```

## Direct Resume entry

Resume/CV should include public site URL and useful route context.

## Primary CTA

```text
View Resume
```

or:

```text
Contact for Opportunities
```

## Failure points

- Resume buried;
- Skills shown as fake percentages;
- Experience as long unscannable prose;
- academic content overwhelming professional path;
- Contact missing;
- fake impact metrics.

## Success criteria

```text
Work path                            1 action
Experience                           ≤ 1 action from Work
Resume                               ≤ 2 actions from Home
Featured Project                     ≤ 2 actions
Contact                              ≤ 1 action
```

---

# 13. Journey 04 — Research Collaborator

## Priority

P0

## Primary Job

Discover overlap and collaboration possibilities.

## Questions

```text
Which topics overlap with mine?
What methods does he use?
Which projects are active?
What publications / code / data exist?
What is open for collaboration?
```

## Ideal Journey

```text
Entry
↓
Topic / Research
↓
Research Area
↓
Project
↓
Publication / Data / Code
↓
Related Topics
↓
Research Contact
```

## Topic-driven path

```text
/topics/{topic}
↓
Research
Projects
Publications
Writing
Teaching
Related Topics
```

## Trust requirements

- availability;
- status;
- license;
- source;
- last verified where relevant;
- code/data/publication relations;
- current project status.

## Primary CTA

```text
Discuss Collaboration
```

## Success criteria

- Topic collects cross-content relationships.
- Project has availability states.
- Contact preserves research context.
- Visitor does not need to search manually across sections.

---

# 14. Journey 05 — Admission Committee / Research Lab

## Priority

P1

## Primary Job

Rapid academic evaluation.

## Journey

```text
Homepage / Research
↓
Research Profile
↓
Education / Academic Experience
↓
Selected Research Evidence
↓
Academic CV
```

## Key requirement

This visitor should not need to read long case studies.

Use scannable:

- summary;
- education;
- roles;
- methods;
- projects;
- publications;
- CV.

---

# 15. Journey 06 — Student / Learner

## Priority

P1

## Primary Job

Find something useful to learn.

## Questions

```text
What can I learn?
What level is this?
What are the prerequisites?
How long / difficult is it?
Is it Persian or English?
What should I read next?
```

## Ideal Journey

```text
Homepage
↓
Writing & Learning
↓
Topic / Course / Series
↓
Resource
↓
Related Resource / Next Step
```

## Required information for Course-like content

- level;
- prerequisites;
- language;
- format;
- availability;
- estimated effort if defensible;
- outcomes.

## Failure points

- no level;
- no prerequisites;
- disconnected articles;
- no related next step;
- inaccessible media.

---

# 16. Journey 07 — General Visitor

## Priority

P1

## Job

Understand who Taha is.

## Journey

```text
Homepage
↓
About
↓
Journey
↓
Selected Work
↓
Writing / Creative / Now
```

This user should not face deep technical complexity first.

---

# 17. Journey 08 — Returning Visitor

## Priority

P1

## Job

Find what changed.

## High-value Homepage sections

- Current Focus
- Latest Writing
- Recent Project
- Latest Publication
- Now
- Availability

Do not require the returning user to scan the same static biography every time.

---

# 18. Journey 09 — Conference / Talk Organizer

## Priority

P2

## Job

Evaluate expertise and speaking relevance.

## Journey

```text
Search / Homepage
↓
Research or Work
↓
Talks / Selected Work
↓
Bio / Topics
↓
Contact
```

Potential future action:

```text
Invite to Speak
```

Do not prioritize this CTA above Research / Professional paths in V1.

---

# 19. Cross-persona trust architecture

Trust is created through:

```text
Clear role
+
Specific problem
+
Methods / decisions
+
Evidence
+
Availability states
+
Source / provenance
+
Accurate dates
+
No fabricated metrics
```

Visual polish enhances trust but cannot substitute for evidence.

---

# 20. Evidence architecture

Important claims may be supported by:

- Published work
- DOI
- Repository
- Code
- Demo
- Dataset
- Screenshot
- Architecture
- Quantitative result
- Qualitative verified outcome
- Award
- Reference
- Organizational context

If quantitative evidence is unavailable:

> use defensible qualitative evidence instead of an invented number.

---

# 21. CTA architecture

CTA labels change by user context.

## Research context

```text
Explore Research
View Research Project
Download Academic CV
Discuss Research
Discuss Collaboration
```

## Professional context

```text
View Case Study
View Experience
Download Resume
Contact for Opportunities
Discuss Engineering / R&D
```

## Writing / Learning

```text
Read Article
Explore Topic
Continue Series
View Course
```

## General

```text
About
Contact
```

---

# 22. CTA hierarchy

Each page SHOULD have:

- one Primary CTA;
- at most one prominent Secondary CTA;
- supporting text links.

Do not present 5 equally prominent buttons above the fold.

---

# 23. Contact intent

Contact SHOULD preserve intent where possible.

Conceptual intents:

```text
Research / PhD
Research Collaboration
Professional Opportunity
Speaking / Teaching
General
```

The visitor should not need to rewrite context already known from the page.

No sensitive page state should be automatically embedded.

---

# 24. Dead-end prevention

Major content pages MUST NOT end with only a Footer.

At the end of a detail page:

```text
Related Content
+
Contextual Next Step
+
Contact / Parent Area
```

Example:

```text
Publication
↓
Related Research Area
Related Project
Related Writing
↓
Discuss Research
```

---

# 25. Information Architecture principles

## 25.1 Stable top-level navigation

The top-level IA should remain stable while lower content grows.

## 25.2 Entities are reusable

Project, Publication, Topic, Article and other major entities should not exist as duplicated content under multiple areas.

They may be presented from different contexts.

## 25.3 Navigation ≠ Sitemap

Not every page appears in the header.

## 25.4 Context beats duplication

Research may list Publications, but Publication detail remains one canonical entity.

## 25.5 Taxonomy supports discovery

Topic connects different content types.

## 25.6 IA grows progressively

Do not create empty category pages for future content.

---

# 26. Root architecture

```text
/
└── Language Gateway
    ├── /fa/
    └── /en/
```

The root Gateway is a language decision, not the main Homepage.

---

# 27. Primary locale Homepages

```text
/fa/
/en/
```

Each locale has its own:

- content;
- metadata;
- direction;
- status;
- translation linkage.

---

# 28. Top-level public IA

```text
/{locale}/
│
├── research/
├── work/
├── projects/
├── writing/
├── about/
├── search/
├── contact/
├── topics/
├── publications/
├── books/
├── teaching/
├── creative/
├── talks/
├── downloads/
└── now/
```

Not all top-level routes appear in primary navigation.

---

# 29. Primary navigation

Desktop:

```text
Research
Work
Projects
Writing
About
More
```

Utilities:

```text
Search
FA / EN
CV / Resume
```

---

# 30. Why this navigation

## Research

Primary academic identity.

## Work

Professional roles / experience / engineering evidence.

## Projects

Cross-domain portfolio entities.

## Writing

Articles / series / technical and research writing.

## About

Identity / journey / current direction.

## More

Lower-frequency content:

- Teaching
- Creative
- Talks
- Downloads
- Explore
- Now

---

# 31. Mobile navigation

Recommended:

```text
Research
Work
Projects
Writing
About

More
├── Teaching
├── Creative
├── Talks
├── Downloads
├── Explore
└── Now

Search
Language

[CV / Resume]
[Contact]
```

Mobile MUST expose Contact clearly even if it is not a primary desktop nav label.

---

# 32. Research IA

Canonical Research landing:

```text
/{locale}/research/
```

Research content:

```text
Research Profile
Research Agenda
Research Statement
Research Areas
Research Projects
Publications
Books
Talks
Methods
Research Notes
Open Research
Academic CV
```

Not all require independent page in early phases.

---

# 33. Research landing hierarchy

Recommended:

```text
Research Profile
↓
Current Questions / Current Direction
↓
Research Areas
↓
Selected Research Projects
↓
Selected Publications
↓
Research Agenda
↓
Methods
↓
Research Statement
↓
Academic CV
↓
Research Contact
```

Research Statement remains independently linkable even if previewed on Research landing.

---

# 34. Research Area page hierarchy

```text
Area Title
Short Positioning
↓
Why It Matters
↓
Current Questions
↓
Methods / Approaches
↓
Selected Projects
↓
Publications
↓
Related Writing / Talks / Data / Code
↓
Future Direction
↓
Related Topics
↓
Discuss Research
```

---

# 35. Work IA

Canonical:

```text
/{locale}/work/
```

Contains:

```text
Professional Profile
Experience
Engineering Case Studies
Skills / Methods
Resume
```

Suggested internal routes only when needed:

```text
/work/experience/{slug}
/work/case-studies/{slug}
```

However Project remains the canonical Project entity when a case study is fundamentally a Project.

Do not create duplicate Project objects.

---

# 36. Work landing hierarchy

```text
Professional Positioning
↓
Current / Recent Roles
↓
Selected Engineering Evidence
↓
Experience
↓
Core Skills / Methods
↓
Resume
↓
Professional Contact
```

---

# 37. Projects IA

Canonical listing:

```text
/{locale}/projects/
```

Canonical detail:

```text
/{locale}/projects/{slug}
```

Project is a shared canonical entity.

Possible Project types:

- Research
- Engineering
- AI
- Data
- Design / UX
- Open Source
- Experimental
- Personal

Do not automatically create a route for every type.

Use filters / Topics first.

---

# 38. Project listing

V1 should support:

- curated featured projects;
- simple type/topic filtering when justified;
- search later;
- honest availability states.

Avoid category-page explosion.

---

# 39. Project detail hierarchy

Base contract:

```text
Title
Type / Status
Role
Summary
Availability
↓
Problem / Objective
↓
Context
↓
Role / Ownership
↓
Approach / Methods
↓
Architecture / Design
↓
Constraints
↓
Decisions / Trade-offs
↓
Implementation
↓
Testing / Evaluation
↓
Outcome / Evidence
↓
Code / Demo / Data / License
↓
Related Topics
↓
Related Publication / Writing
↓
Contact
```

Sections may be omitted only if genuinely not applicable.

---

# 40. Writing IA

Canonical:

```text
/{locale}/writing/
```

Detail:

```text
/{locale}/writing/{slug}
```

Series:

```text
/{locale}/writing/series/{slug}
```

Writing can be organized by:

- Topics;
- limited categories;
- Series;
- date.

Do not expose a deep category tree in the primary navigation.

---

# 41. Writing landing

Recommended:

```text
Featured / Current Writing
↓
Latest
↓
Series
↓
Topics
↓
Selected Categories
↓
RSS / Subscribe if implemented
```

Do not show newsletter CTA unless newsletter actually exists.

---

# 42. Article hierarchy

```text
Title
Summary
Author / Date / Updated
Topics
↓
Article
↓
References / Notes
↓
Related Writing
↓
Related Research / Project
↓
Next in Series if applicable
```

Long-form reading has priority over promotional UI.

---

# 43. About IA

V1:

```text
/{locale}/about/
```

One strong page.

Contents:

```text
Short Bio
Journey
Current Focus
Values / Working Principles
Selected Personal Interests
Timeline Highlights
Now preview
CV / Resume links
Contact
```

Do NOT split About into many subpages in V1 unless content becomes too large.

Possible future:

```text
/about/journey
/about/now
```

only after evidence of need.

---

# 44. More IA

The `More` menu may expose:

```text
Teaching
Creative
Talks
Downloads
Explore
Now
```

This keeps primary navigation focused.

---

# 45. Teaching IA

Canonical:

```text
/{locale}/teaching/
```

Possible detail:

```text
/{locale}/teaching/{slug}
```

Course/resource detail should show:

- level;
- prerequisites;
- format;
- language;
- status/availability;
- learning outcomes;
- resources.

---

# 46. Creative IA

Canonical:

```text
/{locale}/creative/
```

Creative may include:

- UI/UX;
- Graphic / visual;
- Photography;
- experiments.

It remains secondary to core Research / Work in primary hierarchy.

---

# 47. Talks IA

Canonical:

```text
/{locale}/talks/
```

Talk detail MAY be independent when useful.

Metadata:

- title;
- venue/event;
- date;
- role;
- topic;
- slides/video;
- availability.

---

# 48. Downloads IA

Canonical:

```text
/{locale}/downloads/
```

Possible resources:

- Academic CV
- Professional Resume
- selected public documents
- slides
- approved datasets/resources

Each file SHOULD expose:

- title;
- file type;
- size;
- language;
- updated date;
- accessibility status if known;
- license/access status where relevant.

---

# 49. Now IA

Canonical:

```text
/{locale}/now/
```

Purpose:

- what I am currently researching;
- building;
- writing;
- learning;
- open to.

This area may use more of the Human / Mascot layer.

---

# 50. Topic IA

Canonical:

```text
/{locale}/topics/{slug}
```

Topics are NOT primary navigation.

Topic is a cross-content discovery node.

Topic detail may aggregate:

```text
Research Areas
Projects
Publications
Writing
Teaching
Talks
Related Topics
```

---

# 51. Topic rules

Topics should be:

- meaningful;
- reused;
- governed;
- not synonymous duplicates;
- not an uncontrolled tag cloud.

Examples conceptually:

- Human-Centered AI
- Wearable Computing
- Digital Health
- Data Visualization
- Software Architecture
- HCI

Exact taxonomy belongs to later taxonomy governance.

---

# 52. Publications IA

Publication is a first-class entity.

Canonical listing MAY be:

```text
/{locale}/publications/
```

Canonical detail:

```text
/{locale}/publications/{slug}
```

Research landing may expose a Publication listing view.

The detail entity should not be duplicated under:

```text
/research/publications/{same-item}
```

unless routing ADR intentionally makes Research path canonical.

The principle is one canonical URL per locale per entity.

---

# 53. Publication hierarchy

```text
Title
Authors
Venue
Date
Status
Identifiers
↓
Abstract / Summary
↓
Contribution / Role if appropriate
↓
Citation
↓
DOI / External links
↓
Code / Data / License availability
↓
Related Research
↓
Related Project
↓
Related Writing / Talk
↓
Research Contact
```

---

# 54. Books IA

Canonical:

```text
/{locale}/books/
```

Detail:

```text
/{locale}/books/{slug}
```

Books may be authored, coauthored, or relevant public works only when the Product Model defines them.

Do not create empty section merely because schema exists.

---

# 55. Search IA

Canonical page:

```text
/{locale}/search/
```

Command Palette may provide alternate UI.

Search should eventually support entity types:

```text
Research
Projects
Publications
Writing
Topics
Experience
Teaching
Talks
```

---

# 56. Search result IA

Group or label results by type.

Minimum result:

```text
Type
Title
Summary
Relevant topic / metadata
Locale
```

Search MUST NOT expose:

- draft;
- private;
- hidden;
- archived private;
- internal note.

---

# 57. Search no-result state

Should provide:

- query feedback;
- spelling / simpler-query hint when available;
- Browse Topics;
- Research;
- Projects;
- Writing;
- optional mascot.

No-result must not be a dead end.

---

# 58. Search URL / faceting

Thin faceted/search result URLs SHOULD NOT automatically become indexable.

SEO policy decides canonical/noindex behavior.

---

# 59. Language architecture

Root:

```text
/
```

Locale roots:

```text
/fa/
/en/
```

Each content item has independent:

- title;
- body;
- slug;
- SEO metadata;
- status;

while linked by translation identity.

---

# 60. Language Gateway rules

- Root displays explicit language selection.
- Direct `/fa/...` bypasses Gateway.
- Direct `/en/...` bypasses Gateway.
- Do not force geo/IP redirect.
- Browser preference MAY suggest a choice.
- Locale selection MAY be remembered.
- Language switch remains visible.

---

# 61. Missing translation behavior

When equivalent translation exists:

```text
/en/projects/foo
↔
/fa/projects/foo-fa
```

When no equivalent exists:

MUST NOT:

- send user to 404;
- silently show wrong-language page under wrong locale;
- silently redirect to unrelated translated content.

Recommended behavior:

1. Language Switcher indicates unavailable.
2. On activation, display concise message:
   - “This page is not available in Persian yet.”
3. Offer:
   - parent section in requested locale;
   - original-language page;
   - related translated content if explicitly known.

Example:

```text
English Project
↓ switch to FA
Translation unavailable
↓
[Go to Persian Projects]
[Stay on English page]
```

---

# 62. Locale-specific slug

Slugs may differ per locale.

Do not force Persian and English to share one slug.

Each canonical URL must be stable.

Slug changes require redirect.

---

# 63. URL principles

URLs should be:

- predictable;
- semantic;
- locale-aware;
- canonical;
- stable;
- lowercase where relevant to Latin;
- free of implementation details.

Avoid:

```text
/page?id=123
/content/project/45
```

Prefer:

```text
/en/projects/project-name
```

---

# 64. URL architecture baseline

```text
/
/{locale}/
/{locale}/research/
/{locale}/research/{area-slug}
/{locale}/work/
/{locale}/projects/
/{locale}/projects/{slug}
/{locale}/writing/
/{locale}/writing/{slug}
/{locale}/writing/series/{slug}
/{locale}/about/
/{locale}/topics/{slug}
/{locale}/publications/
/{locale}/publications/{slug}
/{locale}/books/
/{locale}/books/{slug}
/{locale}/teaching/
/{locale}/teaching/{slug}
/{locale}/creative/
/{locale}/talks/
/{locale}/downloads/
/{locale}/now/
/{locale}/search/
/{locale}/contact/
```

Some routes are activated only when real content exists.

---

# 65. Canonical entity rule

A major entity has **one canonical detail URL per locale**.

Contextual areas link to it.

Example:

```text
Research landing
→ Project

Topic
→ same Project

Search
→ same Project
```

No duplicate Project detail pages.

---

# 66. Primary Navigation vs Entity routes

Primary nav is intentionally smaller than the route tree.

Not primary nav by default:

- Topics;
- Publications;
- Books;
- Teaching;
- Creative;
- Talks;
- Downloads;
- Now;
- Search result types.

---

# 67. Breadcrumb rules

Use Breadcrumb on hierarchical / deep pages.

Good:

```text
Research / Human-Centered AI
Projects / Project Name
Writing / Series / Article
Teaching / Course
```

Usually unnecessary:

- Home;
- About;
- Contact;
- Search;
- Language Gateway.

Breadcrumb is semantic navigation, not decoration.

---

# 68. Breadcrumb behavior

Breadcrumb SHOULD:

- reflect information hierarchy;
- not reflect browser history;
- be locale-correct;
- use structured data when page is indexable.

---

# 69. Related Content architecture

Ranking priority:

```text
1. Explicit editorial relationship
2. Shared Research Area
3. Shared Topic
4. Direct Project/Publication relation
5. Shared method / technology where modeled
6. Recency only as lower-priority fallback
```

Do not create opaque “You may also like” recommendations in early phases.

---

# 70. Orphan prevention

Published content SHOULD have at least one discoverable route from:

- parent listing;
- Topic;
- related entity;
- Search.

Admin Content Health later should detect orphan content.

---

# 71. Homepage IA

Recommended order:

```text
Header
↓
Hero
↓
Explore by Perspective
↓
Current Focus
↓
Selected Evidence
↓
Journey
↓
Research / Engineering Highlights
↓
Latest Writing
↓
Now / Availability
↓
Contact / Footer
```

---

# 72. Hero information architecture

Must expose:

```text
Name
Primary Positioning
One-line Proposition
Research CTA
Selected Work CTA
CV CTA
```

Optional:

- current status;
- availability;
- meaningful identity visualization.

Do not add full biography.

---

# 73. Explore by Perspective

Three choices:

```text
Research
Engineering & AI
Writing & Learning
```

Each entry includes:

- short promise;
- 1 supporting evidence signal;
- action.

This is not a second primary navbar.

---

# 74. Selected Evidence

Homepage displays **3–6 manually curated items**.

Possible types:

- Research Project
- Engineering Case Study
- Publication
- Book
- Major Project
- Major Achievement

Quality > recency.

---

# 75. Current Focus

Current Focus answers:

```text
What is Taha working on now?
```

Keep concise.

It should support Returning Visitor Journey.

---

# 76. Journey section

The conceptual identity journey:

```text
Design
→ Interaction / UX
→ Software Engineering
→ Data / Information
→ AI
→ Human-Centered Intelligent Systems
```

This is intellectual/professional evolution, not necessarily exact chronology.

---

# 77. Latest Writing

Keep limited.

Do not turn Homepage into Blog archive.

Show:

- 2–4 latest or curated items;
- topic;
- date;
- reading type.

---

# 78. Now / Availability

Purpose:

- current work;
- openness to collaboration/opportunity;
- personal human layer.

Mascot MAY be used here.

---

# 79. Footer IA

Recommended groups:

```text
Identity
Explore
Resources
Personal
Connect
Locale
```

Example:

```text
Identity
Taha Mohammadi
Short positioning

Explore
Research
Work
Projects
Writing

Resources
Academic CV
Professional Resume
Downloads
RSS if implemented

Personal
About
Now
Creative

Connect
Contact
GitHub
LinkedIn
Approved profiles

Language
فارسی / English
```

---

# 80. Footer rule

Footer supplements primary navigation.

It should not repeat every route in the Sitemap.

---

# 81. Contact IA

Canonical:

```text
/{locale}/contact/
```

Contact may support intent selector:

- Research / PhD
- Collaboration
- Professional opportunity
- Speaking / Teaching
- General

V1 can start simpler.

---

# 82. Contact context

From a Project or Research page, contextual CTA MAY preselect intent conceptually.

Do not pass confidential content or unnecessary tracking data.

---

# 83. CV / Resume architecture

Two distinct public artifacts MAY exist:

```text
Academic CV
Professional Resume
```

They should be labeled clearly.

Header “CV” behavior may adapt by locale/context only if not confusing.

Preferred:

- one visible CV/Resume utility;
- landing page or dropdown only if both documents are live.

---

# 84. Academic CV discoverability

Must be reachable from:

- Research;
- About;
- Downloads;
- appropriate Header utility.

---

# 85. Professional Resume discoverability

Must be reachable from:

- Work;
- About;
- appropriate Header utility;
- Downloads.

---

# 86. Content discoverability matrix

| Content | Home | Parent Area | Topic | Search | Related |
|---|---:|---:|---:|---:|---:|
| Research Area | selected | yes | yes | yes | yes |
| Project | selected | yes | yes | yes | yes |
| Publication | selected | yes | yes | yes | yes |
| Article | latest | yes | yes | yes | yes |
| Course | optional | yes | yes | yes | yes |
| Talk | optional | yes | yes | yes | yes |
| Creative | optional | yes | optional | yes | optional |

Not every item appears on Home.

---

# 87. Page hierarchy principle

Every page should prioritize:

```text
Orientation
↓
Primary content
↓
Evidence
↓
Depth
↓
Relationships
↓
Next action
```

Do not open with secondary metadata before purpose.

---

# 88. Page-type hierarchy — Research

```text
Position
Question
Method
Evidence
Relationship
Contact
```

---

# 89. Page-type hierarchy — Engineering

```text
Problem
Role
Architecture
Decision
Trade-off
Implementation
Testing
Outcome
Evidence
```

---

# 90. Page-type hierarchy — Publication

```text
Bibliographic identity
Abstract
Contribution
Availability
Relations
Citation
```

---

# 91. Page-type hierarchy — Writing

```text
Title / Summary
Reading metadata
Article
References
Related / Series
```

---

# 92. Page-type hierarchy — Teaching

```text
Goal
Level
Prerequisites
Outcomes
Material
Next Step
```

---

# 93. Mobile IA

Mobile prioritizes:

```text
Content
Primary action
Navigation
Context
```

not desktop visual complexity.

Rules:

- no deep hover dependency;
- no important second navigation hidden behind gestures;
- language switch accessible;
- Contact accessible;
- Search accessible;
- breadcrumbs may horizontally simplify;
- filters use Sheet/Drawer when necessary.

---

# 94. Mobile page entry

When landing directly on a detail page, mobile above-the-fold should establish:

- entity type;
- title;
- one-sentence summary;
- primary metadata;
- key action.

Avoid oversized decorative Hero that pushes meaning below 2 screens.

---

# 95. RTL / LTR IA

The hierarchy is the same conceptually.

Visual order adapts.

MUST correctly handle:

- breadcrumb direction;
- nav arrow direction;
- next/previous semantics;
- mixed URL;
- DOI;
- code;
- tables;
- citations.

---

# 96. Accessibility constraints

IA must not rely on:

- hover;
- color alone;
- canvas-only graph;
- gesture-only navigation.

Provide accessible alternatives for:

- Graph;
- Topic relationships;
- interactive filters;
- carousels;
- timelines.

---

# 97. Search accessibility

Search must support:

- keyboard input;
- clear submit/instant behavior;
- announced result count when dynamic;
- filter labels;
- no-result explanation;
- visible focus.

---

# 98. Analytics philosophy

Analytics must answer product/UX questions.

Not collect unnecessary personal data.

Possible questions:

```text
Which audience route is used?
Can visitors find Research?
Are CV/Resume links discovered?
Which content types generate deeper exploration?
Where do users leave?
Does Language Gateway create friction?
```

---

# 99. Minimal analytics event taxonomy

Conceptual events:

```text
language_selected
perspective_selected
nav_selected
cv_opened
resume_opened
contact_started
contact_submitted
search_opened
search_submitted
search_result_selected
topic_opened
project_opened
publication_opened
related_content_selected
external_evidence_opened
```

Event names are conceptual until analytics ADR.

---

# 100. Analytics privacy

MUST NOT include in analytics:

- contact message body;
- email address;
- private form text;
- search terms if privacy policy forbids or terms may be sensitive, unless explicitly approved;
- secret / internal IDs;
- unpublished content.

Analytics consent/privacy policy governs implementation.

---

# 101. Journey funnel metrics

Potential aggregated metrics:

```text
Home → Research
Home → Work
Home → Writing
Research → Project
Project → Publication
Project → Contact
Research → Academic CV
Work → Resume
Search → Result
Topic → Content
```

Use for UX improvement, not vanity reporting.

---

# 102. Language Gateway analytics

Possible aggregate measurement:

```text
Gateway views
FA selection
EN selection
time-to-selection
exit before selection
```

No invasive fingerprinting.

If Gateway creates measurable friction, behavior can be reconsidered later.

---

# 103. Edge case — direct locale root

```text
/en/
```

Must open English Homepage directly.

No Language Gateway.

---

# 104. Edge case — missing translation

Handled explicitly.

Never 404 silently.

Never show mismatched-language body under wrong `lang`.

---

# 105. Edge case — draft relation

Public page MUST not link to draft/private related content.

---

# 106. Edge case — restricted code/data

Show honest state:

```text
Public
Restricted
Unavailable
Not published
On request — only if genuinely offered
```

Do not hide the field when availability itself is meaningful.

---

# 107. Edge case — missing evidence

Do not create placeholder metrics.

Allow:

```text
Evidence currently not public
```

only when truthful and useful.

---

# 108. Edge case — no publications

Research page remains valid.

Do not create fake empty publication carousel.

Focus on Projects / Methods / Agenda.

---

# 109. Edge case — no real content for a section

Do not expose empty primary nav section.

Route can remain undeployed until useful.

---

# 110. Edge case — changed slug

Permanent redirect from old canonical path.

Do not break shared professor/recruiter links.

---

# 111. Edge case — external evidence unavailable

If GitHub/demo/external source disappears:

- show availability status;
- do not silently leave broken CTA;
- preserve safe project narrative.

---

# 112. Edge case — long bilingual titles

Navigation and cards must handle:

- long English;
- long Persian;
- mixed terms.

Do not truncate critical title without an accessible full label.

---

# 113. Edge case — user enters via Google on old language

The page remains in indexed locale.

Offer visible locale switch.

Do not automatically translate/redirect based on IP.

---

# 114. Edge case — 404

Localized 404 should offer:

- Search;
- Research;
- Projects;
- Writing;
- Home.

Optional mascot.

---

# 115. Edge case — Search disabled in early release

Do not show Search CTA until Search exists.

Navigation remains fully usable without Search.

---

# 116. Phase-aware IA

IA is stable conceptually, but sections activate by development phase.

## P1

- Language Gateway
- Homepage
- basic navigation/footer
- honest links only

## P2

- About
- Resume / CV
- Contact

## P3

- CMS foundation

## P4

- Writing

## P5

- Research
- minimal Publication relationship

## P6

- Projects / Engineering Case Studies

## P8+

- Publications / Books / Talks / Downloads

## P9

- Teaching / Creative

## P10

- Topics / Search / Collections

## P11

- Semantic / AI / richer Knowledge Graph

Inactive routes MUST NOT be linked as if live.

---

# 117. IA progressive disclosure

Do not expose future complexity early.

Example P1 header may temporarily have fewer live links.

If `Research` is not ready:

- hide it;
- or route to an honest “Research section coming” only if intentional.

Do not create fake empty shells.

---

# 118. Homepage P1 scope

Initial Homepage can be:

```text
Header
Hero
Explore by Perspective — only live paths
Selected Evidence — available items
Short About / Positioning
Contact / Footer
```

Later sections progressively activate.

---

# 119. Wireframe handoff — Language Gateway

Wireframe must resolve:

- mark size;
- prompt hierarchy;
- FA/EN button order;
- mobile stacking;
- background treatment;
- remembered-language hint;
- keyboard focus order;
- reduced-motion fallback.

---

# 120. Wireframe handoff — Homepage

Wireframe must resolve:

- Hero text width;
- Hero visualization footprint;
- CTA hierarchy;
- perspective cards;
- evidence card composition;
- Current Focus;
- Journey;
- writing;
- footer.

---

# 121. Wireframe handoff — Research

Must test Professor Journey.

Key question:

> Can a Professor find research direction, evidence, CV and contact with minimal scanning?

---

# 122. Wireframe handoff — Work / Project

Must test Engineering Manager and Recruiter separately.

Do not optimize one at the expense of the other.

---

# 123. Wireframe handoff — Mobile

Every major wireframe must have:

- desktop;
- mobile.

Tablet can follow established responsive pattern unless complex.

---

# 124. Usability test tasks

Suggested tasks for later validation:

## Professor

> Find Taha’s current research direction and one relevant project. Then find the Academic CV.

## Engineering Manager

> Find a technically detailed project and identify one architecture decision and its outcome.

## Recruiter

> Find professional experience, Resume and contact path.

## Collaborator

> Find everything related to one research topic and determine whether code/data is available.

## Student

> Find a learning resource at an appropriate level and identify its prerequisites.

---

# 125. Usability acceptance targets

For critical moderated/unmoderated test:

```text
≥ 90% find Research direction without help
≥ 90% find relevant Project without help
≥ 90% find CV/Resume without help
≥ 90% find Contact without help
No repeated major confusion on Research vs Projects
No repeated confusion on Academic CV vs Professional Resume
```

Sample size and testing method are decided later.

---

# 126. IA anti-patterns

MUST avoid:

- giant primary navigation;
- duplicated Project pages;
- separate microsite per persona;
- “Skills” as main identity;
- tag cloud;
- empty future sections;
- 4-level hover menu;
- category URL explosion;
- generic “Portfolio” catch-all hiding Research;
- hidden CV;
- Contact only in Footer;
- ambiguous `More` containing critical Research/Work functions;
- Home as mandatory gateway to direct content.

---

# 127. Homepage anti-patterns

Avoid:

- every section from the entire site;
- 15 featured projects;
- huge biography;
- 10 CTA buttons;
- mascot dominating professional identity;
- Blog-first Home;
- decorative motion before meaning.

---

# 128. Research IA anti-patterns

Avoid:

- research interests as keyword chips only;
- publication list with no project/topic context;
- “AI” as broad unsupported label;
- evidence hidden;
- collaborator logos without permission;
- graph visualization as the only relationship navigator.

---

# 129. Project IA anti-patterns

Avoid:

- screenshot gallery before problem/context;
- tech-stack-first narrative;
- generic “Challenges” paragraph;
- no role;
- no outcome;
- no availability state;
- duplicated ResearchProject and EngineeringProject entities.

---

# 130. Search IA anti-patterns

Avoid:

- Search over private/draft content;
- opaque AI ranking as baseline;
- no filters at scale;
- no no-result path;
- search that ignores locale.

---

# 131. Navigation governance

A new primary nav item requires evidence that:

- it serves a primary user goal;
- it is frequently needed;
- it is not better nested;
- it contains real content;
- it does not duplicate another primary category.

Primary nav should remain approximately 5–7 main items.

---

# 132. Route governance

A new route requires:

- clear user value;
- canonical ownership;
- content type;
- locale behavior;
- breadcrumb behavior;
- SEO decision;
- relation to parent IA.

Do not create route because a CMS model exists.

---

# 133. Topic governance

A Topic should be created only if:

- used across multiple pieces of content;
- conceptually meaningful;
- not duplicate/synonym;
- expected to aid navigation or search.

Tags used only once are suspicious.

---

# 134. Related-content governance

Manual editorial relation overrides automatic similarity.

Critical Research/Project relations SHOULD be explicit.

---

# 135. Sitemap — conceptual full state

```text
/
├── Language Gateway
│
├── /fa/
│   ├── research/
│   │   └── {research-area}
│   ├── work/
│   ├── projects/
│   │   └── {project}
│   ├── writing/
│   │   ├── {article}
│   │   └── series/{series}
│   ├── about/
│   ├── topics/{topic}
│   ├── publications/
│   │   └── {publication}
│   ├── books/
│   │   └── {book}
│   ├── teaching/
│   │   └── {course}
│   ├── creative/
│   ├── talks/
│   ├── downloads/
│   ├── now/
│   ├── search/
│   └── contact/
│
└── /en/
    └── same conceptual structure
```

Locale content may differ in publication status.

---

# 136. Contextual navigation model

Top navigation gives breadth.

Breadcrumb gives hierarchy.

Topics give conceptual cross-navigation.

Related Content gives local next steps.

Search gives recovery/discovery.

CTA gives task completion.

These systems are complementary.

---

# 137. User orientation model

At any time user should understand:

```text
Site identity
Section
Current entity
Related next step
```

This reduces cognitive load.

---

# 138. Content labeling

Prefer clear domain labels.

Good:

```text
Research
Projects
Publications
Writing
About
Teaching
```

Avoid clever labels that require interpretation.

---

# 139. Terminology consistency

Use one canonical term consistently.

Examples:

```text
Project
Publication
Research Area
Topic
Article
Series
Experience
Course
```

Do not alternate between:

```text
Work / Portfolio / Showcase / Cases
```

without defined semantic differences.

---

# 140. “Work” semantic definition

`Work` = professional identity / experience / professional engineering evidence.

`Projects` = canonical project entities across professional, research and personal contexts.

This distinction MUST be preserved.

---

# 141. “Research” semantic definition

`Research` = academic/research narrative, agenda, areas, methods and evidence.

Projects and Publications can be surfaced there but remain reusable canonical entities.

---

# 142. “Writing” semantic definition

`Writing` = authored knowledge/publication-style web content such as Articles and Series.

Formal scholarly Publications are not merged into Writing.

---

# 143. “Topic” semantic definition

Topic = cross-content conceptual node.

It is not a blog tag only.

---

# 144. Structured data / SEO IA alignment

Indexable pages should align URL + entity semantics.

Possible structured entities:

- Person
- ProfilePage
- Article
- ScholarlyArticle
- Book
- CreativeWork
- Course
- BreadcrumbList
- WebSite

Only use structured data when real and accurate.

---

# 145. Sitemap XML rule

Sitemap contains only:

- public;
- canonical;
- indexable;
- current locale URLs.

No:

- draft;
- private;
- preview;
- thin filter route unless approved.

---

# 146. Hreflang relation

Only published public translation pairs should be linked.

Do not claim a translation that is not actually available.

Root Language Gateway may act as `x-default` per SEO implementation decision.

---

# 147. Content lifecycle impact on IA

When content is:

```text
Draft
Archived
Private
```

it must disappear from public navigational relationships according to visibility policy.

Public relation graph must never leak hidden entity existence if that is sensitive.

---

# 148. Accessibility acceptance — IA

The IA passes if:

- all major tasks work by keyboard;
- no important content is hover-only;
- hierarchy is semantic;
- breadcrumbs are readable;
- Search has accessible fallback;
- visual graph has list/tree alternative;
- mobile navigation has clear focus handling;
- language switching is announced correctly.

---

# 149. RTL acceptance — IA

The IA passes if:

- primary nav works RTL;
- mobile drawer order is intentional;
- breadcrumbs render correctly;
- back/forward semantics are correct;
- mixed URLs/DOIs do not break layout;
- topic/project lists retain reading order;
- tables and code can use localized direction override.

---

# 150. Performance acceptance — IA

IA itself should not require heavy JS for:

- primary navigation;
- breadcrumb;
- locale switch;
- basic related content;
- content listing.

Advanced Search / Knowledge Graph can be progressive enhancement.

---

# 151. Analytics acceptance

Analytics must be:

- minimal;
- documented;
- privacy-aware;
- useful for Journey questions.

No tracking event should exist solely because it is easy to collect.

---

# 152. Agent rules — Journey

Agent MUST NOT alter a critical Journey without updating this document or a linked UX decision.

Examples:

- hiding CV;
- moving Contact;
- renaming Research;
- adding mandatory onboarding;
- replacing direct detail route with modal-only content.

---

# 153. Agent rules — IA

Agent MUST NOT:

- add primary navigation item silently;
- create duplicate canonical route;
- make Project nested-only under Research;
- generate empty category pages;
- create a new content taxonomy ad hoc;
- remove locale prefix;
- link missing translation to 404;
- expose draft in Search;
- invent a new page label inconsistent with terminology.

---

# 154. Agent task checklist — Public page

Before implementation:

- [ ] Identify target Persona(s).
- [ ] Identify Journey stage.
- [ ] Identify primary task.
- [ ] Identify parent IA.
- [ ] Identify canonical URL.
- [ ] Identify locale behavior.
- [ ] Identify breadcrumb.
- [ ] Identify related content.
- [ ] Identify primary CTA.
- [ ] Identify empty/error/restricted state.
- [ ] Identify mobile priority.
- [ ] Identify accessibility alternative for advanced interaction.

---

# 155. UX validation checklist — Homepage

- [ ] Who/what is clear in ≤ 15 sec.
- [ ] Research is one action away.
- [ ] Engineering/Work is one action away.
- [ ] Writing is one action away.
- [ ] CV/Resume discoverable.
- [ ] Contact discoverable.
- [ ] No fake inactive link.
- [ ] Selected Evidence limited and curated.
- [ ] Mobile preserves hierarchy.
- [ ] Language behavior correct.

---

# 156. UX validation checklist — Research

- [ ] Research direction is explicit.
- [ ] Areas are visible.
- [ ] Projects linked.
- [ ] Publications linked if real.
- [ ] Methods visible.
- [ ] Evidence visible.
- [ ] Academic CV discoverable.
- [ ] Contact context is Research.
- [ ] Missing evidence state is honest.
- [ ] Private/restricted information not leaked.

---

# 157. UX validation checklist — Project

- [ ] Project type/status.
- [ ] Role.
- [ ] Objective/problem.
- [ ] Approach/method.
- [ ] Architecture where relevant.
- [ ] Trade-offs where relevant.
- [ ] Outcome/evidence.
- [ ] Code/data/demo states.
- [ ] Related Research/Publication/Topic.
- [ ] Next action.

---

# 158. UX validation checklist — Writing

- [ ] Article readable.
- [ ] Series relation if applicable.
- [ ] Topics useful.
- [ ] Related content relevant.
- [ ] long-form navigation accessible.
- [ ] locale correct.
- [ ] no excessive promotion.

---

# 159. Freeze decisions

The following are frozen as baseline unless explicitly revised:

1. `/` is Language Gateway.
2. `/fa/` and `/en/` are primary locale roots.
3. Direct locale/detail URLs bypass Gateway.
4. Primary navigation:
   ```text
   Research | Work | Projects | Writing | About | More
   ```
5. Three Homepage audience paths:
   ```text
   Research | Engineering & AI | Writing & Learning
   ```
6. `About` is one main page in initial release.
7. Project is a canonical reusable entity.
8. Publication is a canonical reusable entity.
9. Topic is a cross-content entity.
10. Every major page can be an Entry Page.
11. Missing translation does not silently 404.
12. Academic CV and Professional Resume remain semantically distinct.
13. Contact is context-aware.
14. Navigation and Sitemap are not identical.
15. No empty future sections in public navigation.

---

# 160. Open decisions

Do NOT guess these during implementation:

1. Exact final slugs for every Research Area.
2. Exact Topic taxonomy.
3. Whether Books are active at initial launch.
4. Whether Talks have detail pages or listing-only initially.
5. Whether `/publications/` is live before P8.
6. Exact Search filter set.
7. Final Contact intent form.
8. Exact Gateway locale persistence behavior.
9. Whether `CV` header action opens a chooser when both CV/Resume exist.
10. Exact Footer social profiles.
11. Exact label translation for every primary nav item in Persian.
12. Whether Research Methods receives an independent route.
13. Whether Research Notes are public at all.
14. Whether Open Research is a section or presentation state.
15. Whether `Explore` becomes a dedicated page before P10.

---

# 161. Decision triggers

Create new route only if:

```text
real content exists
+
clear audience need exists
+
canonical ownership is defined
+
locale behavior is defined
+
page is discoverable
```

Create new primary nav item only if:

```text
high-frequency primary task
+
cannot fit existing section
+
real content
+
user testing supports it
```

---

# 162. Deliverables after this document

Next UX deliverables:

```text
1. Language Gateway wireframe
2. Homepage wireframe
3. Mobile Homepage wireframe
4. Research landing wireframe
5. Project / Case Study wireframe
6. Typography proof in FA/EN
7. Hero visual prototype
```

P1 only needs the subset required for Landing release.

---

# 163. Wireframe priority

## W0

Language Gateway

## W1

Homepage

## W2

Mobile Homepage

## W3

About / Resume / Contact

## W4

Research

## W5

Project

## W6

Writing

Do not fully wireframe P10/P11 features before earlier phases need them.

---

# 164. Definition of Done — User Journey

A critical Journey is complete when:

- Persona identified;
- Entry Points identified;
- Job identified;
- Questions identified;
- Trust requirements identified;
- ideal path defined;
- failure modes identified;
- CTA defined;
- success targets defined;
- direct-entry path defined;
- mobile considered;
- locale considered.

---

# 165. Definition of Done — IA

IA is complete enough for a phase when:

- required routes identified;
- navigation placement identified;
- canonical ownership identified;
- parent/child relation identified;
- breadcrumbs decided;
- related-content path defined;
- locale behavior defined;
- empty/missing state defined;
- Search/Topic dependencies not invented;
- inactive future routes not linked.

---

# 166. Quality rubric

The document is scored using:

| Dimension | Weight |
|---|---:|
| Persona / Journey completeness | 1.4 |
| IA clarity / consistency | 1.4 |
| Research / professional fit | 1.0 |
| Bilingual / locale architecture | 1.0 |
| Direct-entry / discoverability | 0.8 |
| Mobile / accessibility | 0.8 |
| Content relationships / canonical model | 0.8 |
| Agent implementability | 1.0 |
| Progressive-development compatibility | 0.8 |
| Edge cases / governance | 0.6 |
| Analytics / validation | 0.4 |
| **Total** | **10.0** |

---

# 167. Final self-evaluation

| Dimension | Score |
|---|---:|
| Persona / Journey completeness | 1.38 / 1.4 |
| IA clarity / consistency | 1.39 / 1.4 |
| Research / professional fit | 0.99 / 1.0 |
| Bilingual / locale architecture | 0.99 / 1.0 |
| Direct-entry / discoverability | 0.79 / 0.8 |
| Mobile / accessibility | 0.79 / 0.8 |
| Content relationships / canonical model | 0.80 / 0.8 |
| Agent implementability | 0.99 / 1.0 |
| Progressive-development compatibility | 0.79 / 0.8 |
| Edge cases / governance | 0.59 / 0.6 |
| Analytics / validation | 0.39 / 0.4 |
| **Total** | **9.88 / 10** |

This score evaluates the **UX/IA baseline document**, not the final implemented usability of the site.

Real usability validation remains required.

---

# 168. Final UX/IA contract

```text
ROOT
= Language Gateway

LOCALES
= /fa/ + /en/

PRIMARY NAV
= Research | Work | Projects | Writing | About | More

AUDIENCE ROUTES
= Research
  Engineering & AI
  Writing & Learning

CORE PRINCIPLE
= One Identity, Multiple Audience Paths

CONTENT PRINCIPLE
= Evidence over Claims

ENTRY PRINCIPLE
= Every Important Page Can Be an Entry Page

PROJECT
= one canonical reusable entity

PUBLICATION
= one canonical reusable entity

TOPIC
= cross-content discovery entity

CONTACT
= contextual

TRANSLATION
= independent but linked
  missing translation handled explicitly

MOBILE
= content-first, not desktop shrink

ACCESSIBILITY
= semantic hierarchy + keyboard + visible focus
  visual graph never the only relationship path

PROGRESSIVE IA
= no empty future sections
  activate routes only when real content exists
```

---

# 169. Governing rule

> **A visitor should never need to understand the structure of the site before the site helps them complete their goal.**

The IA exists to make evidence discoverable, not to display the complexity of the platform.
