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
