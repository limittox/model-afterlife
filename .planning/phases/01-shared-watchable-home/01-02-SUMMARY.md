---
phase: 01-shared-watchable-home
plan: "02"
subsystem: world-runtime
tags: [determinism, event-sourcing, postgres, trigger-dev, recovery, property-testing]

requires:
  - 01-01 PostgreSQL observer tracer
provides:
  - Pure deterministic logical clock, advancement rules, canonical hashing, and replay
  - Transaction-locked append-only catch-up with coherent snapshot and ordered-update reads
  - Scheduled wake-up adapter with bounded delivery and executable journal-rebuild proof
affects: [01-03-observer-runtime, 01-04-watchable-home, 02-grounded-ensemble]

tech-stack:
  added: []
  patterns: [fixed-epoch logical time, deterministic occurrence keys, world-row transaction lock, canonical event replay, timestamp-derived scheduled wake-up]

key-files:
  created:
    - src/features/world/domain/advance.ts
    - src/features/world/domain/replay.ts
    - src/features/world/server/advance-world-to.ts
    - src/features/world/server/rebuild-world-projection.ts
    - src/app/api/world/updates/route.ts
    - src/trigger/world-clock.ts
    - scripts/rebuild-world.ts
    - drizzle/0001_deterministic_world.sql
  modified:
    - src/db/schema.ts
    - src/features/world/contracts/public-world.ts
    - README.md
    - vitest.config.ts

key-decisions:
  - "Emit a deterministic quiet event on every otherwise-empty logical tick so direct advancement, chunked advancement, and journal replay remain identical."
  - "Serialize overlapping world advancement through a PostgreSQL row lock and make occurrence and per-world sequence uniqueness the canonical duplicate-delivery defense."
  - "Treat Trigger.dev as a bounded wake-up source only; its supplied timestamp selects a target tick while PostgreSQL catches up every missing tick atomically."
  - "Run database integration files sequentially because they deliberately exercise one shared canonical world; retain concurrent calls inside the tests that prove locking behavior."

requirements-completed: [WRLD-01, WRLD-02, WRLD-03, WRLD-08, VIEW-08]

coverage:
  - id: D1
    description: "Fixed inputs produce byte-stable world advancement, chunk equivalence, quiet state, same-tick ordering, and journal replay."
    requirement: WRLD-02
    verification:
      - kind: unit
        ref: "tests/unit/world-clock.test.ts"
        status: pass
      - kind: unit
        ref: "tests/unit/world-replay.property.test.ts (100 generated paths per property)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Overlapping writers converge on one contiguous journal and matching projection while public snapshot/update reads stay coherent, bounded, validated, and GET-only."
    requirement: WRLD-01
    verification:
      - kind: integration
        ref: "tests/integration/world-repository.test.ts#serializes twenty overlapping advances into one canonical journal"
        status: pass
      - kind: integration
        ref: "tests/integration/world-api.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Late and duplicate scheduled deliveries catch up without divergence, and ordered journal replay exactly reproduces the committed hash and sequence."
    requirement: WRLD-08
    verification:
      - kind: integration
        ref: "tests/integration/world-catchup.test.ts"
        status: pass
      - kind: other
        ref: "corepack pnpm rebuild-world -- --check"
        status: pass
    human_judgment: false
  - id: D4
    description: "A returning observer can request a current snapshot or contiguous capped updates, with any cursor gap explicitly requiring snapshot replacement."
    requirement: WRLD-03
    verification:
      - kind: integration
        ref: "tests/integration/world-api.test.ts"
        status: pass
    human_judgment: false
  - id: D5
    description: "The scheduler, routes, and public contracts expose no browser-controlled time or mutation authority and pass the production security audit."
    requirement: VIEW-08
    verification:
      - kind: other
        ref: "corepack pnpm lint; corepack pnpm typecheck; corepack pnpm build; corepack pnpm audit --prod"
        status: pass
    human_judgment: false

duration: 22 min
completed: 2026-07-22
status: complete
---

# Phase 1 Plan 02: Deterministic World Runtime Summary

**A fixed-epoch world now advances through a transaction-locked event journal, survives missed or repeated scheduler delivery, and proves its live projection by exact replay.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-07-22T19:10:00+10:00
- **Completed:** 2026-07-22T19:32:00+10:00
- **Tasks:** 3
- **Files modified:** 35

## Accomplishments

- Built a pure clock, deterministic rules, complete provisional six-turn scene, canonical serialization/hash, and ordered replay with property coverage across at least 100 generated paths.
- Persisted every missing tick through one world-row-locked transaction, with unique occurrence and sequence constraints plus coherent versioned snapshot and capped update APIs.
- Added a minute schedule whose timestamp derives the target tick, while late, repeated, and concurrent deliveries converge through the same canonical writer.
- Added a guarded journal-rebuild check and verified clean migrations, all 25 tests, lint, types, production build, and a zero-finding production dependency audit.

## Task Commits

Each task was committed atomically:

1. **Task 1: Specify the pure clock, reducer, serialization, and replay kernel** - `f535a03` (feat)
2. **Task 2: Persist atomic catch-up and expose coherent snapshot/update reads** - `4f5fe26` (feat)
3. **Task 3: Wire scheduled wake-up and prove missed/duplicate delivery recovery** - `7ed9cd6` (feat)

**Plan metadata:** this commit

## Files Created/Modified

- `src/features/world/domain/advance.ts` - Advances every missing logical tick through stable deterministic rules and occurrence keys.
- `src/features/world/domain/replay.ts` - Replays ordered unique events and proves the resulting canonical hash.
- `src/features/world/server/advance-world-to.ts` - Locks, rereads, appends, reduces, and commits the canonical head atomically.
- `src/features/world/server/world-repository.ts` - Reads coherent heads, full journals, and bounded contiguous public updates.
- `src/app/api/world/updates/route.ts` - Validates a safe cursor and exposes ordered recovery via GET only.
- `src/trigger/world-clock.ts` - Converts scheduled UTC timestamps to target ticks with bounded task delivery.
- `src/features/world/server/rebuild-world-projection.ts` - Compares journal replay against the committed sequence and hash, refusing unsafe overwrite.
- `drizzle/0001_deterministic_world.sql` - Adds versioned payloads, internal state, public snapshots, and duplicate-proof uniqueness.
- `tests/unit/world-replay.property.test.ts` - Proves determinism, chunking, deduplication, ordering, and replay properties.
- `tests/integration/world-catchup.test.ts` - Proves late and duplicate wake recovery plus rebuild equality.

## Decisions Made

- Every logical tick emits a deterministic event, including quiet ticks. This makes the journal sufficient to reconstruct time-dependent state without consulting an external clock.
- PostgreSQL is the canonical idempotency boundary. Scheduler metadata is useful operational context, but transaction locks and unique occurrence keys decide what becomes canon.
- Public recovery uses snapshot replacement on gaps rather than replaying missed movement, preserving current shared state while leaving animation strictly local.
- Database integration files run sequentially against the singleton test world; concurrency remains explicit inside the overlapping-writer and duplicate-delivery cases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Correctness] Added a deterministic quiet event for ticks without a scene**
- **Found during:** Task 1 property-test green loop
- **Issue:** A quiet tick changed eligibility and location state without leaving a replayable journal event, so direct advancement could not equal journal rebuild.
- **Fix:** Emit one stable quiet-routine event for every otherwise-empty tick.
- **Verification:** Direct-versus-chunked and replay/hash properties pass across 100 generated paths.
- **Committed in:** `f535a03`

**2. [Rule 3 - Blocking] Serialized integration test files sharing the singleton world**
- **Found during:** Task 3 full-suite verification
- **Issue:** Vitest ran separate database test files in parallel, allowing an unrelated file to advance the same canonical row between assertions.
- **Fix:** Disabled file-level parallelism while preserving deliberately concurrent operations within each test.
- **Verification:** The focused recovery suite and complete 25-test suite both pass repeatedly.
- **Committed in:** `7ed9cd6`

---

**Total deviations:** 2 auto-fixed (1 correctness, 1 blocking)
**Impact on plan:** Both changes strengthen deterministic replay and make the real singleton-database evidence reproducible; no product scope was added.

## Issues Encountered

None remain. The two implementation findings above were resolved and covered by passing automated evidence.

## User Setup Required

Cloud scheduling remains optional for local execution. See [01-USER-SETUP.md](./01-USER-SETUP.md) for the Neon development connection, Trigger.dev project ref and secret, local runner, and cloud verification steps.

## Next Phase Readiness

- Plan 03 can consume one validated snapshot plus contiguous versioned updates without owning canonical time or outcomes.
- The complete-scene/quiet contract, cursor gap signal, and local presentation seam are ready for the observer recovery matrix.
- No high-severity threat, schema drift, security finding, or implementation blocker remains open.

---
*Phase: 01-shared-watchable-home*
*Completed: 2026-07-22*
