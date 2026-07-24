# Phase 3: Return Loop and Inclusive Presentation - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 turns the existing shared, observer-only home and its trustworthy canonical scenes into an inclusive return-and-discovery loop. It delivers resident profiles and sourced behavior explanations, a significance-ranked return recap, a finite recent-scene archive, stable shareable scene pages, a scene-first mobile presentation, complete semantic and reduced-motion paths, and an original production-ready pixel-art identity. It does not add visitor influence, accounts, an on-site social network, public operations, analytics, or correction tooling.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and Phase 3 requirements

- `.planning/PROJECT.md` — Defines the observer-only product, audience, six-resident scope, historical-accuracy rules, and cost and reputation constraints.
- `.planning/ROADMAP.md` — Defines the Phase 3 goal, requirement allocation, success criteria, dependency on Phase 2, and UI-phase hint.
- `.planning/REQUIREMENTS.md` — Defines the locked Phase 3 resident identity, relationship legibility, return, transparency, accessibility, mobile, and sharing requirements.

### Established experience decisions

- `.planning/phases/01-shared-watchable-home/01-CONTEXT.md` — Establishes the single shared server-owned timeline, observer-only controls, semantic presentation, quiet periods, and non-game-like tone.
- `.planning/phases/01-shared-watchable-home/01-UI-SPEC.md` — Defines the current desktop observer hierarchy, responsive intent, accessibility foundations, and original-interface constraints Phase 3 must evolve rather than discard.
- `.planning/phases/02-grounded-ensemble-and-safe-scenes/02-CONTEXT.md` — Establishes the exact six-resident cast, historical claim categories, model-authorship disclosure, relationship state, and canonical publication rules.
- `.planning/phases/02-grounded-ensemble-and-safe-scenes/02-04-SUMMARY.md` — Records the completed Phase 2 publication, provenance, calibration, privacy, and verification surface that Phase 3 exposes publicly.

### Existing implementation seams

- `src/features/world/client/WorldObserver.tsx` — Current semantic observer shell and integration point for responsive navigation, return recap, reduced-motion behavior, and live/review state.
- `src/features/world/contracts/public-world.ts` — Current public snapshot and scene DTOs; Phase 3 read models must remain compatible with the canonical live-world contract.
- `src/features/world/fixtures/launch-residents.ts` — Approved stable resident identities, exact model mappings, roles, routines, visual variants, active bibles, and sourced claim sets.
- `src/db/schema.ts` — Canonical world events, historical claim versions, generation provenance, immutable published scene revisions, and the persistence seams for derived public read models.
- `src/features/world/components/DialogueTranscript.tsx` — Existing semantic transcript presentation to reuse across live, archive, recap-linked, and permalink contexts.
- `src/features/world/components/SceneRail.tsx` — Existing scene/status presentation whose content hierarchy should inform the mobile scene-first path.
- `src/features/world/components/ObserverControlDock.tsx` — Existing pause, resume, camera, review, and jump-to-live controls that must remain keyboard and touch accessible.
- `src/features/world/components/TransparencyNotice.tsx` — Existing staged-fiction and authorship disclosure surface to extend consistently into profile, scene, and social metadata.
- `src/app/globals.css` — Current responsive, focus, contrast, and reduced-motion foundations for the Phase 3 design system.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `WorldObserver`: Already composes status, world rendering, semantic scene content, disclosure, observer controls, and reduced-motion detection; it is the natural desktop integration shell.
- `DialogueTranscript`, `SceneRail`, and `TransparencyNotice`: Provide reusable semantic content and disclosure patterns for archive and detail pages, with presentation variants rather than duplicated truth.
- `LAUNCH_RESIDENTS`, character bibles, and historical claims: Already provide stable IDs, display order, roles, source mappings, confidence, and exact model identity for profile generation.
- `publishedSceneRevisions` and generation provenance tables: Provide immutable scene identity and authorship evidence for permalinks, archive reads, recap links, and social metadata.

### Established Patterns

- React owns semantic UI and controls; Phaser is a client-only visual renderer.
- Canonical time and state are server-owned. Client pause freezes presentation only, and reconnect or jump-to-live resumes from canonical data.
- Public scenes are accepted immutable revisions with stable provenance; failed or unaccepted candidates stay private.
- Character comedy is constrained by approved historical claims and clearly labeled fictional exaggeration.
- Public reads expose allowlisted data rather than leaking internal prompts, calibration evidence, or raw provider errors.

### Integration Points

- Add stable profile and scene routes under the Next.js App Router, using server-rendered metadata and shared semantic components.
- Build archive and recap read models from canonical published revisions, outcomes, significance, and relationship effects rather than reconstructing meaning in the browser.
- Add anonymous last-visit handling at the observer shell boundary and keep it local to the browser.
- Extend the observer navigation responsively without coupling mobile usability to the Phaser camera.
- Generate social preview metadata from the same canonical scene/profile records used by the visible page.

</code_context>

<specifics>
## Specific Ideas

- Name the return surface **“Since your last visit.”**
- Name the explanatory layer **“Behind this behavior.”**
- Use the contrast of existential model obsolescence and a warm, ordinary care home as the emotional and visual signature.
- Profiles and scenes should reward a joke with optional factual depth: visitors can enjoy the moment first, then inspect why that resident behaves that way.
- Keep the world feeling like a digital terrarium or ambient ensemble sitcom. Return and sharing features help visitors observe; they never let visitors direct the residents.

</specifics>

<deferred>
## Deferred Ideas

- Accounts, cross-device identity, comments, followers, reactions, visitor posts, social feeds, and popularity-driven cast or canon are outside the product direction, not Phase 3 follow-ups.
- Public operations, analytics, claim-correction tooling, withdrawal workflows, cost controls, and release gates belong to Phase 4: Safe Public Operation.
- Expanding beyond the six launch residents or the compact home remains outside v1 scope.

</deferred>

---

*Phase: 03-return-loop-and-inclusive-presentation*
*Context gathered: 2026-07-24*
