---
phase: 02-grounded-ensemble-and-safe-scenes
plan: "01"
subsystem: ai-generation
tags: [openrouter, trigger-dev, zod, postgres, playwright, provenance]

# Dependency graph
requires:
  - phase: 01-shared-watchable-home
    provides: Canonical PostgreSQL world, ordered event feed, semantic observer, and deterministic replay
provides:
  - Private-first four-turn scene generation and atomic immutable publication tracer
  - Strict one-key OpenRouter resident adapter with verified exact model and upstream routing
  - Post-commit durable generation dispatch with two bounded full attempts
  - Persistent staged-fiction and non-affiliation disclosure with exact per-turn model labels
affects: [02-02-resident-admission, 02-03-relationships, 02-04-publication-gates, phase-3-provenance]

# Tech tracking
tech-stack:
  added: ["@openrouter/ai-sdk-provider@3.0.0"]
  patterns: [private-attempt-before-canon, verified-router-authorship, post-commit-trigger-dispatch, public-contract-whitelisting]

key-files:
  created:
    - src/features/world/generation/provider-registry.ts
    - src/features/world/generation/openrouter-metadata.ts
    - src/features/world/generation/openrouter-resident-turn-provider.ts
    - src/features/world/generation/run-generation-request.ts
    - src/trigger/generate-scene.ts
    - src/features/world/components/TransparencyNotice.tsx
  modified:
    - src/db/schema.ts
    - src/features/world/server/publish-scene-revision.ts
    - src/features/world/server/to-public-snapshot.ts
    - src/trigger/world-clock.ts
    - src/features/world/client/WorldObserver.tsx

key-decisions:
  - "Route resident inference through one strict OpenRouter transport with exact model/upstream profiles and fail-closed first-attempt metadata validation."
  - "Only openrouter_verified turns may publish; retry the immutable brief once and convert exhausted failures into a private quiet disposition."
  - "Expose only exact public model labels and persistent staged-fiction/non-affiliation copy; keep all attempt machinery backstage."

patterns-established:
  - "Post-commit dispatch: canonical transaction returns committed generation requests before Trigger.dev receives a global scene-key idempotency key."
  - "Router proof boundary: requested identity is insufficient; retained OpenRouter response metadata must prove direct exact model and upstream selection."
  - "Public whitelist: scene serialization reconstructs the public turn shape rather than spreading private persisted records."

requirements-completed: [WRLD-06, WRLD-07, SCEN-01, SCEN-02, SCEN-03, SCEN-04, SCEN-07, SCEN-08, SCEN-09, TRNS-01, TRNS-02]

coverage:
  - id: D1
    description: Private attempts validate and publish one immutable four-turn scene atomically without duplicate canon or leakage.
    requirement: WRLD-07
    verification:
      - kind: integration
        ref: tests/integration/scene-generation-tracer.test.ts and tests/integration/scene-publication.test.ts
        status: pass
      - kind: unit
        ref: tests/unit/generation-contracts.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Strict OpenRouter routing proves exact resident model and approved upstream identity before a turn can advance.
    requirement: SCEN-07
    verification:
      - kind: unit
        ref: tests/unit/provider-registry.test.ts, tests/unit/openrouter-metadata.test.ts, and tests/unit/openrouter-provider.test.ts
        status: pass
      - kind: integration
        ref: tests/integration/generation-job.test.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Committed generation requests dispatch durably and two failed complete attempts leave a healthy quiet world.
    requirement: WRLD-06
    verification:
      - kind: unit
        ref: tests/unit/world-clock.test.ts
        status: pass
      - kind: integration
        ref: tests/integration/generation-job.test.ts
        status: pass
    human_judgment: false
  - id: D4
    description: The observer shows exact per-turn model labels and persistent staged-fiction and non-affiliation disclosure without private fields.
    requirement: TRNS-01
    verification:
      - kind: unit
        ref: tests/unit/public-world-contract.test.ts
        status: pass
      - kind: e2e
        ref: tests/e2e/semantic-observer.spec.ts (50 cases at active, quiet, failed, cached, loading, and reconnecting states)
        status: pass
    human_judgment: false

# Metrics
duration: 39min
completed: 2026-07-23
status: complete
---

# Phase 2 Plan 01: Production Scene Tracer Summary

**A private-first, duplicate-safe scene tracer now reaches atomic canon through strict OpenRouter authorship proof and an observer that discloses exact model participation.**

## Performance

- **Duration:** 39 min
- **Started:** 2026-07-23T00:59:00+10:00
- **Completed:** 2026-07-23T01:38:00+10:00
- **Tasks:** 3
- **Files modified:** 57

## Accomplishments

- Added all Phase 2 private generation records and proved the full request, attempt, validation, immutable revision, publication event, projection, and public snapshot path against PostgreSQL.
- Replaced five direct SDK paths with one exact-pinned OpenRouter adapter that disables fallback, cache authorship, streaming, tools, and SDK retries while validating direct router evidence.
- Added post-commit Trigger.dev dispatch, a maximum of two fresh attempts from the immutable brief, and private failure dispositions that never become dialogue or canon.
- Added exact model/version attribution to every public turn plus persistent staged-fiction and independent/non-affiliation language across every observer state.

## Task Commits

Each behavior was recovered through explicit RED/GREEN commits after the architecture amendment:

1. **Task 1: Prove one private-to-canonical scene** - `3f0ae38` (RED), `be739f5` (GREEN), `d3c6b3a` (GREEN)
2. **Task 2: Wire strict OpenRouter generation** - `a46e277` through `e96b3a6` (granular RED/GREEN), `099f875` (refactor)
3. **Task 3: Show only validated scenes and transparency** - `396a5ab`, `567b41f` (RED), `cf225d2` (GREEN), `ba9dcd4` (test typing)

The strict OpenRouter planning amendment was recorded in `d717201` before Task 2 implementation.

## TDD Gate Evidence

- Registry, router metadata, bounded prompt, adapter, post-commit dispatch, verified identity, durable job, attempt ordinal, public serialization, and browser disclosure tests each failed for the intended missing behavior before implementation.
- Final verification passed 21 Vitest files / 93 tests, all 50 semantic observer Playwright cases, Biome lint, TypeScript checking, and the Next.js production build.
- All provider tests used frozen injected responses. No OpenRouter key or live network inference call was used.

## Files Created/Modified

- `drizzle/0001_majestic_mariko_yashida.sql` and `src/db/schema.ts` - Private generation, validation, revision, and provenance persistence.
- `src/features/world/generation/provider-registry.ts` - Exact six-model OpenRouter request/canonical/upstream allowlist.
- `src/features/world/generation/openrouter-metadata.ts` - Fail-closed direct-route and first-attempt evidence validation.
- `src/features/world/generation/openrouter-resident-turn-provider.ts` - Bounded no-tools/no-streaming provider adapter.
- `src/features/world/generation/build-resident-prompt.ts` - Immutable instructions with randomized labelled boundaries around untrusted data.
- `src/features/world/generation/run-generation-request.ts` - Two-attempt orchestration and quiet failure disposition.
- `src/trigger/generate-scene.ts` and `src/trigger/world-clock.ts` - Durable scene task and post-commit idempotent dispatch.
- `src/features/world/server/publish-scene-revision.ts` - Atomic, duplicate-safe publication after all model work completes.
- `src/features/world/contracts/public-world.ts` and `src/features/world/server/to-public-snapshot.ts` - Exact-model public contract and private-field whitelist.
- `src/features/world/components/TransparencyNotice.tsx` and `src/features/world/components/DialogueTranscript.tsx` - Persistent disclosures and exact turn attribution.
- `tests/unit/*`, `tests/integration/*`, and `tests/e2e/semantic-observer.spec.ts` - Offline routing, durability, serialization, leakage, and observer-state proofs.

## Decisions Made

- OpenRouter is the sole transport boundary for resident and later judge inference; direct provider SDKs and mutable aliases are not supported.
- Router identity is independently verified from retained `openrouter_metadata`; application-requested identity alone cannot authorize publication.
- Trigger dispatch happens only after the world transaction commits. PostgreSQL uniqueness remains the final duplicate-safety authority.
- Attempt two starts from the original immutable brief, never from rejected output, so failures cannot poison retries.
- The observer reconstructs a minimal public scene shape and keeps disclosure outside the canvas so it survives all world and connection states.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Recovered strict TDD sequencing after premature implementation commits**

- **Found during:** Task 2 startup
- **Issue:** Initial Task 2/3 implementation commits did not establish observable RED gates.
- **Fix:** Reverted those commits without inspecting or reusing their diffs, then rebuilt every behavior through focused failing tests and granular GREEN commits.
- **Files modified:** Task 2 and Task 3 files listed above.
- **Verification:** Each named behavior produced its intended failure before implementation; the final full suite passed.
- **Committed in:** `1e497cf`, `af4e075`, `bf3279f` (recovery reverts), followed by `a46e277` through `ba9dcd4`.

**2. [Rule 3 - Blocking] Read router evidence from the AI SDK's retained response body**

- **Found during:** Task 2 strict adapter implementation
- **Issue:** The OpenRouter provider does not normalize the required router evidence into AI SDK provider metadata.
- **Fix:** Enabled response-body retention and validated the private `openrouter_metadata` envelope before returning a resident turn.
- **Files modified:** `src/features/world/generation/openrouter-resident-turn-provider.ts`, `tests/unit/openrouter-provider.test.ts`
- **Verification:** Frozen responses accept only direct first-attempt exact routes and reject aliases, fallbacks, cache-without-metadata, mismatches, and material pipeline stages.
- **Committed in:** `430e9f1`, `7328bae`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both changes were necessary to preserve the approved TDD and strict-router contracts; no product scope was added.

## Issues Encountered

- The specialized executor profile was unavailable, so execution used the approved generic-agent workaround while preserving the full executor contract and verification gates.
- Promptfoo/Phoenix remain intentionally deferred to Plan 04, as specified.

## User Setup Required

None for local or CI verification. Future live admission in Plan 02 requires a development-scoped `OPENROUTER_API_KEY`; it must remain outside chat, git, browser bundles, and traces.

## Next Phase Readiness

- Plan 02 can replace provisional participants with the exact six admitted source-grounded residents while reusing the strict registry and authorship proof boundary.
- Live admission remains intentionally gated on a development OpenRouter key and bundled human calibration review; the complete offline suite is ready now.

## Self-Check: PASSED

- Summary file and all key implementation files exist.
- Effective Task 1-3 commits are present in repository history.
- Working tree contains no tracked implementation changes after the final verification.

---
*Phase: 02-grounded-ensemble-and-safe-scenes*
*Completed: 2026-07-23*
