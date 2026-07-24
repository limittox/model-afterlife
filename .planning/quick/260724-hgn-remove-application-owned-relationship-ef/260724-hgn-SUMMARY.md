---
quick_id: 260724-hgn
status: complete
completed: 2026-07-24
code_commit: ab1f52c
---

# Quick Task 260724-hgn Summary

Moved the relationship-effects boundary entirely behind the trusted server adapter.

The model-facing prompt and structured wire schema no longer expose `proposedRelationshipEffects`. The wire schema is strict and rejects that unexpected field. After parsing the remaining model-owned fields, the adapter deterministically supplies `proposedRelationshipEffects: []` before applying the unchanged strict local turn schema.

Verification:

- TDD red phase: provider and prompt tests failed against the previous model-facing field.
- TDD green phase: prompt, provider, and admission classification suites passed 30/30.
- TypeScript check passed.
- Scoped Biome lint passed.
- Provider calls: none.
- Cumulative paid-call accounting remains 40/70.
