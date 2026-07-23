# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## gpt4o-structured-output — unsupported `not` keyword in the production response schema
- **Date:** 2026-07-23
- **Error patterns:** provider-http-400, GPT-4o, strict structured output, production schema, `items: { not: {} }`, `z.never()`
- **Root cause(s):** The production Zod schema used `z.never()` as an array item type, which serialized to the unsupported strict JSON Schema keyword `not`; GPT-4o rejected the schema before generation.
- **Fix:** Replaced the unreachable `z.never()` item schema with the supported concrete `z.string()` schema while preserving `.max(0)` as the actual zero-item constraint.
- **Files changed:** src/features/world/generation/openrouter-resident-turn-provider.ts, tests/unit/openrouter-provider.test.ts
- **Why not caught:** No offline test inspected the exact serialized production response schema for OpenAI strict-schema compatibility; the admission matrix exposed the issue only when it reached the provider.
- **Recurrence guard:** Regression test `tests/unit/openrouter-provider.test.ts` — `emits an OpenAI-compatible zero-item relationship schema` asserts that the exact outbound schema contains no `not`, retains `maxItems: 0`, accepts the empty boundary, and rejects a singleton relationship effect.
---

## openrouter-optional-attempts — optional route-attempt detail rejected after stable direct-route evidence passed
- **Date:** 2026-07-23
- **Error patterns:** route-attempt-mismatch, GPT-4o, OpenRouter metadata, omitted `attempts`, direct first attempt
- **Root cause(s):** `validateOpenRouterMetadata` declared `attempts` optional at parsing but unconditionally required a singleton approved attempt record, so valid stable direct-route metadata without optional detail was rejected.
- **Fix:** Validate the exact singleton provider/model/status-200 record only when optional `attempts` detail is present; otherwise rely on the already-passed direct top-level attempt and exact selected-endpoint gates.
- **Files changed:** src/features/world/generation/openrouter-metadata.ts, tests/unit/openrouter-metadata.test.ts
- **Why not caught:** The existing focused metadata unit-test gate did not include the omitted optional-field boundary, despite covering the valid singleton and surrounding routing checks.
- **Recurrence guard:** Regression tests in `tests/unit/openrouter-metadata.test.ts` cover accepted omitted optional detail and reject empty, multiple, wrong-provider, wrong-model, and non-200 supplied attempt arrays.
---

## anthropic-wire-schema — local validation constraints rejected by Anthropic's wire-schema admission
- **Date:** 2026-07-23
- **Error patterns:** provider-http-400, Claude Sonnet 4.5, Anthropic, structured output, `minLength`, `maxLength`, `maxItems`
- **Root cause(s):** `ModelTurnOutputSchema` represented both the provider wire contract and the application's stricter local contract, so AI SDK serialization sent local string-length and collection bounds to Anthropic's narrower structured-output validator.
- **Fix:** Added a strict structural-only `ModelTurnWireOutputSchema` for `Output.object` while retaining `ModelTurnOutputSchema.parse(result.output)` as the authoritative local validator.
- **Files changed:** src/features/world/generation/openrouter-resident-turn-provider.ts, tests/unit/openrouter-provider.test.ts
- **Why not caught:** No offline gate asserted that the exact provider-facing schema remained structural-only across upstream providers; the prior schema test covered `not` compatibility but deliberately retained collection bounds.
- **Recurrence guard:** Regression test `tests/unit/openrouter-provider.test.ts` — `emits a structural-only provider schema` forbids `not`, string-length bounds, and collection bounds on the wire, while its local-boundary cases reject blank or oversized text, excessive claim IDs, and non-empty relationship effects.
---
