---
phase: 03-return-loop-and-inclusive-presentation
plan: 02
subsystem: publication
tags: [postgresql, provenance, backfill, archive, nextjs, playwright]
status: complete
requires:
  - phase: 03-01
    provides: immutable canonical scene reads and permanent scene routes
provides:
  - fail-closed local provenance backfill with dry-run, apply, and check modes
  - latest-thirty canonical recent-scene archive with public allowlisted DTOs
  - stable original-revision links for cached and canonical presentations
  - browser coverage for archive state, grouping, limits, and permalink navigation
affects: [phase-3-recaps, phase-3-profiles, phase-3-sharing, phase-4-corrections]
tech-stack:
  added: []
  patterns:
    - transactionally applied evidence backfill with a separate persisted-state check
    - server-only archive projection from canonical publication events
    - incomplete canonical records withheld behind an honest partial state
key-files:
  created:
    - scripts/backfill-scene-claim-versions.ts
    - src/features/publication/server/read-recent-scenes.ts
    - src/features/publication/server/canonical-scene-href.ts
    - src/features/publication/components/RecentSceneArchive.tsx
    - src/app/scenes/page.tsx
    - tests/integration/phase-03-backfill-gate.test.ts
    - tests/integration/phase-03-recent-scenes.test.ts
    - tests/e2e/phase-03-public-scenes.spec.ts
  modified:
    - src/app/scenes/[sceneId]/page.tsx
    - playwright.config.ts
    - tests/integration/migration-manifest.test.ts
key-decisions:
  - "Backfill execution is restricted to the configured local model_afterlife_app or model_afterlife_test database and fails closed for every other target."
  - "The archive uses scene_published sequence plus immutable revisionId ordering, and cached presentations normalize to originalRevisionId without creating another public identity."
  - "Incomplete canonical rows are omitted and produce a partial archive notice rather than fragmentary public content."
metrics:
  duration: 18 min
  completed: 2026-07-25
---

# Phase 03 Plan 02: Provenance Backfill and Recent Scene Archive Summary

**A measured, fail-closed provenance gate now underpins a deterministic latest-thirty canonical scene archive whose links reopen immutable scene pages.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-07-24T17:02:24Z
- **Completed:** 2026-07-24T17:20:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Added explicit `--dry-run`, `--apply`, and `--check` backfill modes with exact local-database guards, unique reviewed-ledger resolution, transactional apply, idempotency, and nonzero gate failures.
- Executed the development-database sequence in order and recorded its real empty legacy population without manufacturing a row.
- Proved the non-empty legacy path in the reset test database through the established accepted-candidate, persistence, and canonical publication fixture path, then removed only the new binding to represent the pre-0003 state.
- Added a bounded server-only archive projection that exposes only title, residents, location, home time, outcome, relationship descriptions, and canonical profile or transcript destinations.
- Rendered semantic loading, error/retry, empty, partial, one, thirty, grouped, and long-content states, with immutable revision identity preventing equal-content collapse.
- Followed a newly evidenced legacy archive link through the browser to the permanent SSR canonical scene and its exact claim-version context.

## Backfill Execution Evidence

The configured development target was `DATABASE_PURPOSE=development`, database `model_afterlife_app`, through the local database/WebSocket proxy configuration. The database contained no published legacy revisions, so all three real development executions correctly measured `total=0`; no legacy row was fabricated.

1. `node --env-file-if-exists=.env --experimental-strip-types scripts/backfill-scene-claim-versions.ts --dry-run`
   - `{"mode":"--dry-run","total":0,"resolved":0,"unresolved":0,"ambiguous":0,"pending":0,"extra":0,"applied":0}`
2. `node --env-file-if-exists=.env --experimental-strip-types scripts/backfill-scene-claim-versions.ts --apply`
   - `{"mode":"--apply","total":0,"resolved":0,"unresolved":0,"ambiguous":0,"pending":0,"extra":0,"applied":0}`
3. `node --env-file-if-exists=.env --experimental-strip-types scripts/backfill-scene-claim-versions.ts --check`
   - `{"mode":"--check","total":0,"resolved":0,"unresolved":0,"ambiguous":0,"pending":0,"extra":0,"applied":0}`

The integration and browser tracer independently measured the non-empty path against `model_afterlife_test`: dry-run resolved one reviewed claim with `pending=1`, apply wrote exactly one binding, a second apply wrote zero, and the final check reported `total=1`, `resolved=1`, `unresolved=0`, `ambiguous=0`, and `pending=0`.

## Verification

- `corepack pnpm test tests/integration/phase-03-backfill-gate.test.ts tests/integration/migration-manifest.test.ts tests/integration/phase-03-recent-scenes.test.ts` — 3 files, 8 tests passed.
- `corepack pnpm test:e2e tests/e2e/phase-03-public-scenes.spec.ts --project=chromium --grep "legacy tracer"` — 1 test passed.
- `node --env-file-if-exists=.env --experimental-strip-types scripts/backfill-scene-claim-versions.ts --check` — unresolved 0, ambiguous 0.
- `corepack pnpm test tests/integration/phase-03-recent-scenes.test.ts` — 1 file, 4 tests passed.
- `corepack pnpm test:e2e tests/e2e/phase-03-public-scenes.spec.ts --project=chromium` — 3 tests passed.
- `corepack pnpm typecheck` — passed.
- `corepack pnpm lint` — 166 files checked, no errors.

## Task Commits

1. **Task 1: Backfill one legacy scene and open it from the archive** — `5ab9ad3` (`feat`)
2. **Task 2: Expand the canonical recent-scene archive to its complete state matrix** — `f0e11dd` (`test`)

## Files Created/Modified

- `scripts/backfill-scene-claim-versions.ts` — Local-only fail-closed evidence reporting, transactional apply, and persisted check.
- `src/features/publication/server/read-recent-scenes.ts` — Bounded canonical event reader and allowlisted archive projection.
- `src/features/publication/server/canonical-scene-href.ts` — Original-revision normalization and validated public path derivation.
- `src/features/publication/components/RecentSceneArchive.tsx` — Semantic archive state matrix and home-day grouping.
- `src/app/scenes/page.tsx` — Dynamic SSR recent-scenes route with honest read failure handling.
- `src/app/scenes/[sceneId]/page.tsx` — Safe decoding before canonical identifier validation.
- `src/app/scenes/[sceneId]/not-found.tsx` — Stable scene-not-found recovery links.
- `tests/integration/phase-03-backfill-gate.test.ts` — Non-empty migration gate and end-to-end canonical read regression.
- `tests/integration/phase-03-recent-scenes.test.ts` — Ordering, identity, partial-row, privacy, and render-state coverage.
- `tests/e2e/phase-03-public-scenes.spec.ts` — Chromium tracer and complete archive presentation matrix.
- `tests/fixtures/render-recent-scene-archive.tsx` — Isolated SSR fixture renderer for browser state checks.
- `tests/integration/migration-manifest.test.ts` — CLI mode and local-target manifest assertions.
- `playwright.config.ts` — Named Chromium project required by phase verification.

## Decisions Made

- Treat stable publication sequence as the archive position and immutable revision ID as the only row identity; title and home-time equality never deduplicate scenes.
- Normalize cached presentation links only through `originalRevisionId`; synthetic cached IDs remain invalid as public scene IDs.
- Query at most thirty canonical publication candidates and retain only complete canonical reads. If any candidate is incomplete, keep complete rows and disclose a partial result.
- Keep all archive output allowlisted and server assembled; no prompt, provider body, usage, cost, calibration, hidden reasoning, or numeric relationship state crosses the boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Decoded encoded canonical identifiers before route validation**
- **Found during:** Task 1 Chromium tracer
- **Issue:** Archive links correctly percent-encoded revision IDs containing `:`, but the App Router parameter reached schema validation still encoded and returned the custom not-found page.
- **Fix:** Decode once inside a guarded `try` block, then apply the existing strict canonical ID schema and exact database lookup.
- **Files modified:** `src/app/scenes/[sceneId]/page.tsx`
- **Commit:** `5ab9ad3`

**2. [Rule 3 - Blocking] Added the named Chromium Playwright project required by the plan**
- **Found during:** Task 1 verification
- **Issue:** The plan's `--project=chromium` command failed because the existing config had device defaults but no named project.
- **Fix:** Added one named Chromium project while preserving the existing base URL, viewport, trace, screenshot, and single-worker behavior.
- **Files modified:** `playwright.config.ts`
- **Commit:** `5ab9ad3`

**3. [Rule 3 - Blocking] Used the repository's Node 24 native TypeScript execution path for environment-aware backfill evidence**
- **Found during:** Development dry-run
- **Issue:** The plan's bare `corepack pnpm tsx ...` command did not load `.env`, so the fail-closed script correctly rejected the missing `DATABASE_PURPOSE`.
- **Fix:** Executed all three recorded database actions with `node --env-file-if-exists=.env --experimental-strip-types`, matching the repository's existing server-script convention and preserving the required order and target guard.
- **Files modified:** None
- **Commit:** N/A

## Known Stubs

None.

## Security Review

- The backfill rejects non-local targets and any database name other than the exact configured Phase 3 development or test database.
- Apply occurs inside one transaction and refuses unresolved, ambiguous, or extra evidence.
- Archive data is reconstructed from complete canonical reads into an explicit public DTO; private generation tables never enter the component.
- Arbitrary scene identifiers remain strictly validated and unknown IDs return the not-found route without row details.
- No new security-relevant surface beyond the plan's threat model was introduced.

## Self-Check: PASSED

- All plan artifacts and the summary exist on disk.
- Task commits `5ab9ad3` and `f0e11dd` exist in repository history.
- No accidental tracked-file deletion or unresolved generated file was found.
