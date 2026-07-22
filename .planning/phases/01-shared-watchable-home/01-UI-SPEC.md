---
phase: 1
slug: shared-watchable-home
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-22
reviewed_at: 2026-07-22T18:00:47+10:00
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the Shared Watchable Home. Generated from the approved Phase 1 context and verified before planning.

---

## Experience Intent

The interface is a living television set: the pixel home is the visual anchor, while a semantic scene rail makes the current event effortless to understand and read. The home must feel calm but visibly alive, never like a controllable game or an operations dashboard.

The hierarchy is fixed:

1. Current primary scene and its speakers.
2. Scene premise, transcript, and Live/Paused state.
3. The compact home and named functional areas.
4. Quiet resident routines and supporting status information.

Provider logos, copied game assets, faux-terminal chrome, game currencies, quest markers, and visitor influence controls are prohibited.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Manual Tailwind CSS 4 token layer |
| Preset | Not applicable; shadcn is not initialized |
| Component library | Radix Primitives, adopted incrementally only for complex focus-managed controls; native semantic HTML for buttons and status content |
| Icon library | Project-authored 16px SVG icons with visible-label or tooltip fallback |
| Interface font | Atkinson Hyperlegible Next, self-hosted |
| Display font | Pixelify Sans, self-hosted and restricted to the wordmark, home clock, and display headings |

All reusable DOM components consume named CSS custom properties exposed through Tailwind utilities. The Phaser canvas does not import Tailwind styles; it consumes a typed presentation-token object derived from the same source values.

No shadcn or third-party component registry is used in Phase 1. Radix is an official npm dependency, not a registry block source.

---

## Layout Contract

### Supported viewport

- Primary contract: desktop viewports at or above 1024px CSS width and 640px height.
- At 1280px and wider, reserve 360px for the scene rail.
- From 1024px through 1279px, reserve 320px for the scene rail.
- Below 1024px, preserve a readable status strip and scene transcript, show a concise desktop-view notice, and do not promise full camera-control parity. The complete simplified mobile experience remains Phase 3 scope.

### Desktop composition

| Region | Position | Contract |
|--------|----------|----------|
| Home status strip | Full width, top | Wordmark at left; fictional home clock, current location, and explicit Live/Paused badge at right |
| Pixel world viewport | Remaining width left of scene rail | Establishing view of the complete compact home on entry; integer-scaled pixel rendering; active speakers remain identifiable without hiding surrounding rooms |
| Scene rail | Fixed right column | Persistent scene card, complete transcript, presentation status, and delayed-state action |
| Observer control dock | Bottom-center overlay inside the canvas | Pan/zoom help, follow state, reset view, pause/resume, and jump-live affordance; never resembles a game action bar |
| Connection banner | Top edge of world viewport below status strip | Non-modal status; last valid home remains visible beneath it |

The scene rail uses an internal scroll area only when required. The world viewport never gains page-level horizontal scrolling. Canvas letterboxing uses the dominant surface color.

---

## Pixel-World Contract

- Author provisional art on a 16px source-tile grid and display it only at integer scale factors.
- Disable texture smoothing; pixel edges remain crisp during settled camera states.
- Use original, chunky resident silhouettes with restrained outlines and no real-provider logos.
- The Common Room is the spatial hub; Memory Garden, Library, and Tea Nook are distinct through architecture, floor treatment, furniture silhouette, and text labels rather than color alone.
- Active speakers receive a restrained amber floor marker and speech-bubble tail. The marker cannot pulse continuously.
- Background residents use subdued idle or routine loops and never display competing full-size speech bubbles.
- One primary dialogue scene may be staged at a time.
- Provisional assets must preserve stable sprite bounds, anchor points, room IDs, and camera targets so production art can replace them without changing layout behavior.

---

## Spacing Scale

Declared values are fixed and all multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, bubble-tail offsets, compact inline separation |
| sm | 8px | Control contents, transcript metadata, chip padding |
| md | 16px | Default component padding and control gaps |
| lg | 24px | Scene-card and rail section padding |
| xl | 32px | Major layout gaps and rail section breaks |
| 2xl | 48px | Empty-state breathing room |
| 3xl | 64px | Page-level separation and safe canvas framing |

Exceptions: interactive targets have a 44px minimum hit area for pointer and touch accessibility. The 44px target is a size constraint, not a spacing token.

---

## Typography

Exactly four type sizes and two weights are permitted:

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Label | 14px | 600 | 1.4 | Atkinson Hyperlegible Next |
| Body | 16px | 400 | 1.5 | Atkinson Hyperlegible Next |
| Heading | 20px | 600 | 1.25 | Atkinson Hyperlegible Next |
| Display | 28px | 600 | 1.2 | Pixelify Sans |

- Dialogue, buttons, status banners, labels, and recovery copy always use Atkinson Hyperlegible Next.
- Pixelify Sans never appears below 20px, in transcript turns, in long copy, or in icon tooltips.
- Transcript speaker names use the Label role; turns use Body; the premise uses Heading.
- Long dialogue wraps naturally. Do not truncate transcript turns or rely on hover to reveal their content.

---

## Color

The semantic shell uses a fixed 60/30/10 allocation:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#171B26` | Page background, canvas letterboxing, deepest shell surfaces |
| Secondary (30%) | `#272F40` | Scene rail, status strip, control dock, cards, banners |
| Accent (10%) | `#E4B65A` | Active speaker marker, current Live/Paused badge outline, keyboard focus ring, and Jump to live action only |
| Primary text | `#F4ECD8` | Dialogue, headings, button labels |
| Muted text | `#B9B5AA` | Metadata, timestamps, quiet-state supporting copy |
| Structural border | `#465066` | Rail divisions, card outlines, inactive controls |
| Destructive/error | `#D96767` | Error icon and error-banner edge only; Phase 1 has no destructive action |

Accent is reserved for the active speaker marker, Live/Paused badge outline, keyboard focus ring, and Jump to live action. Ordinary buttons, room labels, ambient sprites, and decorative borders must not use the accent color.

Live, paused, following, reconnecting, and error states always include text and/or an icon; color is never the only state signal.

---

## Component Inventory

| Component | Responsibility | Required states |
|-----------|----------------|-----------------|
| `HomeStatusStrip` | Wordmark, fictional time/day period, current location, Live/Paused status | live, locally paused, reconnecting |
| `PixelWorldViewport` | Render rooms, residents, bubbles, camera framing, and quiet routines from public state | initial loading, populated, quiet, stale snapshot, unavailable |
| `SceneRail` | Hold scene context and transcript without covering the world | active scene, quiet, locally paused, delayed, unavailable |
| `SceneCard` | Identify premise, location, speakers, and progress | four through eight turns; absent scene |
| `DialogueTranscript` | Provide complete semantic scene text and speaker identity | live advancing, paused reading, overflow scrolling, long text |
| `SpeechBubbleLayer` | Anchor only the current brief turn to a world speaker | active turn, no active turn, off-screen speaker fallback |
| `ObserverControlDock` | Local camera and presentation controls | default, following, paused, behind live, disabled during initial load |
| `ConnectionBanner` | Explain reconnecting, stale snapshot, or hard load failure | reconnecting with snapshot, initial load, retryable hard error |
| `ResidentFocusChip` | Show selected/followed resident identity and allow unfollow | selected, following, unfollowed |

Every icon-only control requires an accessible name and a visible tooltip on hover and keyboard focus. Keyboard focus order follows status strip, world summary/fallback, scene rail, then observer controls.

---

## Interaction Contract

- Dragging the world pans the camera. Wheel input and explicit `Zoom in` / `Zoom out` buttons change zoom. Arrow keys or WASD pan when the world viewport has focus.
- Selecting a resident begins follow mode. Deliberate manual panning ends follow mode and announces `Stopped following {resident}` through a polite live region.
- `Reset view` restores the establishing frame without changing canonical world state.
- `Pause presentation` freezes only local scene advancement and automatic camera presentation. Canonical home time continues.
- `Resume presentation` continues from the locally paused point.
- `Jump to live` discards local presentation delay, loads the latest canonical snapshot, and briefly displays `Caught up to live`.
- An automatic scene camera move may run only when the visitor is live, not manually panning, and not following another resident. It gently frames speakers without locking the camera.
- All controls operate on local presentation state. No control writes canonical time, resident positions, schedules, or outcomes.

---

## Motion Contract

| Motion | Default | Reduced-motion behavior |
|--------|---------|-------------------------|
| Interface state transition | 200ms ease-out | Instant state change |
| Automatic scene framing | 240ms ease-out | Instant camera reposition with focus announcement |
| Manual camera pan/zoom | Direct manipulation; no trailing inertia | Same |
| Resident quiet routines | Subdued 6–8 FPS loops | Hold a representative idle frame except when movement is necessary to communicate location change |
| Active speaker marker | Static highlight with one 150ms entrance | Static highlight with no entrance animation |
| Status banner | 200ms opacity transition | Appears and disappears instantly |

No continuous pulsing, parallax, screen shake, autoplay audio, or decorative camera drift is permitted.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary delayed-state CTA | `Jump to live` |
| Quiet-state heading | `The home is quiet` |
| Quiet-state body | `No scene is playing. Residents are carrying on with their day. Stay and watch for the next scene.` |
| Initial loading | `Opening the home…` |
| Reconnecting with cached state | `The live feed is having trouble. You’re viewing the last known state while we reconnect.` |
| Retryable hard error | `The home couldn’t load. Try loading again.` |
| Retry action | `Try loading again` |
| Scene unavailable | `This scene is unavailable. The home is continuing with quiet routines.` |
| Catch-up confirmation | `Caught up to live` |
| Pause action | `Pause presentation` |
| Resume action | `Resume presentation` |
| Reset action | `Reset view` |
| Follow action | `Follow {resident}` |
| Unfollow action | `Stop following {resident}` |
| Destructive confirmation | None — Phase 1 contains no destructive visitor action |

Use calm, plain language. Do not expose provider names, polling, cursors, snapshots, jobs, or infrastructure terminology to visitors.

---

## UI Considerations

> Resolved by the post-verification UI-consideration probe. Empty-state and error-state wording remains canonical in the Copywriting Contract; these rows define state behavior and reference that copy rather than duplicating it.

Applicable state considerations resolved: 36 covered, 0 backstop, 0 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| loading | `HomeStatusStrip` | ✅ covered | Before canonical status arrives, time and location render em-dash placeholders while the explicit loading message remains in the connection surface. |
| error | `HomeStatusStrip` | ✅ covered | On connection failure with a valid snapshot, the strip retains the last valid time/location and exposes reconnecting text; without a snapshot it presents no invented values. |
| overflow | `HomeStatusStrip` | ✅ covered | The strip keeps the wordmark and state badge visible; the location slot absorbs remaining width and ellipsizes before either fixed item is displaced. |
| long-text | `HomeStatusStrip` | ✅ covered | A long location is visually ellipsized with its full value preserved as the accessible name and focus/hover tooltip. |
| empty | `PixelWorldViewport` | ✅ covered | When no world snapshot exists, the canvas area renders a semantic fallback surface rather than an empty or misleading home. |
| loading | `PixelWorldViewport` | ✅ covered | Initial load shows a static home silhouette plus the Copywriting Contract's loading message; it never blocks behind an indefinite spinner. |
| error | `PixelWorldViewport` | ✅ covered | A failed refresh keeps the last valid world visible; a hard failure with no valid world shows the documented retryable error and action. |
| populated | `PixelWorldViewport` | ✅ covered | A normal snapshot renders the full compact home, named areas, residents, one primary scene, and subordinate quiet routines. |
| empty | `SceneRail` | ✅ covered | With no active scene, the rail renders the documented quiet-state heading and body rather than a blank transcript. |
| loading | `SceneRail` | ✅ covered | During initial load the rail shows the documented loading message and reserves stable scene-card/transcript space without fake dialogue. |
| error | `SceneRail` | ✅ covered | A failed or unavailable scene renders the documented scene-unavailable copy while the home continues quiet routines. |
| populated | `SceneRail` | ✅ covered | An active scene shows its persistent premise card, speakers, progress, and complete four-to-eight-turn transcript. |
| partial | `SceneRail` | ✅ covered | Partially delivered or invalid scenes are never published turn by turn; the rail remains on the prior complete presentation or moves to the unavailable state. |
| overflow | `SceneRail` | ✅ covered | Content beyond the rail height scrolls inside the transcript region while the premise card and presentation controls remain visible. |
| zero-one-many | `SceneRail` | ✅ covered | Zero scenes use the quiet state, one active scene uses the singular scene card, and the interface never presents multiple simultaneous primary scenes. |
| long-text | `SceneRail` | ✅ covered | Premises, speaker names, and transcript text wrap within the rail; complete dialogue is never clipped or hidden behind hover. |
| empty | `DialogueTranscript` | ✅ covered | Zero turns defer to the SceneRail quiet state and do not leave an empty bordered list. |
| loading | `DialogueTranscript` | ✅ covered | Loading presents no fabricated turn rows; the surrounding SceneRail carries the loading state. |
| error | `DialogueTranscript` | ✅ covered | Delivery failure presents no partial turn list; the surrounding SceneRail carries the unavailable state and approved solution path. |
| populated | `DialogueTranscript` | ✅ covered | The normal transcript contains four to eight ordered turns with persistent speaker identity and readable body text. |
| partial | `DialogueTranscript` | ✅ covered | An incomplete canonical scene is withheld as a whole, so visitors never read an apparently complete fragment. |
| overflow | `DialogueTranscript` | ✅ covered | Additional vertical content scrolls within the transcript; the current speaker and active turn remain programmatically identifiable. |
| zero-one-many | `DialogueTranscript` | ✅ covered | Zero turns show no list, one turn retains full speaker/turn structure, and four to eight turns use consistent row spacing without density changes. |
| long-text | `DialogueTranscript` | ✅ covered | Turn text wraps at natural word boundaries and remains complete at browser zoom up to 200%. |
| loading | `ObserverControlDock` | ✅ covered | During initial load, controls that require world state are disabled and expose a reason through their accessible description. |
| error | `ObserverControlDock` | ✅ covered | With a cached world, local pan/zoom/reset remain usable while unavailable scene-presentation actions are disabled; without a world, the dock is disabled and retry remains outside it. |
| overflow | `ObserverControlDock` | ✅ covered | At supported desktop widths the dock stays on one row; it may switch labels to authored icons only when accessible names and focus/hover tooltips remain available. |
| long-text | `ObserverControlDock` | ✅ covered | A long followed-resident name is ellipsized in the focus chip with the full name preserved as its accessible label and tooltip. |
| overflow | `ConnectionBanner` | ✅ covered | Banner copy and retry action wrap to additional lines and increase banner height instead of clipping or covering the action. |
| long-text | `ConnectionBanner` | ✅ covered | Recovery copy wraps without ellipsis; the retry action remains separately focusable and fully visible. |
| empty | `SpeechBubbleLayer` | ✅ covered | When no primary turn is active, no speech bubble is rendered; the semantic rail communicates the quiet state. |
| loading | `SpeechBubbleLayer` | ✅ covered | No loading bubble or placeholder dialogue appears; loading is communicated by the status and connection surfaces. |
| error | `SpeechBubbleLayer` | ✅ covered | No error is fictionalized as resident speech; failure is communicated by the semantic scene and connection surfaces. |
| populated | `SpeechBubbleLayer` | ✅ covered | Only the current brief turn receives a bubble anchored to its speaker; the complete turn remains in the transcript. |
| overflow | `SpeechBubbleLayer` | ✅ covered | A bubble occupies at most two short lines within its safe canvas bounds; longer content is ellipsized only in the supplementary bubble. |
| long-text | `SpeechBubbleLayer` | ✅ covered | Long turn text remains complete in the transcript while the bubble uses a two-line ellipsis and never forces the camera to hide other scene context. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable — no shadcn or third-party registry blocks are permitted in Phase 1 |

---

## Accessibility and Presentation Safeguards

- The complete scene transcript and every observer control exist in semantic DOM; canvas pixels are never the sole source of dialogue or state.
- Visible focus uses a 2px `#E4B65A` ring with 2px offset.
- Status changes use a polite live region; hard load failure uses an assertive alert only once.
- Room identity, speaker identity, Live/Paused state, and connection state use text or shape in addition to color.
- Speech bubbles are supplementary. If a speaker is off-screen, the transcript remains complete and the bubble layer may show a directional speaker chip rather than moving the camera forcibly.
- Browser zoom up to 200% must preserve access to the transcript and controls without horizontal page scrolling at the supported desktop width.
- `prefers-reduced-motion: reduce` applies the reduced-motion column from the Motion Contract.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — specific actions, quiet/loading/error copy, and recovery paths are defined.
- [x] Dimension 2 Visuals: PASS — focal hierarchy, pixel-world framing, speaker emphasis, and icon fallbacks are explicit.
- [x] Dimension 3 Color: PASS — the 60/30/10 allocation and four-item accent reservation prevent accent overuse.
- [x] Dimension 4 Typography: PASS — exactly four sizes, two weights, and role-specific line heights are declared.
- [x] Dimension 5 Spacing: PASS — the standard 4/8/16/24/32/48/64 scale is fixed; the justified 44px value is a hit-target size, not a spacing token.
- [x] Dimension 6 Registry Safety: PASS — a manual design system is declared and no component registry blocks are permitted.

**Approval:** approved 2026-07-22
