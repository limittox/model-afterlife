---
status: resolved
trigger: "keep going"
created: 2026-07-23
updated: 2026-07-23T21:42:59+10:00
---

# Debug Session: OpenRouter optional attempts metadata

## Symptoms

- expected_behavior: A successful direct first-attempt response from the exact approved model and upstream is admitted when OpenRouter supplies all stable routing-summary evidence.
- actual_behavior: GPT-4o passed model, direct-route, first-attempt, pipeline, and selected-endpoint checks but failed with `route-attempt-mismatch`.
- error_messages: Sanitized admission error `route-attempt-mismatch`; the exact optional `attempts` payload was deliberately discarded.
- timeline: Discovered on the first fresh GPT-4o sample after fixing the Structured Outputs schema.
- reproduction: Validate successful router metadata whose stable summary has `strategy: direct`, `attempt: 1`, and exactly one approved selected endpoint while the optional `attempts` array is omitted.

## Current Focus

- hypothesis: Confirmed — the validator incorrectly required OpenRouter's optional `attempts` detail even though the stable top-level attempt and selected-endpoint fields already proved the required first direct route.
- test: Completed offline RED-to-GREEN regression, strict negative boundaries, adjacent suites, static checks, and revert/reapply proof.
- expecting: Resolved at the code-contract level; native provider admission confirmation is deferred to a separately authorized rerun.
- next_action: Archive the resolved session and commit only the scoped fix, regression test, and debug records.
- bug_class: Bohrbug (deterministic data-shape/API-contract mismatch).
- reasoning_checkpoint:
  hypothesis: The omitted optional `attempts` property causes `route-attempt-mismatch` because the validator's final predicate treats `undefined` as invalid even after stable route-summary identity checks pass.
  confirming_evidence:
    - Source parsing declares `attempts` optional, while lines 120-123 unconditionally require an exact singleton record.
    - The agent-authored offline regression fails only for omitted `attempts` at that branch; the other 14 focused cases pass, including all contradictory present-array boundaries.
  falsification_test: The hypothesis would be false if removing only `attempts` failed at an earlier gate, if the validator already accepted it, or if guarding the detail predicate on presence did not make that exact regression pass.
  fix_rationale: Conditioning strict detail validation on property presence implements the documented optionality while preserving every stronger route-summary gate and every exact check for a supplied attempt record.
  blind_spots: No live provider call will be made, so this verifies the documented/sanitized metadata shape and local admission behavior but not a new upstream sample.
  candidate_causes:
    - code: The validator conflates omitted optional detail with contradictory supplied detail.
    - config: An approved provider/model profile mismatch could produce a nearby admission rejection, but the observed sample and regression pass those unchanged gates.
  and_gate: No; omitted `attempts` alone deterministically reproduces the failure with valid code, configuration, and all stable routing evidence.
- tdd_checkpoint:
  status: green
  test_file: tests/unit/openrouter-metadata.test.ts
  test_name: accepts an omitted optional attempts array after stable direct-route evidence passes
  failure_output: RED was OpenRouterIdentityError at openrouter-metadata.ts:125; GREEN is 15 passed.

## Evidence

- timestamp: 2026-07-23
  observation: The fresh GPT-4o sample passed metadata parsing, exact request/model checks, `strategy: direct`, top-level `attempt: 1`, empty pipeline, and exact selected OpenAI endpoint before failing at the `attempts` validation branch.
  implication: The provider call reached the exact approved route and the remaining failure is isolated to optional attempt-detail handling.
- timestamp: 2026-07-23
  observation: OpenRouter documents `attempts` as an optional field for per-attempt provider/model/status detail when the router retried against fallbacks.
  implication: Absence of the field on a successful first-attempt response is valid API behavior.
- timestamp: 2026-07-23
  observation: The current validator requires `metadata.attempts?.length === 1` unconditionally.
  implication: Local validation is stricter than the documented provider contract.
- timestamp: 2026-07-23
  observation: The debug knowledge base has no prior optional-router-metadata match; its only entry concerns strict Structured Outputs schema serialization.
  implication: No known-pattern shortcut applies to this distinct admission bug.
- timestamp: 2026-07-23
  observation: `OpenRouterMetadataSchema` declares `attempts` optional, but validation later rejects anything other than an exact singleton array after the requested model, direct top-level attempt, response model, pipeline, and selected endpoint checks.
  implication: The parser and validator implement conflicting optionality semantics at a deterministic branch.
- timestamp: 2026-07-23
  observation: Existing focused tests cover valid singleton attempts and surrounding route gates, but do not cover omitted attempts or contradictory present attempt arrays explicitly.
  implication: A specified-oracle regression can reproduce the defect offline and preserve strict validation when details are supplied.
- timestamp: 2026-07-23
  observation: SBFL skipped because the focused suite has no failing regression yet and therefore no failing/passing per-test spectrum to rank.
  implication: Direct branch isolation from the sanitized error and complete source trace is the appropriate localization evidence.
- timestamp: 2026-07-23
  observation: `pnpm exec vitest run tests/unit/openrouter-metadata.test.ts` exited before Vitest with `packages field missing or empty`.
  implication: This invocation cannot establish RED; use the repository's installed Vitest binary directly and keep the provider offline.
- timestamp: 2026-07-23
  observation: Direct Vitest execution produced exactly 1 failing test and 14 passing tests; the omitted-attempts regression failed at `validateOpenRouterMetadata` line 125 with `OpenRouter attempt evidence does not prove one approved route`.
  implication: The regression is a valid RED reproduction, and contradictory present attempt arrays already remain rejected.
- timestamp: 2026-07-23
  observation: After guarding strict attempt-detail validation on `metadata.attempts !== undefined`, the same focused file passed all 15 tests.
  implication: The minimal predicate change resolves the specified omitted-field contract while preserving strict present-array boundaries.
- timestamp: 2026-07-23
  observation: No Stryker package or configuration exists in the repository.
  implication: Guardrail mutation signal is skipped explicitly; target boundaries and revert/reconfirm must carry causal verification.
- timestamp: 2026-07-23
  observation: The scoped production diff adds a presence guard around the existing strict predicate and neither deletes nor short-circuits surrounding routing identity gates.
  implication: The no-op/behavior-deletion signal passes; the only removed behavior is rejection of a contractually valid omitted optional detail, explicitly justified by the RCA.
- timestamp: 2026-07-23
  observation: Adjacent offline suites passed 28/28 across metadata validation, provider integration, and admission error classification; TypeScript completed with exit 0; changed-file `biome lint` completed with exit 0.
  implication: The fix does not regress its direct import graph or static contracts. A broader `biome check` reported pre-existing formatter drift in both files, while the repository's configured lint-only gate passes.
- timestamp: 2026-07-23
  observation: Reverting only the production presence guard restored exactly 1 failure and 14 passes at the omitted-attempt regression; reapplying the same guard restored all 15 passes.
  implication: The production predicate change is causally necessary and sufficient for the specified local contract behavior.
- timestamp: 2026-07-23
  observation: No live OpenRouter/provider call was made during investigation, RED/GREEN, adjacent verification, or revert/reconfirm.
  implication: Verification is deterministic and offline; end-to-end confirmation in the original provider environment remains the required human checkpoint.
- timestamp: 2026-07-23T21:42:59+10:00
  observation: Human verification accepted the completed offline RED-to-GREEN regression, unchanged strict negative cases, adjacent offline tests, TypeScript/lint checks, and revert/reapply proof as sufficient code-level verification, and explicitly prohibited a provider call in this session.
  implication: The debug session can be resolved and archived; native admission confirmation remains deferred to a separately authorized rerun rather than blocking this scoped fix.
- timestamp: 2026-07-23T21:42:59+10:00
  observation: Project configuration has MemPalace disabled.
  implication: Semantic indexing is skipped explicitly; `.planning/debug/knowledge-base.md` remains the durable recall fallback.

## Eliminated

- hypothesis: GPT-4o used the wrong model or upstream.
  reason: Those checks execute before `route-attempt-mismatch` and passed.
- hypothesis: OpenRouter used fallback or a later successful attempt.
  reason: The stable top-level metadata reported `strategy: direct` and one-indexed `attempt: 1`.

## Resolution

- root_cause: `validateOpenRouterMetadata` declares `attempts` optional at parsing but unconditionally requires a singleton approved attempt record, so valid stable direct-route metadata without optional detail is rejected.
- fix: Validate the exact singleton provider/model/status-200 record only when optional `attempts` detail is present; otherwise rely on the already-passed direct top-level attempt and exact selected-endpoint gates.
- verification:
  target_test: { result: pass }
  mutation_check: { result: skipped, reason_if_skipped: "No Stryker package or configuration is present.", mutant_killed: false }
  no_op_deletion: { result: pass, deletion_justified_by_rca: true }
  adjacent_tests: { result: pass, suites_run: ["tests/unit/openrouter-metadata.test.ts", "tests/unit/openrouter-provider.test.ts", "tests/unit/admission-error-classification.test.ts", "tsc --noEmit", "biome lint changed files"] }
  revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
  human_confirmation: { result: accepted, scope: "offline code-level verification", deferred: "native provider admission confirmation requires a separately authorized rerun" }
  guardrail_verdict: accepted
- files_changed:
  - src/features/world/generation/openrouter-metadata.ts
  - tests/unit/openrouter-metadata.test.ts
- oracle_type: specified

## Prevention

- causal_branches:
  - code: The parser represented `attempts` as optional, but the final validation predicate encoded only the supplied-detail case. The absence case remained indistinguishable from contradictory detail because the predicate did not carry the schema's optionality into admission semantics.
  - data_contract: OpenRouter may omit per-attempt detail for a successful direct first attempt while still returning the stable strategy, top-level attempt, and selected-endpoint evidence. The focused test matrix exercised supplied singleton detail but not the valid omitted-field boundary.
- and_gate: No; the code predicate alone rejected valid omitted detail after every stable routing gate passed. Model/profile configuration was checked and was not a contributing condition.
- why_not_caught: The existing focused metadata unit-test gate did not include the omitted optional-field boundary, even though it covered the valid singleton and surrounding routing checks.
- recurrence_guard: Regression test `tests/unit/openrouter-metadata.test.ts` — `accepts an omitted optional attempts array after stable direct-route evidence passes`, paired with the table-driven `rejects a present %s attempts array` cases for empty, multiple, wrong-provider, wrong-model, and non-200 supplied detail.
