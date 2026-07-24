---
quick_id: 260724-nhl
status: complete
outcome: diagnosed
completed: 2026-07-24
diagnosis_commit: 4e41d50
---

# Quick Task 260724-nhl Summary

The retry-2 semantic judge failure was diagnosed entirely offline. OpenRouter generation and strict route verification succeeded; the returned object then failed the application's stricter local semantic-judge schema.

The provider-facing schema intentionally validates structure only, while the local schema additionally constrains score integers and ranges, reason lengths, and critical-failure ID lengths/counts. The saved privacy-safe evidence collapses every one of those local failures to `schema-invalid`, so it cannot identify the exact rejected field without the raw output that the project correctly chose not to retain.

The smallest safe next change is privacy-safe, field-level judge schema classification. It should be implemented and verified offline before any new paid authorization. No prompt, schema contract, model, route, calibration label, or generated value was changed during this diagnosis.

## Verification

- Zero external model or catalog calls.
- Focused offline tests passed 18/18.
- Phase 2 privacy scan passed across 11 public/result files.
- Local mocked outputs reproduced the same usage-recorded-then-`schema-invalid` sequence for each stricter constraint family.
