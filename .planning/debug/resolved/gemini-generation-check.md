---
status: resolved
trigger: "Gemini 2.5 Pro live admission stopped with generation-check-failed after the first Gemini sample; diagnose and fix the local generation-check path offline without consuming any remaining provider calls"
created: 2026-07-24
updated: 2026-07-24T00:42:16+10:00
---

# Debug Session: Gemini generation check

## Symptoms

- expected_behavior: The approved Gemini 2.5 Pro response passes the bounded generation-content checks and contributes one of five valid admission samples without relaxing grounding, schema, routing, or safety gates.
- actual_behavior: The one authorized breadth-first admission matrix stopped fail-closed on Gemini 2.5 Pro with sanitized code `generation-check-failed`.
- error_messages: `ResidentAdmissionError` for Gemini 2.5 Pro via approved upstream `google-ai-studio`, code `generation-check-failed`; the matrix consumed 3 fresh calls and 13/40 cumulative admission calls.
- timeline: First observed on 2026-07-23 during the single clean 30-call matrix after the Claude requested-alias identity fix. No successful Gemini admission evidence was persisted.
- reproduction: Trace the production admission classifier and Gemini-specific request/response contract with offline fixtures and focused tests. Do not invoke OpenRouter or any provider, rerun the admission matrix, persist partial live evidence, or consume the remaining 27-call allowance.

## Current Focus

- bug_class: bohrbug
- hypothesis: resolved — the admission canary's `.find` exposed only the first approved resident claim, while the bounded production contract permits all three editorially approved exact-version Gemini claims.
- test: Human verification accepted all three exact-version approved Gemini claims as valid within the bounded admission canary; the offline regression and full automated guardrail remain the verification basis.
- expecting: The archived fix preserves exact claim membership, schema, routing, grounding, and safety gates while leaving live admission accounting unchanged at 13/40.
- next_action: Archived; any future live admission matrix requires separate authorization and must resume from the preserved 13/40 cumulative accounting.
- reasoning_checkpoint:
    hypothesis: `canaryBrief` causes an otherwise valid Gemini result to be rejected because it selects one approved claim with `.find` while the resident has three exact-version approved claims.
    confirming_evidence:
      - The plan requires active-resident, version-scoped approved claims and the Gemini fixture contains exactly three such claims.
      - An offline production-shaped response citing `gemini25-deliberative-reputation` is classified `generation-check-failed` against the current one-claim brief and is accepted when only `allowedFactIds` changes to all three approved Gemini claims.
    falsification_test: The hypothesis would be false if the identical response still failed after only expanding `allowedFactIds` to all three exact approved Gemini claims; the counterfactual accepted it.
    fix_rationale: Build the neutral admission context from all approved claims for the exact resident/version, preserving the existing exact-membership guard and three-claim bound rather than weakening grounding.
    blind_spots: Raw live output was intentionally not persisted and no provider call may be made, so verification is limited to the user-reported approved-content condition plus a production-shaped offline fixture.
    candidate_causes:
      - "code: `canaryBrief` uses `.find` and supplies only one of three approved exact-version claims"
      - "data: Gemini may select a different approved resident claim in its structured `approvedClaimIds`"
      - "environment: missing optional OpenRouter cost could share the same generic code, but it does not explain the reproduced content-dependent counterfactual"
    and_gate: "yes — the observed content failure requires both the underspecified one-claim canary context and a generated approved claim outside that single-item subset"
- tdd_checkpoint:
    test_file: tests/integration/gemini-admission-generation.test.ts
    test_name: admits an exact-version approved Gemini claim from its bounded canary context
    status: green
    failure_output: "RED before fix: ResidentAdmissionError: gemini-2.5-pro via google-ai-studio (generation-check-failed)"

## Evidence

- timestamp: 2026-07-24
  checked: debugger and project skill bootstrap
  found: No configured `gsd-debugger` agent skills were returned, and neither `.codex/skills/` nor `.agents/skills/` exists in the project.
  implication: No additional project-specific skill rules apply to this investigation.
- timestamp: 2026-07-24
  checked: Phase 0 knowledge-base recall
  found: MemPalace MCP and CLI are unavailable; keyword fallback found no existing knowledge-base entry with two or more high-signal symptom tokens (`generation-check-failed`, Gemini 2.5 Pro, google-ai-studio).
  implication: No known-pattern candidate is promoted; investigation proceeds from the local classifier path.
- timestamp: 2026-07-24
  checked: exact source search for `generation-check-failed`
  found: `classifyAdmissionFailure` in `src/features/world/generation/run-admission-canaries.ts` returns `generation-check-failed` for non-object exceptions and as its final fallback; the sample-generation catch wraps that classification in `ResidentAdmissionError`.
  implication: The observed sanitized code identifies the local generation/validation wrapper, not the specific failed predicate; the underlying offline call path must be traced.
- timestamp: 2026-07-24
  checked: complete admission runner and focused tests
  found: The wrapped path increments call accounting, calls `OpenRouterResidentTurnProvider.generateTurn`, requires `provenance.usage.cost`, builds a raw sample, then calls `validateAdmissionSample`; the observed `callsConsumed=3` deterministically places the failure at Gemini ordinal 1 after GPT-4o and Claude ordinal 1. Existing integration coverage only exercises an invalid routing strategy and does not reproduce a Gemini output/content boundary.
  implication: The failure is a Bohrbug candidate in the first Gemini sample path, and the missing regression seam is an offline provider/result fixture rather than admission ordering.
- timestamp: 2026-07-24
  checked: provider, metadata, registry, and admission-sample validation path
  found: Typed routing/identity failures and Zod output failures receive non-generic codes. Once `generateText` returns a structurally valid object, the provider can still throw an ordinary `Error` when an output claim ID is outside `prompts.approvedClaimIds`; the live dependency can also throw an ordinary `Error` when cost provenance is absent. Either ordinary error becomes `generation-check-failed`.
  implication: Candidate causes are now narrowed to two falsifiable local post-generation branches plus a lower-probability unknown SDK error; fixture evidence must distinguish them before any fix.
- timestamp: 2026-07-24
  checked: Gemini fixture and prompt coverage
  found: No persisted Gemini admission response fixture exists. `buildLaunchResidentPrompt` exposes only the current resident's exact, editorially approved claim IDs, while provider tests use GPT-4o or DeepSeek fixtures and never exercise Gemini output. The wire schema deliberately accepts arbitrary claim-ID strings and relies on a post-generation exact-membership guard.
  implication: Existing tests cannot reproduce the live Gemini content boundary; a local provider-shaped Gemini fixture is required before fixing.
- timestamp: 2026-07-24
  checked: canary claim selection and test-runner baseline setup
  found: `historicalClaimsFor` deterministically sorts by `stableOrder`, so Gemini ordinal 1 receives `gemini25-thinking-and-multimodal`, which is exact-scoped and approved. The attempted `pnpm exec vitest` baseline did not run because this pnpm installation reports `packages field missing or empty`.
  implication: Claim selection itself is not the mismatch. Test execution must use the installed Vitest entrypoint; SBFL is skipped for now because there is no failing test spectrum or per-test coverage.
- timestamp: 2026-07-24
  checked: focused offline baseline
  found: Direct Vitest execution passed all 50 focused tests across provider, identity, metadata, error classification, and admission integration. No failing test or per-test coverage spectrum exists, so Phase 1.25 SBFL is skipped.
  implication: The live branch is absent from current tests; the regression must use a production-shaped Gemini fixture rather than changing already-covered generic admission behavior.
- timestamp: 2026-07-24
  checked: installed AI SDK/OpenRouter adapter contracts and provider schema history
  found: AI SDK 7 uses the already-recognized `AI_NoObjectGeneratedError`; the OpenRouter adapter normalizes response `usage.cost` into `providerMetadata.openrouter.usage.cost`, but cost remains optional. Recent fixes only split structural wire constraints from local bounds. No installed-runtime error-name mismatch explains an approved object reaching the generic fallback.
  implication: The provider-version hypothesis is weakened. The ordinary claim-membership error is now the leading code branch; missing cost remains a data/environment alternative to eliminate with the counterfactual and specification.
- timestamp: 2026-07-24
  checked: one-variable offline Gemini counterfactual
  found: The identical production-shaped Gemini response (valid schema, direct Google AI Studio metadata, usage cost present) citing the exact approved claim `gemini25-deliberative-reputation` is rejected with `Error` → `generation-check-failed` when `allowedFactIds` contains only the current stable-order-1 claim, and is accepted when `allowedFactIds` contains all three exact-version approved Gemini claims.
  implication: The content failure mechanism is confirmed independently of provider access, cost, routing, schema, or safety changes. The failure requires the code's one-claim selection and the valid generated selection of another approved resident claim.
- timestamp: 2026-07-24
  checked: TDD RED regression
  found: `tests/integration/gemini-admission-generation.test.ts` failed at Gemini ordinal 1 with the exact `ResidentAdmissionError` code `generation-check-failed` while all provider metadata, cost, schema, and routing fields were valid.
  implication: The automated fixture now reproduces the reported branch before implementation; the minimal fix may proceed.
- timestamp: 2026-07-24
  checked: TDD GREEN regression
  found: After replacing first-claim selection with the full approved resident claim list, the same offline Gemini admission fixture passed (1 file, 1 test).
  implication: The minimal change directly addresses the reproduced cause without modifying output validation or provider routing.
- timestamp: 2026-07-24
  checked: fix-acceptance mutation/no-op/revert signals
  found: Stryker is not installed or configured, so mutation checking is logged as skipped. The production diff expands a filtered approved-claim collection and is not deletion/short-circuit behavior. Scoped revert restored the exact `generation-check-failed` test failure; reapplying restored the pass.
  implication: Applicable guardrail signals 1, 3, and 5 pass; signal 2 is unavailable by documented degradation; adjacent/full gates remain.
- timestamp: 2026-07-24
  checked: full offline verification
  found: Full Vitest passed 27 files / 147 tests; TypeScript `tsc --noEmit` passed; Biome lint checked 109 files with no errors; scoped `git diff --check` passed. No live command or provider endpoint was invoked, no admission result was persisted, and accounting remains 13/40.
  implication: All applicable automated guardrail signals pass offline. A production build was not run because Next may rewrite the user-owned modified `next-env.d.ts`; the full type/lint/test gates cover the changed TypeScript path without risking that file.

- timestamp: 2026-07-24T00:42:16+10:00
  checked: human verification checkpoint
  found: The user approved the recommended fixed scope and confirmed that all three exact-version, editorially approved Gemini claims are valid within the bounded admission canary.
  implication: The approved-content boundary matches the offline regression and minimal fix; the session can be resolved without a provider call, live matrix rerun, partial evidence persistence, or any change to the 13/40 cumulative admission accounting.
- timestamp: 2026-07-24T00:44:17+10:00
  checked: final offline regression and durable recall
  found: The focused offline Gemini integration test passed 1/1 after human confirmation, the resolution entry was appended to `.planning/debug/knowledge-base.md`, and semantic indexing was skipped because `.planning/config.json` explicitly disables MemPalace.
  implication: The recurrence guard is executable and the Markdown knowledge base remains the durable recall path; no provider call or live admission matrix was invoked.

## Eliminated

## Resolution

- root_cause: "`canaryBrief` selected only the first approved resident claim with `.find`; combined with Gemini selecting another exact-version approved resident claim, the post-generation membership guard threw an ordinary error classified as `generation-check-failed`."
- fix: "Changed the neutral admission canary to include every editorially approved claim for the exact resident/version, preserving the existing exact-membership guard and three-claim output bound; added a provider-shaped offline Gemini admission regression."
- verification:
    target_test:
      result: pass
    mutation_check:
      result: skipped
      reason_if_skipped: Stryker is not installed or configured in this repository.
      mutant_killed: null
    no_op_deletion:
      result: pass
      deletion_justified_by_rca: false
    adjacent_tests:
      result: pass
      suites_run:
        - full Vitest suite (27 files, 147 tests)
        - TypeScript tsc --noEmit
        - Biome lint (109 files)
        - scoped git diff --check
    revert_and_reconfirm:
      result: pass
      bug_returned_on_revert: true
      fixed_on_reapply: true
    guardrail_verdict: accepted
    human_checkpoint:
      result: accepted_offline_scope
      approved_claim_scope: all three exact-version editorially approved Gemini claims
      live_provider_call_made: false
      cumulative_admission_calls: 13/40
    environment_notes:
      - No live admission/provider command was run; cumulative admission accounting remains 13/40.
      - Production build skipped to avoid rewriting the user-owned modified next-env.d.ts.
- files_changed:
    - src/features/world/generation/run-admission-canaries.ts
    - tests/integration/gemini-admission-generation.test.ts
- oracle_type: specified

## Prevention

### Branching 5-Whys

- code branch:
  - The valid Gemini output was rejected because its approved claim ID was absent from the canary brief's `allowedFactIds`.
  - The ID was absent because `canaryBrief` used `.find`, reducing the resident's approved exact-version claim set to the first stable-order item.
  - That reduction was possible because the admission context was implemented as a single representative claim even though the generation contract permits up to three approved claim IDs.
  - It persisted because no integration fixture exercised a resident selecting a valid approved claim other than the first stable-order claim.
- data branch:
  - The defect surfaced only when Gemini selected `gemini25-deliberative-reputation` instead of `gemini25-thinking-and-multimodal`.
  - Both IDs are exact-version, editorially approved resident claims, so the generated selection was valid but exposed the underspecified context.
  - The membership guard correctly rejected IDs outside the supplied context; weakening that guard would have obscured the code defect and reduced grounding safety.
- environment/config branch:
  - Missing optional provider cost could produce the same generic `generation-check-failed` classification, but the production-shaped counterfactual supplied valid cost and direct Google AI Studio routing metadata.
  - Provider access and admission accounting were therefore not required to isolate or fix this deterministic local content-boundary defect.
- AND-gate: yes — rejection required both the one-claim canary context and a valid generated selection from the resident's other approved exact-version claims; expanding only the context resolves the combination while preserving every downstream gate.

### Why Not Caught

No integration gate exercised the production Gemini profile with an exact-version approved claim outside the first stable-order item. Existing provider fixtures covered GPT-4o or DeepSeek and therefore could not detect that `canaryBrief` silently narrowed a multi-claim resident contract to one claim.

### Recurrence Guard

The offline regression test `tests/integration/gemini-admission-generation.test.ts` — `admits an exact-version approved Gemini claim from its bounded canary context` — uses production-shaped Gemini routing, cost, schema, and claim data; it proves a non-first approved claim is admitted and asserts that all three exact-version Gemini claim IDs are present in the generated prompt.
