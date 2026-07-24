---
phase: 03-return-loop-and-inclusive-presentation
plan: "01"
subsystem: publication-provenance-and-ssr
tags: [postgresql, drizzle, provenance, nextjs, ssr, accessibility]

requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    provides: Immutable accepted revisions, approved historical claims, canonical publication transactions, and privacy-safe disclosures
provides:
  - Atomic per-turn bindings from published revisions to exact immutable historical claim versions
  - A strict complete/unavailable/not-found canonical scene reader with no live-state or provider dependency
  - Permanent server-rendered scene transcripts with profile links, provenance, outcome, and disclosure content
affects: [phase-3-archives, phase-3-recaps, phase-3-sharing, phase-4-corrections]

tech-stack:
  added: []
  patterns:
    - Fail-closed immutable provenance binding inside the canonical publication transaction
    - Allowlisted public DTO assembly from immutable records only
    - Revision-ID canonical permalinks with whole-scene unavailable fallback

key-files:
  created:
    - drizzle/0003_phase3_public_provenance.sql
    - src/features/publication/contracts/public-publication.ts
    - src/features/publication/server/read-canonical-scene.ts
    - src/features/publication/components/ScenePermalink.tsx
    - src/app/scenes/[sceneId]/page.tsx
    - tests/integration/phase-03-scene-provenance.test.ts
    - tests/unit/public-publication-contract.test.ts
  modified:
    - src/db/schema.ts
    - src/features/world/server/publish-scene-revision.ts
    - src/features/world/server/to-public-snapshot.ts
    - tests/integration/migration-manifest.test.ts

key-decisions:
  - "D-16 remains one-way: immutable published revision IDs are the only durable public scene identity."
  - "Every approved stable claim ID resolves to exactly one approved immutable version under historical-claims-v1, or the entire publication transaction fails."
  - "Canonical public reads return a complete scene, known-unavailable, or not-found; they never substitute current claims or expose a partial scene."

patterns-established:
  - "Exact provenance before canon: claim-version rows are inserted before publication events and projection advancement in the same transaction."
  - "Whole-object public validation: any missing transcript, cast, clock, cause, authorship, or provenance record downgrades the scene to unavailable."
  - "Stable historical ordering: turn index, claim stable order, then claim version ID is independent of database row order."

requirements-completed:
  - TRNS-04
  - SHAR-01
  - SHAR-02

coverage:
  - id: D1
    description: "Published scenes atomically retain exact per-turn historical claim-version bindings, including rollback and tuple-level idempotency."
    requirement: TRNS-04
    verification:
      - kind: integration
        ref: "tests/integration/phase-03-scene-provenance.test.ts#publication binding, rollback, idempotency, and immutable reread cases"
        status: pass
    human_judgment: false
  - id: D2
    description: "Immutable revision IDs produce distinct, validated canonical scene URLs and reject blank, malformed, unknown, or cached synthetic identities."
    requirement: SHAR-01
    verification:
      - kind: unit
        ref: "tests/unit/public-publication-contract.test.ts#canonicalScenePath identity and ordering cases"
        status: pass
      - kind: integration
        ref: "tests/integration/phase-03-scene-provenance.test.ts#unknown and synthetic revision lookup cases"
        status: pass
    human_judgment: false
  - id: D3
    description: "The SSR permalink renders only complete immutable scene data with ordered transcript, provenance, outcome, profile links, and persistent disclosures."
    requirement: SHAR-02
    verification:
      - kind: unit
        ref: "tests/unit/public-publication-contract.test.ts#strict DTO, disclosure parity, long-text, four/ten-turn, and 200% reflow cases"
        status: pass
      - kind: integration
        ref: "tests/integration/phase-03-scene-provenance.test.ts#projection advancement preserves transcript and provenance"
        status: pass
    human_judgment: false

duration: 23min
completed: 2026-07-24
status: complete
---

# Phase 3 Plan 01: Immutable Canonical Scene Permalink Summary

**Exact historical claim versions now travel atomically with every published scene into a strict, correction-safe SSR transcript permalink keyed by immutable revision ID.**

## Performance

- **Duration:** 23 min
- **Started:** 2026-07-24T16:28:37Z
- **Completed:** 2026-07-24T16:51:57Z
- **Tasks:** 1
- **Files modified:** 15

## Accomplishments

- Added reviewed migration `0003_phase3_public_provenance` with restrictive foreign keys, composite tuple identity, reverse lookup index, and fail-closed pre-release backfill.
- Bound every accepted turn claim to one exact approved claim version before canonical events and projection changes, preserving all-or-nothing rollback behavior.
- Added strict public contracts and an immutable-record reader that cannot leak prompts, provider data, hidden validation state, usage, cost, or raw relationship scores.
- Added `/scenes/[sceneId]` with semantic four-to-ten-turn transcripts, logical home time, resident profile links, historical sources, qualitative outcomes, and persistent staged-fiction/non-affiliation disclosures.
- Proved durable identity, deterministic provenance ordering, claim-free behavior, unavailable fallback, long-content reflow, and stability after live projection advancement.

## Task Commits

Each task was committed atomically:

1. **Task 1: Publish and open one exact-version-bound scene** - `b0e640c` (feat)

## Files Created/Modified

- `drizzle/0003_phase3_public_provenance.sql` - Adds and safely backfills immutable per-turn claim bindings.
- `src/db/schema.ts` - Declares the composite binding table, restrictive references, and reverse index.
- `src/features/world/server/publish-scene-revision.ts` - Resolves and inserts exact claim versions inside the publication transaction.
- `src/features/publication/contracts/public-publication.ts` - Defines strict allowlisted canonical-scene and read-result schemas.
- `src/features/publication/domain/home-clock.ts` - Provides shared deterministic logical-tick home time formatting.
- `src/features/publication/server/read-canonical-scene.ts` - Assembles complete immutable scenes or returns unavailable/not-found.
- `src/features/publication/components/CanonicalTranscript.tsx` - Renders ordered semantic transcript turns with exact authorship.
- `src/features/publication/components/ScenePermalink.tsx` - Renders complete, loading, and unavailable permalink surfaces.
- `src/app/scenes/[sceneId]/page.tsx` - Validates the route identity and server-renders the canonical scene.
- `tests/unit/public-publication-contract.test.ts` - Covers strict DTOs, identity, ordering, privacy, disclosure, transcript bounds, and reflow.
- `tests/integration/phase-03-scene-provenance.test.ts` - Covers migrated persistence, rollback, idempotency, and immutable rereads.

## Decisions Made

- Kept the locked D-16 revision identity without adding aliases or content-derived scene URLs.
- Treated `historical-claims-v1` as the supported immutable claim set and failed closed for any approved claim without one content-consistent row.
- Exposed only qualitative relationship changes and curated historical source fields; private scores and internal generation records never cross the public DTO boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated the migration manifest regression expectation**
- **Found during:** Task 1 verification
- **Issue:** The repository-wide integration suite still expected the Phase 2 migration journal to be the terminal entry, so the valid new ordered migration failed one stale assertion.
- **Fix:** Extended the manifest test to require `0003_phase3_public_provenance` and its generated snapshot in the correct journal position.
- **Files modified:** `tests/integration/migration-manifest.test.ts`
- **Verification:** The complete 44-file suite passes with all three migrations applied to disposable PostgreSQL.
- **Committed in:** `b0e640c`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The change updates a directly affected regression contract only; no product scope was added.

## Issues Encountered

- PowerShell passed the plan's literal `--` through to Vitest, which caused the prescribed command to exercise the entire repository suite rather than only two named files. This strengthened the evidence: both repeated tracer runs passed 257/257 tests across 44 files.
- Docker-backed database tests required access to the local Docker named pipe. Verification remained credential-free and made no provider or model calls.
- The state progress handler emitted a stale completed-plan count and an incorrect three-phase total in its legacy prose block; those metadata fields were reconciled to the handler's authoritative 9/15 result and the four-phase roadmap.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Archive, recap, metadata, and share surfaces can consume `CanonicalScene` and `canonicalScenePath` without reading live projections or current claim rows.
- Future correction tooling can retain durable public identity while relying on explicit immutable revision/provenance records.
- No open stubs, skipped tests, unrun verification steps, or unplanned threat surfaces remain.

## Self-Check: PASSED

- All 15 task files exist in commit `b0e640c`.
- Task commit `b0e640c` exists in repository history and contains no tracked-file deletions.
- The exact plan test command passed twice at 257/257 tests across 44 files; post-commit TypeScript checking passed.

---
*Phase: 03-return-loop-and-inclusive-presentation*
*Completed: 2026-07-24*
