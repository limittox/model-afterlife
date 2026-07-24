---
quick_id: 260724-mg7
status: complete
completed: 2026-07-24
implementation_commit: c73f5d1
---

# Quick Task 260724-mg7 Summary

The Phase 2 live reference runner now uses the existing privacy-safe generation failure classifier for both resident and semantic-judge calls. Future failures persist and print only stable codes such as HTTP status class, timeout, structured-output failure, identity evidence failure, or a generic unknown-generation failure.

Exception messages, prompts, outputs, response bodies, request bodies, and headers are never copied into the ledger or command error. The already committed `109/120` checkpoint remains unchanged because its discarded exception cannot be reconstructed honestly.

## Verification

- Focused live-reference and admission-classification suites passed 21/21 tests.
- Phase 2 privacy scan passed across eight public/result files.
- Biome lint passed across the repository.
- TypeScript typecheck passed.
- No OpenRouter or other provider call was made.

## Remaining Checkpoint

A complete reference retry still requires a fresh exact 15-generation authorization starting at cumulative 109 and ending at ceiling 124.
