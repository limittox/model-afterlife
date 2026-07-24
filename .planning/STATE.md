---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 02
current_phase_name: grounded-ensemble-and-safe-scenes
status: executing
stopped_at: "02-02 Task 3 DeepSeek V3.2 replacement verified offline; live canary not authorized; 23/47 cumulative"
last_updated: "2026-07-24T01:40:00.000Z"
last_activity: 2026-07-24
last_activity_desc: "DeepSeek R1 was replaced offline by V3.2 with reasoning disabled; 23/47 cumulative calls remain consumed and no further provider call is authorized"
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 8
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-22)

**Core value:** The retirement home must produce short, memorable, historically grounded character moments that make visitors want to keep watching and return later to see what changed.
**Current focus:** Phase 02 — grounded-ensemble-and-safe-scenes

## Current Position

Phase: 02 (grounded-ensemble-and-safe-scenes) — EXECUTING
Plan: 2 of 4
Status: Task 3 implementation ready; blocked only on authorization for a fresh V3.2 live canary
Last activity: 2026-07-24 — DeepSeek R1 0528 was replaced by `deepseek/deepseek-v3.2` in explicit non-thinking mode after two failed R1 diagnostics; accounting remains 23/47 and no further provider call is authorized

Progress: [█████████████░░░░░░░] 5/8 plans (63%)

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: 30 min
- Total execution time: 2.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4 | 111 min | 28 min |
| 2 | 1 | 39 min | 39 min |

**Recent Trend:**

- Last 4 plans: 22 min, 34 min, 35 min, 39 min
- Trend: Increased as the work moved from the shared-home foundation into the production generation tracer

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 20 min | 2 tasks | 32 files |
| Phase 01 P02 | 22 min | 3 tasks | 35 files |
| Phase 01 P03 | 34 min | 3 tasks | 27 files |
| Phase 01 P04 | 35 min | 3 tasks | 23 files |
| Phase 02 P01 | 39 min | 3 tasks | 57 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Phase 1]: Prove the shared canonical home before adding generated dialogue or the production cast.
- [Phase 1]: Make PostgreSQL journal ordering, occurrence uniqueness, and exact replay the authority for browser-independent canon.
- [Phase 1]: Keep React authoritative for semantic meaning and local presentation while Phaser remains a disposable renderer with three closed intents.
- [Phase 1]: Recover from focus, reconnect, cursor gaps, and Jump-live by replacing from a fresh snapshot instead of replaying missed movement.
- [Phase 1]: Preserve the last valid home during transport trouble while suppressing stale supplementary speech and rejecting malformed feed data.
- [Phase 2]: Route all resident and backstage-judge inference through one strict OpenRouter transport; pin exact/canonical model slugs and approved upstreams, disable fallback, validate router metadata, and pause rather than substitute.
- [Phase 2]: The earlier replacement of unavailable `openai/gpt-3.5-turbo-0125` with `openai/gpt-3.5-turbo-0613` is superseded by the approved GPT-4o/DeepSeek cast amendment below; mutable aliases remain prohibited.
- [Phase 2]: Replace launch residents GPT-3.5 Turbo 0613 and Command R+ 08-2024 with `openai/gpt-4o` via OpenAI and, after R1 0528 failed structured admission, `deepseek/deepseek-v3.2` via DeepInfra FP4. V3.2 uses explicit non-thinking mode and the standard short-turn bounds.
- [Phase 02]: Resident and judge inference uses one strict OpenRouter transport with exact model/upstream profiles and verified direct first-attempt metadata.
- [Phase 02]: Only openrouter_verified turns can publish; attempt two restarts from the immutable brief and failed candidates yield a persistent quiet disposition.
- [Phase 02]: Public scenes require exact per-turn model labels and persistent staged-fiction and non-affiliation disclosure.

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Plan 02-02 admission is blocked only on a separately authorized V3.2 live canary. The two prior R1 experiments ended with `generation-no-output`; accounting remains 23/47. No catalog request, generation, retry, fallback, route/model/quantization substitution, full matrix, or other paid provider call is authorized.
- [Phase 2]: Live admission requires one development-scoped `OPENROUTER_API_KEY` and one bundled human calibration review; the secret must stay out of chat, git, public bundles, and traces.
- [Phase 3]: Phase 1 UI audit scored 14/24; revisit the game-like dock, mixed hard-error/loading copy, typography wiring, accent reservation, and spacing during production presentation work.
- [Phase 4]: Qualified legal and provider-brand review is an external launch dependency.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260723-uxm | Run resident admission canaries breadth-first by sample ordinal, with regression coverage proving early provider failures minimize spent calls while preserving deterministic 30-call success results | 2026-07-23 | ed1ab57 | [260723-uxm-run-resident-admission-canaries-breadth-](./quick/260723-uxm-run-resident-admission-canaries-breadth-/) |
| 260724-fyf | Replace DeepSeek R1 0528 with DeepSeek V3.2, preserve paid-call accounting, and verify offline without an OpenRouter canary | 2026-07-24 | 1151363 | [260724-fyf-replace-deepseek-r1-0528-resident-with-d](./quick/260724-fyf-replace-deepseek-r1-0528-resident-with-d/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-22T15:39:15.673Z
Stopped at: Completed 02-01-PLAN.md
Resume file: None
