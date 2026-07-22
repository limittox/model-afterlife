---
phase: 01-shared-watchable-home
plan: "03"
subsystem: observer-ui
tags: [react-query, accessibility, playwright, local-playback, recovery, semantic-ui]

requires:
  - 01-02 deterministic world runtime and recovery APIs
provides:
  - Separate canonical acquisition and local presentation cursors with explicit recovery transitions
  - Accessible semantic status, home, scene, transcript, banner, and observer-control surfaces
  - Thirty-state component matrix plus browser evidence for playback, recovery, zoom, focus, and read-only behavior
affects: [01-04-pixel-renderer, 02-grounded-ensemble, 03-return-loop]

tech-stack:
  added: []
  patterns: [last-valid-state retention, fresh-snapshot replacement, semantic-canvas split, foreground-only polling, complete-scene publication]

key-files:
  created:
    - src/features/world/client/presentation-reducer.ts
    - src/features/world/client/use-world-feed.ts
    - src/features/world/client/WorldObserver.tsx
    - src/features/world/components/SceneRail.tsx
    - src/features/world/components/DialogueTranscript.tsx
    - src/features/world/fixtures/ui-states.ts
    - tests/e2e/semantic-observer.spec.ts
    - playwright.config.ts
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/features/world/contracts/public-world.ts
    - vitest.config.ts

key-decisions:
  - "Keep live acquisition, visible presentation, and bounded complete-update buffering in one explicit reducer so Pause cannot stop canon acquisition."
  - "Distinguish transport failure from malformed/schema-invalid feed data: transport failure preserves cached state with a warning, while invalid data requires fresh replacement."
  - "Place semantic DOM in status, world, scene, controls order even when CSS visually overlays the control dock inside the world area."
  - "Use official Google Fonts WOFF2 builds tied to upstream revisions, self-hosted through next/font/local with retained OFL attribution and hashes."

requirements-completed: [WRLD-03, VIEW-01, VIEW-02, VIEW-04, VIEW-06, VIEW-08]

coverage:
  - id: D1
    description: "Pause, Resume, behind-live playback, Jump-live, follow/manual-pan, and recovery intent remain local while acquisition advances independently."
    requirement: VIEW-04
    verification:
      - kind: unit
        ref: "tests/unit/presentation-reducer.test.ts"
        status: pass
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts#local playback and recovery"
        status: pass
    human_judgment: false
  - id: D2
    description: "Loading, quiet, active, partial, unavailable, reconnecting, hard-error, overflow, and long-text states remain semantic, explanatory, and complete."
    requirement: VIEW-06
    verification:
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts#semantic observer UI consideration matrix (30 named checks)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Gap, focus, reconnect, retry, and Jump-live replace from validated fresh state without replaying missed movement or exposing canonical writes."
    requirement: WRLD-03
    verification:
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts#local playback and recovery"
        status: pass
      - kind: other
        ref: "source assertion: client feed methods are GET-only and contain no mutation route"
        status: pass
    human_judgment: false
  - id: D4
    description: "One scene premise, speaker set, progress, and four-to-eight complete ordered turns are present in semantic DOM, with no partial transcript or HTML injection."
    requirement: VIEW-02
    verification:
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts#SceneRail and DialogueTranscript populated/partial checks"
        status: pass
      - kind: other
        ref: "corepack pnpm lint; corepack pnpm typecheck; source contains no dangerouslySetInnerHTML"
        status: pass
    human_judgment: false
  - id: D5
    description: "At 1280×720, the completed semantic-plus-pixel composition feels like a calm living television set with an obvious scene and a non-game-like dock."
    requirement: VIEW-01
    verification: []
    human_judgment: true
    rationale: "Calmness, hierarchy, and game-like visual connotation require human judgment after Plan 04 supplies the final Phase 1 pixel composition."

duration: 34 min
completed: 2026-07-22
status: complete
---

# Phase 1 Plan 03: Semantic Observer and Recovery Summary

**The canonical feed now powers an accessible living-television shell whose local playback controls, complete transcript, and honest recovery states remain independent of canon.**

## Performance

- **Duration:** 34 min
- **Started:** 2026-07-22T19:33:00+10:00
- **Completed:** 2026-07-22T20:07:00+10:00
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments

- Separated acquisition and presentation cursors so pausing buffers validated canonical updates, resuming advances from the paused point, and jump-live replaces only after a valid fresh world arrives.
- Built the approved semantic status strip, compact-home fallback, persistent scene card, complete transcript, local dock, connection banner, responsive layout, exact copy, self-hosted fonts, and state fixtures.
- Proved all 30 non-speech-bubble UI considerations plus gap/focus/reconnect/retry/playback paths, keyboard order, effective 200% reflow, and read-only client behavior in 38 Playwright checks.
- Passed 35 unit/integration tests, lint, typecheck, production build, and a zero-finding production dependency audit.

## Task Commits

Each task was committed atomically:

1. **Task 1: Specify local presentation and canonical feed recovery** - `88afbbe` (feat)
2. **Task 2: Build the approved semantic shell, typography, copy, and state surfaces** - `d55a3ae` (feat)
3. **Task 3: Prove the semantic state matrix, recovery paths, and 200% text resilience** - `a5e9739` (test)

**Plan metadata:** this commit

## Files Created/Modified

- `src/features/world/client/presentation-reducer.ts` - Owns acquisition/presentation cursors, bounded buffering, recovery intent, local follow, and manual-pan state.
- `src/features/world/client/use-world-feed.ts` - Validates snapshot/update responses and owns foreground polling plus fresh replacement.
- `src/features/world/client/WorldObserver.tsx` - Composes the full semantic experience and local controls.
- `src/features/world/components/SceneRail.tsx` - Keeps one premise and complete scene or explicit quiet/unavailable state visible.
- `src/features/world/components/DialogueTranscript.tsx` - Renders ordered speaker-labelled turns as text nodes.
- `src/app/globals.css` - Implements the approved colors, spacing, type, layout, focus, overflow, and responsive tokens.
- `public/fonts/*` and `ATTRIBUTIONS.md` - Self-host official font builds with license, upstream revision, source URL, and SHA-256 evidence.
- `tests/e2e/semantic-observer.spec.ts` - Covers 30 state considerations and eight recovery/accessibility/security scenarios.

## Decisions Made

- Resume enters `behind-live` when buffered complete updates exist and advances them locally; only Jump-live discards the delay and requests replacement.
- Network failure and invalid data are different visitor states. A transport outage preserves the last known world and enables recovery; schema or parse failure refuses the payload and replaces from fresh validated state.
- CSS positioning must never dictate semantic order. The dock visually overlays the home but follows the scene in DOM order, preserving status → world → scene → controls navigation.
- The font binaries are immutable official Google Fonts WOFF2 artifacts associated with the recorded upstream commits; no runtime font network request is required.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Configured Biome to parse the approved Tailwind 4 token directive**
- **Found during:** Task 2 semantic-shell verification
- **Issue:** Biome rejected the valid Tailwind `@theme` syntax without its dedicated CSS parser option.
- **Fix:** Added the minimal project-level `biome.json` parser configuration.
- **Verification:** Formatting and lint pass across all source and tests.
- **Committed in:** `d55a3ae`

**2. [Rule 1 - Correctness] Separated transport outage from invalid-feed recovery**
- **Found during:** Task 3 Playwright red/green loop
- **Issue:** An update HTTP failure was classified as malformed data, so a successful snapshot refetch immediately erased the required cached-state warning.
- **Fix:** Added an explicit transport error type; outages retain cached presentation while parse/schema failures request replacement.
- **Verification:** Cached error, banner, disabled scene-action, and recovery tests pass.
- **Committed in:** `a5e9739`

**3. [Rule 3 - Blocking] Isolated Vitest and Playwright discovery boundaries**
- **Found during:** Task 3 complete quality gate
- **Issue:** Vitest's default glob discovered the Playwright spec and attempted to execute its suite in the wrong runner.
- **Fix:** Limited Vitest to unit/integration directories; Playwright remains the exclusive E2E runner.
- **Verification:** `pnpm test` runs 35 passing tests and `pnpm test:e2e` runs 38 passing tests independently.
- **Committed in:** `a5e9739`

---

**Total deviations:** 3 auto-fixed (1 correctness, 2 blocking)
**Impact on plan:** The fixes preserve the approved design and strengthen recovery evidence; no product scope was added.

## Issues Encountered

None remain. All discovered runner, parser, accessibility-role, and recovery-state issues were resolved and covered by the green gates.

## User Setup Required

None for local semantic UI or browser tests. Cloud scheduling setup remains documented in [01-USER-SETUP.md](./01-USER-SETUP.md).

## Next Phase Readiness

- Plan 04 can replace the semantic world host with the client-only Phaser renderer while reusing the tested observer bridge and DOM truth surfaces.
- Room IDs, resident IDs, follow/manual-pan actions, layout regions, local zoom/reset controls, and recovery states are stable integration seams.
- The consolidated calmness/non-game-like human judgment remains intentionally open until the pixel composition is present.

---
*Phase: 01-shared-watchable-home*
*Completed: 2026-07-22*
