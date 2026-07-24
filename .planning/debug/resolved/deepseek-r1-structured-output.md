---
status: resolved
trigger: "Investigate DeepSeek R1 after its admission samples failed first with provider-timeout and then generation-no-output."
created: 2026-07-24
updated: 2026-07-24T11:11:14+10:00
---

# Resolved Diagnostic: DeepSeek R1 structured-output incompatibility

## Symptoms

- expected_behavior: DeepSeek R1 0528 receives enough time to complete its mandatory reasoning and return a locally validated structured resident turn, while other residents retain the existing 30-second timeout.
- actual_behavior: The post-fix admission matrix passed GPT-4o, Claude Sonnet 4.5, and Gemini 2.5 Pro, then stopped fail-closed when DeepSeek R1 0528 exceeded the provider's shared 30-second total timeout.
- error_messages: Sanitized admission failure code `provider-timeout` for `deepseek/deepseek-r1-0528` via `deepinfra/fp4`.
- timeline: Observed on 2026-07-24 during the first DeepSeek sample in the authorized post-fix admission matrix, with cumulative accounting at 21/47 calls.
- reproduction: Run the live resident admission canary matrix with the exact approved provider profiles; the DeepSeek request is currently bounded by `timeout: { totalMs: 30_000 }` in the shared OpenRouter resident-turn provider.

## Current Focus

- bug_class: compatibility
- known_pattern_candidate: "Reasoning-first models can consume latency or output budget before a strict short `Output.object` response is available."
- hypothesis: "Confirmed at the product boundary: R1 0528 was a poor fit for the short, structured, low-latency resident-turn contract."
- test: "Two bounded live R1 diagnostics plus offline replacement-profile tests."
- expecting: "The failed R1 route remains audit history while a callable superseded hybrid model takes its cast position."
- next_action: "None for this diagnostic. The separately authorized V3.2 compatibility canary passed; the final six-resident admission matrix remains a distinct checkpoint."
- candidate_causes:
    - "model/contract: R1 requires private reasoning while the product requires a short, strict object under a low latency cap."
    - "budget: both increased timeout and explicit reasoning budget experiments failed to produce a structured output."
    - "product fit: V3.2 exposes an explicit non-thinking mode that matches this resident-turn contract."
- and_gate: "yes — the issue required both R1's mandatory reasoning path and the product's strict short-turn contract."

## Prior Focus Archive

- bug_class: bohrbug
- known_pattern_candidate: "`gemini-live-error-detail` — a reasoning model consumed its shared output envelope before `Output.object` could resolve, producing `AI_NoOutputGeneratedError`."
- hypothesis: "Offline evidence cannot distinguish whether DeepInfra ignored the forwarded 512-token reasoning ceiling or honored it and returned another non-`stop` finish reason; increasing the total output envelope now would be an unmeasured policy guess."
- test: "Completed local-only trace of adapter request/response mapping, adapter types, AI SDK output resolution, provider access order, captured endpoint metadata, and sanitized admission classification."
- expecting: "A defensible next step exists only for finish-reason observability: read `finishReason`/`rawFinishReason` before the throwing `output` getter and expose an allow-listed sanitized failure code under a focused offline TDD regression. The available evidence does not justify a specific larger DeepSeek envelope."
- next_action: "Do not make a third live call or enlarge the envelope. If authorized to continue implementation, first add a focused failing regression for sanitized non-stop finish-reason classification, then make the minimal provider/classifier change and run offline gates."
- prior_reasoning_budget_tdd_checkpoint:
    test_file: "tests/unit/openrouter-provider.test.ts"
    test_name: "reserves half of DeepSeek's bounded envelope for structured output"
    status: "green"
    failure_output: "Expected DeepSeek reasoning `{ max_tokens: 512, exclude: true }`; received `{ effort: minimal, exclude: true }` at tests/unit/openrouter-provider.test.ts:398."
- prior_timeout_reasoning_checkpoint:
    hypothesis: "The unconditional `timeout: { totalMs: 30_000 }` in `OpenRouterResidentTurnProvider.generateTurn` aborts DeepSeek R1 0528 because its mandatory reasoning path exceeded 30 seconds."
    confirming_evidence:
      - "The captured live admission failure was sanitized as `provider-timeout` at the shared 30-second limit for exact model `deepseek/deepseek-r1-0528` on `deepinfra/fp4`."
      - "The complete provider implementation selects the exact resident profile before constructing `generateText` options but still sets one unconditional 30,000 ms timeout."
      - "The DeepSeek profile is uniquely identified by resident/model, retains 1,024 output tokens and minimal hidden reasoning, and routing/retry/fallback options are constructed separately."
    falsification_test: "The hypothesis would be false if the offline captured DeepSeek request already received a timeout above 30 seconds, or if the observed live failure occurred before the generation timeout boundary."
    fix_rationale: "Selecting 90,000 ms only for the exact DeepSeek profile changes the causal abort threshold without modifying model identity, provider routing, quantization, retries, fallback, reasoning disclosure, or other residents' 30-second bound."
    blind_spots: "Offline verification can prove request construction and policy isolation, but cannot prove that every future DeepInfra response finishes within 90 seconds; no live calls are authorized for this fix."
    candidate_causes:
      - "code/config: the provider request hard-codes one shared 30-second total timeout instead of selecting a resident-specific timeout policy."
      - "environment: the exact DeepSeek/DeepInfra reasoning request took longer than 30 seconds during admission."
      - "data: the bounded canary prompt or output envelope could inflate latency, but both are already constrained and the timeout abort happened at the shared provider limit."
    and_gate: "yes — the reported timeout requires both the shared 30-second policy and a valid DeepSeek generation whose latency exceeds it; the adjustable root cause is the missing resident-specific timeout selection."

- falsified_reasoning_checkpoint:
    hypothesis: "DeepSeek's mandatory private reasoning is controlled only by qualitative `effort: minimal` inside the same 1,024-token OpenRouter `max_tokens` envelope needed by the structured final object; it returned a non-`stop` result, inferred most plausibly as `length`, and AI SDK therefore left `Output.object` unresolved and threw `AI_NoOutputGeneratedError`."
    confirming_evidence:
      - "The sole post-timeout DeepSeek canary returned sanitized `generation-no-output`, which installed AI SDK source can produce at this boundary only when the final finish reason is not `stop`; stopped invalid JSON would be `AI_NoObjectGeneratedError` instead."
      - "The installed OpenRouter adapter maps the local profile exactly to `max_tokens: 1024` plus `reasoning: { effort: minimal, exclude: true }`, so there is no numeric ceiling reserving capacity for the final object."
      - "The exact DeepSeek/DeepInfra FP4 route and structured-output capability have prior positive direct evidence, while the current canary prompt is bounded to one brief line, all approved claims, no tools, no retries, and no relationship effects."
    falsification_test: "The shared-envelope hypothesis would be disproved by a captured raw finish reason such as `content_filter`, or by an authorized reproduction showing the old effort-only profile stops successfully while the same bounded input fails for a different reason."
    fix_rationale: "Replace only DeepSeek's qualitative effort label with a 512-token private-reasoning ceiling inside the unchanged 1,024-token total envelope. This preserves mandatory reasoning, leaves half the envelope for the bounded structured object, and changes no model, route, quantization, schema, retry, fallback, timeout, or public-text limit."
    blind_spots: "The live helper accessed the throwing output getter before finish reason or usage could be captured, so `length` remains a causal inference. Offline tests can prove request semantics and SDK behavior but cannot prove the next live model response will stop; a separately authorized one-shot verification is still required."
    candidate_causes:
      - "config: DeepSeek uses a qualitative reasoning-effort setting with no numeric sub-budget inside the immutable 1,024-token combined envelope."
      - "environment/model: DeepSeek R1 performs mandatory private reasoning that consumes the same output-token envelope before its final structured answer."
      - "data: the canary prompt or schema could trigger filtering or unusually long reasoning, but it is neutral, bounded, and uses only approved resident context; this remains the main unobserved alternative because raw finish reason is unavailable."
      - "code/dependency: AI SDK intentionally refuses to resolve structured output for non-`stop` results; adapter and SDK behavior are correct but expose the unsafe profile split."
    and_gate: "yes — the failure requires both DeepSeek's mandatory reasoning behavior and the effort-only local profile sharing a finite total envelope; AI SDK's correct non-`stop` output policy turns that combination into the observed error."

## Constraints

- Do not make a live OpenRouter generation or catalog call while implementing this timeout policy.
- Keep retries disabled, fallback disabled, and the exact DeepSeek model/upstream/quantization unchanged.
- Preserve the existing 30-second timeout for every resident except DeepSeek R1 0528.
- Preserve user-owned `next-env.d.ts` and untracked `.codex/` changes.
- Human verification continuation authorizes exactly one DeepSeek R1 0528 generation canary under the existing cumulative cap of 47; 21 calls were consumed before invocation and the reserved call advances accounting to at most 22/47.
- The authorized canary must reuse the immutable approved DeepSeek profile and existing DeepInfra FP4 route evidence, make zero catalog requests, and perform no retry, fallback, substitution, full matrix, or second provider call.
- The 2026-07-24 continuation authorizes exactly one additional DeepSeek R1 0528 generation canary. Existing accounting is 22/47, and the reserved call is conservatively recorded as 23/47 before invocation and capped there afterward.
- This additional canary must use exact `deepseek/deepseek-r1-0528` via `deepinfra/fp4`, `maxOutputTokens: 1024`, reasoning `{ max_tokens: 512, exclude: true }`, total timeout 90 seconds, `maxRetries: 0`, and disabled fallback. It authorizes zero catalog calls, other models/providers, retries, substitutions, full matrices, or second calls.
- Keep the credential, prompts, raw request/response bodies, and model output out of terminal logs and durable artifacts.

## Evidence

- timestamp: 2026-07-24
  checked: Semantic-recall availability and `.planning/debug/knowledge-base.md`.
  found: No MemPalace connector is available in this session, and the durable knowledge base has related OpenRouter admission fixes but no prior DeepSeek timeout-policy resolution.
  implication: There is no known-pattern shortcut to assume; continue with direct code-path evidence and treat the saved hypothesis as unconfirmed.

- timestamp: 2026-07-24
  checked: Production provider and approved resident profile.
  found: Every resident currently receives `timeout: { totalMs: 30_000 }`; DeepSeek is the only mandatory-reasoning R1 resident and already uses hidden minimal reasoning within a 1,024-token output envelope.
  implication: Timeout selection belongs at the resident provider-profile boundary and can be changed without modifying routing, retry, fallback, model identity, or public output policy.

- timestamp: 2026-07-24
  checked: `openrouter-resident-turn-provider.ts`, `provider-registry.ts`, `launch-residents.ts`, and the complete focused provider unit test.
  found: `generateTurn` obtains the exact profile before calling `generateText`, but the call unconditionally uses 30,000 ms. The existing GPT-4o test already specifies the 30,000 ms non-DeepSeek boundary, while the existing DeepSeek test captures the exact request without asserting its timeout.
  implication: A single new assertion in the existing DeepSeek test is a minimal offline reproduction with a specified policy oracle; no production refactor is needed to prove the defect.

- timestamp: 2026-07-24
  checked: Spectrum-based fault localization prerequisites.
  found: The focused suite had no known failing test before the regression assertion, so there was no failing/passing per-test coverage spectrum to rank.
  implication: SBFL is skipped with a recorded reason; deterministic direct reproduction at the request-construction boundary is the appropriate Bohrbug route.

- timestamp: 2026-07-24
  checked: Initial focused-test invocation with `pnpm exec vitest`.
  found: pnpm exited before starting Vitest with `packages field missing or empty`.
  implication: This is a test-runner invocation error, not a valid TDD red result; re-run through the repository's `test` script before touching production code.

- timestamp: 2026-07-24
  checked: Focused DeepSeek provider regression test via local Vitest 4.1.10.
  found: The test failed at the intended policy assertion: expected `timeout.totalMs` 90,000 and received 30,000; eight unrelated tests were skipped by the name filter.
  implication: The offline regression test reproduces the exact request-construction defect and is valid TDD red evidence.

- timestamp: 2026-07-24
  checked: Focused DeepSeek provider regression after the production timeout selection change.
  found: The target test passed (1 passed, 8 skipped) with the exact 90,000 ms assertion.
  implication: The minimal production change makes the previously red specified-oracle test green.

- timestamp: 2026-07-24
  checked: Complete `tests/unit/openrouter-provider.test.ts` after the fix.
  found: All 9 provider tests passed, including the existing GPT-4o and Gemini assertions that retain 30,000 ms and the strict routing/retry/fallback/quantization checks.
  implication: The DeepSeek-only policy does not weaken adjacent non-DeepSeek provider request contracts.

- timestamp: 2026-07-24
  checked: Revert-and-reconfirm guardrail using a targeted line restoration that left user-owned files untouched.
  found: Restoring the original unconditional 30,000 ms timeout made the focused test fail with expected 90,000 versus actual 30,000; reapplying only the profile conditional made the same test pass.
  implication: The production timeout selection change, rather than unrelated working-tree state, causes the regression to disappear.

- timestamp: 2026-07-24
  checked: Scoped production/test diff and mutation-tool availability.
  found: The diff contains one behavior-preserving conditional expansion and two stronger test assertions, with no deletion or short-circuit; `git diff --check` passed. No Stryker dependency or configuration exists.
  implication: The no-op/deletion guard passes; mutation checking must be explicitly skipped because the repository has no configured mutation runner.

- timestamp: 2026-07-24
  checked: TypeScript 6.0.3 project typecheck and Biome lint on both changed source files.
  found: `tsc --noEmit` exited 0 and Biome checked both files with no diagnostics.
  implication: The final reapplied change is type-safe and conforms to repository lint rules.

- timestamp: 2026-07-24
  checked: Final offline adjacent-test set after the exact fix was reapplied.
  found: Vitest passed 3 files and 14 tests across the OpenRouter provider, provider registry, and resident admission contracts.
  implication: The final working-tree state preserves the provider-profile and admission boundaries without making a live OpenRouter request.

- timestamp: 2026-07-24T10:30:55+10:00
  checked: Human-verification continuation authorization and pre-invocation accounting.
  found: Exactly one DeepSeek R1 0528 generation canary is authorized with the existing exact profile and DeepInfra FP4 route evidence; no catalog or other provider call is authorized. Accounting is 21/47 before invocation and the reserved call may advance it only to 22/47.
  implication: The one-call boundary and conservative accounting are durable before invocation; any outcome ends live provider activity for this session.

- timestamp: 2026-07-24T10:34:30+10:00
  checked: Initial local one-shot runner process.
  found: PowerShell stripped JavaScript string quotes, and Node exited with a syntax error before module imports, credential access, dependency construction, or network initialization.
  implication: Zero provider or catalog calls occurred and accounting remains 21/47; correct only the local stdin quoting before spending the sole authorized generation call.

- timestamp: 2026-07-24T10:35:30+10:00
  checked: Sole authorized DeepSeek-only live verification canary.
  found: Sanitized failure code `generation-no-output`; the single generation call was consumed and cumulative accounting is 22/47.
  implication: Stop immediately with no retry, fallback, substitution, catalog request, other provider call, full matrix, offline gate, archive, or commit.

- timestamp: 2026-07-24
  checked: Continuation authorization after the failed live canary.
  found: The same non-terminal session is authorized to resume for offline-only root-cause investigation of `generation-no-output`; no OpenRouter generation or catalog call is authorized, and accounting must remain 22/47.
  implication: Investigate the distinct failure using local code, installed dependency semantics, and offline tests only; any later live verification requires a new checkpoint and separate authorization.

- timestamp: 2026-07-24
  checked: Durable debug knowledge base for no-output precedents.
  found: `gemini-live-error-detail` records the same sanitized `generation-no-output`/`AI_NoOutputGeneratedError` class when reasoning tokens shared and exhausted a too-small total output envelope before `Output.object` resolved; its fix separated total-output and thinking-budget policy while keeping public output bounded.
  implication: Treat shared reasoning/output-token exhaustion as the first known-pattern hypothesis for DeepSeek, but confirm it against the exact DeepSeek profile and installed SDK/provider semantics before changing code.

- timestamp: 2026-07-24
  checked: Working tree and offline symbol inventory.
  found: The prior timeout fix remains limited to `openrouter-resident-turn-provider.ts` and its focused unit test; user-owned `next-env.d.ts` and untracked `.codex/` remain present, and unrelated `.planning/STATE.md` is modified. DeepSeek is configured with `maxOutputTokens: 1024` and `reasoning: { effort: "minimal", exclude: true }`; Gemini uses `maxOutputTokens: 1024` plus an explicit `max_tokens: 128`.
  implication: Preserve all unrelated state. The salient profile difference is that DeepSeek has an effort label but no explicit reasoning-token ceiling inside the shared output envelope.

- timestamp: 2026-07-24
  checked: Complete local provider and admission-canary path.
  found: `generateTurn` passes the DeepSeek profile's reasoning setting into the OpenRouter model, uses `Output.object` with a structural wire schema, caps total output at the profile value, and only performs the stricter local Zod parse after `generateText` returns. The admission classifier maps only SDK `AI_NoOutputGeneratedError` to `generation-no-output`; the canary already supplies all approved resident claims and requests one brief line with no relationship effects.
  implication: The observed code cannot be produced by the local strict schema or claim-membership guard because those execute after SDK output exists and classify differently. Investigation should focus on adapter request mapping and SDK structured-output completion semantics, not the prior Gemini claim-context bug.

- timestamp: 2026-07-24
  checked: Installed `@openrouter/ai-sdk-provider@3.0.0` request construction and type contract.
  found: The adapter maps AI SDK `maxOutputTokens` directly to OpenRouter `max_tokens`, maps model setting `reasoning` unchanged to the top-level OpenRouter `reasoning` field, and maps `Output.object` to strict `response_format: { type: "json_schema" }`. DeepSeek therefore sends `max_tokens: 1024` with effort-only reasoning and no numeric reasoning ceiling. The non-streaming adapter returns reasoning parts separately and adds a text part only when `choice.message.content` is non-empty.
  implication: The repository test currently proves only the high-level settings passed into the adapter, while installed code confirms the exact wire-body relationship. A provider response containing reasoning but no final text would leave AI SDK without text to parse as the structured object.

- timestamp: 2026-07-24
  checked: Installed `ai@7.0.34` `generateText`, `Output.object`, and `NoOutputGeneratedError` implementation.
  found: `generateText` calls the output parser only when the last unified finish reason is exactly `stop`; all other finish reasons leave the resolved output undefined, and the public `result.output` getter then throws `AI_NoOutputGeneratedError`. If a stopped response contains empty, malformed, or schema-invalid JSON, `Output.object` instead throws `AI_NoObjectGeneratedError`.
  implication: Sanitized `generation-no-output` proves a non-`stop` provider result reached AI SDK, not merely an empty or invalid structured body. This eliminates the local schema and prompt membership guards and narrows the causal branch to non-stop finish reasons such as `length` or content filtering.

- timestamp: 2026-07-24
  checked: Local Phase 2 research/specification references and prior live-route notes.
  found: The approved DeepSeek policy intentionally caps combined private reasoning plus final output at 1,024 tokens and excludes reasoning from publication; a prior bounded direct diagnostic proved the same exact DeepSeek model and DeepInfra FP4 route can succeed. The current profile expresses the private portion only as `effort: "minimal"`, not as a numeric sub-budget.
  implication: Model identity, route availability, and structured-output capability have prior positive evidence. A fix should preserve the approved 1,024-token total bound and make the reasoning/public-output split explicit rather than simply inflating the total envelope without a new product decision.

- timestamp: 2026-07-24
  checked: Full resolved Gemini no-output investigation and locked Phase 2 constraints.
  found: Gemini produced the same SDK error at the same `result.output` getter boundary, and the accepted remedy was an explicit numeric reasoning sub-budget inside a 1,024-token total envelope. The exact raw finish reason was also unavailable there. Phase 2 locks DeepSeek's 1,024-token combined bound and public 240-character limit but leaves the planner discretion over the precise bounded context/token split.
  implication: An explicit DeepSeek reasoning sub-budget is consistent with the locked product boundary and the established neighboring fix pattern; the remaining work is to choose a defensible numeric bound and prove the current effort-only configuration lacks deterministic output headroom.

- timestamp: 2026-07-24
  checked: Phase 1.25 SBFL prerequisites for the distinct no-output defect.
  found: No focused offline test failed before the agent-authored DeepSeek budget assertion, so there was no failing/passing per-test coverage spectrum to rank.
  implication: SBFL is skipped; the exact request-policy boundary is the deterministic minimal reproduction.

- timestamp: 2026-07-24
  checked: First focused red-test invocation through `pnpm test`.
  found: pnpm exited with `packages field missing or empty` before Vitest started.
  implication: This is a runner invocation failure, not a valid TDD red; re-run through the installed Vitest 4.1.10 entry point without touching production code.

- timestamp: 2026-07-24
  checked: Agent-authored focused DeepSeek reasoning-envelope regression through installed Vitest 4.1.10.
  found: The single target failed at the intended request-policy assertion because the current provider settings supplied qualitative `effort: minimal` instead of the required numeric 512-token reasoning ceiling; eight unrelated tests were skipped.
  implication: This is a valid derived-oracle TDD red for the configuration defect. Production code may now change minimally.

- timestamp: 2026-07-24
  checked: Minimal production/profile implementation.
  found: DeepSeek now uses `reasoning: { max_tokens: 512, exclude: true }` in both immutable registry mirrors while retaining `maxOutputTokens: 1024`; the literal type, exact mirror assertions, and AI contract reflect the same split. No routing, quantization, retry, fallback, timeout, schema, prompt, or public-line setting changed.
  implication: Run the exact previously red test before any broader verification.

- timestamp: 2026-07-24
  checked: Focused DeepSeek reasoning-envelope regression after the profile change.
  found: The exact previously red test passed (1 passed, 8 skipped).
  implication: TDD is green; proceed to the multi-signal offline fix-acceptance guardrail.

- timestamp: 2026-07-24
  checked: Focused provider/profile/admission import-graph suite after the fix.
  found: Five files and all 30 tests passed across the OpenRouter provider, provider registry, resident registry, admission contract, and no-output classification.
  implication: The numeric DeepSeek sub-budget preserves adjacent route identity, registry mirrors, admission serialization, and sanitized error handling.

- timestamp: 2026-07-24
  checked: Initial parallel static-check invocation.
  found: Biome `check` reported repository-wide formatting drift in several pre-existing sections of the scoped files; its output also identified the two newly edited reasoning type declarations as safely compactable. The project script's actual quality gate is Biome `lint`, not formatter enforcement.
  implication: Normalize the two task-authored declarations and run the configured lint gate separately; do not bulk-format user code or treat pre-existing formatter drift as a functional regression.

- timestamp: 2026-07-24
  checked: TypeScript, scoped Biome lint, whitespace, diff shape, and mutation-runner availability.
  found: `tsc --noEmit`, Biome lint on all seven changed TypeScript files, and `git diff --check` exited 0. The scoped diff is additive/substitutive, preserves all provider safety controls, and contains no behavior-deleting short circuit. No Stryker dependency or configuration exists.
  implication: Static, no-op/deletion, and diff-integrity signals pass; mutation checking is explicitly skipped. Run the mandatory revert-and-reconfirm signal.

- timestamp: 2026-07-24
  checked: First targeted causal revert of only the provider-registry DeepSeek sub-budget.
  found: Test setup failed closed before executing the target because the launch-resident registry invariant detected the old effort-only provider profile no longer matched the 512-token launch mirror.
  implication: The profile invariant detects partial regression, but complete the causal signal by temporarily reverting both mirrors so the driving test itself observes the old request settings.

- timestamp: 2026-07-24
  checked: Complete revert-and-reconfirm of the DeepSeek reasoning sub-budget.
  found: Restoring the old effort-only setting in both immutable mirrors made the driving test fail at the intended 512-versus-effort assertion; reapplying only the numeric 512-token settings made the same test pass.
  implication: The exact reasoning sub-budget change causally controls the offline defect oracle and satisfies the revert-and-reconfirm signal.

- timestamp: 2026-07-24
  checked: Final exact-state offline static gates after causal reapply.
  found: TypeScript no-emit, scoped Biome lint, and `git diff --check` all exited 0 against the final reapplied state.
  implication: The offline fix-acceptance guardrail is accepted; stop at human verification because no live call is authorized.

- timestamp: 2026-07-24T10:55:58+10:00
  checked: Additional human-verification authorization and pre-invocation accounting.
  found: Exactly one additional DeepSeek R1 0528 generation canary is authorized with exact model `deepseek/deepseek-r1-0528`, upstream `deepinfra/fp4`, 1,024 total output tokens, a hidden 512-token reasoning ceiling, a 90-second total timeout, zero retries, and disabled fallback. No catalog or other provider/model call is authorized. Accounting is 22/47 before invocation and is conservatively reserved at 23/47.
  implication: The single-call boundary and 22-to-23 accounting are durable before invocation; any outcome ends live provider activity, and only a passing local validation permits offline gates, archival, and commit.

- timestamp: 2026-07-24T10:57:25+10:00
  checked: Windows one-shot runner syntax and credential-presence preflight.
  found: An inline `node -e` preflight lost JavaScript quotes under PowerShell and terminated during parsing before credential access or network initialization. A literal stdin runner then parsed successfully and confirmed only that the server credential is present.
  implication: Zero provider or catalog calls occurred, the live accounting remains the pre-reserved 23/47, and the authorized generation should use the validated literal-stdin mechanism exactly once.

- timestamp: 2026-07-24T10:58:02+10:00
  checked: Sole additional authorized DeepSeek-only live verification canary.
  found: Sanitized failure code `generation-no-output`; the single generation call was consumed and cumulative accounting is 23/47.
  implication: Stop immediately with no retry, fallback, substitution, catalog request, other provider/model call, full matrix, offline gate, archive, or commit.

## Eliminated

- hypothesis: "A 512-token private-reasoning ceiling inside the unchanged 1,024-token total output envelope would reserve sufficient capacity for DeepSeek to complete a structured object."
  evidence: "The sole authorized canary using exact model `deepseek/deepseek-r1-0528`, upstream `deepinfra/fp4`, `maxOutputTokens: 1024`, `reasoning: { max_tokens: 512, exclude: true }`, 90-second timeout, zero retries, and disabled fallback again returned sanitized `generation-no-output`; accounting is fixed at 23/47."
  timestamp: 2026-07-24T11:02:31+10:00

## Resolution

- root_cause: DeepSeek R1 0528's mandatory reasoning path did not reliably fit the product's short, strict structured-turn contract. Raising the timeout from 30 to 90 seconds and then capping private reasoning at 512 of 1,024 total tokens both failed live with sanitized `generation-no-output`; the exact raw finish reason was neither required nor exposed.
- fix: Replace the active resident with `deepseek/deepseek-v3.2` (canonical `deepseek/deepseek-v3.2-20251201`) on the same strict DeepInfra FP4 route. Explicitly disable reasoning with effort `none`, restore the standard 180-token output bound and 30-second timeout, and remove the unfinished finish-reason observability experiment.
- verification:
    target_test: { result: pass }
    mutation_check: { result: skipped, reason_if_skipped: "No Stryker dependency or configuration exists in the repository.", mutant_killed: false }
    no_op_deletion: { result: pass, deletion_justified_by_rca: false }
    adjacent_tests: { result: pass, suites_run: ["5 focused files / 30 tests", "tests/unit/openrouter-provider.test.ts", "tests/unit/provider-registry.test.ts", "tests/unit/resident-registry.test.ts", "tests/integration/resident-admission.test.ts", "tests/unit/admission-error-classification.test.ts", "tsc --noEmit", "Biome scoped lint", "git diff --check"] }
    revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
    prior_human_verify: { result: fail, sanitized_code: "generation-no-output", calls_consumed: "22/47" }
    human_verify: { result: pass, scope: "one V3.2 compatibility canary", selected_model: "deepseek/deepseek-v3.2-20251201", selected_upstream: "DeepInfra", finish_reason: "stop", cumulative_calls: "24/47" }
    guardrail_verdict: accepted
- files_changed:
    - src/features/world/generation/openrouter-resident-turn-provider.ts
    - src/features/world/domain/types.ts
    - src/features/world/fixtures/launch-residents.ts
    - src/features/world/generation/provider-registry.ts
    - tests/unit/openrouter-provider.test.ts
    - tests/unit/provider-registry.test.ts
    - tests/unit/resident-registry.test.ts
    - tests/integration/resident-admission.test.ts
    - .planning/phases/02-grounded-ensemble-and-safe-scenes/02-AI-SPEC.md
    - src/features/world/fixtures/character-bibles.ts
    - src/features/world/fixtures/historical-claims.ts
    - evals/datasets/phase-02-reference.jsonl
- oracle_type: derived
