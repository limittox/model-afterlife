---
status: resolved
trigger: "Claude Sonnet 4.5 live admission returned model-identity-mismatch after a successful response; approve the narrow requested-alias-or-canonical top-level identity rule while preserving strict canonical route evidence"
created: 2026-07-23
updated: 2026-07-23T13:12:30Z
---

# Debug Session: Claude alias identity gate

## Symptoms

- expected_behavior: A successful `anthropic/claude-sonnet-4.5` request is admitted when OpenRouter proves the selected endpoint is the exact canonical `anthropic/claude-4.5-sonnet-20250929` model on Anthropic, direct, first attempt, with no fallback or material pipeline.
- actual_behavior: The live matrix stops on Claude's first sample with sanitized code `model-identity-mismatch` before the selected endpoint metadata can be accepted.
- error_messages: `ResidentAdmissionError` for resident `claude-sonnet-4.5`, upstream `anthropic`, code `model-identity-mismatch`, calls consumed `2`.
- timeline: First observed after the structural Anthropic wire-schema fix allowed Claude generation to complete. The one authorized matrix stopped after GPT-4o ordinal one and Claude ordinal one.
- reproduction: Run the exact Phase 02 admission matrix. The OpenRouter provider returns a successful Claude response whose top-level `model` value does not equal the profile's canonical slug, causing `validateOpenRouterMetadata` to reject before validating the canonical selected endpoint.

## Current Focus

- bug_class: bohrbug
- pattern_match: Data Shape / API Contract — the top-level response model and canonical route model are distinct evidence fields with different allowed identities.
- confirmed_root_cause: The top-level response identity predicate accepted only `profile.canonicalModelId`, conflating the response label with the separately validated canonical selected route.
- outcome: The exact requested alias or canonical ID is accepted only at the top-level response boundary; every canonical route-evidence gate remains strict.
- next_action: Archive this session and append the resolved pattern to the debug knowledge base.

## Evidence

- timestamp: 2026-07-23
  observation: Commit `a8c0bc7` contains exactly the validator and regression-test files; `next-env.d.ts` and untracked `.codex/` remain outside the commit.
  implication: User-owned workspace changes were preserved and the code/test fix is atomic.
- timestamp: 2026-07-23
  observation: `.planning/STATE.md` remains unchanged at the Plan 02-02 checkpoint with 10/38 cumulative calls consumed and 28 authorized calls remaining.
  implication: Call accounting and checkpoint state were preserved; no live admission matrix, provider generation, OpenRouter request, or diagnostic call was made during this fix.
- timestamp: 2026-07-23
  observation: Biome lint passed across 108 files, TypeScript no-emit typecheck passed, and all 112 unit tests passed across 15 files.
  implication: The fix is statically valid and introduces no detected unit regression.
- timestamp: 2026-07-23
  observation: Reverting only the source predicate restored the exact one-test alias failure; reapplying the predicate returned the focused suite to 19 of 19 passing.
  implication: The fix is causally responsible for resolving the reproduced bug, satisfying revert-and-reconfirm.
- timestamp: 2026-07-23
  observation: The focused metadata suite plus the provider-caller and sanitized-error-classification suites passed 36 of 36 offline tests.
  implication: Adjacent import-graph behavior remains intact; no provider, OpenRouter, admission matrix, or live diagnostic call was made.
- timestamp: 2026-07-23
  observation: The source diff only broadens one exact allowlist predicate and updates its error wording; it does not delete or bypass validation, and all endpoint, provider, strategy, attempt, generation, pipeline, and fallback checks are unchanged.
  implication: The no-op/behavior-deletion guardrail passes.
- timestamp: 2026-07-23
  observation: No Stryker dependency or configuration exists in the repository.
  implication: The mutation signal is skipped explicitly per the guardrail degradation rule; target boundaries and revert/reapply causality carry the proof.
- timestamp: 2026-07-23
  observation: Direct test importers are the focused metadata suite, the mocked OpenRouter provider suite, and sanitized admission-error classification.
  implication: Those are the adjacent offline suites required before acceptance.
- timestamp: 2026-07-23
  observation: After the minimal predicate change, the focused suite passed all 19 tests, including requested-alias acceptance, canonical acceptance, unrelated rejection, mutable/latest rejection, and existing strict-route cases.
  implication: The target-test guardrail signal passes and the specified identity boundary is enforced.
- timestamp: 2026-07-23
  observation: The agent-authored focused suite ran 19 cases: 18 passed and only `accepts the exact approved requested alias as the top-level response model` failed with `model-identity-mismatch` at `openrouter-metadata.ts:102`.
  implication: The hypothesis is directly reproduced and isolated; canonical top-level identity still passes, while unrelated and mutable/latest IDs are rejected.
- timestamp: 2026-07-23
  observation: In the failing fixture, metadata.requested is the exact requested alias, endpoint and attempt model are the canonical slug, provider is Anthropic, strategy is direct, attempt is one, generation ID is nonblank, and pipeline is empty.
  implication: Malformed route evidence, fallback, substitution, missing generation identity, and pipeline transformation are not contributing causes.
- timestamp: 2026-07-23
  observation: The first focused RED attempt did not execute Vitest; `pnpm exec vitest ...` exited with `packages field missing or empty`.
  implication: This is a test-runner invocation/configuration issue, not evidence for or against the validator hypothesis; no behavior change has been made.
- timestamp: 2026-07-23
  observation: `validateOpenRouterMetadata` contains one top-level check, `responseModelId !== profile.canonicalModelId`, but separately requires the selected endpoint and any supplied attempt model to equal `profile.canonicalModelId`.
  implication: Allowing the exact approved requested alias at only the top-level boundary does not relax canonical route proof.
- timestamp: 2026-07-23
  observation: The Claude profile is the relevant boundary case: requested `anthropic/claude-sonnet-4.5` differs from canonical `anthropic/claude-4.5-sonnet-20250929`; the existing focused test fixture uses GPT-4o, whose requested and canonical IDs are identical.
  implication: Existing tests cannot distinguish requested-alias acceptance from canonical-only acceptance, explaining why the defect passed the unit gate.
- timestamp: 2026-07-23
  observation: The focused suite has no failing test yet, so spectrum-based fault localization is inapplicable; direct deterministic reproduction at the isolated validator boundary is the routed Bohrbug technique.
  implication: A single-file regression can establish the exact divergence without live provider calls or confounding higher layers.
- timestamp: 2026-07-23
  observation: The debug knowledge base has related OpenRouter metadata and provider-schema resolutions but no prior alias-versus-canonical top-level identity resolution.
  implication: Prior metadata defects confirm this boundary needs focused offline regression coverage, but they do not establish the current root cause.
- timestamp: 2026-07-23
  observation: The live matrix invoked exactly once and stopped on fresh call two at Claude Sonnet 4.5 with `model-identity-mismatch`; no result was persisted.
  implication: The structural-output request now succeeds, and the remaining failure is inside local response identity validation.
- timestamp: 2026-07-23
  observation: The public OpenRouter model lookup resolves requested ID `anthropic/claude-sonnet-4.5` to canonical slug `anthropic/claude-4.5-sonnet-20250929`.
  implication: Requested alias and canonical concrete identity are both approved values but represent different layers of evidence.
- timestamp: 2026-07-23
  observation: `validateOpenRouterMetadata` checks `responseModelId === canonicalModelId` before separately requiring the selected endpoint and optional attempt model to equal the canonical slug.
  implication: The top-level check duplicates the canonical endpoint gate and rejects an exact approved alias before stronger route evidence is considered.

## Eliminated

- hypothesis: The Claude provider profile is misconfigured so the requested alias and canonical ID cannot be distinguished.
  reason: The registry contains the exact distinct approved values and the regression imports that production profile directly.
- hypothesis: The failure requires malformed endpoint, provider, attempt, strategy, generation, or pipeline evidence in addition to the top-level alias.
  reason: The focused regression holds every one of those fields at its valid strict value and still reproduces solely when the top-level model changes from canonical to the requested alias.
- hypothesis: OpenRouter silently redirected to an arbitrary model or provider.
  reason: This has not been established; the sanitized failure occurs at the earlier top-level response-model comparison. The proposed fix continues to reject anything outside the exact approved requested/canonical pair and retains strict canonical route validation.

## Resolution

- root_cause: `validateOpenRouterMetadata` conflates two evidence layers by requiring the top-level `responseModelId` to equal only `canonicalModelId`; for an approved aliased profile, OpenRouter may report the exact `requestedModelId` at the top level while separately proving the canonical model and provider in selected-endpoint and attempt metadata.
- oracle_type: specified — the approved contract explicitly permits exactly the requested or canonical top-level ID and rejects every other identity.
- fix: Changed only the top-level response identity condition to accept exact equality with `profile.requestedModelId` or `profile.canonicalModelId`; canonical endpoint and attempt checks remain unchanged.
- verification:
    target_test: { result: pass, suite: "tests/unit/openrouter-metadata.test.ts", tests: "19/19" }
    mutation_check: { result: skipped, reason_if_skipped: "No Stryker dependency or configuration is present.", mutant_killed: null }
    no_op_deletion: { result: pass, deletion_justified_by_rca: false }
    adjacent_tests: { result: pass, suites_run: ["tests/unit/openrouter-provider.test.ts", "tests/unit/admission-error-classification.test.ts"], tests: "36/36 including target suite" }
    revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
    static_checks: { lint: "pass (108 files)", typecheck: "pass", unit_tests: "pass (112/112)" }
    guardrail_verdict: accepted
    live_provider_call: { result: not_run, reason: "Explicit offline-only constraint; Plan 02-02 checkpoint and call accounting preserved." }
    semantic_index: { result: skipped, reason: "MemPalace CLI is unavailable; knowledge-base.md remains the durable fallback." }
    commit: a8c0bc7
- files_changed:
  - src/features/world/generation/openrouter-metadata.ts
  - tests/unit/openrouter-metadata.test.ts

## Prevention

- five_whys:
  - code_branch:
    - The validator required the canonical slug in the top-level response label.
    - That requirement duplicated the stronger canonical selected-endpoint and attempt checks instead of modeling the top-level label as an exact requested-or-canonical union.
    - The duplication appeared correct for five profiles because their requested and canonical IDs are identical.
  - test_data_branch:
    - The focused metadata fixture used GPT-4o, whose requested and canonical IDs are the same.
    - Therefore the suite could not distinguish canonical-only behavior from the intended two-value allowlist.
    - No boundary fixture selected the one launch profile whose approved alias and canonical slug differ.
- why_not_caught: The existing unit gate exercised only a profile with identical requested and canonical IDs, so it had no observable alias boundary.
- recurrence_guard: `tests/unit/openrouter-metadata.test.ts` now uses the production Claude profile to accept the exact requested alias and canonical ID while rejecting an unrelated model and `anthropic/claude-sonnet-4.5:latest`; the existing route tests continue to enforce canonical endpoint/provider/attempt evidence and no fallback or pipeline transformation.
