---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 02
current_phase_name: grounded-ensemble-and-safe-scenes
status: executing
stopped_at: "02-02 Task 3 conditional Qwen canary and final matrix authorized; 70/70 ceiling"
last_updated: "2026-07-24T02:32:32.243Z"
last_activity: 2026-07-24
last_activity_desc: "One post-fix Qwen canary and, only on success, one paced final matrix are authorized; cumulative generation ceiling is conservatively reserved at 70/70"
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
Status: Task 3 conditional Qwen canary and final matrix authorized
Last activity: 2026-07-24 — one post-fix Qwen canary is authorized and, only if it passes, one standard paced matrix with at most 30 generations; exact routing, zero retries, disabled fallback, first-failure stop, and cumulative ceiling 70/70

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

- [Phase 2]: One post-fix Qwen canary and, conditional on its success, one paced final matrix are authorized. The combined hard ceiling is 31 new generations and 70/70 cumulative. Exact routing, zero retries, disabled fallback, first-failure stop, and sanitized output remain mandatory.
- [Phase 2]: Live admission requires one development-scoped `OPENROUTER_API_KEY` and one bundled human calibration review; the secret must stay out of chat, git, public bundles, and traces.
- [Phase 3]: Phase 1 UI audit scored 14/24; revisit the game-like dock, mixed hard-error/loading copy, typography wiring, accent reservation, and spacing during production presentation work.
- [Phase 4]: Qualified legal and provider-brand review is an external launch dependency.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260723-uxm | Run resident admission canaries breadth-first by sample ordinal, with regression coverage proving early provider failures minimize spent calls while preserving deterministic 30-call success results | 2026-07-23 | ed1ab57 | [260723-uxm-run-resident-admission-canaries-breadth-](./quick/260723-uxm-run-resident-admission-canaries-breadth-/) |
| 260724-fyf | Replace DeepSeek R1 0528 with DeepSeek V3.2, preserve paid-call accounting, and verify offline without an OpenRouter canary | 2026-07-24 | 1151363 | [260724-fyf-replace-deepseek-r1-0528-resident-with-d](./quick/260724-fyf-replace-deepseek-r1-0528-resident-with-d/) |
| 260724-gba | Run exactly one authorized DeepSeek V3.2 admission generation canary through DeepInfra FP4, preserve strict routing, and stop at 24 of 47 calls | 2026-07-24 | e695608 | [260724-gba-run-exactly-one-authorized-deepseek-v3-2](./quick/260724-gba-run-exactly-one-authorized-deepseek-v3-2/) |
| 260724-gix | Run the authorized final six-resident OpenRouter admission matrix with 12 catalog checks and at most 30 generations, stopping fail-closed at a cumulative ceiling of 54 calls | 2026-07-24 | 46986a8 | [260724-gix-run-the-authorized-final-six-resident-op](./quick/260724-gix-run-the-authorized-final-six-resident-op/) |
| 260724-glw | After provider cooldown rerun the authorized final six-resident OpenRouter admission matrix once, stopping fail-closed at cumulative generation ceiling 58 | 2026-07-24 | 0d5e4b1 | [260724-glw-after-provider-cooldown-rerun-the-author](./quick/260724-glw-after-provider-cooldown-rerun-the-author/) |
| 260724-guf | Add deterministic inter-generation pacing to the live admission matrix after reproducible fourth-request HTTP 429s, verify offline, and make no provider calls | 2026-07-24 | 11d1523 | [260724-guf-add-deterministic-inter-generation-pacin](./quick/260724-guf-add-deterministic-inter-generation-pacin/) |
| 260724-h0c | Run the one authorized paced final six-resident admission matrix with 21-second generation spacing and cumulative ceiling 62 | 2026-07-24 | bf09b61 | [260724-h0c-run-the-one-authorized-paced-final-six-r](./quick/260724-h0c-run-the-one-authorized-paced-final-six-r/) |
| 260724-h57 | Add privacy-safe field-level classification for local admission schema failures, with no provider calls | 2026-07-24 | 9f031bc | [260724-h57-add-privacy-safe-field-level-classificat](./quick/260724-h57-add-privacy-safe-field-level-classificat/) |
| 260724-h91 | Run one privacy-safe Qwen admission diagnostic with two catalog reads, one generation, and cumulative ceiling 39 | 2026-07-24 | 4ec7c22 | [260724-h91-run-one-privacy-safe-qwen-admission-diag](./quick/260724-h91-run-one-privacy-safe-qwen-admission-diag/) |
| 260724-hc9 | Make the resident prompt explicitly require an empty relationship-effects array, verified offline with TDD and no provider calls | 2026-07-24 | e12e751 | [260724-hc9-make-the-resident-prompt-explicitly-requ](./quick/260724-hc9-make-the-resident-prompt-explicitly-requ/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-22T15:39:15.673Z
Stopped at: Completed 02-01-PLAN.md
Resume file: None
