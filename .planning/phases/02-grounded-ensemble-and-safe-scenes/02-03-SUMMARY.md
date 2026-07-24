---
phase: 02-grounded-ensemble-and-safe-scenes
plan: "03"
subsystem: persistent-ensemble
tags: [relationships, memory, scene-eligibility, continuity, replay]

requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    plan: "02"
    provides: Six stable grounded resident identities and strict generation provenance
provides:
  - Replayable typed relationship graph and bounded accepted-memory context
  - Deterministic scene eligibility with quiet intervals, cooldowns, and ensemble budgets
  - Honest cached or quiet continuity through provider and publication failures
affects: [02-04-publication-gates, phase-3-profiles, phase-3-recaps]

key-files:
  created:
    - src/features/world/domain/relationships.ts
    - src/features/world/domain/memories.ts
    - src/features/world/domain/scene-eligibility.ts
    - src/features/world/generation/select-prompt-memories.ts
    - src/features/world/server/read-cached-scene.ts
    - src/features/world/server/resolve-generation-continuity.ts
  modified:
    - src/features/world/domain/types.ts
    - src/features/world/domain/events.ts
    - src/features/world/domain/replay.ts
    - src/features/world/server/publish-scene-revision.ts
    - src/features/world/generation/run-generation-request.ts
    - src/trigger/generate-scene.ts

key-decisions:
  - "Relationships and memories are canonical event-sourced application state; resident-model output cannot directly mutate either."
  - "Scene selection is a pure function of canonical state, approved briefs, logical time, and a stable seed, with no observer or popularity input."
  - "A cached scene is an availability presentation of an immutable prior revision, never a new publication and never a cause for repeated effects."
  - "Canonical pending-request state prevents duplicate generation requests and lets every failure settle into an inspectable quiet or cached disposition."

patterns-established:
  - "Cause-backed ensemble state: each relationship delta is unique by published cause, unordered pair, dimension, and ordinal."
  - "Bounded continuity context: prompts receive at most three deterministic accepted structured memories, never rejected candidates or raw transcripts."
  - "Failure-safe presentation: provider availability can change what is shown without changing canon, relationships, memories, or authorship provenance."

requirements-completed: [WRLD-05, RELS-01, RELS-02, RELS-03, RELS-05]

coverage:
  - id: D1
    description: Every unordered resident pair has bounded typed relationship dimensions and ordered, cause-backed shared memories that survive replay.
    requirements: [RELS-01, RELS-02]
    verification:
      - kind: unit
        ref: tests/unit/relationships.test.ts, tests/unit/prompt-memories.test.ts, and tests/unit/world-replay.property.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Prompt context deterministically selects no more than three relevant accepted memories and excludes rejected or private generation text.
    requirement: RELS-03
    verification:
      - kind: unit
        ref: tests/unit/prompt-memories.test.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Quiet intervals, resident and pair cooldowns, stable tie-breaking, and mature ensemble shares remain within policy over long simulations.
    requirements: [WRLD-05, RELS-05]
    verification:
      - kind: property
        ref: tests/unit/scene-eligibility.test.ts and tests/unit/ensemble-balance.property.test.ts
        status: pass
        detail: 100 deterministic long-horizon runs
    human_judgment: false
  - id: D4
    description: Provider, validation, stale-head, duplicate, and publication failures settle into convergent quiet or explicitly non-live cached presentation without canonical side effects.
    requirement: SCEN-10
    verification:
      - kind: integration
        ref: tests/integration/generation-job.test.ts and tests/integration/provider-failure-continuity.test.ts
        status: pass
      - kind: e2e
        ref: tests/e2e/semantic-observer.spec.ts
        status: pass
        detail: 51 browser cases, including two-observer cached convergence
    human_judgment: false
  - id: D5
    description: Database-backed atomic publication replay and projection rebuild match the live state.
    requirements: [RELS-01, RELS-02, SCEN-10]
    verification:
      - kind: integration
        ref: corepack pnpm rebuild-world -- --check
        status: blocked
        detail: Docker Desktop engine was stopped; no schema migration was introduced
    human_judgment: true

duration: 25 min
started: 2026-07-24T14:00:00+10:00
completed: 2026-07-24T14:25:00+10:00
tasks: 3
files-modified: 33
status: complete
---

# Phase 2 Plan 03: Persistent Ensemble and Safe Continuity Summary

**The six residents now share replayable relationships and memories, rotate through deterministic scene budgets, and remain observably coherent when generation is unavailable.**

## Accomplishments

- Replaced provisional affinity with bounded friendship, rivalry, and familiarity records for every unordered resident pair.
- Added immutable cause-backed relationship and shared-memory events, stable application order, duplicate rejection, and accepted-only prompt memory selection capped at three.
- Added a deterministic approved-brief selector with one-primary-scene enforcement, quiet intervals, 12-tick resident cooldowns, 30-tick pair cooldowns, rolling scoring, mature cast limits, pair limits, and versioned authored overrides.
- Materialized selected briefs and pending generation requests into canonical state so duplicate ticks cannot produce duplicate requests.
- Classified generation, validation, stale-world, duplicate, and publication outcomes and resolved each to honest live, cached, or quiet presentation.
- Preserved original revision and model provenance for cached content while preventing republication or repeated relationship and memory effects.

## Task Commits

1. **Add replayable relationships and memories** — `7591deb`
2. **Balance deterministic ensemble scenes** — `bf87f6a`
3. **Preserve continuity through provider failure** — `368317d`

## Validation Evidence

- Local non-database suite: 21 files and 164 tests passed.
- Long-horizon ensemble evidence: 100 deterministic property runs passed.
- Browser verification: 51 semantic-observer Playwright cases passed.
- Biome lint, TypeScript checking, and the Next.js production build passed.
- Docker Desktop was stopped, so database-backed integration and `rebuild-world -- --check` were not run. This plan introduced no database schema migration; the missing database check remains explicit coverage debt for the next available Docker-backed verification run.
- No paid OpenRouter calls were made. Cumulative authorized accounting remains 71/71.

## Deviations from Plan

### User-directed test workflow

The three tasks were implemented without TDD at the user's explicit request. Focused regression tests were added after each implementation and followed by the consolidated unit, integration, browser, lint, typecheck, and build checks above.

### Additional canonical coordination fields

`sceneHistory` and `pendingSceneRequest` were added to canonical state because the deterministic cooldown and idempotent request policies need replayable selection history and an inspectable in-flight request boundary.

### Database verification deferred

The planned database projection check could not run because the local Docker engine was unavailable. It is recorded as blocked coverage rather than reported as passing.

## Next Plan Readiness

- Plan 02-04 can evaluate publication gates and human calibration against stable relationships, immutable briefs, exact provenance, and failure-safe continuity.
- `WRLD-05`, `RELS-01`, `RELS-02`, `RELS-03`, and `RELS-05` are complete.
- `SCEN-10` remains pending because Plan 02-04 also declares it.
- Provider-call accounting is exhausted at 71/71; any additional live evaluation requires a new explicit bounded authorization.

## Self-Check: PASSED

- All implementation commits and key source files exist.
- Fresh local, property, browser, lint, typecheck, and build evidence passed.
- Database-backed replay remains unverified only because Docker Desktop is stopped.
- The user's pre-existing `next-env.d.ts` edit and untracked `.codex/` directory remain untouched.

---
*Phase: 02-grounded-ensemble-and-safe-scenes*
*Completed: 2026-07-24*
