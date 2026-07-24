---
quick_id: 260724-hc9
status: complete
completed: 2026-07-24
code_commit: e12e751
---

# Quick Task 260724-hc9 Summary

Strengthened the immutable resident system prompt at the exact boundary identified by the Qwen diagnostic.

Every resident is now explicitly instructed to set `proposedRelationshipEffects` to `[]` because relationship changes are application-owned. The strict local schema remains unchanged and continues to reject any model-proposed effect.

Verification:

- TDD red phase: the new regression failed because the instruction was absent.
- TDD green phase: prompt regression passed after the one-line system instruction.
- Prompt, OpenRouter provider, and admission classification suites passed 30/30.
- TypeScript check passed.
- Scoped Biome lint passed.
- Provider calls: none.
- Cumulative paid-call accounting remains 39/62.
