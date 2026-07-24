---
quick_id: 260724-ho4
status: complete
completed: 2026-07-24
test_commit: 4081dd1
implementation_commit: 6be74a9
---

# Quick Task 260724-ho4 Summary

Replaced the sixth resident, Qwen 2.5 7B Instruct, with Qwen3 235B A22B
Instruct 2507 throughout the active runtime, editorial fixtures, evaluation
corpus, tests, and Phase 02 contracts.

## Result

- Requested model: `qwen/qwen3-235b-a22b-2507`
- Canonical model: `qwen/qwen3-235b-a22b-07-25`
- Approved route: DeepInfra FP8 (`deepinfra/fp8`)
- Output policy: 180 tokens, non-thinking-only, no reasoning configuration
- Resident identity: Many-Expert Archive Curator
- Grounding: three exact-model-scoped claims separating documented
  architecture, reported strengths, and fictional exaggeration
- Seed behavior: transactionally removes the retired Qwen model, bible, and
  claim rows before inserting the active six-resident editorial set

The reference corpus remains 24 cases with all 15 cast pairs and the same
category composition. No OpenRouter catalog or generation request was made;
paid-call accounting remains 40/70 and live admission remains separately
authorized.

## Verification

- Focused offline Vitest configuration: 4 files and 17 tests passed
- `corepack pnpm typecheck`: passed
- Scoped `biome lint` across the nine changed TypeScript files: passed
- `git diff --check`: passed
- Database-backed seed integration: not rerun because Docker Desktop was
  stopped and the PostgreSQL test environment could not start

The user-owned `next-env.d.ts` modification and untracked `.codex/` directory
were not staged or changed by this task.
