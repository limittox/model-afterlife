---
phase: 01-shared-watchable-home
plan: "04"
subsystem: pixel-observer
tags: [phaser, pixel-art, camera, playwright, convergence, reduced-motion]

requires:
  - 01-03 semantic observer and recovery state machine
provides:
  - Original client-only 16px-grid retirement home with four structural zones and subdued resident routines
  - Closed renderer-intent bridge with bounded local pan, zoom, follow, reset, pause, and reduced-motion behavior
  - Real PostgreSQL-backed two-viewer convergence plus complete renderer/recovery browser evidence
affects: [02-grounded-ensemble, 03-return-loop, 04-public-operation]

tech-stack:
  added: []
  patterns: [client-only disposable renderer, serializable render projection, local camera state, integer pixel scaling, database-backed multi-context e2e]

key-files:
  created:
    - src/features/world/renderer/PixelWorld.tsx
    - src/features/world/renderer/PhaserWorld.tsx
    - src/features/world/renderer/HomeScene.ts
    - src/features/world/renderer/CameraController.ts
    - src/features/world/renderer/renderer-bridge.ts
    - src/features/world/renderer/SpeechBubbleLayer.ts
    - tests/unit/renderer-bridge.test.ts
    - tests/e2e/shared-home.spec.ts
    - tests/e2e/global-setup.ts
  modified:
    - src/features/world/client/WorldObserver.tsx
    - src/features/world/components/PixelWorldViewport.tsx
    - src/features/world/components/ObserverControlDock.tsx
    - src/app/globals.css
    - playwright.config.ts
    - README.md

key-decisions:
  - "Keep React as semantic and local-presentation authority; Phaser receives serializable view state and emits only residentSelected, manualPanStarted, or cameraSettled."
  - "Author the provisional home as provider-neutral geometric code on a 16px source grid, with CSS owning integer-scaled canvas centering."
  - "Suppress supplementary resident bubbles during connection trouble while retaining the last valid home and complete semantic transcript."
  - "Prepare Playwright with migrations and seed only when no projection exists, so repeated verification never rewinds an existing canonical journal."

requirements-completed: [WRLD-01, WRLD-03, WRLD-04, VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, VIEW-08]

coverage:
  - id: D1
    description: "Two isolated browser contexts match world ID, tick, sequence, hash, resident locations, and scene identity; local delay/camera actions affect neither the other viewer nor PostgreSQL, and both converge after Resume and Jump-live."
    requirement: WRLD-01
    verification:
      - kind: e2e
        ref: "tests/e2e/shared-home.spec.ts#two isolated viewers converge while one delays and moves only its camera"
        status: pass
      - kind: integration
        ref: "corepack pnpm rebuild-world -- --check"
        status: pass
    human_judgment: false
  - id: D2
    description: "The renderer uses four exact named structural zones, stable resident identities, one static amber speaker marker, subdued 7 FPS routines, and one bounded current-turn bubble while the complete transcript remains DOM text."
    requirement: WRLD-04
    verification:
      - kind: unit
        ref: "tests/unit/renderer-bridge.test.ts#renderer bridge and supplementary speech bubbles"
        status: pass
      - kind: e2e
        ref: "tests/e2e/shared-home.spec.ts#SpeechBubbleLayer considerations (6 named checks)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Follow, manual-unfollow announcement, drag/wheel/buttons/keyboard pan, integer zoom 1-4, whole-home reset, pause buffering, and guarded automatic framing remain local and reduced-motion safe."
    requirement: VIEW-03
    verification:
      - kind: unit
        ref: "tests/unit/renderer-bridge.test.ts#local camera controller"
        status: pass
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts#camera dock follows, manually unfollows, clamps integer zoom, and resets locally"
        status: pass
      - kind: e2e
        ref: "tests/e2e/shared-home.spec.ts#reduced motion holds quiet loops and frames a newly active scene instantly"
        status: pass
    human_judgment: false
  - id: D4
    description: "Loading, quiet, active, cached-error, hard-error, unavailable, gap, focus, reconnect, overflow, long-text, 1024/1280, and effective 200 percent states remain explanatory, crisp, and free of fictional infrastructure speech."
    requirement: VIEW-06
    verification:
      - kind: e2e
        ref: "tests/e2e/semantic-observer.spec.ts and tests/e2e/shared-home.spec.ts (49 passing checks)"
        status: pass
      - kind: other
        ref: "corepack pnpm test; corepack pnpm lint; corepack pnpm typecheck; corepack pnpm build; corepack pnpm audit --prod"
        status: pass
    human_judgment: false
  - id: D5
    description: "At 1280x720, the completed four-zone home reads immediately, feels original and provider-neutral, keeps one scene clearly primary, moves gently, and presents observer controls without a gameplay feel."
    requirement: VIEW-01
    verification: []
    human_judgment: true
    rationale: "Immediate readability, artistic originality, calmness, focal hierarchy, and gameplay connotation require consolidated human visual judgment; automated layout and state evidence cannot establish taste."

duration: 35 min
completed: 2026-07-22
status: complete
---

# Phase 1 Plan 04: Original Pixel Home and Shared Watch Loop Summary

**The shared canonical timeline now inhabits an original four-zone pixel home whose disposable renderer, calm scene staging, and local observer camera are proven across two independent browsers.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-07-22T20:08:00+10:00
- **Completed:** 2026-07-22T20:43:00+10:00
- **Tasks:** 3
- **Files modified:** 23

## Accomplishments

- Built an SSR-disabled Phaser island with a typed serializable bridge, explicit listener cleanup, `game.destroy(true)`, stable room/resident anchors, and 1x-4x integer camera zoom.
- Authored an original compact Common Room hub with structurally distinct Memory Garden, Library, and Tea Nook, four provider-neutral resident silhouettes, calm deterministic routines, one static speaker marker, and two-line supplementary dialogue.
- Wired pointer, wheel, keyboard, directional buttons, zoom, follow/unfollow, reset, pause/resume, and Jump-live without exposing a canonical write capability.
- Proved 49 browser scenarios and 49 unit/integration tests, deterministic journal rebuild, production build, lint, typecheck, and a zero-finding production audit.

## Task Commits

Each task was committed atomically:

1. **Task 1: Render the original compact home and one subordinate-bubble scene** - `d7540a9` (feat)
2. **Task 2: Implement typed camera, follow, pause, and reduced-motion behavior** - `9e0a020` (feat)
3. **Task 3: Prove two-viewer convergence and the complete Phase 1 watch loop** - `9253579` (test)

**Plan metadata:** this commit

## Files Created/Modified

- `src/features/world/renderer/PixelWorld.tsx` and `PhaserWorld.tsx` - Own the client-only dynamic boundary, one bridge, one canvas, responsive integer sizing, and disposal.
- `src/features/world/renderer/HomeScene.ts` - Draws the home, structural room cues, residents, marker, bubbles, quiet motion, pointer input, follow, and scene framing.
- `src/features/world/renderer/CameraController.ts` - Implements pure bounded camera math and framing guards.
- `src/features/world/renderer/renderer-bridge.ts` - Projects validated snapshots to stable render identities and carries typed local state/controls.
- `tests/e2e/shared-home.spec.ts` - Proves real two-viewer convergence, all six bubble considerations, lifecycle, layouts, and reduced motion.
- `tests/e2e/global-setup.ts` - Starts local services, migrates, and seeds only a missing projection.
- `README.md` - Documents the complete route-to-database-to-renderer run and optional Neon/Vercel/Trigger deployment.

## Decisions Made

- CSS owns canvas centering and Phaser owns only internal camera transforms. This avoids stacked margins while preserving integer display scale at 1280 and 1024 widths.
- The renderer bridge has no arbitrary command or server callback. Its only outbound intents are resident selection, manual-pan start, and camera settled; all canonical routes remain GET-only.
- Connection failure retains the last valid world but disables the supplementary bubble, preventing a stale scene line from masquerading as current canon during an outage.
- The real E2E setup never blindly reseeds an existing database because resetting only the projection beneath an immutable journal would create a false head.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Split browser-free lifecycle cleanup from the Phaser import**
- **Found during:** Task 1 RED/GREEN lifecycle test
- **Issue:** Importing the game factory in Node evaluated Phaser, which immediately touched `window`.
- **Fix:** Moved disposable-game cleanup to a browser-free module while retaining Phaser behind the SSR-disabled island.
- **Verification:** Node unit tests and the Next production server build both pass.
- **Committed in:** `d7540a9`

**2. [Rule 1 - Accessibility] Preserved a keyboard-visible semantic resident follow path**
- **Found during:** Task 1 browser regression run
- **Issue:** The new canvas intercepted the previously visible semantic resident button.
- **Fix:** Kept semantic room/resident controls in DOM, reveal them on focus, and exercise follow through Enter while sprite pointer selection remains available.
- **Verification:** Keyboard order, long-name focus-chip, and camera-follow browser tests pass.
- **Committed in:** `d7540a9`

**3. [Rule 1 - Correctness] Suppressed stale bubbles during infrastructure trouble**
- **Found during:** Task 3 SpeechBubbleLayer state matrix
- **Issue:** Cached-state retention could leave the prior scene's canvas bubble visible during an update outage.
- **Fix:** Added a presentation-only bubble visibility flag derived from connection state; the home and DOM transcript remain intact.
- **Verification:** `SpeechBubbleLayer/error` proves a cached outage has zero canvas bubbles.
- **Committed in:** `9253579`

**4. [Rule 1 - Visual correctness] Removed stacked Phaser/CSS canvas centering**
- **Found during:** Consolidated 1280x720 image review
- **Issue:** Phaser margins combined with CSS grid centering and pushed the integer-scaled map too low.
- **Fix:** Assigned centering solely to CSS, cleared canvas margins, and moved the bubble below the Common Room label.
- **Verification:** 1280/1024 layout checks and the regenerated UAT image pass.
- **Committed in:** `9253579`

---

**Total deviations:** 4 auto-fixed (2 correctness, 1 accessibility, 1 blocking)
**Impact on plan:** All fixes stay inside the renderer/presentation boundary and strengthen the approved accessibility, outage, and visual contracts without changing scope.

## Issues Encountered

None remain. The SSR import, semantic pointer interception, stale outage bubble, and double-centering defects were corrected and covered by regression evidence.

## User Setup Required

None for local verification. The Playwright global setup starts Docker services, applies migrations, and seeds only when needed. Optional cloud credentials and separation rules are documented in `README.md` and `01-USER-SETUP.md`.

## Next Phase Readiness

- Phase 1 implementation and automated evidence are complete; one consolidated human visual judgment remains for end-of-phase UAT.
- Stable room IDs, resident render IDs, camera targets, bridge types, and semantic transcript boundaries are ready for the historically grounded six-resident ensemble in Phase 2.
- Production art may replace provisional geometry without changing room anchors, semantic structure, or canonical world contracts.

---
*Phase: 01-shared-watchable-home*
*Completed: 2026-07-22*
