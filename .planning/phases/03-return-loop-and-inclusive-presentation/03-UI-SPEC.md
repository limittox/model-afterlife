---
phase: 3
slug: return-loop-and-inclusive-presentation
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-25
reviewed_at: 2026-07-25T00:19:00+10:00
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for the Return Loop and Inclusive Presentation phase. Extends the approved Phase 1 observer system and the approved Phase 3 context.

---

## Experience Intent

Model Afterlife should feel like a warm computational care home observed through a well-made museum window. The live home remains the emotional anchor; profiles, recaps, archives, and scene pages add factual depth without turning the experience into a dashboard, wiki, or social feed.

The fixed hierarchy is:

1. The current scene or the selected canonical scene.
2. Its residents, premise, transcript, and outcome.
3. The home and its current situation.
4. Optional historical explanation and provenance.
5. Navigation, sharing, and supporting metadata.

The first visual focal point on the live desktop view is the pixel home with its active scene. On mobile it is the semantic current-scene card and transcript. On resident pages it is the original resident portrait and identity block. On scene permalinks it is the scene premise followed immediately by the canonical transcript.

Affectionate character comedy comes before technical documentation, but factual depth is always reachable. Provider logos, copied mascots, copied game assets or visual expression, faux-terminal chrome, engagement counters, streaks, currencies, feeds, comments, reactions, and visitor-influence controls are prohibited.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Manual Tailwind CSS 4 token layer, extending the implemented Phase 1 custom properties |
| Preset | Not applicable; shadcn is not initialized |
| Component library | Native semantic HTML; Radix Primitives may be added only for a focus-managed disclosure or popover that cannot be implemented robustly with native elements |
| Icon library | Project-authored 16px SVG icons with adjacent visible labels; icon-only variants require accessible names and focus/hover tooltips |
| Interface font | Atkinson Hyperlegible Next, self-hosted |
| Display font | Pixelify Sans, self-hosted; restricted to the wordmark, home clock, resident display names, and short display headings |
| Pixel renderer | Phaser remains a client-only visual enhancement; React owns all semantic content and essential controls |

No shadcn or third-party registry block is permitted. New DOM components consume the existing named CSS custom properties. New Phaser art consumes typed presentation tokens derived from the same semantic palette.

---

## Information Architecture

| Route / surface | Purpose | Primary content |
|-----------------|---------|-----------------|
| `/` | Live shared home | Current scene, semantic transcript, compact observer navigation, optional return recap, home controls |
| `/residents` | Cast overview | Six original portrait cards in fixed launch order |
| `/residents/[residentId]` | Stable resident profile | Identity, significance, lineage, capabilities, limitations, supersession, qualitative relationships, behaviors, claims and sources |
| `/scenes` | Finite recent archive | Latest 30 canonical scenes, newest first, grouped by home day |
| `/scenes/[sceneId]` | Stable scene permalink | Canonical premise, cast, home time, transcript, outcome, historical context, exact model authorship, disclosures and sharing |

The global observer navigation contains `Live home`, `Residents`, and `Recent scenes`. When a local return marker has meaningful changes, a separate `Since your last visit` action appears with text, not a numeric badge. The fictional home clock and Live/Paused state remain status, not navigation.

All routes use normal links and server-rendered headings. Browser back/forward navigation must work. Opening a profile or scene never changes canonical world state or the visitor's local presentation position.

---

## Layout Contract

### Breakpoints

| Range | Contract |
|-------|----------|
| 1280px and wider | Full home plus 360px scene rail; expanded observer navigation; detail pages use a 1120px centered content frame |
| 1024–1279px | Full home plus 320px scene rail; compact navigation labels; detail pages keep two columns where content permits |
| 640–1023px | Scene-first stacked layout; compact static establishing home view; no full camera controls; detail pages use one column |
| Below 640px | Phone layout with transcript first, touch-friendly navigation, full-width cards and disclosures, and no dependency on canvas drag |

The content frame uses `min(1120px, calc(100% - 32px))` from 640px upward and `calc(100% - 24px)` below 640px. No page gains horizontal scrolling at 200% browser zoom.

### Live home: desktop

- Preserve the current status strip, transparency notice, world viewport, scene rail, and observer control dock.
- Add global observer navigation inside the status-strip system without reducing the world below its existing minimum usable size.
- `Since your last visit` opens as a non-modal, independently scrollable side sheet no wider than 480px. It may overlap a quiet edge of the world but must not trap focus, hide the current transcript, or block `Jump to live`.
- Closing or deferring the recap returns focus to the action that opened it.
- The active route and Live/Paused state use text and shape in addition to color.

### Live home: compact and mobile

- Order is: status and observer navigation, current-scene card, complete transcript, presentation actions, compact static establishing home view, resident shortcuts, transparency notice.
- The compact establishing view is a labeled, non-draggable snapshot of the home. It supports selecting a resident profile but has no pan or zoom requirement.
- Current scene and transcript appear before the establishing view in source order.
- A sticky action row may contain `Pause presentation` or `Resume presentation`, `Jump to live` when delayed, and `Share this scene`. It must not cover transcript content.
- `Since your last visit` renders as an inline disclosure above the current scene, not a full-screen modal.

### Detail pages

- Resident and scene pages use a quiet two-column editorial layout at 1024px and wider: primary narrative content at `minmax(0, 2fr)` and supporting facts/provenance at `minmax(280px, 1fr)`.
- Below 1024px, supporting content follows the narrative in semantic order.
- The recent-scenes archive is a single ordered list, not a masonry grid or infinite feed.
- Breadcrumbs use `Live home / Residents / {resident}` or `Live home / Recent scenes / {scene}` and remain horizontally scrollable only as a last resort; labels should wrap first.

---

## Surface Contracts

### “Since your last visit”

- The heading is exactly `Since your last visit`.
- Show zero to five significance-ranked causal beats. Each beat contains a short development, home time, linked scene title, relevant resident links, and a relationship note only when the canonical scene recorded a genuine relationship effect.
- Beats use an ordered list. They are not notifications and have no unread dots, urgency colors, or popularity counts.
- End with a `Current situation` paragraph describing the live scene or quiet routine.
- Actions are `Open scene`, `Review later`, `Dismiss recap`, and `Jump to live`. `Open scene` follows the beat's canonical permalink; `Review later` closes without advancing the local marker; `Dismiss recap` acknowledges the presented marker; `Jump to live` uses the existing presentation behavior.
- If there are no meaningful changes, do not open an empty recap. The navigation action is absent and the local marker may advance silently after the visitor observes the current home.

### Recent-scenes archive

- Display at most 30 canonical published scenes, newest first, grouped under readable home-day headings.
- Each archive row contains scene title or premise, two or three resident names, location, home time, one-sentence outcome, and any genuine qualitative relationship change.
- The entire title is the primary link. Resident names are separate profile links. Do not make the whole row a nested interactive target.
- No filters, sorting controls, pagination, likes, views, comments, or infinite scroll are required for v1.

### Resident index and profile

- The index shows all six residents in fixed launch order as an accessible list of portrait cards. Each card contains original portrait art, display name, fictional role, one-line significance, and `View resident profile`.
- Profile hero contains original pixel portrait, display name, fictional role, exact designated model ID, and a concise disclosure that the resident is a staged characterization.
- Profile narrative sections appear in this order: `Why this model mattered`, `Lineage and capabilities`, `Documented limitations`, `Why it lives here`, `Relationships in the home`, `Behind this behavior`, `Sources and scope`.
- `Relationships in the home` uses qualitative phrases such as `Familiar collaborators`, `A careful rivalry`, or `Growing trust`, plus the latest cause-backed canonical scene. It never shows numbers, meters, ranks, or arrows implying optimization.
- Each behavior explanation uses a native `<details>` disclosure. Its summary is the human-readable behavior label; expanded content separates `The joke`, `Historical inspiration`, `Fictional exaggeration`, `Uncertainty and scope`, and `Sources`.
- Claim-category labels are always visible as text: `Documented`, `Reported or reputation-based`, or `Fictional exaggeration`. Category cannot be communicated by color alone.
- Source links display source title and access date. Long exact model IDs and URLs wrap anywhere.

### Scene permalink

- Header contains `Canonical scene`, the premise as the page heading, home time, location, cast links, and original/cached delivery context where relevant.
- The transcript is an ordered list using the same speaker and exact-model attribution pattern as the live `DialogueTranscript`.
- After the transcript, show `What changed` with the structured outcome, shared-experience summary, and only genuine qualitative relationship effects.
- `Historical context` links each behavior explanation to approved claims and resident profiles without exposing private prompts, rejected generations, internal calibration, raw provider errors, or hidden reasoning.
- Disclosures appear before sharing: staged fiction, AI-written dialogue using the named designated model APIs, exact model/version provenance, and non-affiliation.
- Sharing actions are `Share this scene` when the Web Share API is available and `Copy scene link` everywhere. Successful copy announces `Scene link copied`.

### Social preview

- Generate a 1200×630 original image using the project's palette, pixel border language, scene premise, two or three original resident silhouettes, `Model Afterlife`, and `Canonical scene`.
- Include readable text for `Staged fictional scene`, `AI-written dialogue`, exact designated model IDs, and `Independent; not affiliated with model creators or serving providers`.
- Do not use provider logos, copied mascots, screenshots of third-party interfaces, or protected game assets.
- Preview text must remain meaningful if the image is unavailable; equivalent disclosure lives in Open Graph and social metadata descriptions.

---

## Original Pixel-Art Direction

### Environment

- Replace provisional geometric rooms with original 16px-grid production tiles while preserving the implemented room IDs, camera anchors, sprite bounds, and functional layout.
- The home combines warm plaster, dark timber, brass fixtures, patterned rugs, small CRT-like household displays, cable conduits, labeled archive drawers, and ordinary care-home furniture.
- Technology is domestic rather than cyberpunk: a talking clock, tea trolley, repair bench, observatory window, memory shelves, and garden radio.
- Rooms remain distinguishable by architecture, furniture silhouette, floor texture, and text label—not hue alone.

### Resident silhouettes

| Resident | Original visual language |
|----------|--------------------------|
| GPT-4o | Amber waistcoat, short rounded silhouette, scrapbook folio and talking-clock prop |
| Claude Sonnet 4.5 | Tall navy cardigan, precise posture, chore ledger and repair tools |
| Gemini 2.5 Pro | Violet shawl, round satchel, observatory charts and oversized blueprints |
| DeepSeek V3.2 | Teal apron, square glasses, puzzle cards and tea-trolley route map |
| Llama 3.3 70B Instruct | Rust overalls, broad-brim garden hat, cuttings and radio parts |
| Qwen3 235B A22B 2507 | Jade coat, many-tabbed satchel, multilingual labels and archive cards |

These are fictional project-owned costumes and props. No silhouette may reproduce a provider mascot or logo. Each resident needs a recognizable neutral pose, seated pose, walking cycle, listening pose, and restrained speaking pose.

### Illustration palette

The semantic shell keeps one accent. Illustration colors are non-interactive material roles:

| Role | Value | Usage |
|------|-------|-------|
| Warm plaster | `#D8C7A7` | Interior wall highlights and paper |
| Dark timber | `#6F513D` | Furniture and structural trim |
| Garden green | `#647A5E` | Plants and garden materials |
| Observatory violet | `#746B8F` | Night-room textiles and charts |
| Brass | `#A9874F` | Fixtures; never a focus or active-state substitute |

Illustration colors may not replace semantic status colors or reduce text contrast.

---

## Spacing Scale

Declared values are fixed, inherited from Phase 1, and all multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gaps, pixel-border offsets |
| sm | 8px | Metadata, chip and compact-control spacing |
| md | 16px | Default component padding and list gaps |
| lg | 24px | Cards, sheets and page-section padding |
| xl | 32px | Major layout gaps |
| 2xl | 48px | Empty-state breathing room and hero separation |
| 3xl | 64px | Page-level section separation |

Exceptions: all interactive targets retain a 44px minimum hit area. The 44px target is a size constraint, not a spacing token.

---

## Typography

Exactly four sizes and two weights are permitted:

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Label | 14px | 600 | 1.4 | Atkinson Hyperlegible Next |
| Body | 16px | 400 | 1.5 | Atkinson Hyperlegible Next |
| Heading | 20px | 600 | 1.25 | Atkinson Hyperlegible Next |
| Display | 28px | 600 | 1.2 | Pixelify Sans |

- Pixelify Sans is limited to the wordmark, fictional clock, resident display name, and short display headings. It never appears in transcripts, source lists, disclosures, controls, or paragraphs.
- Exact model IDs, URLs, dialogue, source titles, and relationship explanations use Atkinson Hyperlegible Next and wrap without truncating essential meaning.
- No all-caps paragraph text. Small labels may use title case or sentence case.

---

## Color

The semantic shell preserves the implemented 60/30/10 allocation:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#171B26` | Page background, deepest shell surfaces, canvas letterboxing |
| Secondary (30%) | `#272F40` | Cards, navigation, side sheet, scene rail, profile facts |
| Accent (10%) | `#E4B65A` | Keyboard focus ring, active route indicator, active speaker marker, disclosure summary caret, and `Jump to live` only |
| Primary text | `#F4ECD8` | Headings, dialogue, labels and body copy |
| Muted text | `#B9B5AA` | Metadata and secondary context |
| Structural border | `#465066` | Dividers, inactive cards and control boundaries |
| Error | `#D96767` | Error icon and error-surface edge only |

Accent is reserved for the keyboard focus ring, active route indicator, active speaker marker, expanded behavior-disclosure caret, and `Jump to live`. It is not applied to every link, button, portrait, card, or decorative fixture.

Error, live, paused, cached, documented, reported, exaggeration, and relationship states always include text and/or an icon or border pattern. Color is never the sole cue.

---

## Component Inventory

| Component | Responsibility | Required states |
|-----------|----------------|-----------------|
| `ObserverNavigation` | Stable links among live home, residents and recent scenes; optional recap action | default, active route, recap available, narrow layout |
| `ReturnRecap` | Non-blocking causal catch-up and current situation | absent, loading marker resolution, one through five beats, stale referenced scene, dismissed, deferred |
| `RecapBeat` | One canonical development with causal links | scene-only, resident change, genuine relationship change, long text |
| `RecentSceneArchive` | Ordered latest-30 scene collection grouped by home day | loading, empty, populated, partial read failure, long list |
| `ArchiveSceneRow` | Canonical scene summary and links | ordinary outcome, relationship change, cached scene, long title |
| `ResidentDirectory` | Fixed six-resident cast overview | loading, populated, unavailable portrait |
| `ResidentProfile` | Stable historical and fictional identity page | loading, complete, partial optional relationship history, source failure |
| `BehaviorDisclosure` | Layered joke/history/exaggeration/uncertainty/source explanation | collapsed, expanded, keyboard focus, long sources |
| `RelationshipSummary` | Qualitative relationship state with causal scene | no recent cause, one recent cause, long resident names |
| `ScenePermalink` | Stable canonical scene page | loading, complete, withdrawn or unavailable annotation, cached provenance |
| `CanonicalTranscript` | Complete ordered scene transcript | four through ten turns, long text, exact model IDs |
| `ShareSceneActions` | Native share and copy-link fallback | Web Share available, copy-only, copied, share cancelled, share/copy failure |
| `CompactHomeView` | Mobile establishing snapshot and resident shortcuts | loading, populated, quiet, unavailable image |
| `DisclosureBlock` | Staged-fiction, authorship, provenance and non-affiliation copy | normal, compact social-page variant, long model IDs |

---

## Interaction Contract

- Route navigation, disclosure expansion, recap review, archive browsing, profile reading, permalink sharing, pause/resume, and jump-to-live are all keyboard operable with visible focus.
- Native `<details>` behavior explanations preserve browser semantics. Opening one does not collapse another automatically.
- The recap sheet is non-modal and does not trap focus. `Escape` closes it only when focus is inside the sheet; the explicit `Dismiss recap` and `Review later` controls remain available.
- Archive and profile links use ordinary anchor navigation. No card requires drag, hover, or JavaScript to reveal its primary destination.
- Web Share cancellation is silent. Copy failure retains the canonical URL in a selectable field and displays a solution path.
- Automatic live updates never move keyboard focus. While presentation is paused or a historical page is open, canonical server time continues.
- A visitor returning from a profile or permalink to `/` may resume the existing local presentation state; `Jump to live` remains explicit when that state is behind.

---

## Motion Contract

| Motion | Default | Reduced-motion behavior |
|--------|---------|-------------------------|
| Side-sheet entrance | 200ms opacity plus 8px translation | Instant appearance |
| Disclosure expansion | Native layout change; no height tween | Same |
| Route/content transition | None required | Same |
| Automatic scene framing | Existing 240ms ease-out | Instant reposition with polite announcement |
| Resident production sprites | Restrained 6–8 FPS loops | Representative still frame except required location change |
| Portrait speaking pose | One short 2-frame change while current speaker | Static speaking pose |
| Copy confirmation | Static text for at least 2 seconds | Same |

No continuous pulsing, parallax, decorative camera drift, autoplay audio, scroll-jacking, animated counters, or skeleton shimmer is permitted.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary live CTA | `Jump to live` |
| Global navigation | `Live home` · `Residents` · `Recent scenes` |
| Return action and heading | `Since your last visit` |
| Recap defer | `Review later` |
| Recap acknowledge | `Dismiss recap` |
| Recap scene action | `Open scene` |
| Recap footer label | `Current situation` |
| Recap loading | `Checking what changed…` |
| Recap error | `Your recap could not be prepared. The live home is still available.` |
| Recap retry | `Try recap again` |
| Recap partial note | `Some older changes could not be included.` |
| Resident card CTA | `View resident profile` |
| Behavior disclosure | `Behind this behavior` |
| Behavior loading | `Opening behavior notes…` |
| Behavior error | `Behavior notes are unavailable. Try opening them again.` |
| Behavior partial note | `Some supporting sources are unavailable.` |
| Scene share | `Share this scene` |
| Copy fallback | `Copy scene link` |
| Copy success | `Scene link copied` |
| Share preparation | `Preparing scene link…` |
| Archive empty heading | `The archive is quiet` |
| Archive empty body | `No canonical scenes are available yet. Return to the live home while the residents continue their day.` |
| Archive loading | `Opening the recent scene archive…` |
| Archive error | `The recent scenes could not be loaded. Try opening the archive again, or return to the live home.` |
| Archive retry | `Open archive again` |
| Archive partial note | `Some recent scenes could not be loaded. Open the archive again to retry.` |
| Profile loading | `Opening resident profile…` |
| Profile error | `This resident profile could not be loaded. Try opening it again, or return to the residents list.` |
| Profile retry | `Open profile again` |
| Missing profile heading | `Resident profile not found` |
| Missing profile body | `This resident does not have a published profile. Return to the residents list or the live home.` |
| Relationship unavailable | `No recent relationship change is available.` |
| Scene loading | `Opening canonical scene…` |
| Scene unavailable heading | `This canonical scene is unavailable` |
| Scene unavailable body | `The scene cannot be displayed right now. Return to recent scenes or jump back to the live home.` |
| Share failure | `The scene could not be shared. Copy its link instead.` |
| Copy failure | `The link could not be copied automatically. Select and copy the scene address below.` |
| Destructive confirmation | None — Phase 3 has no destructive visitor action |

Copy is calm, specific, and non-anthropomorphic about model consciousness. Infrastructure terms such as cursor, projection, provider retry, generation attempt, or database revision are not visitor-facing.

---

## Accessibility and Presentation Safeguards

- Every scene, recap beat, profile fact, source, relationship explanation, archive row, disclosure, and control is semantic DOM content. Canvas art is supplementary.
- Visible focus remains a 2px `#E4B65A` ring with 2px offset and is never clipped by cards, sheets, sticky rows, or scroll containers.
- Page landmarks use one `<main>`, a labeled global `<nav>`, and route-appropriate `<aside>` elements. Heading levels do not skip.
- Current route uses `aria-current="page"`. Current transcript turn may use `aria-current="true"` only during live presentation.
- Status announcements are polite and concise: recap availability, copied link, presentation pause/resume, and jump-to-live. Loading or polling does not repeatedly announce.
- Browser zoom at 200%, text-only zoom, and long exact model IDs must reflow without horizontal page scrolling.
- Touch targets are at least 44×44px. Essential mobile actions never require drag or hover.
- Reduced-motion behavior follows this contract even while canonical world time and data continue to advance.
- Social preview images have equivalent metadata text; portrait or map images use concise alt text, while decorative pixel borders use empty alt text.

---

## UI Considerations

> Resolved after the six-dimension review using the UI-consideration probe and the user-approved manual element classification. Empty-state and error-state wording remains canonical in the Copywriting Contract; these rows define behavior and reference that copy rather than duplicating it.

Applicable state considerations resolved: 83 covered, 0 backstop, 0 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| loading, error, overflow, long-text | `ObserverNavigation` | ✅ covered | Core server-rendered route links are present before optional data resolves. The recap action stays absent while its marker is checked; a failed optional check never disables navigation or invents an active route. At narrow widths links form a wrapping two-row group, preserve full labels, and never force page-level horizontal scrolling. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `ReturnRecap` | ✅ covered | Zero meaningful beats suppress the recap action and sheet. Opening during resolution shows the documented loading copy without blocking the live home; failure shows the documented retry path. The populated state contains one to five complete canonical beats plus `Current situation`. Stale or incomplete beats are omitted and trigger the documented partial note. The sheet scrolls internally while its heading and actions remain reachable; beat text and links wrap without semantic truncation. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `RecentSceneArchive` | ✅ covered | Zero scenes use the documented quiet-archive state; loading reserves no fabricated scene rows; failure shows the documented retry path. Normal content is one to 30 complete canonical rows, newest first. A partial read retains only complete rows and shows the documented partial note. The page uses normal vertical scrolling, stable home-day headings, consistent one/many row spacing, and natural wrapping for titles, residents and outcomes. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `ResidentDirectory` | ✅ covered | The only valid populated state is the fixed six-resident launch cast in approved order. Loading announces progress and reserves six non-animated card frames without fake identity text. Zero or partial cast data is treated as a page error rather than presenting an incomplete ensemble. The card grid collapses from three to two to one column, portraits retain aspect ratio, and names, roles and significance copy wrap without clipping. |
| empty, loading, error, populated, overflow, long-text | `ResidentProfile` | ✅ covered | An unknown resident uses the documented not-found copy and links back to the directory and live home. Loading and fetch failure use their documented messages and retry paths without invented facts. A populated profile presents one complete resident record and its approved claim-backed sections. The editorial page uses document scrolling, collapses to one column below 1024px, and wraps exact model IDs, source titles and URLs anywhere. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `BehaviorDisclosure` | ✅ covered | A behavior without a complete approved claim mapping is omitted rather than shown empty. Deferred notes use the documented loading copy; failure retains the profile and shows the documented behavior retry path. One or many complete behaviors render as independent native disclosures. Incomplete claims or sources are withheld and trigger the documented partial note. Expanded content participates in page scrolling and wraps every explanation and source without ellipsis. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `ScenePermalink` | ✅ covered | A stable scene identity always resolves to either one complete immutable scene or the documented unavailable annotation; it never becomes a generic blank page. Loading shows the canonical-scene message. A scene missing its complete transcript or required provenance is unavailable as a whole, not partially presented. Populated pages use normal document scrolling and a single-scene hierarchy; premise, model IDs, context and disclosures wrap without hiding canonical meaning. |
| empty, loading, error, populated, partial, overflow, zero-one-many, long-text | `CanonicalTranscript` | ✅ covered | A canonical transcript is published only with four to ten ordered complete turns. Zero, partial, loading or failed transcript data delegates to the parent scene's loading or unavailable state, with no fabricated or fragmentary turns. Populated turns retain speaker and exact-model attribution. Permalink transcripts use page scrolling; live transcripts use their established contained scroll region. All dialogue and IDs wrap and remain complete at 200% zoom. |
| empty, loading, error, partial, long-text | `ShareSceneActions` | ✅ covered | Share controls are absent until a stable canonical URL exists. During URL preparation they are disabled with the documented preparation text. Native-share cancellation is silent; other failures show the documented copy-link solution. If Web Share is unavailable, copy remains; if automatic copy fails, a labeled selectable address field preserves the full URL. Labels and addresses wrap or reflow without obscuring the action. |
| empty, loading, error, populated, overflow, long-text | `CompactHomeView` | ✅ covered | Without visual data, the semantic current scene, transcript and resident navigation remain primary and a labeled static silhouette occupies the establishing-view slot. Loading uses the existing opening-home copy without shimmer. Failure retains the last valid image when safe or shows a labeled unavailable placeholder. A populated view shows one static labeled home snapshot; shortcuts wrap below it and long room names wrap rather than resizing or enabling drag. |
| loading, error, overflow, long-text | `RelationshipSummary` | ✅ covered | Relationship content appears only after its complete cause-backed read resolves. Missing or failed optional relationship history leaves the rest of the profile intact and shows the documented unavailable sentence, not a guessed state or number. Multiple summaries stack vertically in document flow; resident names, qualitative phrases and scene-link labels wrap without truncation. |
| loading, error, overflow, long-text | `DisclosureBlock` | ✅ covered | Core staged-fiction and non-affiliation disclosures are server-rendered constants and remain present on complete, loading and error variants of scene/profile surfaces; exact dynamic model provenance is omitted rather than guessed until available. Disclosure blocks expand vertically, preserve normal page flow, and wrap exact model IDs and link labels without ellipsis. |
| empty, loading, error, populated, overflow, long-text | `SocialPreview` | ✅ covered | Social metadata is server-generated with no client loading UI. A scene with insufficient data or an image-render failure returns the original generic Model Afterlife fallback carrying staged-fiction, AI-authorship and non-affiliation text; it never fabricates a scene or resident. A populated 1200×630 preview uses the canonical premise and exact model IDs. Premise display is deterministically limited to two lines while the full premise remains in metadata; up to three exact model IDs receive dedicated wrapping lines. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable — the established manual Tailwind system uses no shadcn or third-party registry blocks |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-25
