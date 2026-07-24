---
phase: 03-return-loop-and-inclusive-presentation
plan: "04"
subsystem: deterministic-return-loop
tags: [nextjs, react, postgresql, zod, local-storage, accessibility, playwright]
status: complete
requires:
  - phase: 03-01
    provides: immutable canonical scene reader, allowlisted publication DTOs, and stable scene links
  - phase: 03-03
    provides: stable six-resident profile links and qualitative cause-backed relationship descriptions
provides:
  - deterministic five-beat return recaps ranked by canonical cause significance and publication sequence
  - exact anonymous version-one local markers with observation-gated baseline and reset behavior
  - frozen non-modal recap lifecycle where only explicit dismissal acknowledges the presented boundary
  - accessible observer navigation and complete return-state browser coverage
affects: [phase-3-mobile, phase-3-sharing, phase-4-corrections]
tech-stack:
  added: []
  patterns:
    - canonical recap selection from immutable complete scenes at a frozen publication boundary
    - strict local marker parsing with no account, server visitor record, or engagement input
    - non-modal semantic recap with explicit acknowledgement and ordinary canonical links
key-files:
  created:
    - src/features/publication/server/read-return-recap.ts
    - src/app/api/recap/route.ts
    - src/features/return-loop/client/last-visit-marker.ts
    - src/features/return-loop/client/ReturnRecapController.tsx
    - src/features/return-loop/components/ReturnRecap.tsx
    - src/features/return-loop/components/RecapBeat.tsx
    - src/features/world/components/ObserverNavigation.tsx
    - tests/unit/return-recap.test.ts
    - tests/unit/last-visit-marker.test.ts
    - tests/integration/phase-03-recap-reader.test.ts
    - tests/e2e/phase-03-return-loop.spec.ts
  modified:
    - src/features/publication/contracts/public-publication.ts
    - src/features/world/client/WorldObserver.tsx
    - src/app/globals.css
key-decisions:
  - "Return recap identity and ordering use scene_published sequence plus immutable revisionId; wall-clock time, popularity, and visitor behavior never participate."
  - "A valid local marker is exactly version, worldId, and throughSequence; absent, corrupt, future, or other-world markers become a baseline only after a valid current home is observed."
  - "Only Dismiss recap writes the frozen response boundary; Review later, Open scene, Jump to live, focus recovery, polling, and tab events do not mutate an open recap."
  - "Canonical relationship changes outrank accepted shared experiences, which outrank ordinary complete publications; incomplete rows are omitted and reported as partial."
patterns-established:
  - "Frozen-boundary presentation: live acquisition may advance while recap beats, current situation, and acknowledgement sequence remain unchanged."
  - "Whole-scene public recap: significance is inferred only from the complete canonical scene reader, never directly from private generation or relationship tables."
requirements-completed:
  - RTRN-02
  - RTRN-03
  - RTRN-04
  - RTRN-05
  - RTRN-06
coverage:
  - id: D1
    description: "Anonymous markers accept only the exact version-one shape and establish/reset baselines only from a valid observed home."
    requirement: RTRN-02
    verification:
      - kind: unit
        ref: "tests/unit/last-visit-marker.test.ts#anonymous last-visit marker"
        status: pass
      - kind: e2e
        ref: "tests/e2e/phase-03-return-loop.spec.ts#first, corrupt, future, and other-world visits"
        status: pass
    human_judgment: false
  - id: D2
    description: "Significance ranking is exact, deterministic under input permutation, independent of engagement fields, and capped at five."
    requirement: RTRN-03
    verification:
      - kind: unit
        ref: "tests/unit/return-recap.test.ts#ranking, overflow, tie, privacy, and permutation cases"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every beat uses one complete immutable scene with real canonical scene/profile links and only genuine cause-backed relationship wording."
    requirement: RTRN-04
    verification:
      - kind: integration
        ref: "tests/integration/phase-03-recap-reader.test.ts#canonical boundary and incomplete-row cases"
        status: pass
      - kind: e2e
        ref: "tests/e2e/phase-03-return-loop.spec.ts#frozen tracer and Open-scene flow"
        status: pass
    human_judgment: false
  - id: D4
    description: "Only explicit dismissal acknowledges the frozen throughSequence across polling, focus, repeated presentation actions, and concurrent-tab events."
    requirement: RTRN-05
    verification:
      - kind: e2e
        ref: "tests/e2e/phase-03-return-loop.spec.ts#frozen tracer, focus/tab race, and Open-scene cases"
        status: pass
    human_judgment: false
  - id: D5
    description: "Callbacks are limited to accepted canonical shared experiences and ranking excludes streak, reward, absence, analytics, share, view, and popularity inputs."
    requirement: RTRN-06
    verification:
      - kind: unit
        ref: "tests/unit/return-recap.test.ts#canonical shared-experience and forbidden engagement-field cases"
        status: pass
    human_judgment: false
duration: 24min
completed: 2026-07-25
---

# Phase 03 Plan 04: Deterministic Return Recap Summary

**Returning visitors now receive a frozen, sequence-ranked recap of at most five complete canonical developments, acknowledged only by explicit dismissal through an anonymous local marker.**

## Performance

- **Duration:** 24 min
- **Completed:** 2026-07-25
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Added a bounded canonical recap reader and validated GET API that reject malformed, future, or other-world cursors and expose only strict public fields.
- Ranked genuine nonzero cause-backed relationship changes above accepted shared experiences above ordinary complete publications, with newest publication sequence and revision ID as stable ties.
- Added exact anonymous marker parsing, observation-gated baseline/reset behavior, silent empty-window advancement, storage-denial recovery, and no user account or server visitor state.
- Integrated a frozen non-modal recap with real scene/profile links, Current situation, truthful observer navigation, retry/partial states, internal overflow, keyboard access, and mobile inline presentation.
- Proved polling, focus recovery, tab races, Review later, Open scene, and Jump to live cannot acknowledge or mutate an open recap; Dismiss recap writes exactly the frozen response boundary.

## Verification

- `node node_modules/vitest/vitest.mjs run tests/unit/return-recap.test.ts tests/unit/last-visit-marker.test.ts tests/integration/phase-03-recap-reader.test.ts` — 3 files, 12 tests passed.
- `corepack pnpm playwright test tests/e2e/phase-03-return-loop.spec.ts --project=chromium` — 6 tests passed.
- `node node_modules/typescript/bin/tsc --noEmit` — passed.
- Targeted Biome lint across the recap implementation and verification files — passed with no warnings.

## Task Commits

1. **Task 1: Return one frozen canonical recap beat end to end** — `0f56096` (`feat`)
2. **Task 2: Expand the recap to the complete return-state matrix** — `a36c17e` (`test`)

## Files Created/Modified

- `src/features/publication/contracts/public-publication.ts` — Strict allowlisted recap beat and response DTOs.
- `src/features/publication/server/read-return-recap.ts` — Bounded deterministic canonical selection, ranking, completeness, and current-situation assembly.
- `src/app/api/recap/route.ts` — Validated positive-sequence/world request boundary with no-store responses.
- `src/features/return-loop/client/last-visit-marker.ts` — Exact anonymous marker parser, reader, writer, baseline, and disposition rules.
- `src/features/return-loop/client/ReturnRecapController.tsx` — Frozen fetch, error/retry, zero-beat, tab, dismissal, and acknowledgement lifecycle.
- `src/features/return-loop/components/ReturnRecap.tsx` — Non-modal semantic state matrix and Current situation footer.
- `src/features/return-loop/components/RecapBeat.tsx` — Ordered canonical development with stable scene and resident links.
- `src/features/world/components/ObserverNavigation.tsx` — Core SSR-compatible links plus truthful optional recap action.
- `src/features/world/client/WorldObserver.tsx` — Return-loop integration with the live snapshot and existing Jump-to-live behavior.
- `src/app/globals.css` — Responsive navigation, inline/mobile recap, independent scrolling, wrapping, and focus-compatible layout.
- `tests/unit/return-recap.test.ts` — Ranking, tie, permutation, cap, duplicate, empty, incomplete, and forbidden-input coverage.
- `tests/unit/last-visit-marker.test.ts` — Exact parsing, valid observation, reset, idempotent storage, corrupt, and denial coverage.
- `tests/integration/phase-03-recap-reader.test.ts` — Canonical reader, local projection, future cursor, API validation, partial, and privacy boundaries.
- `tests/e2e/phase-03-return-loop.spec.ts` — Tracer plus first/return/empty/error/retry/partial/overflow/storage/focus/tab/navigation state matrix.

## Decisions Made

- Use the canonical scene reader as the sole significance authority so relationship wording necessarily has a matching immutable nonzero cause event.
- Bound candidate inspection to the newest one hundred canonical publication events and disclose partial results when the bounded window or incomplete records omit candidates.
- Keep the recap response frozen at its server-read throughSequence; live snapshot acquisition is deliberately independent.
- Preserve ordinary browser links for scene and profile destinations so navigation remains semantic, inspectable, and unable to acknowledge locally.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Selected exact baseline fields from the observed snapshot**
- **Found during:** Task 1 Chromium tracer
- **Issue:** Passing the full valid snapshot into the strict marker schema included extra fields and prevented returning markers from reaching the recap API.
- **Fix:** Construct the marker from only `worldId` and `throughSequence`, with regression coverage for full-snapshot inputs.
- **Files modified:** `src/features/return-loop/client/last-visit-marker.ts`, `tests/unit/last-visit-marker.test.ts`
- **Verification:** The frozen tracer and exact marker suite pass.
- **Commit:** `0f56096`

**2. [Rule 1 - Bug] Kept the frozen recap request alive while polling advanced**
- **Found during:** Task 1 Chromium tracer
- **Issue:** The initial effect cleanup aborted the recap request when a new live snapshot arrived, suppressing the return sheet.
- **Fix:** Initialize once per world without tying the in-flight immutable recap read to changing live snapshot objects.
- **Files modified:** `src/features/return-loop/client/ReturnRecapController.tsx`
- **Verification:** The tracer advances acquisition to sequence 85 while the open recap remains frozen at sequence 84.
- **Commit:** `0f56096`

**3. [Rule 2 - Missing Critical] Added responsive recap and navigation styles**
- **Found during:** Task 1 implementation
- **Issue:** The plan required a non-modal, internally scrollable, wrapping, mobile-inline accessible surface but omitted the global stylesheet from its file list.
- **Fix:** Added scoped observer-navigation and return-recap rules using the existing design tokens.
- **Files modified:** `src/app/globals.css`
- **Verification:** Chromium proves internal overflow, no horizontal page scroll, narrow wrapping, and focusable links.
- **Commit:** `0f56096`

**4. [Rule 3 - Blocking] Used installed pinned test executables and local Docker access**
- **Found during:** Task 1 verification
- **Issue:** The literal `corepack pnpm vitest` binary was unavailable on this Windows installation, and sandboxed setup could not access the configured local Docker daemon.
- **Fix:** Used the installed Vitest entry point and approved local-only Docker access; no dependency install, network provider, or paid model call occurred.
- **Files modified:** None
- **Verification:** 12/12 unit/integration tests and 6/6 Chromium tests pass against the recreated local test database.
- **Commit:** N/A

**5. [Rule 1 - Bug] Reconciled stale state-handler prose and phase attribution**
- **Found during:** Plan closeout
- **Issue:** The state handlers advanced to plan 5 and 12/15 completion but rewrote the total phase count to three, retained stale 11/15 prose, and labeled new decisions as `Phase ?`.
- **Fix:** Reconciled frontmatter and prose to the authoritative four-phase roadmap, 12/15 completion, Phase 03 attribution, and Plan 04 activity.
- **Files modified:** `.planning/STATE.md`
- **Verification:** State reports Phase 03 Plan 5 of 7, 12/15 milestone plans, four total phases, and four Phase 03 return-loop decisions.
- **Commit:** Plan metadata commit

---

**Total deviations:** 5 auto-fixed (3 bugs, 1 missing critical presentation seam, 1 local verification blocker).
**Impact:** The fixes preserve the planned architecture and strengthen the required frozen, accessible, local-only lifecycle without adding external state.

## Known Stubs

None.

## Security Review

- The API accepts only a UUID world and positive safe integer cursor, rejects future and other-world markers, bounds canonical candidate reads, and returns no-store responses.
- Recap DTOs are strict allowlists; prompts, rejected text, provider bodies/errors, hidden reasoning, calibration, usage, cost, and raw numeric relationship state never cross the public boundary.
- Local storage is an untrusted anonymous hint and contains exactly version, world ID, and sequence. Storage denial cannot block the shared home.
- No account, visitor identifier, server-side visitor profile, analytics, popularity, share/view count, streak, reward, or absence input was introduced.
- The new recap API is the planned T-03-04 trust surface; no unplanned security-relevant surface was added.

## User Setup Required

None — verification used only the existing local test database and browser stack, with no provider or paid external calls.

## Next Phase Readiness

- Mobile scene-first work can reuse the semantic observer navigation and the recap’s inline compact behavior.
- Sharing work can reuse the immutable recap scene destinations without creating another scene identity.
- No open stubs, skipped tests, unrun verification steps, or return-loop blockers remain.

## Self-Check: PASSED

- All implementation, verification, and summary artifacts exist on disk.
- Task commits `0f56096` and `a36c17e` exist in repository history.
- No tracked-file deletion, generated-file residue, known stub, skipped test, or unrun plan verification remains.

---
*Phase: 03-return-loop-and-inclusive-presentation*
*Completed: 2026-07-25*
