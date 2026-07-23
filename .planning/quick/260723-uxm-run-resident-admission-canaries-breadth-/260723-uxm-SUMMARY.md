---
phase: quick
plan: 260723-uxm
subsystem: generation
tags: [resident-admission, canaries, deterministic-scheduling, vitest]

requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    provides: Strict resident provider profiles, admission validation, and sanitized admission errors
provides:
  - Serial breadth-first admission generation by sample ordinal and registry order
  - Mocked regression coverage for three-call early failure and deterministic 30-call success
affects: [resident-admission, generation-cost-control, provider-validation]

tech-stack:
  added: []
  patterns:
    - Prepare registry-ordered catalog evidence before serial ordinal-major generation rounds
    - Use the provider registry as the single ordering source for calls and summaries

key-files:
  created: []
  modified:
    - src/features/world/generation/run-admission-canaries.ts
    - tests/integration/resident-admission.test.ts

key-decisions:
  - "Keep admission sampling serial while moving the ordinal loop outside the resident loop, preserving immediate failure and deterministic order."
  - "Prepare all catalog evidence first, then aggregate successful samples back into registry-ordered resident summaries."

patterns-established:
  - "Breadth-first canaries: complete one sample ordinal across all residents before advancing to the next ordinal."

requirements-completed:
  - QUICK-260723-UXM

coverage:
  - id: D1
    description: "Admission generation runs breadth-first by ordinal and registry order while successful output remains deterministic."
    requirement: QUICK-260723-UXM
    verification:
      - kind: integration
        ref: "tests/integration/resident-admission.test.ts#records exactly five sanitized samples for every exact resident"
        status: pass
      - kind: other
        ref: "corepack pnpm typecheck"
        status: pass
    human_judgment: false
  - id: D2
    description: "A first-round Gemini validation failure stops after three mocked generation calls and retains the sanitized ResidentAdmissionError contract."
    requirement: QUICK-260723-UXM
    verification:
      - kind: integration
        ref: "tests/integration/resident-admission.test.ts#pauses the exact resident and exposes only a sanitized route reason on failure"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-23
status: complete
---

# Quick Task 260723-uxm: Resident Admission Canary Breadth Summary

**Serial ordinal-major admission canaries now stop first-round Gemini failures after three mocked calls while preserving deterministic 30-sample summaries.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-23T12:23:16Z
- **Completed:** 2026-07-23T12:27:16Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Reordered resident admission sampling into five serial breadth-first rounds, retaining provider-registry order within each round.
- Locked the early-failure cost contract: an invalid Gemini ordinal-one sample stops after GPT-4o, Claude, and Gemini calls.
- Preserved six registry-ordered summaries, five sanitized samples per resident, existing metrics and token-policy fields, and sanitized failure classification.

## RED/GREEN Evidence

- **RED:** `corepack pnpm exec vitest run tests/integration/resident-admission.test.ts` failed 2 of 3 tests against the original runner. The success trace was resident-major, and the Gemini ordinal-one failure occurred after 11 mocked generation calls instead of 3.
- **GREEN:** The same targeted command passed 3 of 3 tests after the runner change.
- **Type safety:** `corepack pnpm typecheck` completed successfully with `tsc --noEmit`.
- All test dependencies were mocked; no live admission or provider command was invoked.

## Task Commits

1. **Task 1: Lock ordinal-major admission scheduling with a red/green regression** - `ed1ab57` (fix)

The test and production changes were committed together as the single atomic task outcome required by the quick-task orchestrator.

## Files Created/Modified

- `src/features/world/generation/run-admission-canaries.ts` - Prepares catalog evidence in registry order, runs serial ordinal-major sample rounds, and assembles unchanged summaries afterward.
- `tests/integration/resident-admission.test.ts` - Asserts complete call ordering, three-call Gemini early stop, registry-ordered summaries, and the existing sanitized result contract.

## Decisions Made

- Catalog checks remain registry-ordered and complete before generation begins; only generation scheduling changed.
- The same immutable provider registry controls within-round call order and final resident summary order.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The globally installed `pnpm` resolved to 9.5.0 and exited before Vitest with `packages field missing or empty`. Required commands were run through Corepack, which resolved the project-pinned pnpm 11.15.1.
- An optional scoped Biome check surfaced pre-existing whole-file formatting and import-order drift. No broad formatter rewrite was made; the required targeted tests, typecheck, and diff check pass.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Resident admission regression coverage is ready for normal mocked CI execution without `OPENROUTER_API_KEY`.
- Live provider admission remains outside this quick task and was not invoked.

## Self-Check: PASSED

- Both modified code/test files and this summary exist.
- Commit `ed1ab57be27507cff6435a5381d19ba5aa4414fd` exists and contains exactly the two authorized code/test paths.
- The summary declares `status: complete`; planning artifacts remain uncommitted for the orchestrator.

---
*Phase: quick*
*Completed: 2026-07-23*
