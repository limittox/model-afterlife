---
status: resolved
trigger: "Temporarily expose sufficient local Gemini error detail to identify and fix the repeated generation-check-failed result, using exactly one bounded Gemini-only diagnostic call and never exposing credentials"
created: 2026-07-24
updated: 2026-07-24T09:58:54+10:00
---

# Debug Session: Gemini live error detail

## Symptoms

- expected_behavior: One Gemini-only diagnostic generation reveals the precise failing local/provider boundary, after which the confirmed defect is fixed and verified without running another full admission matrix.
- actual_behavior: Two separate one-shot admission matrices stopped on Gemini's first sample with the catch-all `generation-check-failed`, including after the approved-claim context defect was fixed.
- error_messages: `ResidentAdmissionError` for `gemini-2.5-pro` via approved upstream `google-ai-studio`, sanitized code `generation-check-failed`; current admission accounting is 16/43 with 27 calls remaining.
- timeline: The first Gemini failure occurred at 13/40 cumulative. An offline claim-context defect was reproduced and fixed in `914bbc3`, but the next clean matrix stopped identically and advanced accounting to 16/43.
- reproduction: Add temporary or typed local diagnostic observability, then make exactly one Gemini-only generation request using the production provider/profile and a bounded neutral canary. Capture error name, message, cause chain, stack location, and metadata-field presence sufficient to isolate the defect. Never print or persist the API key, authorization headers, full prompt, source text, complete output body, or raw HTTP request/response. Do not run the full matrix, retry, fall back, substitute a route/model/provider, or make any second provider call.

## Current Focus

- hypothesis: Resolved and human-verified: Gemini 2.5 Pro's default dynamic thinking and the local 180-token total output cap jointly exhausted the response before a `stop` finish, so AI SDK v7 left structured output unresolved and `result.output` threw `AI_NoOutputGeneratedError`.
- test: Human confirmation received after the accepted offline fix-acceptance guardrail; resolved session and prevention summary archived.
- expecting: Commit only the verified fix, regression tests, accurate 17/43 accounting artifacts, resolved session, and knowledge-base entry.
- next_action: Stage the explicit allowlist, inspect the staged diff, and create the scoped atomic commit while leaving `next-env.d.ts` and `.codex/` unstaged.
- bug_class: bohrbug
- reasoning_checkpoint:
    hypothesis: "Gemini 2.5 Pro's mandatory/default dynamic thinking causes a non-stop finish under the profile's 180-token total cap, and AI SDK v7 therefore leaves `Output.object` unresolved and throws `AI_NoOutputGeneratedError`."
    confirming_evidence:
      - "The sole live diagnostic deterministically threw `AI_NoOutputGeneratedError` at `result.output` before local schema, claim, route-metadata, or cost checks."
      - "Installed AI SDK source resolves structured output only for finish reason `stop`; its output getter throws this exact error when unresolved."
      - "Official Google documentation says Gemini 2.5 Pro uses dynamic thinking by default with a minimum explicit thinking budget of 128 tokens; OpenRouter documents reasoning tokens as output tokens, while this profile caps all output at 180."
    falsification_test: "The hypothesis would be false if Gemini already sent an explicit bounded thinking budget with adequate total headroom, or if the live error occurred after a `stop` finish with a parsed result; source and profile inspection show neither."
    fix_rationale: "Reserve Gemini's documented minimum 128-token thinking budget within the existing bounded 1,024-token reasoning-model envelope, exclude returned reasoning, and classify `AI_NoOutputGeneratedError` explicitly without relaxing route, model, schema, grounding, or safety validation."
    blind_spots: "The one-shot diagnostic accessed the throwing output getter before capturing the raw finish reason or usage, and no post-fix live call is authorized; verification must therefore remain offline and causal."
    candidate_causes:
      - "config: Gemini is incorrectly assigned the 180-token non-reasoning profile with no explicit thinking budget."
      - "environment/model: Gemini 2.5 Pro performs mandatory/default dynamic thinking whose tokens count against the output limit."
      - "data: the neutral canary could theoretically trigger a filter, but repeated identical behavior and the absence of a content-filter classification make this branch inconsistent with the observed model-specific configuration."
    and_gate: "yes — the failure requires both Gemini's reasoning-token behavior and the local undersized/unbounded reasoning profile; either a non-reasoning model or adequate explicitly bounded headroom avoids this failure class."
- tdd_checkpoint:

## Constraints

- The user explicitly authorized temporary diagnostic logging and asked to identify and tackle the actual issue.
- The existing cumulative cap remains 43. Count the diagnostic conservatively as one call, so accounting may advance from 16/43 to at most 17/43.
- No full admission matrix is authorized in this debug session.
- No secrets, authorization headers, complete prompts, full response bodies, or raw HTTP payloads may enter chat, git, debug artifacts, terminal output, or test fixtures.
- Preserve user-owned `next-env.d.ts` and `.codex/` changes.

## Evidence

- timestamp: 2026-07-24T01:05:00+10:00
  checked: Git worktree and `.planning/STATE.md`
  found: Accounting remains 16/43 with 27 calls remaining; only user-owned `next-env.d.ts`, untracked `.codex/`, and this debug file are dirty.
  implication: The required pre-call accounting update has not yet occurred, and unrelated user changes must remain untouched and unstaged.
- timestamp: 2026-07-24T01:08:00+10:00
  checked: Knowledge-base Phase 0 recall
  found: Exact prior match `gemini-generation-check` attributed the same code to a non-first approved Gemini claim omitted from the canary; the fix is present and the live failure recurred afterward.
  implication: Treat the prior cause as a tested candidate, but recurrence after its fix points to another independent boundary.
- timestamp: 2026-07-24T01:09:00+10:00
  checked: Gemini provider, canary, metadata, and focused test implementations
  found: `runAdmissionCanaries` collapses unrecognized top-level errors to `generation-check-failed`; the production provider can fail during SDK generation, local Zod parsing, approved-claim membership, OpenRouter metadata validation, or missing cost, while the Gemini fixture supplies a complete happy-path response.
  implication: A sanitized cause-chain diagnostic can distinguish these boundaries without capturing prompt, output, or raw response data.
- timestamp: 2026-07-24T01:09:30+10:00
  checked: Phase 1.25 SBFL preconditions
  found: Focused tests exist, but there is no known failing offline test or per-test pass/fail coverage spectrum yet.
  implication: SBFL is skipped; deterministic working-backwards inspection and the one bounded live diagnostic are the appropriate route.
- timestamp: 2026-07-24T01:11:00+10:00
  checked: Focused Gemini/provider/admission offline baseline
  found: Five focused files passed with 40/40 tests.
  implication: Existing tests model only accepted shapes and do not reproduce the live failure.
- timestamp: 2026-07-24T01:12:00+10:00
  checked: Installed AI SDK retry and error implementations
  found: With `maxRetries: 0`, the first failure is rethrown directly; structured-output failures use `AI_NoObjectGeneratedError`, which the admission classifier already recognizes.
  implication: `generation-check-failed` is unlikely to be retry wrapping and remains consistent with an ordinary local error such as `provenance-incomplete`.
- timestamp: 2026-07-24T01:14:13+10:00
  checked: Temporary value-free diagnostic hook and one-shot runner
  found: Typecheck, focused lint, and 21 focused tests pass; the development API key is present without being printed.
  implication: The runner is ready for the single authorized call after the mandatory accounting-state commit.
- timestamp: 2026-07-24T01:16:07+10:00
  checked: Sole authorized Gemini-only production-profile generation diagnostic
  found: The call failed as `AI_NoOutputGeneratedError` at the provider generation await; no generated result existed, and response, metadata, usage, finish-reason, and text fields were all absent on the error.
  implication: The defect occurs before local Zod, approved-claim, router-metadata, or cost-provenance checks. The call is consumed and accounting is 17/43; no further provider call is permitted.
- timestamp: 2026-07-24T01:18:57+10:00
  checked: Installed AI SDK output resolution and official Gemini/OpenRouter reasoning contracts
  found: AI SDK resolves `Output.object` only on `stop`; Gemini 2.5 Pro defaults to dynamic thinking, its explicit thinking budget minimum is 128, and reasoning tokens count as output tokens. The production profile supplies only 180 total tokens and no reasoning bound.
  implication: The model behavior and local profile form an AND-gated root cause; a bounded reasoning-model profile is required.
- timestamp: 2026-07-24T01:20:24+10:00
  checked: Agent-authored offline regression tests before production fix
  found: Three intended tests failed: Gemini registry policy remained 180/no reasoning, the provider omitted the 128-token reasoning configuration, and `AI_NoOutputGeneratedError` still classified as `generation-check-failed`.
  implication: The tests reproduce the exact configuration and observability defects and are red before the fix.
- timestamp: 2026-07-24T01:22:23+10:00
  checked: Focused regression tests after the minimal fix
  found: Five focused files passed with 28/28 tests, including the exact provider registry mirror and Gemini admission fixture.
  implication: The bounded Gemini reasoning policy and stable sanitized error code are enforced offline; proceed to full regression verification.
- timestamp: 2026-07-24T01:29:30+10:00
  checked: Full offline Vitest run
  found: 142/149 tests passed. Six integration tests timed out at the existing 5-second limit under full parallel load; one resident-admission assertion failed because it still required every non-DeepSeek resident to omit reasoning configuration.
  implication: The stale adjacent assertion must be aligned with the intentional Gemini policy. The timeout-only files require isolated reruns to distinguish load contention from regression.
- timestamp: 2026-07-24T01:34:12+10:00
  checked: Isolated reruns of all seven broad-suite failures
  found: The aligned resident-admission contract passed 3/3. Database seeding passed 3/3, generation job 7/7, scene tracer 1/1, world catch-up 5/5, and world repository 2/2 when run without broad-suite contention; several database cases legitimately require 5.3-10.0 seconds and therefore exceed the repository's default 5-second threshold in this environment.
  implication: The broad failures are separated into one fixed adjacent assertion and six environment-timing failures; no functional regression remains in those flows.
- timestamp: 2026-07-24T01:35:05+10:00
  checked: TypeScript no-emit verification
  found: The new Gemini provider test declared its `generateText` mock with zero parameters but inspected the mock's first recorded argument, yielding TS2493; production code produced no type errors.
  implication: The test double must declare the options parameter it actually receives before static verification can pass.
- timestamp: 2026-07-24T01:36:02+10:00
  checked: Corrected static checks and scoped diff
  found: TypeScript no-emit and Biome lint both pass. `git diff --check` reports no whitespace errors, temporary diagnostic code is absent, and unrelated `next-env.d.ts` plus `.codex/` remain untouched and unstaged.
  implication: The implementation is statically sound and scoped; run the mandatory causal revert/reapply signal before accepting it.
- timestamp: 2026-07-24T01:37:23+10:00
  checked: Causal guardrail with the fix sites temporarily reverted
  found: After reverting Gemini to 180/no reasoning and removing the `AI_NoOutputGeneratedError` classifier, exactly 3/21 focused tests failed: registry policy, provider reasoning options, and sanitized no-output classification. The remaining 18 passed.
  implication: The regression tests are causally tied to the fix and detect its removal; restore the exact implementation and verify green.
- timestamp: 2026-07-24T01:39:45+10:00
  checked: Restored fix, focused import-graph suite, static checks, and mutation-tool availability
  found: The causal regression suite returned to 21/21; the expanded registry/provider/admission suite passed 31/31; TypeScript and Biome pass. No Stryker configuration or dependency exists.
  implication: Signals 1 and 5 pass, static and held-out focused coverage is green, and signal 2 must be explicitly skipped. A final full-suite run with an environment-appropriate timeout will close signal 4.
- timestamp: 2026-07-24T01:42:19+10:00
  checked: Full offline suite with the timeout raised only at invocation time
  found: All 27 test files and all 149 tests passed with `--testTimeout=20000`; the repository was not modified to weaken its default timeout.
  implication: The six earlier default-threshold timeouts were local database/load timing artifacts, not functional regressions. All applicable fix-acceptance signals pass.
- timestamp: 2026-07-24T01:42:19+10:00
  checked: Diagnostic-result semantics
  found: The SDK did return a generation result, but the diagnostic helper's first access to its unresolved `result.output` getter threw `AI_NoOutputGeneratedError` before response, usage, finish-reason, or metadata fields could be captured.
  implication: Earlier wording that no result object existed was imprecise; the strong observation is unresolved structured output before any local post-generation validation, while the exact finish reason remains an acknowledged blind spot.
- timestamp: 2026-07-24T09:57:25+10:00
  checked: Human verification checkpoint and final scoped working-tree reconciliation
  found: The user confirmed the issue is fixed. The intended implementation, regression tests, and AI specification are the only task-owned worktree changes; `.planning/STATE.md` already records the sole diagnostic as 17/43 in commit `171c27d`. User-owned `next-env.d.ts` and untracked `.codex/` remain outside the task scope.
  implication: The session may be resolved and archived without another provider, catalog, diagnostic, or admission-matrix call.
- timestamp: 2026-07-24T09:58:54+10:00
  checked: Final accounting state and semantic-memory availability
  found: `.planning/STATE.md` now records the defect as fixed and human-verified offline while preserving 17/43 cumulative calls and the prohibition on further provider work. MemPalace is disabled in project configuration.
  implication: The durable knowledge-base entry is the recurrence record; semantic indexing is explicitly skipped.

## Eliminated

- hypothesis: Gemini generation succeeds but `providerMetadata.openrouter.usage.cost` is missing, causing `provenance-incomplete`.
  evidence: The diagnostic raised `AI_NoOutputGeneratedError` before a result object or result diagnostic existed; no post-generation cost check ran.
  timestamp: 2026-07-24T01:16:07+10:00

## Resolution

- root_cause: Gemini 2.5 Pro was incorrectly treated as a non-reasoning resident with only 180 total output tokens and no explicit thinking budget. Its default dynamic thinking consumes output tokens, producing a non-stop result for which AI SDK v7 intentionally leaves `Output.object` unresolved; accessing `result.output` then throws `AI_NoOutputGeneratedError`, which the admission classifier collapsed to `generation-check-failed`.
- fix: Give Gemini 2.5 Pro a bounded 1,024-token total reasoning/output envelope with the documented minimum 128-token thinking budget and returned reasoning excluded; keep the 240-character local public-line schema unchanged; classify `AI_NoOutputGeneratedError` as sanitized `generation-no-output`; remove all temporary diagnostic code.
- oracle_type: derived
- verification:
    target_test: { result: pass }
    mutation_check:
      result: skipped
      reason_if_skipped: "No Stryker dependency or configuration exists in the repository."
      mutant_killed: false
    no_op_deletion:
      result: pass
      deletion_justified_by_rca: false
    adjacent_tests:
      result: pass
      suites_run:
        - "focused registry/provider/admission suite: 31/31"
        - "full Vitest suite with invocation-only `--testTimeout=20000`: 149/149"
        - "TypeScript `--noEmit`"
        - "Biome lint over 109 files"
    revert_and_reconfirm:
      result: pass
      bug_returned_on_revert: true
      fixed_on_reapply: true
    human_verify:
      result: pass
      confirmed_at: 2026-07-24T09:57:25+10:00
    guardrail_verdict: accepted
- files_changed:
  - src/features/world/domain/types.ts
  - src/features/world/fixtures/launch-residents.ts
  - src/features/world/generation/provider-registry.ts
  - src/features/world/generation/run-admission-canaries.ts
  - tests/unit/admission-error-classification.test.ts
  - tests/unit/openrouter-provider.test.ts
  - tests/unit/provider-registry.test.ts
  - tests/unit/resident-registry.test.ts
  - tests/integration/resident-admission.test.ts
  - .planning/phases/02-grounded-ensemble-and-safe-scenes/02-AI-SPEC.md

## Prevention

- branching_5_whys:
    config:
      - "Gemini was assigned the common 180-token non-reasoning profile because the registry policy distinguished only DeepSeek as reasoning-aware."
      - "That assignment remained possible because the profile types and fixtures allowed Gemini to omit an explicit thinking budget, and an adjacent integration assertion treated every non-DeepSeek resident as non-reasoning."
    model_environment:
      - "Gemini 2.5 Pro uses dynamic thinking by default, with a documented minimum explicit thinking budget of 128 tokens."
      - "Reasoning tokens share the output-token envelope, so a 180-token total cap left insufficient bounded headroom for a structured `stop` result."
    observability:
      - "`AI_NoOutputGeneratedError` was not classified explicitly, so the admission boundary collapsed the causal signal into the generic `generation-check-failed` code."
    and_gate: "The production failure required both Gemini's default reasoning behavior and the undersized local non-reasoning profile; the generic classifier then obscured that joint cause."
- why_not_caught: "No offline gate asserted Gemini's exact reasoning-aware production profile or exercised the AI SDK's non-stop/no-output error. Existing fixtures modeled a successful `stop` response, while the broad resident assertion incorrectly reinforced the assumption that only DeepSeek required reasoning configuration."
- recurrence_guard: "Regression tests `tests/unit/provider-registry.test.ts` (`pins the six approved exact OpenRouter and upstream routes`), `tests/unit/openrouter-provider.test.ts` (`reserves bounded Gemini thinking headroom without exposing reasoning`), `tests/unit/admission-error-classification.test.ts` (`returns a stable code when a non-stop generation has no structured output`), and `tests/integration/resident-admission.test.ts` (`records exactly five sanitized samples for every exact resident`) now enforce the 1,024/128-token Gemini policy and sanitized `generation-no-output` classification."
