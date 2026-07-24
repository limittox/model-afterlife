---
quick_id: 260724-hgn
status: in_progress
description: Remove application-owned relationship effects from the model wire schema and inject an empty array locally, verified with TDD and no provider calls
---

# Quick Task 260724-hgn: Remove relationship effects from model output

1. Change provider tests first so the model-facing structured schema omits `proposedRelationshipEffects`, rejects that extra field, and accepts the remaining structural turn fields.
2. Run the focused provider suite and confirm the new expectations fail against the current wire schema.
3. Remove the field from the strict wire schema, explicitly parse returned wire data, and inject `proposedRelationshipEffects: []` before the unchanged local application schema.
4. Run focused generation suites, typecheck, and scoped lint; make no provider calls.
5. Commit and push the verified code and quick-task record.
