# Phase 1: Shared Watchable Home - Context

**Gathered:** 2026-07-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers a compact, desktop-first observer experience in which every browser watches the same server-owned home timeline. It proves deterministic world advancement and recovery, a readable authored primary scene, calm ambient resident routines, and local presentation controls using provisional residents, dialogue, and visual assets. Historically grounded character generation, the final six-resident cast, production pixel art, recaps, sharing, and public operational hardening remain later-phase work.

</domain>

<decisions>
## Implementation Decisions

### Home Composition
- **D-01:** Use a compact hub layout with a central Common Room and surrounding functional zones.
- **D-02:** The visible Phase 1 zones are the Common Room, Memory Garden, Library, and Tea Nook. They should feel like believable retirement-home spaces first, with technical humor supplied by resident behavior and scene content.
- **D-03:** Entry begins with an establishing view of the whole home. If a primary scene is active, it is clearly highlighted without hiding the wider setting.
- **D-04:** Between scenes, the home is calm but visibly alive. Several residents may perform subdued quiet routines, but ambient activity must not compete with the primary scene.

### Scene Presentation
- **D-05:** Use a hybrid dialogue presentation: short speech bubbles anchor turns to sprites in the world, while a semantic dialogue panel contains the complete readable scene.
- **D-06:** When a scene begins, the camera gently frames its speakers without overriding deliberate visitor control.
- **D-07:** A typical Phase 1 authored scene contains four to eight brief turns and lasts roughly 30 to 60 seconds at the default presentation pace.
- **D-08:** Keep a compact scene card visible throughout the scene. It identifies the premise, location, participants, and scene progress.
- **D-09:** Present no more than one primary dialogue scene at a time. Background residents and bubbles remain visually subordinate.

### Viewer Controls
- **D-10:** Present observer controls in a small persistent dock rather than a game-style toolbar or hover-only interface.
- **D-11:** Selecting a resident starts camera follow. Deliberate manual panning automatically unfollows, and the interface always makes the follow state visible.
- **D-12:** Pausing is local presentation control only. Canonical home time continues; the visitor may resume from the paused presentation point or discard the local delay by jumping live.
- **D-13:** Desktop camera controls support drag-to-pan, wheel and explicit buttons for zoom, keyboard movement, reset view, and jump to live.
- **D-14:** Observer actions never change schedules, resident positions, scene outcomes, canonical time, or any state seen by other visitors.

### Time and Recovery States
- **D-15:** Show a fictional home clock and day period together with an unambiguous Live or Paused indicator. Do not derive canonical home time from the visitor's timezone.
- **D-16:** After reconnecting or returning from a background tab, load the current canonical snapshot immediately without replaying missed movement. Briefly confirm the transition with “Caught up to live.”
- **D-17:** During initial loading or temporary connection trouble, keep the last valid home visible when available and use a calm, non-blocking status banner. Never leave the experience behind an indefinite spinner.
- **D-18:** When there is no primary scene, scene delivery fails, or a provider is unavailable, residents continue quiet routines and the interface plainly explains the current state. Do not silently replay an old scene or disguise a real failure as fictional canon.

### The Agent's Discretion
- Exact placeholder sprite shapes, provisional palette, easing durations, quiet-routine animation details, control-dock placement, and concise status copy may be chosen during UI design and planning, provided they preserve the decisions above.
- The planner may choose responsive breakpoints and implementation details for the Phase 1 desktop proof. Full simplified-mobile presentation is reserved for Phase 3.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Intent and Constraints
- `.planning/PROJECT.md` — Defines the observer-only ambient-sitcom concept, core value, one shared persistent timeline, desktop-first scope, and later-phase boundaries.

### Phase Scope and Acceptance
- `.planning/ROADMAP.md` — Defines the Phase 1 goal, mapped requirements, and five success criteria.
- `.planning/REQUIREMENTS.md` — Defines Phase 1 requirements WRLD-01, WRLD-02, WRLD-03, WRLD-04, WRLD-08, VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, and VIEW-08.

### Technical Research Baseline
- `.planning/research/SUMMARY.md` — Defines the recommended canonical-world architecture, observer-client boundary, initial stack direction, delivery risks, and Phase 1 exit evidence.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No product source code, components, hooks, maps, sprites, or utilities exist yet. Phase 1 is a greenfield implementation.

### Established Patterns
- There are no application-level code patterns to preserve. Planning documents establish the governing patterns: server-owned canonical state, deterministic replay, a React-owned semantic interface, a client-only pixel-world renderer, and observer controls that remain local.

### Integration Points
- Implementation begins at the repository root alongside the existing `.planning/` artifacts. The first vertical slice must create the application shell, pure world-domain boundary, persistence/projection path, snapshot/update contract, and observer presentation together.
- `.codex/` contains workflow tooling rather than reusable product code and should not be treated as an application integration point.

</code_context>

<specifics>
## Specific Ideas

- Treat the experience as a “living television set”: the pixel home provides place and ambience while a readable semantic layer makes the current scene effortless to follow.
- The home should feel “calm but visibly alive,” not empty and not game-like.
- Favor warm retirement-home names such as Common Room, Memory Garden, Library, and Tea Nook over filling the first map with technical-pun rooms.
- Use short, reassuring state language such as “Caught up to live” rather than exposing infrastructure terminology.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope. Previously established later-phase work remains governed by the roadmap.

</deferred>

---

*Phase: 1-Shared Watchable Home*
*Context gathered: 2026-07-22*
