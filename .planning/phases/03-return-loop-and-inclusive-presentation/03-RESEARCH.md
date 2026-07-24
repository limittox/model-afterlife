# Phase 3: Return Loop and Inclusive Presentation - Research

**Researched:** 2026-07-25  
**Domain:** Immutable public scene reads, causal return recaps, sourced resident profiles, inclusive responsive presentation, original pixel-art production, and account-free sharing  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Return recap and recent archive

- **D-01:** A returning visitor sees a non-blocking **“Since your last visit”** sheet rather than a mandatory interruption. It contains no more than five significance-ranked, causal beats and may be dismissed immediately.
- **D-02:** The browser stores only an anonymous local last-visit marker. The marker identifies the visitor's previously observed canonical position; it is not an account, cross-device identity, streak, or server-side visitor profile.
- **D-03:** Each recap beat must describe a meaningful canonical development, link to its canonical scene and relevant resident profile, and mention a relationship change only when that change was actually recorded by the scene.
- **D-04:** The recap ends with a short current-situation footer and provides distinct actions to dismiss, review later, open a referenced scene, or jump to the live home.
- **D-05:** The public recent-scenes archive contains the latest 30 canonical published scenes. Each entry exposes its title, residents, home time, premise, transcript, outcome, and relevant profile or explanation links. The 30-scene limit is presentation retention, not permission to delete canonical provenance.
- **D-06:** Return texture comes from restrained callbacks and unresolved threads grounded in bounded canonical history. Do not introduce streaks, currencies, daily rewards, absence penalties, or popularity mechanics.

### Resident profiles and “Behind this behavior”

- **D-07:** Every launch resident has a dedicated, stable public profile URL. — **Reversibility:** costly — changing released profile routes would require permanent redirects and updates to scene, recap, archive, and social-card references.
- **D-08:** A profile explains the resident's real-world significance, lineage, architecture or capabilities, documented limitations, and the evidence-based reason it is treated as retired or superseded in this fictional home.
- **D-09:** Profiles use progressive disclosure. The readable character overview comes first; **“Behind this behavior”** expands a recurring trait into five clearly separated parts: the joke, its historical inspiration, the fictional exaggeration, uncertainty or scope caveats, and supporting sources.
- **D-10:** Historical material must preserve the existing documented, reported or reputation-based, and fictional-exaggeration categories. Sources and uncertainty remain accessible without putting citations or provenance clutter inside live speech bubbles.
- **D-11:** Relationship presentation is qualitative and legible through descriptions, recent behavior, causal recap beats, and linked archived scenes. Do not expose raw numeric relationship scores, progress bars, or game-like affinity meters.

### Mobile and accessible observation

- **D-12:** Mobile is a purpose-built, scene-and-transcript-first presentation. It includes a compact static establishing view of the home and touch-friendly access to residents, recap, archive, profiles, sharing, and jump-to-live; it is not a shrunken or drag-dependent desktop map.
- **D-13:** Dialogue, profiles, explanations, recap beats, archive entries, current status, and all essential controls remain semantic HTML outside the canvas. The Phaser renderer stays a visual enhancement, never the only source of content or control.
- **D-14:** Every essential action is keyboard operable with visible focus. Text must scale and reflow, speaker and state differences must not depend on color alone, and controls and content must retain sufficient contrast.
- **D-15:** Reduced-motion mode removes nonessential sprite animation, camera easing and panning, parallax, and decorative motion. Pausing or manually reviewing presentation does not pause the canonical server timeline; jump-to-live remains explicit.

### Stable scene sharing

- **D-16:** Every published scene receives a stable, server-rendered public permalink that continues to resolve after the live world advances. — **Reversibility:** one-way — once shared publicly, the route and scene identity become a durable external contract and must be preserved or permanently redirected.
- **D-17:** A scene page presents the immutable canonical transcript, cast, home time, premise, structured outcome, historical context, exact resident-model authorship, relevant resident links, staged-fiction disclosure, AI-authorship disclosure, and non-affiliation context.
- **D-18:** Social metadata and preview cards use approved text and original project assets. The staged-fiction, AI-authorship, exact model/version provenance, and non-affiliation context must survive outside the main application rather than appearing only after a click.
- **D-19:** Sharing uses the Web Share API where available with a copy-link fallback. It requires no account and creates no on-site feed, follower graph, comment system, reaction counter, or popularity-driven canon.

### Original visual identity

- **D-20:** Retain the current compact home structure and observer hierarchy while replacing provisional visuals with an original warm **“computational care home”** pixel-art identity. — **Reversibility:** costly — the palette, environment assets, resident silhouettes, social previews, responsive composition, and accessibility tokens will become a coordinated visual system.
- **D-21:** Each resident remains recognizable through an original silhouette, wardrobe, prop, palette role, and animation language derived from the resident's fictional characterization—not through provider logos, copied mascots, or protected game assets or visual expression.
- **D-22:** The home should feel affectionate, calm, and quietly theatrical: cozy domestic spaces frame technically specific character comedy without implying model consciousness or turning limitations into humiliation.

### the agent's Discretion

- Exact URL slugs and route component boundaries, provided released canonical URLs remain durable.
- The deterministic significance-ranking formula and tie-breakers, provided recap output is causal, bounded to five beats, and independent of popularity.
- Database projection and API shapes for archive, profile, recap, and share-page reads, provided they derive from immutable canonical records and approved claim versions.
- Exact navigation labels, responsive breakpoints, focus treatment, reduced-motion timing values, and social-card composition within the approved information architecture and accessibility constraints.
- The detailed palette, tile set, props, sprite proportions, and animation frames within the original computational-care-home direction.

### Deferred Ideas (OUT OF SCOPE)

- Accounts, cross-device identity, comments, followers, reactions, visitor posts, social feeds, and popularity-driven cast or canon are outside the product direction, not Phase 3 follow-ups.
- Public operations, analytics, claim-correction tooling, withdrawal workflows, cost controls, and release gates belong to Phase 4: Safe Public Operation.
- Expanding beyond the six launch residents or the compact home remains outside v1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RSID-05 | Each resident profile explains significance, lineage, architecture or capabilities, documented limitations, and the basis for retirement or supersession. | Add a validated, versioned profile definition whose sections map to approved claim versions; do not write profile facts directly in JSX. |
| RSID-06 | Visitors can open a “Behind this behavior” explanation that distinguishes the joke, its historical inspiration, the exaggeration, uncertainty, and supporting sources. | Reuse character-bible traits and exact claim mappings in native `<details>` disclosures with five fixed semantic sections. |
| RSID-08 | Provider logos, copied mascots, and protected game assets or visual expression are absent from resident and environment art unless separately authorized. | Establish source-controlled original-art manifests, deterministic exports, and a human originality review gate. |
| RELS-04 | Visitors can recognize relationship changes through later behavior, profiles, archived scenes, or recaps. | Project only qualitative phrases and the latest cause-backed relationship event; never expose canonical numeric values. |
| VIEW-07 | The live view uses original pixel-art assets and a consistent Model Afterlife visual identity rather than reproducing another game's protected assets or interface. | Replace procedural placeholder drawing through the existing 16px layout and renderer bridge while preserving room IDs, anchors, and observer behavior. |
| RTRN-01 | Visitors can browse a finite recent-scenes archive containing each scene's title, residents, home time, premise, transcript, outcome, and links to resident context. | Query the latest 30 `scene_published` events and immutable revisions; use each title as the canonical transcript permalink and keep rows summary-first. |
| RTRN-02 | The site records an anonymous local last-visit marker without requiring an account. | Store a versioned `{worldId, throughSequence}` record in local storage after parsing it as untrusted input. |
| RTRN-03 | When meaningful events occurred after a visitor's last visit, the visitor receives a significance-ranked recap containing no more than five concise causal beats. | Rank immutable publication/effect/memory records on the server with deterministic scores and stable tie-breakers. |
| RTRN-04 | Every recap beat links to a canonical scene or resident profile and identifies genuine relationship changes only when canon records them. | Build each beat from a published revision plus explicit `relationship_effect_applied` events sharing that revision cause. |
| RTRN-05 | A recap ends with the home's current situation and lets the visitor dismiss it, review it later, open a referenced scene, or jump to live. | Return a bounded recap envelope with its own `throughSequence`; only explicit dismissal acknowledges it. |
| RTRN-06 | The viewing experience can surface unresolved threads and restrained callbacks without adding streaks, currencies, or absence penalties. | Reuse accepted bounded shared-experience summaries and approved scene history; never derive significance from visitor behavior. |
| TRNS-04 | Scene and profile pages expose enough provenance to trace each historical explanation to its approved claims and sources without cluttering live speech bubbles. | Add exact published-scene-to-claim-version bindings and reuse the approved historical claim ledger on detail pages only. |
| TRNS-06 | Shared scene metadata and social cards retain staged-fiction, AI-authorship, exact model-version provenance, and non-affiliation context outside the main site. | Generate page metadata and route-local Open Graph images from the same canonical scene reader and shared disclosure constants. |
| ACCS-01 | Dialogue, controls, profiles, recaps, and scene transcripts are available as semantic HTML rather than exclusively through the canvas. | Keep React/server-rendered DOM authoritative and make the Phaser/static image layer supplementary. |
| ACCS-02 | Visitors can operate all essential viewing, profile, archive, recap, pause, and navigation controls with a keyboard and visible focus. | Use ordinary links/buttons/details, preserve 44px targets, non-modal recap behavior, and explicit focus return. |
| ACCS-03 | Text can scale and reflow without losing content, while contrast and non-color cues keep speakers, statuses, and controls understandable. | Extend existing tokens and Playwright layout patterns; remove truncation from exact IDs, URLs, and essential labels. |
| ACCS-04 | The experience honors reduced-motion preferences and provides a mode that removes nonessential camera easing, panning, parallax, and animation. | Preserve the existing `matchMedia` and renderer flag, then make the production atlas choose static representative frames. |
| ACCS-05 | Automatically moving or updating presentation can be paused, stopped, hidden, or read manually without stopping canonical server time. | Preserve the acquisition/presentation cursor split and explicit Jump-to-live behavior. |
| ACCS-06 | Mobile visitors receive a touch-friendly scene-first view with the current scene, compact establishing view, residents, recap, archive, profiles, sharing, and jump-to-live controls. | Reorder semantic source structure so transcript precedes the compact home at narrow widths and remove mobile camera dependency. |
| ACCS-07 | Mobile usability does not depend on shrinking the complete desktop map or requiring drag-only interaction. | Render a labeled static establishing view and ordinary resident/profile links below 1024px. |
| SHAR-01 | Every published scene has a stable public permalink that continues to resolve after the live world advances. | Use immutable publication `revisionId` as the durable `[sceneId]` route identity and always normalize cached playback to `originalRevisionId`. |
| SHAR-02 | A scene permalink presents the canonical transcript, residents, time, premise, historical context, exact resident-model authorship, and staged-fiction disclosure. | Compose the page from the immutable revision, brief, publication event, exact claim versions, and launch-resident registry. |
| SHAR-03 | The site produces an attractive social preview for a scene using approved text and original assets while preserving AI-authorship, staged-fiction, and non-affiliation labels. | Use route-local `opengraph-image.tsx` with deterministic 1200×630 output and a generic disclosed fallback. |
| SHAR-04 | Sharing a scene does not require an account and does not create an on-site feed, follower graph, comment system, or popularity-driven canon. | Keep sharing client-only and stateless: native share, copy, and selectable URL only. |
</phase_requirements>

## Summary

Phase 3 should be planned as a public-read and presentation phase, not as an extension of the live snapshot contract. The repository already has immutable `published_scene_revisions`, canonical `scene_published` events, exact turn model IDs, approved claim IDs, cause-backed relationship events, bounded shared memories, six stable resident IDs, and a clean semantic/canvas split. The missing layer is a small family of strict server read models that join those records into stable scene, archive, profile, relationship, and recap DTOs without exposing raw projection state, private attempts, prompts, rejected text, or provider errors. [VERIFIED: `src/db/schema.ts`, `src/features/world/server/publish-scene-revision.ts`, `src/features/world/domain/types.ts`, `src/features/world/contracts/public-world.ts`]

The highest-risk data gap is historical provenance. Published turns currently persist stable `approvedClaimIds`, while generation attempts record one claim-set version key; neither record binds every used claim to the exact immutable `claimVersionId` that a future correction must preserve. Phase 3 should add an explicit published-scene claim-version mapping and backfill the pre-release rows before exposing permanent pages. The second gap is editorial: the current ledger has three behavior-oriented claims per resident but does not yet cover every required profile section such as lineage, limitations, and supersession. [VERIFIED: `src/db/schema.ts`, `src/features/world/generation/contracts.ts`, `src/features/world/fixtures/historical-claims.ts`]

The presentation work should preserve the existing acquisition/presentation cursor split and renderer bridge while changing document structure at the responsive boundary. Today `WorldObserver` renders the full world before the scene rail in source order and keeps a live Phaser viewport at mobile widths; the approved Phase 3 contract requires the semantic scene/transcript first and a static, non-draggable establishing view below 1024px. The production art should replace procedural Phaser drawing through checked-in atlas/map exports while retaining the 352×256 coordinate space, 16px grid, room IDs, resident IDs, camera bounds, and renderer intents. [VERIFIED: `src/features/world/client/WorldObserver.tsx`, `src/app/globals.css`, `src/features/world/renderer/world-layout.ts`, `src/features/world/renderer/HomeScene.ts`]

**Primary recommendation:** Build and verify immutable public read models plus exact claim-version bindings first; then layer server-rendered routes, local recap state, inclusive responsive composition, and original art over those stable contracts.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Stable scene permalink | Frontend Server (SSR) | Database / Storage | The App Router owns durable HTML/metadata; immutable revision/event rows own truth. [VERIFIED: codebase + UI-SPEC] |
| Recent 30-scene archive | Frontend Server (SSR) | Database / Storage | Server-rendered ordered content should be assembled from canonical publication records, not live client state. [VERIFIED: codebase + CONTEXT D-05] |
| Resident profiles and behavior provenance | Frontend Server (SSR) | Database / Storage | Profile copy is public editorial content; exact approved claim versions and sources are stored/versioned data. [VERIFIED: codebase + CONTEXT D-08–D-10] |
| Qualitative relationships | API / Backend | Database / Storage | Server code owns the numeric-to-language allowlist and cause lookup so raw values never cross the public boundary. [VERIFIED: `relationships.ts`, CONTEXT D-11] |
| Significance-ranked recap | API / Backend | Browser / Client | The server ranks canonical causes; the browser supplies only an anonymous parsed sequence marker and owns sheet state. [VERIFIED: CONTEXT D-01–D-05] |
| Last-visit marker | Browser / Client | — | It is intentionally anonymous, device-local, and non-canonical. [VERIFIED: CONTEXT D-02] |
| Semantic navigation and detail content | Frontend Server (SSR) | Browser / Client | Headings, links, profiles, transcripts, and disclosures render as HTML; only interactive recap/share/presentation controls hydrate. [VERIFIED: UI-SPEC] |
| Desktop pixel home | Browser / Client | CDN / Static | Phaser consumes validated snapshots and project-owned atlases/maps; it never owns semantic or canonical state. [VERIFIED: renderer bridge] |
| Compact mobile home | Browser / Client | CDN / Static | A static labeled view supplements the transcript and profile links without camera or drag behavior. [VERIFIED: UI-SPEC] |
| Social metadata and preview | Frontend Server (SSR) | CDN / Static | Metadata and 1200×630 images derive from the same immutable scene reader and original static assets. [CITED: https://nextjs.org/docs/app/getting-started/metadata-and-og-images] |
| Native sharing and copy fallback | Browser / Client | — | Web Share and Clipboard require user activation/client APIs and are optional capabilities. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API] |

## Project Constraints (from AGENTS.md)

- Do not invoke `$gsd-debug`, a debug session manager, a multi-agent debugging loop, or subagent fan-out unless the user explicitly requests it; use proportional direct evidence and focused regression coverage for routine work. [VERIFIED: `AGENTS.md`]
- Use a GSD workflow before repository edits. This research was delegated by the phase-planning workflow and edits only its canonical research artifact. [VERIFIED: `AGENTS.md`]
- Paid external API calls require a separately authorized bounded checkpoint with durable accounting. Phase 3 planning and ordinary verification must remain credential-free; no provider calls are needed for any requirement in this phase. [VERIFIED: `AGENTS.md`, `.planning/STATE.md`]
- Preserve the observer-only, one-shared-timeline product. Navigation, profiles, recaps, archive reads, and sharing must not write canon or let visitors influence residents. [VERIFIED: `AGENTS.md` project constraints]
- Keep generated dialogue attributable, reviewable, cached, and clearly disclosed; historical exaggeration must never be presented as historical fact. [VERIFIED: `AGENTS.md` project constraints]
- Limit v1 to six residents and one compact home; desktop is primary and mobile is a simplified scene-first experience rather than full map parity. [VERIFIED: `AGENTS.md` project constraints]
- Use original cozy pixel art and avoid copied assets/protected visual expression; satire targets documented technology behavior and must not imply consciousness or misrepresent people/companies. [VERIFIED: `AGENTS.md` project constraints]
- Use the established Next.js/React semantic shell, Phaser client island, PostgreSQL/Drizzle persistence, Zod validation, Tailwind token layer, Vitest, Playwright, self-hosted fonts, Aseprite sources, and Tiled JSON workflow. Do not replace the stack during this phase. [VERIFIED: `AGENTS.md` technology stack]
- Keep durable simulation and generation out of Next request handlers; this phase needs read handlers/pages only and no new scheduled or inference work. [VERIFIED: `AGENTS.md` technology stack]
- Do not add autonomous-agent frameworks, browser-to-model calls, Redis, WebSocket infrastructure, an unreviewed production `drizzle push`, or assumed Phaser 3 plugins. [VERIFIED: `AGENTS.md` “What NOT to Use”]
- No project-local skills exist, so there are no additional project skill rules to incorporate. [VERIFIED: `AGENTS.md`, project-skill discovery]
- The planning configuration sets `workflow.nyquist_validation` to `false` and `tdd_mode` is not enabled; therefore this research intentionally omits a `Validation Architecture` section and does not prescribe TDD. [VERIFIED: `.planning/config.json`]

## Standard Stack

### Core

| Library / facility | Version | Purpose | Why Standard Here |
|--------------------|---------|---------|-------------------|
| Next.js App Router | 16.2.11 | Server scene/profile/archive pages, dynamic metadata, route-local OG images | Already installed and the approved route shell; `page.tsx`, `generateMetadata`, `notFound`, and `opengraph-image.tsx` cover the permanent public-route contract. [VERIFIED: `package.json`] [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes] |
| React / React DOM | 19.2.8 | Semantic components and hydrated recap/share/presentation controls | Already owns semantic meaning while Phaser is supplementary. [VERIFIED: `package.json`, `WorldObserver.tsx`] |
| TypeScript | 6.0.3 | Strict public read models, route parameters, asset manifests | Deliberately pinned by the project stack. [VERIFIED: `package.json`, `AGENTS.md`] |
| Zod | 4.4.3 | Parse database JSON, local-storage markers, route/API payloads, and public DTOs | Existing public snapshot and generation boundaries already use Zod; Phase 3 should follow the same fail-closed pattern. [VERIFIED: `package.json`, `public-world.ts`, `contracts.ts`] |
| PostgreSQL + Drizzle ORM | PostgreSQL 18 target / Drizzle 0.45.2 | Immutable revision/event/claim reads and exact provenance mapping | Existing canonical storage and migration system; no new datastore is needed. [VERIFIED: `AGENTS.md`, `package.json`, `src/db/schema.ts`] |
| Phaser | 4.2.1 | Desktop atlas/tilemap rendering and reduced-motion frame selection | Existing client-only renderer and bridge should be evolved, not replaced. [VERIFIED: `package.json`, renderer files] |
| Tailwind CSS token layer | 4.3.3 | Editorial page, navigation, recap, reflow, focus, and responsive styling | The approved UI contract explicitly retains the manual token system with no registry component library. [VERIFIED: `package.json`, `globals.css`, UI-SPEC] |

### Supporting

| Library / facility | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| `lucide-react` [WARNING: flagged as suspicious — verify before using.] | 1.26.0 | Named utility icons listed by the approved UI contract | Install only after a human verification checkpoint; import individual named icons, retain visible labels, and keep branded identity icons project-authored. [CITED: https://lucide.dev/guide/react] |
| Web Share API | Browser capability | Native account-free share sheet | Call synchronously from an explicit button activation only when `navigator.share` is available; cancellation is silent. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share] |
| Clipboard API | Browser capability | Copy canonical scene URL | Use `writeText` in a secure context, catch rejection, and reveal a selectable URL field on failure. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText] |
| Native `<details>/<summary>` | HTML platform | “Behind this behavior” progressive disclosure | Use for every complete behavior explanation; do not add a disclosure package. [VERIFIED: UI-SPEC] |
| Aseprite | 1.3.17.2 project pin | Editable resident/environment/portrait sources and tagged atlas exports | Author art locally; commit sources and validated runtime PNG/JSON exports so deployment does not require the licensed binary. [VERIFIED: `AGENTS.md`] [CITED: https://www.aseprite.org/docs/cli/] |
| Tiled | 1.12.2 project pin | Home tilemap, object layers, stable room/anchor properties | Author the production map; commit JSON exports and validate room/anchor IDs before Phaser loads them. [VERIFIED: `AGENTS.md`] [CITED: https://doc.mapeditor.org/en/stable/reference/json-map-format/] |
| Vitest / Playwright | 4.1.10 / 1.61.1 | Focused read-model regressions and browser/visual accessibility evidence | Extend the established suites after implementation; no new test framework is needed. [VERIFIED: `package.json`, test configs] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Approved stack | No alternative researched | Framework, routes, component model, icon library, art direction, and mobile behavior are locked by CONTEXT.md and UI-SPEC; planning should deepen those decisions rather than reopen them. |

**Installation (after the required human package checkpoint):**

```bash
corepack pnpm add lucide-react@1.26.0
```

**Version verification:** `lucide-react` 1.26.0 was the live npm version on 2026-07-25, published 2026-07-23, with about 96.7 million weekly downloads, an ISC license, the official `lucide-icons/lucide` source repository, and no postinstall script. The legitimacy seam still returned `SUS` solely because the latest release was less than a week old. [CITED: npm registry metadata] [CITED: https://lucide.dev/guide/react]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `lucide-react` | npm | Latest release about 2 days old | 96,725,471/week | `github.com/lucide-icons/lucide` | SUS (`too-new`) | Flagged — planner must add `checkpoint:human-verify` before install; verify publisher/repository and decide whether to pin 1.26.0 or the immediately preceding approved release. |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** `lucide-react`

The package was identified by the official Lucide React guide, not by a package-name guess, but the latest release does not pass the mandatory age heuristic. It must remain warning-tagged until the human checkpoint. [CITED: https://lucide.dev/guide/react]

## Architecture Patterns

### System Architecture Diagram

```text
Canonical publication transaction
  ├─ published_scene_revisions (immutable transcript, effects, outcome summary)
  ├─ scene_briefs (premise, cast, location, permitted outcome)
  ├─ world_events
  │    ├─ scene_published (sequence + logical tick)
  │    ├─ relationship_effect_applied (exact cause revision)
  │    └─ shared_experience_recorded (bounded callback memory)
  ├─ generation_attempts / turns (exact model identity)
  └─ published_scene_claim_versions (NEW exact claim-version bindings)
                         │
                         ▼
                Server read-model layer
        ┌───────────────┼──────────────────┐
        ▼               ▼                  ▼
  Scene detail      Recent 30 archive   Resident profiles
        │               │                  │
        ├───────────────┴──────────┐       └─ qualitative relationships
        ▼                          ▼
  SSR page + metadata       Recap ranker API
  + OG image fallback             ▲
        │                          │ parsed local marker only
        ▼                          │
  Share client               Browser recap controller
  native share → copy →      review later / dismiss / jump live
  selectable canonical URL

Live snapshot feed ──► acquisition/presentation reducer ──► semantic current scene
                                                      ├──► desktop Phaser enhancement
                                                      └──► mobile static home snapshot
```

### Recommended Project Structure

```text
src/
├── app/
│   ├── residents/
│   │   ├── page.tsx
│   │   └── [residentId]/page.tsx
│   ├── scenes/
│   │   ├── page.tsx
│   │   └── [sceneId]/
│   │       ├── page.tsx
│   │       ├── opengraph-image.tsx
│   │       └── not-found.tsx
│   └── api/recap/route.ts
├── features/publication/
│   ├── contracts/              # strict public scene/archive/profile/recap DTOs
│   ├── server/                 # joins/parsers; no client imports
│   └── components/             # shared transcript, provenance, disclosures
├── features/return-loop/
│   ├── client/                 # local marker + non-modal recap controller
│   └── components/
├── features/residents/
│   ├── fixtures/               # versioned profile definitions → claim IDs
│   └── components/
└── features/world/
    └── renderer/               # existing bridge + production atlas/tilemap adapter

art-src/
├── residents/                  # editable .aseprite sources
├── home/                       # editable tiles/map sources
└── ORIGIN.md                   # authorship, references, review, export versions

public/art/
├── residents/                  # committed PNG + atlas JSON + portraits
├── home/                       # committed tileset PNG + Tiled JSON
└── social/                     # original static preview elements/fallback
```

This structure keeps permanent publication reads separate from the volatile live-world DTO and prevents server-only provenance code from leaking into the client bundle. [VERIFIED: current feature-folder and App Router patterns]

### Pattern 1: Immutable Public Scene Read Model

**What:** Build one `readCanonicalScene(sceneId)` function that joins and parses the immutable revision, brief, publication event, exact model provenance, exact claim-version mappings, resident registry, relationship effects, and shared-experience outcome. It returns either `complete`, `known-unavailable`, or `not-found`; it never returns a partial transcript.  
**When to use:** Scene page, archive link, recap beat, metadata, and social preview.

Use `publishedSceneRevisions.revisionId` as the durable public `sceneId`. A live scene already uses this value; a cached presentation must link with `originalRevisionId`, never its synthetic `cached:*` presentation ID. [VERIFIED: `publish-scene-revision.ts`, `read-cached-scene.ts`, `public-world.ts`]

Add an explicit mapping such as:

```text
published_scene_claim_versions
  revision_id       FK → published_scene_revisions.revision_id
  turn_index        integer
  claim_version_id  FK → historical_claim_versions.claim_version_id
  PRIMARY KEY (revision_id, turn_index, claim_version_id)
  INDEX (claim_version_id, revision_id)
```

Resolve stable model-output claim IDs to exact claim-version IDs inside the accepted publication transaction. Backfill existing pre-release published rows from their stored attempt claim-set version and the current versioned ledger, then verify every published approved claim ID resolves exactly once. This closes the Phase 3 provenance contract and prepares Phase 4 affected-scene lookup without implementing correction tooling early. [VERIFIED: current schema gap]

### Pattern 2: Event-Indexed Archive and Recap

**What:** Treat `world_events.sequence` as the canonical position marker and `logicalTick` as home time. Query `scene_published` events for archive order and recap candidates, then enrich from immutable revisions/briefs.  
**When to use:** Latest-30 archive, last-visit recap, relationship cause links.

Do not use `published_scene_revisions.created_at` as home chronology; it is database wall-clock metadata. Extract the existing private clock conversion into a pure shared helper that returns home day, `HH:MM`, and day period from `logicalTick`. [VERIFIED: `schema.ts`, `to-public-snapshot.ts`]

Recommended deterministic recap ranking:

1. Candidate unit is one published revision after `afterSequence`, not one raw event.
2. Attach only relationship effects whose `causeRevisionId` equals that revision and whose `delta !== 0`.
3. Score genuine relationship change above accepted shared-experience outcome, and ordinary complete publication below both.
4. Tie-break by newest publication sequence, then immutable revision ID.
5. Return at most five complete beats plus the fresh snapshot's current situation.
6. Mark `partial: true` when a stale/malformed candidate is omitted; never invent a replacement beat.

This formula is causal, deterministic, bounded, and observer/popularity independent. It can change before public release, but its version should be included in the recap DTO for regression fixtures. [VERIFIED: available canonical causes and locked discretion]

### Pattern 3: Versioned Local Marker with Explicit Acknowledgement

**What:** Parse local storage as untrusted data into a minimal versioned record:

```typescript
// Source: project synthesis from CONTEXT D-02 and current sequence contract.
const LastVisitMarkerSchema = z.object({
  version: z.literal(1),
  worldId: z.string().uuid(),
  throughSequence: z.number().int().positive(),
});
```

**When to use:** Once on client hydration after the first valid snapshot.

Required state semantics:

- No marker: suppress recap and establish the first observed valid snapshot as the baseline.
- Valid same-world marker behind head: request recap from the server.
- `Review later`: close locally and do not write the marker.
- `Dismiss recap`: persist the recap response's `throughSequence`, not whatever newer feed position happens to arrive during reading.
- `Open scene`: ordinary navigation; do not acknowledge.
- `Jump to live`: preserve existing presentation behavior; do not silently acknowledge the recap.
- Zero meaningful beats: after a valid current home is actually observed, the marker may advance silently.
- Invalid, future, or other-world marker: discard it safely and establish a new baseline.

Never send a visitor ID, wall-clock last-visit time, streak, or session history to the server. [VERIFIED: CONTEXT D-02, D-04 and public sequence contract]

### Pattern 4: Server-Rendered Durable Routes and Metadata

**What:** Keep scene/profile/archive pages as Server Components and isolate only sharing/disclosure/recap controls as client components. Next.js 16 dynamic route `params` are promises; validate the string before repository lookup. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes]

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
import { notFound } from "next/navigation";

export default async function ScenePage({
  params,
}: PageProps<"/scenes/[sceneId]">) {
  const { sceneId } = await params;
  const result = await readCanonicalScene(sceneId);
  if (result.kind === "not-found") notFound();
  return <ScenePermalink result={result} />;
}
```

Use one reader for the page, `generateMetadata`, and `opengraph-image.tsx`. Configure a validated production `metadataBase`; build canonical URLs from that configuration and the immutable ID, never from a user-controlled request `Host`. Next route-local Open Graph files can read dynamic params, return `ImageResponse`, and export fixed 1200×630 size/alt/type. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image] [CITED: https://nextjs.org/docs/app/api-reference/functions/generate-metadata]

### Pattern 5: Profiles as Validated Editorial Data, Not JSX Copy

**What:** Add one versioned `ResidentProfileDefinition` per launch resident with fixed section order, concise overview text, and arrays of exact approved claim IDs for significance, lineage/capabilities, limitations, and supersession. Add missing sourced claims first, then validate every referenced claim belongs to the resident and exact model scope.  
**When to use:** Directory cards, profile narrative, behavior explanations, social metadata.

Behavior disclosures should join `CharacterTrait.approvedClaimIds` to exact claim versions and render:

1. The joke — readable trait/behavior label.
2. Historical inspiration — documented/reported claim statements.
3. Fictional exaggeration — explicit exaggeration claim.
4. Uncertainty and scope — confidence, model scope, and editorial caveat.
5. Sources — title, URL, and access date.

Keep stored enums (`documented`, `reported`, `exaggeration`) unchanged and map them at the visitor boundary to the UI contract's labels (`Documented`, `Reported or reputation-based`, `Fictional exaggeration`). [VERIFIED: `domain/types.ts`, `historical-claims.ts`, UI-SPEC]

### Pattern 6: Qualitative Relationship Projection

**What:** Read raw relationship values only on the server, map them through a versioned phrase table, and attach the latest genuine cause-backed scene.  
**When to use:** Profiles, archive rows, recap beats.

The public DTO should contain `label`, `description`, `residentId`, and optional `causeSceneId`; it must not contain friendship/rivalry/familiarity numbers or deltas. A zero delta is not a visitor-facing change. When no complete cause is available, render the approved unavailable sentence rather than a guessed relationship state. [VERIFIED: `relationships.ts`, UI-SPEC]

### Pattern 7: Semantic Source Order with Visual Grid Areas

**What:** Put the current-scene card, complete transcript, and essential presentation actions before the visual home in DOM source order; use desktop grid areas to place the home left and scene rail right.  
**When to use:** Refactoring `WorldObserver`.

The current implementation's world-first DOM and 440px live canvas at widths below 1024px do not meet the approved scene-first compact contract. CSS `order` alone is insufficient because keyboard and reading order remain source order. Render the same semantic scene component on live, archive/permalink, and mobile variants, with page-scroll for detail routes and contained scroll only for the desktop live rail. [VERIFIED: `WorldObserver.tsx`, `globals.css`, UI-SPEC]

WCAG 2.2 requires keyboard operation, visible focus, meaningful sequence, non-color cues, resize/reflow, and control of auto-updating or moving information. Its guidance explicitly recognizes pause plus a jump-to-current pattern for real-time status where simply resuming stale display could mislead. [CITED: https://www.w3.org/TR/WCAG22/] [CITED: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html]

### Pattern 8: Deterministic Original-Asset Pipeline

**What:** Preserve editable originals in `art-src`, commit runtime exports in `public/art`, and validate their IDs/dimensions/tags before Phaser creation.  
**When to use:** Replacing procedural rooms/residents, adding portraits and social assets.

Keep the current `HOME_WIDTH=352`, `HOME_HEIGHT=256`, 16px grid, room IDs, anchors, camera bounds, resident `visualVariantId`s, and renderer intent union as the compatibility contract. Move presentation detail from `Graphics` primitives into Tiled/atlas assets; do not move canonical logic into map properties. [VERIFIED: `world-layout.ts`, `renderer-types.ts`, `HomeScene.ts`]

Aseprite can export selected tags to PNG sprite sheets plus JSON metadata, and Tiled exports browser-friendly JSON object/tile/custom-property data. Phaser 4 parses Tiled JSON but requires the tiles for a layer in one embedded tileset image. [CITED: https://www.aseprite.org/docs/sprite-sheet/] [CITED: https://doc.mapeditor.org/en/stable/reference/json-map-format/] [CITED: https://docs.phaser.io/api-documentation/4.0.0/class/tilemaps-tilemap]

The export validator should require:

- six resident atlases in launch order;
- tags/frames for neutral, seated, walk, listen, and speak;
- one reduced-motion representative frame per state;
- exact room IDs and named resident anchors matching current coordinates;
- fixed pixel dimensions and nearest-neighbor rendering;
- original portrait/social frames with no provider logos;
- an origin manifest recording author, date, references, tool version, license/ownership, and export hashes.

Because Aseprite and Tiled are not installed in the current environment, checked-in validated exports are the runtime contract; regeneration is an authoring checkpoint, not a production build step. [VERIFIED: environment probe]

### Pattern 9: Disclosure-Parity Sharing

**What:** Build visible scene disclosures, metadata descriptions, and OG card labels from shared constant functions plus canonical model IDs.  
**When to use:** Scene page, generic fallback metadata/image, native share payload.

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
async function shareCanonicalScene(data: ShareData, canonicalUrl: string) {
  if (navigator.share) {
    try {
      await navigator.share({ ...data, url: canonicalUrl });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(canonicalUrl);
  } catch {
    // Render the already-present labeled selectable canonical URL field.
  }
}
```

Web Share has limited browser availability, requires HTTPS/permission and transient activation, and can reject. Clipboard writing also requires a secure context and can fail. The copy control and selectable URL are therefore part of the normal design, not exceptional debugging UI. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText]

### Anti-Patterns to Avoid

- **Live-snapshot permalinks:** The snapshot intentionally contains only the current scene and cannot resolve old shared links. Query immutable publication records instead. [VERIFIED: `public-world.ts`]
- **Client-side canonical joins:** Do not ship raw revisions, relationship numbers, attempt rows, or claim ledgers and reconstruct meaning in the browser.
- **Marker write on page load:** This loses the very recap being prepared. Acknowledge only explicit dismissal or the documented zero-beat observation path.
- **Wall-clock recap ordering:** Use canonical sequence/logical tick, not browser time or database `createdAt`.
- **Popularity significance:** No views, clicks, shares, resident popularity, or analytics may affect ranking.
- **Raw relationship UI:** No numbers, meters, deltas, arrows, ranks, or inferred change without a cause event.
- **Current-claim lookup for old scenes:** Stable claim IDs alone do not preserve exact historical provenance after correction; bind claim versions at publication.
- **Partial canonical scenes:** Four-to-ten complete ordered turns plus required provenance are atomic; an incomplete scene is unavailable as a whole.
- **Treating cached playback as publication:** Cached scenes retain `originalRevisionId`; they do not get a new archive row, recap beat, permalink, or relationship effect.
- **Canvas-dependent semantics:** Room selection, resident profiles, dialogue, recap, and sharing must remain ordinary DOM controls/content.
- **CSS-only mobile reorder:** Visual reorder without DOM reorder breaks meaningful keyboard/reading sequence.
- **Modal recap:** The recap is a non-modal sheet/disclosure, must not trap focus, and must return focus to its opener.
- **Metadata drift:** Do not separately hand-write page, OG, Twitter, and native-share facts; use the canonical reader and disclosure helpers.
- **Request-host canonical URLs:** Do not trust inbound `Host` for public share URLs or OG metadata.
- **Remote OG asset fetching:** Use checked-in original assets; arbitrary source URLs create SSRF and availability risk.
- **Runtime art generation:** Do not require Aseprite/Tiled or proprietary binaries during deployment; commit validated exports.
- **Replacing stable geometry:** New art must not silently change room IDs, anchors, camera bounds, or renderer intents.
- **Continuous reduced-motion animation:** A lower FPS loop is still motion; choose representative static frames and instant camera positioning.
- **Second icon system or dynamic Lucide map:** Use named individual imports only; original identity art remains separate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Permanent route/metadata plumbing | Custom HTML head or ad-hoc image endpoint | Next App Router pages, `generateMetadata`, `opengraph-image.tsx`, `notFound` | These APIs align dynamic params, head tags, route-local images, and 404 behavior. [CITED: Next.js docs] |
| Native share chooser | Provider-specific share links or custom account system | Web Share API | The OS/browser owns available share targets and requires user activation. [CITED: MDN Web Share] |
| Clipboard implementation | `execCommand`, hidden textarea hacks as primary path | Clipboard `writeText` plus visible selectable field | Modern API is clearer; the field preserves a no-magic fallback. [CITED: MDN Clipboard] |
| Disclosure state machine | Accordion package or custom ARIA widget | Native `<details>/<summary>` | The approved contract needs independent, keyboard-operable disclosures and no exclusive accordion behavior. [VERIFIED: UI-SPEC] |
| Canonical history database | Client archive cache, local recap history, or new datastore | Existing PostgreSQL event/revision/claim records | The existing records are immutable, ordered, transactional, and cause-backed. [VERIFIED: schema/publication code] |
| Relationship inference | NLP analysis of dialogue or raw-score UI | Recorded relationship-effect events plus server phrase mapper | Only canonical effects are genuine relationship changes. [VERIFIED: Phase 2 event model] |
| Sprite/camera/tilemap engine | DOM sprite engine or new canvas framework | Existing Phaser 4 renderer bridge | Current camera, lifecycle, reduced-motion, and two-viewer behavior are already proven. [VERIFIED: Phase 1 summaries] |
| Asset provenance | Informal filename conventions | Source manifest + deterministic export validator + hashes | Originality and reproducibility require inspectable authorship and source/export linkage. [VERIFIED: project constraints] |

**Key insight:** Phase 3 is mostly projection and presentation. Hand-rolled parallel sources of truth would weaken the immutable/cause-backed guarantees established in Phase 2.

## Common Pitfalls

### Pitfall 1: A Stable URL Backed by Volatile Data

**What goes wrong:** `/scenes/[id]` works only while the scene is live or while a client cache survives.  
**Why it happens:** The current public snapshot is convenient but intentionally current-state only. [VERIFIED: `public-world.ts`]  
**How to avoid:** Query immutable revision/event records by `revisionId`; normalize cached playback to `originalRevisionId`.  
**Warning signs:** A scene reader imports `readCurrentSnapshot`, or the URL uses the synthetic `cached:*` ID.

### Pitfall 2: Provenance Silently Follows the Latest Claim

**What goes wrong:** A future claim correction changes the explanation shown on an older scene without retaining what that scene used.  
**Why it happens:** Turns store claim IDs and attempts store a claim-set key, but not an exact per-turn claim-version binding. [VERIFIED: schema/contracts]  
**How to avoid:** Persist a revision/turn/claimVersion mapping atomically and test affected-scene reverse lookup.  
**Warning signs:** Scene detail calls only `historicalClaimsFor(residentId)` or selects the newest claim version.

### Pitfall 3: Recap Acknowledgement Races the Live Feed

**What goes wrong:** A visitor dismisses five beats but the marker jumps beyond scenes that arrived while they were reading.  
**Why it happens:** The client writes the latest acquisition cursor instead of the recap envelope's frozen `throughSequence`.  
**How to avoid:** Persist the exact recap response boundary on dismissal.  
**Warning signs:** Marker writes subscribe directly to `state.acquisitionCursor`.

### Pitfall 4: Event Count Masquerades as Significance

**What goes wrong:** Mechanical location/routine updates dominate the recap, or popular residents dominate because of clicks/shares.  
**Why it happens:** Ranking is performed over raw events or observer telemetry.  
**How to avoid:** Candidate unit is a published revision enriched only with its genuine effects/outcome; rank with versioned canonical-only rules.  
**Warning signs:** Ranking inputs include analytics, browser absence duration, view counts, or resident frequency.

### Pitfall 5: Relationship Copy Loses Its Cause

**What goes wrong:** A profile says “growing trust” without a canonical scene link, or reports a relationship change for a zero/unrecorded delta.  
**Why it happens:** Raw projection totals are mapped without reading cause events.  
**How to avoid:** Attach latest nonzero cause event and omit optional history when a complete cause cannot be read.  
**Warning signs:** Public DTOs include `friendship`, `rivalry`, `familiarity`, or `delta`.

### Pitfall 6: Profile Prose Outruns the Claim Ledger

**What goes wrong:** Lineage, limitation, or retirement copy is plausible but unsourced, or mixes reported reputation with documented fact.  
**Why it happens:** The current three-claim sets were designed around behavior traits, not full profiles. [VERIFIED: `historical-claims.ts`]  
**How to avoid:** Add reviewed claims/sources first, then map versioned profile sections to them and validate categories/model scope.  
**Warning signs:** Long historical paragraphs appear directly in route components.

### Pitfall 7: Mobile Looks Different but Reads in Desktop Order

**What goes wrong:** CSS visually places the transcript first while keyboard/screen-reader users still encounter the canvas and camera controls first.  
**Why it happens:** Grid/flex `order` changes only presentation order.  
**How to avoid:** Make source order semantic-first and use desktop grid areas for the visual composition.  
**Warning signs:** Mobile tests pass screenshots but fail tab/heading order.

### Pitfall 8: Reduced Motion Only Changes CSS

**What goes wrong:** Phaser sprite loops/camera pans continue while CSS transitions are disabled.  
**Why it happens:** The media query is not propagated into atlas animation and camera decisions.  
**How to avoid:** Preserve the renderer `reducedMotion` flag; select static frames and duration `0` for automatic framing.  
**Warning signs:** Canvas datasets still report FPS/motion under Playwright `reducedMotion: "reduce"`.

### Pitfall 9: Share Works on One Browser Only

**What goes wrong:** A missing Web Share method, rejected permission, cancellation, or Clipboard failure becomes a dead-end/error toast.  
**Why it happens:** Optional browser capabilities are treated as guaranteed.  
**How to avoid:** Native share → copy → visible selectable canonical URL; silence `AbortError` only.  
**Warning signs:** The copy action is conditionally absent or the URL is constructed only after clicking share.

### Pitfall 10: Social Card and Page Disagree

**What goes wrong:** The image names the wrong models or omits staged-fiction/non-affiliation context while the page is correct.  
**Why it happens:** Metadata/image code duplicates canonical assembly.  
**How to avoid:** Reuse the scene reader and disclosure helpers; render a generic disclosed fallback on incomplete data/image failure.  
**Warning signs:** Model IDs or disclosure sentences are hard-coded separately in three files.

### Pitfall 11: Production Art Breaks the Proven Renderer

**What goes wrong:** Residents shift rooms, camera follow misses sprites, or compact screenshots no longer align.  
**Why it happens:** Asset coordinates replace the stable functional layout instead of adapting to it.  
**How to avoid:** Validate Tiled object IDs/anchors against `world-layout.ts`, then migrate one compatibility seam at a time.  
**Warning signs:** Room/resident IDs are inferred from display labels or array order.

### Pitfall 12: “Original” Has No Durable Evidence

**What goes wrong:** The team cannot explain an asset's author, references, source file, or export path during Phase 4 review.  
**Why it happens:** Only flattened PNGs are committed.  
**How to avoid:** Commit editable sources, origin manifest, tool versions, export hashes, and human originality review notes.  
**Warning signs:** An asset arrives without source or contains provider/game silhouettes.

## Code Examples

### Canonical Scene Link from Live or Cached Presentation

```typescript
// Source: verified project contract.
export function canonicalSceneHref(
  scene: NonNullable<PublicWorldSnapshot["scene"]>,
) {
  const sceneId =
    scene.deliveryMode === "cached" ? scene.originalRevisionId : scene.id;
  if (!sceneId) return null;
  return `/scenes/${encodeURIComponent(sceneId)}`;
}
```

### Cause-Backed Public Relationship DTO

```typescript
// Source: project synthesis from relationships.ts and CONTEXT D-11.
type PublicRelationshipSummary = {
  residentId: string;
  label: "Familiar collaborators" | "A careful rivalry" | "Growing trust";
  description: string;
  causeSceneId?: string;
};

// Raw numeric fields stay server-side and are deliberately absent.
```

### Route-Local Open Graph Image

```tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ sceneId: string }>;
}) {
  const { sceneId } = await params;
  const result = await readCanonicalScene(sceneId);
  return result.kind === "complete"
    ? renderScenePreview(result.scene)
    : renderGenericDisclosedPreview();
}
```

### Non-Modal Recap Focus Return

```typescript
// Source: UI-SPEC interaction contract.
const openerRef = useRef<HTMLButtonElement>(null);

function closeRecap(mode: "review-later" | "dismiss") {
  if (mode === "dismiss" && recap) acknowledge(recap.throughSequence);
  setOpen(false);
  requestAnimationFrame(() => openerRef.current?.focus());
}
```

## State of the Art

| Old / tempting approach | Current project approach | When established | Impact |
|-------------------------|--------------------------|------------------|--------|
| Client-only live page metadata | Server `generateMetadata` plus route-local generated OG image | Current Next.js App Router docs, updated 2026-02-27 | Permanent scene facts and share cards can be rendered before hydration. [CITED: Next.js metadata docs] |
| Custom share buttons per network | Web Share with copy/selectable URL fallback | Current Web platform | No account/feed integration and graceful limited-browser support. [CITED: MDN Web Share] |
| Resume auto-updating content immediately | Local pause/review plus explicit Jump-to-live | Phase 1 and WCAG guidance | Visitors can read at their pace without pausing canonical time or mistaking stale state for live. [VERIFIED: Phase 1 summary] [CITED: W3C pause/stop/hide] |
| Canvas as the experience | Semantic HTML as truth; canvas/static art as enhancement | Phase 1 | Mobile, keyboard, zoom, and assistive paths remain complete without Phaser. [VERIFIED: Phase 1 summary] |
| Current claim lookup | Exact claim-version binding per publication | Required in Phase 3 | Stable scene explanations survive later correction without silent rewrite. [VERIFIED: identified schema gap] |
| Procedural placeholder shapes | Source-controlled original atlas/map exports with manifest | Required in Phase 3 | Creates a coherent identity while preserving proven functional coordinates. [VERIFIED: UI-SPEC and renderer inspection] |

**Deprecated/outdated for this phase:**

- The current mobile “wider screen” notice plus live 440px Phaser viewport is superseded by the approved compact static establishing view. [VERIFIED: `globals.css`, UI-SPEC]
- Procedural resident/room `Graphics` shapes are provisional compatibility scaffolding, not the Phase 3 production identity. [VERIFIED: `HomeScene.ts`, ROADMAP success criteria]
- Using only stable `approvedClaimIds` for public historical context is insufficient for permanent correction-safe provenance. [VERIFIED: schema gap]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Recommendations are derived from locked phase decisions, inspected repository contracts, live environment/registry probes, or cited official documentation. | — | — |

## Open Questions

1. **Who supplies and approves the production pixel-art sources?**
   - **Disposition: RESOLVED** — execution must pause at an asset-source/originality checkpoint. The user or an explicitly authorized art workflow supplies editable originals and runtime exports; a final human visual/originality review is required before VIEW-07 or RSID-08 can pass.
   - What we know: no PNG/SVG/Tiled/Aseprite production visual assets are present, and Aseprite/Tiled are not installed in the current execution environment. [VERIFIED: filesystem/environment probe]
   - What's unclear: whether an artist, the user, or a separately authorized image-generation workflow will produce the editable originals.
   - Recommendation: planner must add an early asset-source/originality checkpoint and a final human visual review; implementation can proceed against validated manifests and checked-in exports.

2. **What is the production canonical origin?**
   - **Disposition: RESOLVED** — use a server-validated `SITE_URL` contract, permit an explicit localhost fallback only in development/tests, and never derive canonical URLs from request headers.
   - What we know: root metadata currently has no `metadataBase`, and scene URLs/cards require absolute stable URLs. [VERIFIED: `src/app/layout.tsx`]
   - What's unclear: the final production domain/environment variable name.
   - Recommendation: standardize a server-validated `SITE_URL` (or project-equivalent) with localhost test fallback; never infer production origin from request headers.

3. **Which additional historical sources will complete every profile section?**
   - **Disposition: RESOLVED** — profile implementation begins with a discrete reviewed claim-ledger expansion for all six residents; route rendering may reference only approved, correctly scoped claim versions with validated source URLs and access dates.
   - What we know: each resident currently has capability/reputation/exaggeration claims, but the required lineage, limitation, and retirement/supersession coverage is incomplete. [VERIFIED: historical claim inspection]
   - What's unclear: the approved editorial wording and primary sources for all six residents.
   - Recommendation: make profile claim expansion a discrete reviewed content task before route rendering, with exact model scope and access date validation.

4. **How should pre-release published scenes receive exact claim-version mappings?**
   - **Disposition: RESOLVED** — implement a fail-closed dry-run/apply backfill, execute it against the phase database, and block permanent-route release until both unresolved and ambiguous mapping counts are zero.
   - What we know: existing scene turns have stable claim IDs and attempt claim-set version keys, and the repository is not public yet. [VERIFIED: schema/state]
   - What's unclear: whether every historical development row uses the same claim-set version represented by the current fixture.
   - Recommendation: write a one-time fail-closed backfill that reports unresolved/ambiguous mappings and blocks permanent-route release until the count is zero.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Build/tests/Next | ✓ | 24.16.0 | — |
| Corepack pnpm | Pinned dependency install and scripts | ✓ | pnpm 11.15.1 through Corepack | Do not use the unpinned fallback pnpm 11.9.0. |
| Docker CLI/daemon | Existing local PostgreSQL integration harness | CLI ✓ / daemon inaccessible in this sandbox probe | CLI installed; server unavailable | Use the existing configured database environment when available; do not report DB integration as green without it. |
| Aseprite | Editable sprite/atlas export | ✗ | — | Commit artist-produced `.aseprite` sources and validated PNG/JSON exports; runtime/build consumes exports only. |
| Tiled | Editable home-map export | ✗ | — | Commit author-produced JSON/tileset exports; validate schema/IDs without requiring the GUI in CI. |
| Browser Web Share | Native sharing | capability-dependent | — | Copy-link control, then labeled selectable URL. [CITED: MDN] |
| Clipboard API | Automatic copy | secure-context/capability-dependent | — | Labeled selectable URL field. [CITED: MDN] |

**Missing dependencies with no fallback:**

- Production original art authorship/approval is a content dependency; runtime integration can be built with manifests/fixtures, but VIEW-07/RSID-08 cannot be declared complete without approved source assets and human review.

**Missing dependencies with fallback:**

- Aseprite and Tiled are absent locally, but checked-in editable sources and deterministic runtime exports decouple authoring from build/deployment.
- Docker daemon access was unavailable during this research probe; the established test database harness remains the intended verification path when accessible.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No accounts or privileged visitor actions exist in Phase 3. [VERIFIED: scope] |
| V3 Session Management | No | Local recap marker is anonymous presentation state, not a session or identity. [VERIFIED: CONTEXT D-02] |
| V4 Access Control | Limited | Public readers are read-only allowlists; private attempts/prompts/errors never enter DTOs. [VERIFIED: Phase 2 boundary] |
| V5 Input Validation | Yes | Zod-parse dynamic IDs, recap sequence parameters, local storage, DB JSON, and public DTOs; use parameterized Drizzle queries. [VERIFIED: established project pattern] |
| V6 Cryptography | No new control | HTTPS is required by deployment/browser capabilities; do not add custom cryptography. [CITED: MDN Web Share/Clipboard] |

### Known Threat Patterns for Next.js / Public Metadata

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dynamic route or recap parameter injection | Tampering | Bound length/character set and integer ranges with Zod; query via Drizzle parameters; return not-found/unavailable without echoing unsafe HTML. |
| Stored script text in transcript/profile/source fields | Elevation / Information disclosure | Render React text nodes only; retain the existing ban on `dangerouslySetInnerHTML`; parse strict DTOs. [VERIFIED: current component pattern] |
| Local-storage marker tampering | Tampering | Treat storage as untrusted, parse version/world/positive sequence, reject future or mismatched positions, and never grant authority from it. |
| Canonical URL host poisoning | Spoofing | Construct absolute URLs from validated deployment configuration, not inbound `Host`/forwarded headers. |
| OG-image SSRF | Information disclosure / Denial of service | Load only checked-in original assets and canonical text; never fetch arbitrary claim/source URLs during image generation. |
| Private generation leakage | Information disclosure | Scene read models explicitly allowlist accepted transcript, exact public model IDs, approved claims/sources, outcomes, and disclosures; exclude prompts, rejected candidates, raw provider bodies/errors, hidden reasoning, and calibration. [VERIFIED: Phase 2 privacy boundary] |
| External source-link tabnabbing | Spoofing | Prefer same-tab navigation; if using `_blank`, add `rel="noopener noreferrer"` and preserve visible source title/domain. |
| Share capability abuse | Spoofing | Invoke only from explicit user activation with a server-provided canonical URL; do not accept arbitrary share targets/content from query parameters. [CITED: MDN Web Share] |
| Metadata/content divergence | Spoofing | Use one canonical reader and shared disclosure helpers for page, metadata, image, and share payload. |

## Sources

### Primary (HIGH confidence)

- `AGENTS.md` — product constraints, locked stack, workflow, paid-call rule, and forbidden approaches.
- `.planning/phases/03-return-loop-and-inclusive-presentation/03-CONTEXT.md` — locked Phase 3 product decisions.
- `.planning/phases/03-return-loop-and-inclusive-presentation/03-UI-SPEC.md` — approved routes, layouts, components, copy, motion, icon, and accessibility contracts.
- `src/db/schema.ts`, `src/features/world/server/publish-scene-revision.ts`, `src/features/world/generation/contracts.ts` — immutable publication and provenance seams.
- `src/features/world/domain/types.ts`, `events.ts`, `relationships.ts`, `memories.ts` — canonical sequence, cause-backed relationship, and bounded callback records.
- `src/features/world/contracts/public-world.ts`, `to-public-snapshot.ts`, `read-cached-scene.ts` — live DTO boundary and canonical cached-scene identity.
- `src/features/world/fixtures/launch-residents.ts`, `character-bibles.ts`, `historical-claims.ts` — stable routes/identities, behavior mappings, and current claim coverage.
- `src/features/world/client/WorldObserver.tsx`, `src/app/globals.css`, renderer files — responsive/source-order and art integration seams.
- Phase 1 plans 03–04 and Phase 2 plans 03–04 summaries — verified semantic/canvas split, cursor model, reduced motion, persistent ensemble, privacy, and release evidence.
- Live environment and npm registry probes on 2026-07-25 — tool availability and `lucide-react` audit signals.

### Secondary (MEDIUM confidence)

- [Next.js dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — async params and runtime validation.
- [Next.js metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — server metadata and generated images.
- [Next.js Open Graph image convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) — dynamic params, `ImageResponse`, alt/size/type.
- [Next.js `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — dynamic server metadata.
- [Next.js `notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) — route-segment not-found behavior and noindex.
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) and [`navigator.share`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — limited availability, secure context, permission, user activation, rejection.
- [Clipboard `writeText`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — secure-context copy and rejection.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — semantic, keyboard, reflow, non-color, focus, and auto-update controls.
- [Lucide for React](https://lucide.dev/guide/react) — official package identity, named standalone components, tree shaking, ISC license.
- [Aseprite sprite sheets](https://www.aseprite.org/docs/sprite-sheet/) and [CLI](https://www.aseprite.org/docs/cli/) — editable source and deterministic PNG/JSON export.
- [Tiled JSON format](https://doc.mapeditor.org/en/stable/reference/json-map-format/) — map, object-layer, and custom-property export.
- [Phaser 4 Tilemap](https://docs.phaser.io/api-documentation/4.0.0/class/tilemaps-tilemap) — Tiled JSON parsing and one embedded tileset-image-per-layer limitation.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH for installed/locked project dependencies; MEDIUM for the warning-gated new `lucide-react` release.
- Architecture: HIGH — derived from inspected immutable publication, event, claim, live DTO, and renderer contracts.
- Public route/share APIs: MEDIUM — confirmed from current official Next.js, MDN, and W3C documentation.
- Asset workflow: MEDIUM — official tool formats are clear, but final original assets and authorship workflow are not yet present.
- Pitfalls: HIGH — primarily direct consequences of identified code/data seams and locked UI behavior.

**Research date:** 2026-07-25  
**Valid until:** 2026-08-01 for Next/Lucide/browser-capability details; architecture findings remain valid until the publication schema or Phase 3 context changes.
