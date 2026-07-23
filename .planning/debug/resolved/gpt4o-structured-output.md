---
status: resolved
trigger: "fix it"
created: 2026-07-23
updated: 2026-07-23
---

# Debug Session: GPT-4o structured output

## Symptoms

- expected_behavior: The production resident-turn schema is accepted by GPT-4o through the pinned OpenAI upstream while local validation still rejects relationship effects.
- actual_behavior: A simple strict structured-output schema succeeds, but the exact production schema returns HTTP 400.
- error_messages: Sanitized provider failure `provider-http-400`; OpenAI documents that unsupported strict JSON Schema keywords produce an error.
- timeline: Discovered during the first GPT-4o call of the amended Phase 02 admission matrix.
- reproduction: Send the exact production schema from `openrouter-resident-turn-provider.ts` for `openai/gpt-4o` through OpenRouter with OpenAI pinned and fallback disabled.

## Current Focus

- hypothesis: Confirmed — `z.array(z.never()).max(0)` generated the unsupported `not` keyword; the concrete supported item schema removes it without relaxing the zero-item bound.
- bug_class: bohrbug
- test: Approved offline acceptance only; native GPT-4o admission remains deferred until a separately authorized paid/provider run.
- expecting: Offline RED→GREEN, controlled revert/reapply, adjacent tests, typecheck, lint, and diff checks remain sufficient for this scoped fix.
- next_action: Archive the resolved session and commit only the scoped fix/test and debug records; native provider confirmation remains deferred.
- reasoning_checkpoint:
    hypothesis: "`z.array(z.never()).max(0)` causes the provider HTTP 400 because its generated strict JSON Schema contains OpenAI's unsupported `not` keyword."
    confirming_evidence:
      - "The exact production schema failed while an unstructured request and a trivial strict schema both succeeded through the same pinned route."
      - "The exact production schema directly contains `items: { not: {} }`, matching the documented unsupported keyword class."
    falsification_test: "If an outbound schema produced without `not` still fails for the same schema-compatibility reason, or if the current schema does not derive `not` from `z.never()`, the hypothesis is wrong."
    fix_rationale: "Use an OpenAI-supported item schema while retaining `.max(0)` so the serialized provider schema is compatible and local Zod parsing still rejects every non-empty relationship-effects array."
    blind_spots: "No post-fix paid provider call will be repeated; verification is offline against the exact generated schema plus the existing route/provider tests."
    candidate_causes:
      - "code: the Zod `never` item type serializes to unsupported JSON Schema."
      - "environment: OpenAI's strict Structured Outputs subset rejects `not`, unlike local Zod parsing."
    and_gate: "no — the unsupported keyword in the production outbound schema alone accounts for the deterministic provider rejection; route, model availability, and fallback behavior were independently eliminated."
- tdd_checkpoint:
    test_file: tests/unit/openrouter-provider.test.ts
    test_name: emits an OpenAI-compatible zero-item relationship schema
    status: green
    failure_output_before_fix: "Expected the serialized response schema not to contain `not`; received `proposedRelationshipEffects: { maxItems: 0, type: array, items: { not: {} } }`."

## Evidence

- timestamp: 2026-07-23
  observation: Human verification accepted the completed offline RED→GREEN regression, controlled revert/reapply, adjacent provider tests, typecheck, lint, and diff checks as proportionate verification; paid live/provider calls were explicitly deferred.
  implication: The accepted guardrail closes this debug session without repeating a paid call, while native GPT-4o confirmation remains an explicit future admission check.
- timestamp: 2026-07-23
  observation: The final scoped `git diff --check` passed, and status still showed the pre-existing `next-env.d.ts` modification and untracked `.codex` content untouched.
  implication: The fix/test diff is clean and did not overwrite user-owned work.
- timestamp: 2026-07-23
  observation: The complete direct provider test file passed 4/4 tests after the fix.
  implication: Adjacent routing, metadata, and reasoning-budget provider behavior remains intact.
- timestamp: 2026-07-23
  observation: `tsc --noEmit` passed.
  implication: The production and regression-test changes are type-safe.
- timestamp: 2026-07-23
  observation: Biome lint passed on both changed files with no fixes required.
  implication: The edits conform to repository static style and lint rules.
- timestamp: 2026-07-23
  observation: After reapplying `z.string()`, the exact regression passed again.
  implication: Revert-and-reconfirm is complete: the bug returned on revert and disappeared on reapplication.
- timestamp: 2026-07-23
  observation: With only the production line reverted to `z.never()`, the focused regression returned to RED at the exact forbidden-`not` assertion.
  implication: The guardrail confirms the bug causally returns without the fix and is not masked by the new test or environment.
- timestamp: 2026-07-23
  observation: The scoped production diff is a one-line substitution with no behavior deletion or short-circuit; the test diff adds the outbound-schema and zero/singleton boundary checks.
  implication: The no-op/deletion guardrail passes and the fix remains minimal.
- timestamp: 2026-07-23
  observation: No Stryker binary or configuration is present in the project.
  implication: The automated mutation signal is unavailable and must be recorded as skipped; revert-and-reconfirm remains applicable.
- timestamp: 2026-07-23
  observation: After replacing only `z.never()` with `z.string()`, the focused regression passed.
  implication: The wire schema is free of `not`, retains `maxItems: 0`, accepts the empty boundary, and rejects the singleton boundary under local Zod validation.
- timestamp: 2026-07-23
  observation: Local Zod serialization showed `z.unknown()` emits unconstrained `items: {}`, `z.string()` emits `items: { type: string }`, and a strict empty object emits an object schema; all retained `maxItems: 0`.
  implication: `z.string()` is the smallest explicit supported item schema and the zero-item bound—not the unreachable item type—continues to enforce the local contract.
- timestamp: 2026-07-23
  observation: The focused offline regression failed at the exact assertion forbidding `not`; its output showed `proposedRelationshipEffects` still had `maxItems: 0` and `items: { not: {} }`.
  implication: The test reproduces the root-cause contract defect without a paid provider call and distinguishes compatibility from the zero-item bound.
- timestamp: 2026-07-23
  observation: `pnpm exec vitest` did not invoke the test runner because the local pnpm wrapper reported `packages field missing or empty`.
  implication: This is a tooling-entrypoint issue, not evidence about the regression; use the already-installed Vitest binary directly.
- timestamp: 2026-07-23
  observation: Minimal unstructured GPT-4o request returned HTTP 200 through the pinned OpenAI route.
  implication: Model availability and route selection are working.
- timestamp: 2026-07-23
  observation: Trivial strict structured-output schema returned HTTP 200.
  implication: GPT-4o supports Structured Outputs.
- timestamp: 2026-07-23
  observation: The exact production schema returned HTTP 400 and contains `items: { not: {} }`.
  implication: The unsupported `not` keyword is the compatibility failure.

## Eliminated

- hypothesis: GPT-4o does not support Structured Outputs.
  reason: A trivial strict schema succeeded and the official model documentation lists support.
- hypothesis: OpenRouter routed to the wrong upstream or used fallback.
  reason: Diagnostics verified the direct pinned OpenAI route on attempt one with fallback disabled.

## Resolution

- root_cause: The production Zod schema uses `z.never()` as an array item type, which serializes to the unsupported strict JSON Schema keyword `not`; GPT-4o rejects the schema before generation.
- fix: Replaced the unreachable `z.never()` item schema with the supported concrete `z.string()` schema while preserving `.max(0)` as the actual zero-item constraint.
- verification:
    target_test: { result: pass }
    mutation_check: { result: skipped, reason_if_skipped: "No Stryker binary or configuration is present.", mutant_killed: null }
    no_op_deletion: { result: pass, deletion_justified_by_rca: false }
    adjacent_tests: { result: pass, suites_run: ["tests/unit/openrouter-provider.test.ts (4/4)", "tsc --noEmit", "Biome lint on both changed files", "git diff --check"] }
    revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
    native_provider_confirmation: { result: deferred, reason: "Paid live/provider calls are outside the approved scope; confirm in a separately approved GPT-4o admission run." }
    guardrail_verdict: accepted
- files_changed:
    - src/features/world/generation/openrouter-resident-turn-provider.ts
    - tests/unit/openrouter-provider.test.ts
- oracle_type: specified

## Prevention

- causal_branches:
    - code: The zero-item relationship-effects contract used `z.never()` as its item type; Zod serialized that type as `items: { not: {} }`, so an implementation detail intended only to make items unreachable leaked into the provider-facing schema.
    - environment_contract: OpenAI strict Structured Outputs accepts only a subset of JSON Schema and rejects `not`; local Zod validation correctly enforced the empty-array behavior but did not exercise that provider compatibility boundary.
- and_gate: No additional route, fallback, or model-availability condition was required; the unsupported keyword alone deterministically caused the schema rejection.
- why_not_caught: No offline test inspected the exact serialized production response schema for OpenAI strict-schema compatibility; the admission matrix exposed the issue only when it reached the provider.
- recurrence_guard: The regression `tests/unit/openrouter-provider.test.ts` test `emits an OpenAI-compatible zero-item relationship schema` asserts that the exact outbound schema contains no `not`, retains `maxItems: 0`, accepts the empty boundary, and rejects a singleton relationship effect.
