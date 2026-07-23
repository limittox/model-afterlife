---
status: resolved
trigger: "yup"
created: 2026-07-23
updated: 2026-07-23T22:11:23+10:00
---

# Debug Session: Anthropic-compatible wire schema

## Symptoms

- expected_behavior: Claude Sonnet 4.5 accepts the shared structured-output request while the application enforces the full resident-turn contract locally.
- actual_behavior: GPT-4o completed five samples, but the first Claude Sonnet 4.5 request returned provider HTTP 400 before any generation ID or router metadata was available.
- error_messages: Sanitized admission error `provider-http-400`; the raw provider body and request were deliberately discarded.
- timeline: Discovered during the third admission-matrix run after GPT-4o schema and optional route-attempt fixes.
- reproduction: Send the current strict Zod-generated `ModelTurnOutputSchema` through OpenRouter to the pinned Anthropic Claude Sonnet 4.5 route.

## Current Focus

- hypothesis: Resolved at the code-contract boundary — provider admission and application validation use distinct schemas at their respective boundaries.
- test: The accepted offline guardrail covers exact wire serialization, strict local boundaries, adjacent tests, static checks, and controlled revert/reapply.
- expecting: Native Claude admission confirmation is deferred to a separately authorized matrix rerun and is not part of this closed debug session.
- next_action: Archived; future live admission work should reference this resolution without reopening it unless the matrix produces new contradictory evidence.
- bug_class: Bohrbug — the same Zod schema deterministically serializes to the same provider-facing JSON Schema.
- common_pattern: Data Shape / API Contract — a provider-specific wire contract is being conflated with the application's stricter validation contract.
- sbfl: skipped because the focused test directly localized the only failure to the serialized `responseFormat.schema`, and per-test coverage ranking would add no discrimination.
- reasoning_checkpoint:
    hypothesis: A single constrained Zod schema causes the provider HTTP 400 because the AI SDK serializes its application-only string and collection bounds into Anthropic's provider-facing JSON Schema.
    confirming_evidence:
      - The agent-authored offline regression captured `minLength: 1`, `maxLength: 240`, `maxItems: 3`, and `maxItems: 0` in the exact `Output.object` response schema and failed only the structural-wire assertion.
      - All four public-provider boundary tests passed in the same RED run, directly observing that the existing post-generation `ModelTurnOutputSchema.parse` rejects blank text, 241-character text, four claim IDs, and one relationship effect.
      - Five GPT-4o samples accepted the same application contract while Anthropic rejected the request before generation, matching a provider admission difference rather than invalid generated data.
    falsification_test: Pass a distinct structural schema to `Output.object`; this hypothesis is false if the captured response schema still contains string or collection bounds, or if removing the local constrained schema makes any boundary case pass.
    fix_rationale: Separating the wire schema changes only provider admission vocabulary; retaining the existing constrained parse after generation preserves every application invariant and rejects semantically invalid output before provenance or persistence.
    blind_spots: The sanitized incident discarded the raw provider body and live provider calls are prohibited, so end-to-end Anthropic admission cannot be replayed here; verification is limited to the documented contract boundary and exact offline serialization.
    candidate_causes:
      - code: The adapter reuses one Zod schema for two contracts with different supported validation vocabularies.
      - config/environment: The route could have lacked structured-output support, but catalog/endpoint checks and documented Claude Sonnet 4.5 support eliminate that branch.
      - data: Generated output could have violated the schema, but the HTTP 400 happened before a generation ID and the offline schema contains the suspected rejected keywords.
    and_gate: No — Anthropic's narrower accepted vocabulary is an external boundary condition; the adapter's single-schema design alone is the correctable cause and a two-schema adapter handles that condition without any route, environment, or data change.
- tdd_checkpoint: RED — `tests/unit/openrouter-provider.test.ts` failed 1 of 8 tests because the exact schema contained `"minLength"`; the four local boundary cases passed.

## Evidence

- timestamp: 2026-07-23
  observation: Five GPT-4o structured samples passed with the same application contract before the first Claude request failed at HTTP 400.
  implication: The dialogue contract is viable, but its provider-facing JSON Schema is not portable across strict-output implementations.
- timestamp: 2026-07-23
  observation: Claude Sonnet 4.5 and its pinned Anthropic route advertise structured-output support, and the catalog/endpoint check succeeded before generation.
  implication: Model availability and basic feature routing are not sufficient to explain the provider validation error.
- timestamp: 2026-07-23
  observation: Anthropic documents a wire-schema transformation that removes unsupported constraints and retains full validation in the client.
  implication: The adapter needs separate provider-facing and local-validation schemas.
- timestamp: 2026-07-23
  observation: The current adapter already calls `ModelTurnOutputSchema.parse(result.output)` after generation.
  implication: Full local constraints can remain authoritative even if the wire schema is simplified.
- timestamp: 2026-07-23T22:02:43+10:00
  observation: `OpenRouterResidentTurnProvider.generateTurn` passes `ModelTurnOutputSchema` to `Output.object` and later parses `result.output` with that same schema; the schema contains trimmed non-blank strings, a 240-character maximum, a three-item claim-ID maximum, and a zero-item relationship-effect maximum.
  implication: The provider and application currently share one schema despite needing different constraint vocabularies; a two-schema split can change only provider admission while preserving the public provider's local behavior.
- timestamp: 2026-07-23T22:02:43+10:00
  observation: The focused provider test captures `options.output` and awaits its offline `responseFormat`, so the exact serialized wire schema can be tested without a live provider or credential.
  implication: A deterministic, agent-authored regression can reproduce the root cause entirely offline.
- timestamp: 2026-07-23T22:03:58+10:00
  observation: `pnpm exec vitest run tests/unit/openrouter-provider.test.ts` stopped before test collection with `packages field missing or empty`; the installed pnpm is 9.5.0 while the project pins pnpm 11.15.1 and uses a settings-only `pnpm-workspace.yaml`.
  implication: This was not a test result; invoke the already-installed Vitest entrypoint directly so no package installation or live provider access occurs.
- timestamp: 2026-07-23T22:04:41+10:00
  observation: The agent-authored focused test ran eight cases offline: seven passed and `emits a structural-only provider schema` failed because the exact JSON Schema contained `minLength`, `maxLength`, and `maxItems`; the failure printed the full serialized schema.
  implication: The regression is RED for the expected root-cause behavior, while all four local constraint boundary tests already prove the post-generation parse remains authoritative.
- timestamp: 2026-07-23T22:05:52+10:00
  observation: After adding the distinct structural wire schema, the same focused test file passed all eight tests, including exact wire serialization and the four full local-validation boundaries.
  implication: The two-schema split fixes the isolated contract mismatch without weakening the application contract.
- timestamp: 2026-07-23T22:05:52+10:00
  observation: The production diff adds one schema and changes one `Output.object` argument; it does not delete, short-circuit, or weaken local behavior. No Stryker dependency or configuration exists.
  implication: The no-op/deletion guard passes; the mutation signal must be recorded as skipped because the repository has no configured mutation runner.
- timestamp: 2026-07-23T22:06:48+10:00
  observation: The complete offline unit suite passed 108 of 108 tests, `tsc --noEmit` passed, and scoped Biome lint checked both changed code files with no findings.
  implication: The fix has no observed regressions in the adjacent unit import graph and satisfies the repository's static gates.
- timestamp: 2026-07-23T22:07:49+10:00
  observation: With only the production two-schema hunk removed, the focused run returned to exactly one failure in eight tests: the structural wire test again found `"minLength"` in the serialized schema; all four local-boundary tests continued to pass.
  implication: The bug demonstrably returns without this production change, and the regression specifically measures provider-wire behavior rather than a weakened local validator.
- timestamp: 2026-07-23T22:08:50+10:00
  observation: Reapplying the exact production two-schema hunk restored eight of eight focused passing tests; the structural regression also retains the earlier prohibition on the unsupported `not` keyword.
  implication: Revert-and-reconfirm passes and the new wire schema preserves the prior provider-schema recurrence guard.
- timestamp: 2026-07-23T22:09:32+10:00
  observation: Final post-reapply verification passed the focused eight-test file, TypeScript, scoped Biome lint, and `git diff --check`; the earlier complete unit run passed 108 of 108 tests.
  implication: Every applicable automated fix-acceptance signal passes; only real-route provider admission remains for the required human checkpoint.
- timestamp: 2026-07-23T22:11:23+10:00
  observation: The human checkpoint accepted the completed offline RED-to-GREEN proof and automated guardrail as sufficient code-level verification, explicitly prohibited a provider call in this session, and deferred native Claude admission confirmation to a separately authorized admission-matrix rerun.
  implication: The debug session can be resolved and archived without a live call; deferred provider admission remains external validation rather than an unresolved code defect.
- timestamp: 2026-07-23T22:11:23+10:00
  observation: MemPalace semantic indexing was skipped because `.planning/config.json` explicitly sets `mempalace.enabled` to false; the resolution was appended to `.planning/debug/knowledge-base.md`.
  implication: The Markdown knowledge base remains the durable fallback for future Phase-0 recall.

## Eliminated

- hypothesis: Claude Sonnet 4.5 does not support structured outputs.
  reason: Anthropic and OpenRouter both document support for this exact model family.
- hypothesis: The request reached an unapproved route or fallback.
  reason: The route was pinned to Anthropic with fallback disabled; the failure occurred before response provenance could be produced.

## Resolution

- root_cause: `ModelTurnOutputSchema` was used simultaneously as the provider wire schema and the application validation schema, so AI SDK serialization exposed local `minLength`, `maxLength`, and `maxItems` constraints to Anthropic's narrower structured-output admission validator.
- fix: Added a strict structural-only `ModelTurnWireOutputSchema` for `Output.object` and retained the original constrained `ModelTurnOutputSchema.parse(result.output)` for authoritative local validation.
- verification:
    target_test: { result: pass, detail: "8/8 focused provider tests passed after the fix" }
    mutation_check: { result: skipped, reason_if_skipped: "No Stryker dependency or configuration exists in the repository", mutant_killed: false }
    no_op_deletion: { result: pass, deletion_justified_by_rca: false, detail: "Production diff adds a structural schema and switches one schema argument; no behavior is deleted or short-circuited" }
    adjacent_tests: { result: pass, suites_run: ["tests/unit (108/108)", "tsc --noEmit", "Biome lint on changed code files"] }
    revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true, detail: "Focused result changed 8/8 pass -> 7/8 with minLength failure -> 8/8 pass" }
    guardrail_verdict: accepted
    human_checkpoint: { result: accepted_code_level, native_claude_admission: "deferred to separately authorized matrix rerun", live_provider_call_made: false }
- oracle_type: specified — the provider wire contract must contain only structural keywords, while the documented application contract defines the four local validation boundaries.
- files_changed: [src/features/world/generation/openrouter-resident-turn-provider.ts, tests/unit/openrouter-provider.test.ts]

## Prevention

### Branching 5-Whys

- code branch:
  - The request was rejected because application-only validation keywords reached the provider-facing JSON Schema.
  - Those keywords reached the provider because one Zod schema represented both the wire structure and the local semantic contract.
  - That coupling was possible because the adapter had no explicit provider-wire schema boundary.
  - It persisted because the existing schema regression targeted one OpenAI incompatibility (`not`) rather than asserting the provider-neutral structural vocabulary.
- environment/config branch:
  - The defect surfaced on Claude rather than GPT-4o because structured-output providers accept different JSON Schema subsets.
  - That difference was easy to miss because OpenRouter exposes one transport API while upstream schema admission remains provider-specific.
  - The route itself was correctly pinned and supported structured output, so no configuration change was required; the adapter needed to normalize the boundary.
- data branch:
  - Generated content was not causal because the provider rejected the request before generation.
  - Local output constraints still matter after admission, so removing them would only trade the admission failure for unsafe application data.
- AND-gate: no — provider variance is the boundary condition, while the actionable defect was the adapter's single-schema design; separating the schemas resolves the class without route or data changes.

### Why Not Caught

No offline gate asserted that the exact provider-facing schema remained structural-only across upstream providers. The existing provider test covered the earlier unsupported `not` keyword but deliberately retained `maxItems`, so it could not detect the Anthropic portability failure.

### Recurrence Guard

The regression test `tests/unit/openrouter-provider.test.ts` — `emits a structural-only provider schema` — inspects the exact serialized response schema, forbids `not`, string-length bounds, and collection bounds, and proves structurally valid output reaches the separate local validator. Its companion parameterized cases prove blank text, 241-character text, four claim IDs, and one relationship effect remain locally rejected.
