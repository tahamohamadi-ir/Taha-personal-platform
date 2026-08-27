# BK-00 - Data Contracts Inventory (read-only sweep, 2026-08-27)

Packet: BK-00 (`docs/plan/TRACK-BK-backend-cms-task-list.md` line 43). Read-only audit of
`apps/cms` public data layer. No code changed. Authoritative sources: `apps/cms/apps/content/models.py`,
`apps/cms/apps/media/models.py`, `apps/cms/apps/api/api.py`, `apps/cms/apps/content/public_api.py`,
`apps/cms/apps/content/profile_api.py`, `apps/cms/config/urls.py`, `apps/web/src/lib/cms/*.ts`.

Shorthand (content/models.py): LCM = LifecycleMixin: `status`, `published_at`, `scheduled_for`,
`created_at`, `updated_at` (models.py:80-97); LOCM = LocalizedContentMixin: `locale`, `slug`,
`title` (models.py:100-108). Public gate = `status=published AND published_at<=now`
(`ContentQuerySet.public()`, models.py:65-73). Media gate = `is_active=True`
(`active_public()`, media/models.py:17-19, 41).

## 1. Entity inventory

| Entity (app) | Key fields (grouped) | Public endpoint(s) | Published-only gating notes |
|---|---|---|---|
| Landing (content) | id: LOCM; status: LCM; content: body, seo_title, seo_description | GET /api/landings/{locale}, /{slug} (api.py:290-308) | `public()` gate; 404 fail-closed |
| Profile (content) | id: LOCM + translation_key, revision; status: LCM; content: body, short_bio, long_bio, availability, seo_title/description | GET /api/profiles/{locale}, /{slug} (content/public_api.py:24-57; mounted config/urls.py:26-30) | `public()` gate; 404 with TRANSLATION_UNAVAILABLE when slug exists in other locale only |
| ProfileSkill / ProfileExperience / ProfileEducation / ProfilePublication / ProfileResearchProject / ProfileCertificate (content) | rel: FK profile; order: ordering; detail-route: slug, translation_key, detail_body; per-type fields (models.py:199-326) | nested only, in profile detail payload (profile_api.py:169-234) | inherit Profile gate; detail routes require Latin slug + non-empty detail_body |
| ProfileSocialLink (content) | rel: FK profile; order: ordering; content: platform, url (models.py:316-326) | nested only (`socials`, profile_api.py:230-233) | inherits Profile gate |
| TopicTag (content) | id: name, slug (globally unique), locale; content: description, synonyms (models.py:329-353) | GET /api/tags/{locale} (api.py:388-394) | no lifecycle: locale-filtered list only |
| Series (content) | id: LOCM; status: LCM; content: description; order: ordering (models.py:363-386) | GET /api/series/{locale} (api.py:377-385) | `public()` gate |
| Article (content) | id: LOCM; status: LCM; content: body, excerpt, accessibility_notes, reading_time_minutes, allow_comments; rights: license; media: featured_image FK; rel: topic_tags M2M, series M2M, story FK (models.py:389-436) | GET /api/articles/{locale} (paginated), /{slug} (api.py:332-374) | `public()` gate; body sanitized at projection (api.py:230-231) |
| ArticleSlugRedirect (content) | id: locale, old_slug, new_slug (models.py:445-461) | GET /api/article-redirects/{locale} (api.py:397-411) | target `new_slug` must be currently public (api.py:404-410) |
| ResearchTopic (content) | id: LOCM; status: LCM; content: summary, motivation, problems, research_questions, methods, future_directions; rel: projects M2M, story FK (models.py:534-565) | GET /api/research/topics/{locale} (paginated), /{slug} (api.py:1007-1036) | `public()` gate; related projects/publications re-filtered to public (api.py:509-523) |
| ResearchStatement (content) | id: LOCM; status: LCM; content: body; media: statement_pdf FK; rel: story FK (models.py:571-608) | GET /api/research/statements/{locale}, /{slug} (api.py:1039-1069) | `public()` gate + clean(): max one published per locale (models.py:610-626) |
| Publication (content) | id: LOCM; status: LCM; biblio: authors, venue, date, doi, url, pdf_url, abstract, isbn, preprint/code/dataset_url, publication_type, academic_stage; rights: license, citation_text; access: access_state, accessibility_notes, citation_count/source/last_verified/visibility; media: pdf_media FK (models.py:629-701) | GET /api/publications/{locale}, /{slug}; legacy /api/research/publications/* same handlers (api.py:1125-1176) | `public()` gate; pdf_url/pdf gated by access_state=public (models.py:703-731, api.py:766-787); citation count only when source+verified+public visibility (models.py:706-714) |
| Project (content) | id: LOCM; status: LCM; content: project_type, objective, methods_summary, role, start/end_date; rights: license; access: code/data/demo_availability; media: (none direct); rel: topics M2M, publications M2M, story FK; flag: show_on_projects (models.py:737-810) | GET /api/projects/{locale} (paginated), /{slug}; /api/research/projects/* same entity (api.py:1072-1122) | `public()` gate; /api/projects adds show_on_projects=True filter (api.py:1081); URLs nulled unless availability=public (models.py:815-828) |
| ProjectCaseStudyDetails (content) | rel: 1:1 project; content: depth, problem, constraints, technical_decisions, trade_offs, outcomes_summary, lessons_learned, testing_summary (models.py:867-937) | nested in ProjectDetailOut (`case_study`) (api.py:444-458, 662-667) | featured publish gate (models.py:894-933) |
| ProjectDiagram / ProjectScreenshot / ProjectEvidence (content) | rel: FK project; media: diagram_image / screenshot_image FK; access: visibility(public/restricted/internal); evidence adds source+last_verified (models.py:945-1064) | nested in ProjectDetailOut (api.py:461-478, 635-705) | only visibility=public rows with alt/caption/source projectable (models.py:978-985, 1019-1024, 1060-1064) |
| ProjectCollaborator / ProjectFunding (content) | rel: FK project; content: name/role, funder/grant_id; access: publication_approved (models.py:1067-1104) | nested in ProjectDetailOut (api.py:648-660) | only publication_approved=True rows (api.py:652, 659) |
| Book (content) | id: LOCM; status: LCM; biblio: authors, isbn, publisher, publication_date; content: description; rights: license; access: access_state, accessibility_notes; media: cover_media FK (models.py:1107-1155) | GET /api/books/{locale} (paginated), /{slug} (api.py:1179-1203) | `public()` gate; cover only when access_state=public (api.py:810-815) |
| Talk (content) | id: LOCM; status: LCM; biblio: speakers, event_name, event_date, location; content: abstract; access: access_state, accessibility_notes; rights: license; media: slides_media FK (models.py:1158-1217) | GET /api/talks/{locale} (paginated), /{slug} (api.py:1206-1230) | `public()` gate; video/slides URLs + slides media gated by access_state=public (models.py:1206-1217, api.py:839-852) |
| Download (content) | id: LOCM; status: LCM; content: description, download_type, language(file content); access: access_state, accessibility_notes; rights: license; media: media FK (PROTECT) (models.py:1220-1280) | GET /api/downloads/{locale} (paginated), /{slug}, /{slug}/file (api.py:1233-1284) | `public()` gate + file served only when access_state=public AND media.is_active (models.py:1270-1280) |
| Collection (content) | id: LOCM; status: LCM; content: description, curator_name/title, criteria, curated_date; media: cover_media FK; rel: articles/projects/publications M2M (models.py:1283-1361) | NONE (no public route) | n/a - storage exists, projection absent |
| Course (content) | id: LOCM; status: LCM; content: description, body, level, prerequisites, outcomes, course_format, course_language, last_updated; rights: license; access: availability, accessibility_notes; media: cover_media FK (models.py:1391-1463) | GET /api/courses/{locale} (paginated), /{slug}; /api/teaching/* alias (api.py:1286-1330) | `public()` gate; detail hidden when availability=private (models.py:1455-1456) |
| CreativeWork (content) | id: LOCM; status: LCM; content: description, body, work_type, creator_name/role, creation_date; rights: rights_statement, license, consent_verified; access: access_state, accessibility_notes; media: cover_media FK (models.py:1476-1539) | GET /api/creative-works/{locale} (paginated), /{slug}; /api/creative/* alias (api.py:1333-1377) | `public()` gate; cover+gallery only when access_state=public (api.py:973-1004) |
| CreativeWorkGalleryImage (content) | rel: FK creative_work; media: media FK; content: caption, alt_text, ordering (models.py:1542-1576) | nested in CreativeWorkDetailOut (`gallery`) (api.py:930-1004) | row public only when media active + alt_text present (models.py:1571-1576) |
| ContentRevision (content) | id: entity_key, object_id; content: snapshot JSON, note; status: created_at, created_by (models.py:1579-1611) | NONE (admin restore only) | never public |
| Media (media) | id: file, title, mime, size; locale: alt_text, alt_text_fa, alt_text_en (columned, not row-per-locale); status: is_active (public flag, default False) (media/models.py:30-62) | never listed; surfaces via `public_media_ref` inside parent DTOs when is_active (api.py:98-114, 162-169) | `active_public()` gate; upload sniffed mime/size server-side |

Count: 32 models (31 content + 1 media). POST /api/contact exists (public_contact.py:105) but
persists nothing (email-only, non-persistent policy).

## 2. Public DTO map (fields serialized today)

| Endpoint | Response fields |
|---|---|
| GET /api/site | primaryColor, downloads[{kind,title,note,href,mime,size_bytes,updated_at}], contact{email,location,linkedin,orcid,employer,employerUrl,formEnabled}, brandName, tagline, footerText, seoDefaultTitle, seoDefaultDescription (api.py:64-96, 251-287) |
| GET /api/landings/{locale}[/{slug}] | locale, slug, title, body, seo_title, seo_description, published_at (LandingOut api.py:117-127) |
| GET /api/profiles/{locale}[/{slug}] | camelCase aggregate: locale, slug, title, seoTitle, seoDescription, shortBio, longBio, availability, publishedAt, availableLocales; detail adds skills[{category,name,source,+detail-route}], experience[{organization,role,period,location,website,bullets,+story}], education[...], publications[{title,status}], researchProjects[...], certificates[...], socials[{platform,url}] (profile_api.py:154-234; detail-route extras slug/translationKey/detailBody/storyId/story per row, profile_api.py:136-151). NOTE: Ninja ProfileOut (api.py:129-138) is shadowed by Django views (config/urls.py:26-30 before api/ mount line 42) |
| GET /api/articles/{locale} | locale, slug, title, excerpt, license, reading_time_minutes, published_at, updated_at, topic_tags[{name,slug,locale,description,synonyms}], series[{locale,slug,title,description,ordering,published_at}], featured_image{url,alt,mime,title,size} (ArticleListOut api.py:172-202) |
| GET /api/articles/{locale}/{slug} | list fields + body (sanitized), accessibility_notes, story{locale,title,sections[{layout,ratio,blocks[{blockType,settings}]}]} (ArticleDetailOut api.py:222-235) |
| GET /api/series/{locale} | SeriesOut fields (api.py:151-159) |
| GET /api/tags/{locale} | TopicTagOut fields (api.py:141-148) |
| GET /api/article-redirects/{locale} | locale, old_slug, new_slug (api.py:238-243) |
| GET /api/research/topics/{locale} | locale, slug, title, summary, published_at, updated_at (api.py:481-489) |
| GET /api/research/topics/{locale}/{slug} | + motivation, problems, research_questions, methods, future_directions, story, projects[{slug,title}], publications[{slug,title}] (api.py:492-523) |
| GET /api/research/statements/{locale}[/{slug}] | locale, slug, title, body (sanitized), statement_pdf{url,alt,mime,title,size}, story, published_at, updated_at (api.py:526-553) |
| GET /api/projects/{locale}, /api/research/projects/{locale} | locale, slug, title, project_type, objective, license, code/data/demo_availability, published_at, updated_at, has_case_study, case_study_depth (api.py:556-582) |
| GET /api/projects/{locale}/{slug}, /api/research/projects/{locale}/{slug} | + methods_summary, role, start_date, end_date, gated code/data/demo_url, story, topics[], publications[], evidence[{label,value,source,last_verified}], collaborators[{name,role}], funding[{funder,grant_id}], case_study{depth,problem,constraints,technical_decisions,trade_offs,outcomes_summary,lessons_learned,testing_summary}, diagrams[], screenshots[] (api.py:585-705) |
| GET /api/publications/{locale}, /api/research/publications/{locale} | locale, slug, title, authors, venue, date, doi, license, publication_type, academic_stage, access_state, published_at, updated_at (api.py:733-748) |
| GET /api/publications/{locale}/{slug} | + url, pdf_url (gated), abstract, isbn, preprint_url, code_url, dataset_url, accessibility_notes, citation_count (gated), citation_text (gated), pdf{url,alt,...} (gated) (api.py:751-787) |
| GET /api/books/{locale}[/{slug}] | list: locale, slug, title, authors, isbn, publisher, publication_date, license, access_state, published_at, updated_at; detail: + description, url, accessibility_notes, cover (gated) (api.py:790-815) |
| GET /api/talks/{locale}[/{slug}] | list: locale, slug, title, speakers, event_name, event_date, location, license, access_state, published_at, updated_at; detail: + abstract, video_url, slides_url (gated), accessibility_notes, slides (gated) (api.py:818-852) |
| GET /api/downloads/{locale}[/{slug}] | list: locale, slug, title, description, download_type, language, license, access_state, published_at, updated_at; detail: + accessibility_notes, file (gated), mime, size_bytes (api.py:855-891) |
| GET /api/downloads/{locale}/{slug}/file | binary stream (FileResponse, nosniff/no-store/noindex headers) (api.py:1260-1284) |
| GET /api/courses/{locale}, /api/teaching/{locale} | locale, slug, title, description, level, course_format, course_language, availability, license, last_updated, published_at, updated_at (api.py:894-906) |
| GET /api/courses/{locale}/{slug}, /api/teaching/{locale}/{slug} | + body (sanitized), prerequisites (display, defaults "none"), outcomes, accessibility_notes, cover (api.py:909-927) |
| GET /api/creative-works/{locale}, /api/creative/{locale} | locale, slug, title, description, work_type, creator_name, creator_role, creation_date, license, access_state, published_at, updated_at (api.py:939-951) |
| GET /api/creative-works/{locale}/{slug}, /api/creative/{locale}/{slug} | + body (sanitized), rights_statement (gated), accessibility_notes, cover (gated), gallery[{url,alt,caption,mime,title,size}] (api.py:954-1004) |
| POST /api/contact | {ok:bool} JSON or styled HTML; message never stored (public_contact.py:105-233) |

## 3. Redesign-need gap map (MASTER-SPEC section 5 / section 8 vs current models)

| Need (source) | Status | Evidence |
|---|---|---|
| Home composition module records (hide/reorder/select, MASTER-SPEC.md:75-90) | in-flight(BK-01) | No HomeModule model in content/models.py:1-1611; BK-01 spec TRACK-BK-backend-cms-task-list.md:44 (identity/graph/research-fit/journey/projects/publications/previews/cta, unique(locale,key), public read /api/home-composition/{locale}) |
| Timeline/journey ordered records (MASTER-SPEC.md:82, 148) | partial | ProfileExperience has free-text period + ordering only (content/models.py:234-255); no reusable typed/weighted journey record set (BK-02 target, task list line 45) |
| Media focal_x/focal_y (MASTER-SPEC.md:158 crop/focal) | absent | media/models.py:30-62 has no focal fields (BK-03 target) |
| Media rights_statement_{locale} (MASTER-SPEC.md:158 media rights) | absent | media/models.py:35-38 alt_text only; rights_statement exists only at content level on CreativeWork (content/models.py:1501-1503) (BK-03) |
| Media license FK (BK-03 license_id) | absent | media/models.py:30-62 no license; License is TextChoices duplicated per content entity (content/models.py:57-62, 403, 1116) (BK-03) |
| Media caption (MASTER-SPEC.md:158 alt/caption) | absent | media/models.py:35-38 alt only, no caption column (captions live on child rows, e.g. models.py:996, 1557) |
| Graph storage nodes/edges/groups/versions (MASTER-SPEC.md:155-156) | absent | no graph models anywhere in content/models.py:1-1611 (BK-04 target, task list line 47) |
| Graph public read endpoint (MASTER-SPEC.md:155, phase 1) | absent | api.py:1-1383 has no /api/graph route (BK-05 target, task list line 48) |
| Featured/selection for home previews of projects/publications (MASTER-SPEC.md:83-84) | partial | Project.show_on_projects exists (content/models.py:773-777) but no featured/ordering selection for Article/Publication; Collection curation model exists yet unexposed (see next row) |
| Collection public projection (P10-03 curated sets) | absent (storage exists) | Collection model content/models.py:1283-1361; no route in api.py:1-1383 |
| Talk slides_uri (BK-06 candidate) | exists | slides_url + slides_media with access gating (content/models.py:1167, 1179-1185) |
| Course outcomes (BK-06 candidate) | exists | content/models.py:1405, serialized api.py:912 |

## 4. Consumer-route mapping (apps/web/src/lib/cms)

| Web route family (live per AGENTS.md) | Consumer module | Endpoint(s) called |
|---|---|---|
| /{locale}/ (home) + /{locale}/about/** | landing.ts (landing.ts:30) | api/profiles/{locale}/about (Django profile aggregate; snapshot fallback when CMS_API_BASE unset, landing.ts:47-52) |
| /{locale}/writing/** (+rss feed inputs) | articles.ts (articles.ts:112-141) | /api/articles/{locale}, /{slug}, /api/series/{locale}, /api/tags/{locale}, /api/article-redirects/{locale} |
| /{locale}/research/** | research.ts (research.ts:203-247) + publications.ts re-export | /api/research/topics/{locale}, /{slug}, /api/research/statements/{locale}, /api/research/projects/{locale}, /{slug}; publications via publications.ts |
| /{locale}/projects/** | projects.ts (projects.ts:124-131) | /api/projects/{locale}, /{slug} |
| /{locale}/publications/** | publications.ts (publications.ts:177-185) | /api/publications/{locale}, /{slug} |
| /{locale}/books/** | publications.ts (publications.ts:191-198) | /api/books/{locale}, /{slug} |
| /{locale}/talks/** | publications.ts (publications.ts:202-209) | /api/talks/{locale}, /{slug} |
| /{locale}/downloads/** | publications.ts (publications.ts:215-223) | /api/downloads/{locale}, /{slug} |
| /{locale}/teaching/** | courses.ts (courses.ts:84-97) | /api/courses/{locale}, /{slug}; /api/teaching/{locale}, /{slug} |
| /{locale}/creative/** | creative.ts (creative.ts:92-108) | /api/creative-works/{locale}, /{slug}; /api/creative/{locale}, /{slug} |
| theme/branding + footer CV links + contact form wiring | siteSettings.ts (siteSettings.ts:74) | /api/site (POST /api/contact wired in form, siteSettings.ts:104) |
| (story rendering, all families) | story.ts | none (DTO type only, story.ts:3-14) |

Unconsumed by web today: /api/landings/*, Ninja /api/profiles/* (shadowed), /api/research/publications/*
(legacy alias), /api/downloads/{locale}/{slug}/file, /api/tags consumers other than articles.ts.

## Scope notes for other tracks

- Endpoint responses are append-only (BK task list section 5.3): fields above are the frozen v1 set;
  new keys must be added to this doc in the same commit (task list section 8.1.3, gate 4).
- Two locale conventions coexist: row-per-locale content entities (locale+slug unique) vs columned
  alt_text_fa/alt_text_en on Media (media/models.py:37-38). BK additive work must not invent a third.
- New entity proposals belong here as proposal rows before migration (task list section 8.1.2).

## Addendum - BK-01 shipped (2026-08-26)

| Endpoint | Shape | Gating |
|---|---|---|
| GET /api/home-composition/{locale} | {revision: ISO-timestamp of latest projected row, modules: [{key, order}]} | status=published AND published_at<=now AND visible=true, per-locale rows (content.0017_home_modules); 404 'home composition not found' when locale invalid or zero projected rows (apps/cms/apps/api/api.py, tests: apps/cms/tests/test_api_home_composition.py) |