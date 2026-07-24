---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 02
current_phase_name: grounded-ensemble-and-safe-scenes
status: executing
stopped_at: Completed 02-03-PLAN.md
last_updated: "2026-07-24T16:58:04.386+10:00"
last_activity: 2026-07-24
last_activity_desc: "Diagnosed the semantic judge schema-invalid boundary offline with zero provider calls"
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 8
  completed_plans: 7
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-22)

**Core value:** The retirement home must produce short, memorable, historically grounded character moments that make visitors want to keep watching and return later to see what changed.
**Current focus:** Phase 02 — grounded-ensemble-and-safe-scenes

## Current Position

Phase: 02 (grounded-ensemble-and-safe-scenes) — EXECUTING
Plan: 4 of 4
Status: Plan 02-03 complete; semantic-judge local schema mismatch diagnosed, classifier fix pending
Last activity: 2026-07-24 — confirmed offline that the judge output passed transport and route checks before stricter local schema rejection

Progress: [██████████████████░░] 7/8 plans (88%)

## Performance Metrics

**Velocity:**

- Total plans completed: 7
- Average duration: not recalculated; Plan 02-02 spanned interactive provider checkpoints
- Total execution time: 2.9 recorded hours plus multi-session Plan 02-02 work

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4 | 111 min | 28 min |
| 2 | 3 | multi-session | n/a |

**Recent Trend:**

- Last 4 plans: 35 min, 39 min, multi-session, 25 min
- Trend: Plan 02-03 returned to focused offline implementation after the provider-gated admission work

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 20 min | 2 tasks | 32 files |
| Phase 01 P02 | 22 min | 3 tasks | 35 files |
| Phase 01 P03 | 34 min | 3 tasks | 27 files |
| Phase 01 P04 | 35 min | 3 tasks | 23 files |
| Phase 02 P01 | 39 min | 3 tasks | 57 files |
| Phase 02 P02 | multi-session | 4 tasks | 44 files |
| Phase 02 P03 | 25 min | 3 tasks | 33 files |

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
- [Phase 2]: Replace the pre-admission Qwen 2.5 7B entry after repeated structured-output failures with `qwen/qwen3-235b-a22b-2507` (canonical `qwen/qwen3-235b-a22b-07-25`) via DeepInfra FP8. Qwen3 is non-thinking-only, uses the standard 180-token bound, and remains paused until a separately authorized strict-route live admission succeeds.
- [Phase 02]: Resident and judge inference uses one strict OpenRouter transport with exact model/upstream profiles and verified direct first-attempt metadata.
- [Phase 02]: Only openrouter_verified turns can publish; attempt two restarts from the immutable brief and failed candidates yield a persistent quiet disposition.
- [Phase 02]: Public scenes require exact per-turn model labels and persistent staged-fiction and non-affiliation disclosure.
- [Phase 02]: Public resident identity is joined from the immutable registry, and the snapshot boundary rejects anything other than the exact six-resident launch ensemble.
- [Phase 02]: Each launch resident uses a stable, original, provider-neutral pixel silhouette and accessory treatment; provider logos and copied character designs are excluded.
- [Phase 02]: Relationships and memories are canonical event-sourced application state; resident-model output cannot directly mutate either.
- [Phase 02]: Scene selection is pure and observer-independent, using only canonical state, approved briefs, logical time, and stable seeds.
- [Phase 02]: Cached scenes preserve original revision and model provenance and never republish or reapply relationship or memory effects.

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: The second guarded retry confirmed all four tea-timer resident turns, then stopped fail-closed when the semantic judge returned `schema-invalid`. Offline diagnosis confirmed a structural-transport versus stricter-local-schema rejection, but existing sanitized evidence cannot identify the exact field. Add privacy-safe field-level judge classification before requesting another paid checkpoint. Cumulative accounting remains 118/128.
- [Phase 2]: Human semantic calibration is approved and enabled. The remaining reference proof must preserve the OpenRouter credential outside chat, git, public bundles, and traces; any further paid attempt needs fresh explicit authorization.
- [Phase 2]: Docker Desktop is stopped, so Plan 02-03's database-backed replay/rebuild check remains explicit verification debt.
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
| 260724-hf4 | Run one post-fix Qwen canary and, only if it passes, one paced final admission matrix with cumulative ceiling 70 | 2026-07-24 | ecdb4c9 | [260724-hf4-run-one-post-fix-qwen-canary-and-only-if](./quick/260724-hf4-run-one-post-fix-qwen-canary-and-only-if/) |
| 260724-hgn | Remove application-owned relationship effects from the model wire schema and inject an empty array locally, verified with TDD and no provider calls | 2026-07-24 | ab1f52c | [260724-hgn-remove-application-owned-relationship-ef](./quick/260724-hgn-remove-application-owned-relationship-ef/) |
| 260724-ho4 | Replace Qwen 2.5 7B resident with Qwen3 235B A22B Instruct 2507 on DeepInfra FP8, update grounded identity and tests, no provider calls | 2026-07-24 | 6be74a9 | [260724-ho4-replace-qwen-2-5-7b-resident-with-qwen3-](./quick/260724-ho4-replace-qwen-2-5-7b-resident-with-qwen3-/) |
| 260724-in8 | Run one authorized Qwen3 DeepInfra FP8 canary and, only on success, one paced 30-generation final matrix, stopping at cumulative ceiling 71 | 2026-07-24 | cd9d0c5 | [260724-in8-run-one-authorized-qwen3-deepinfra-fp8-a](./quick/260724-in8-run-one-authorized-qwen3-deepinfra-fp8-a/) |
| 260724-m1x | Preserve the fail-closed live evidence, align the resident prompt with deterministic premise establishment, and add a guarded reference-only continuation without provider calls | 2026-07-24 | 0dc1cb3 | [260724-m1x-align-live-reference-prompts-with-determ](./quick/260724-m1x-align-live-reference-prompts-with-determ/) |
| 260724-maw | Run the authorized reference-only 15-generation Phase 2 continuation with cumulative ceiling 120, preserve sanitized evidence, stop fail-closed, verify, commit, and push | 2026-07-24 | 4734371 | [260724-maw-run-the-authorized-reference-only-15-gen](./quick/260724-maw-run-the-authorized-reference-only-15-gen/) |
| 260724-mg7 | Add privacy-safe provider exception classification to the Phase 2 live reference runner, verify offline, make no provider calls, commit, and push | 2026-07-24 | c73f5d1 | [260724-mg7-add-privacy-safe-provider-exception-clas](./quick/260724-mg7-add-privacy-safe-provider-exception-clas/) |
| 260724-mx9 | Add a guarded Phase 2 reference retry mode for the exact failed 109-generation state, run the authorized 15-generation retry with cumulative ceiling 124, stop fail-closed, verify, commit, and push | 2026-07-24 | 4d9d16d | [260724-mx9-add-a-guarded-phase-2-reference-retry-mo](./quick/260724-mx9-add-a-guarded-phase-2-reference-retry-mo/) |
| 260724-nbq | Run the authorized Phase 2 reference retry-2 with at most 15 generations and cumulative ceiling 128, stop fail-closed, verify, commit, and push | 2026-07-24 | 8b8572c | [260724-nbq-run-the-authorized-phase-2-reference-ret](./quick/260724-nbq-run-the-authorized-phase-2-reference-ret/) |
| 260724-nhl | Diagnose the Phase 2 semantic judge schema-invalid failure offline, identify the root cause from saved evidence and code paths, make no provider calls, and record findings | 2026-07-24 | 4e41d50 | [260724-nhl-diagnose-the-phase-2-semantic-judge-sche](./quick/260724-nhl-diagnose-the-phase-2-semantic-judge-sche/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-24T16:58:04.386+10:00
Stopped at: Semantic-judge local schema mismatch diagnosed offline; privacy-safe field-level classification is the next fix
Resume file: None
