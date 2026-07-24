---
quick_id: 260724-in8
status: complete
completed: 2026-07-24
reservation_commit: 5a6f130
evidence_commit: cd9d0c5
---

# Quick Task 260724-in8 Summary

The conditional paid checkpoint completed successfully.

- Qwen3 canary: passed on `qwen/qwen3-235b-a22b-2507`, canonical `qwen/qwen3-235b-a22b-07-25`, through DeepInfra FP8.
- Canary identity: direct route, attempt one, empty pipeline, valid structured schema, and `openrouter_verified`.
- Conditional matrix: passed for all six residents with five samples each.
- Fresh generation calls consumed: 31 of 31 authorized.
- Cumulative generation accounting: 71/71.
- Read-only catalog requests: 14 maximum authorized and 14 used.
- Retry/fallback/substitution: none.
- Matrix cost: US$0.03631458.
- Qwen3 canary cost: US$0.00008894.
- Sanitized evidence: `evals/results/phase-02-live-admission.json`.

Privacy validation found no credential, prompt, raw output, authorization header, or provider response body in the evidence artifact. Every matrix sample used a direct first-attempt route with an empty pipeline, valid schema, and verified OpenRouter identity.

Offline verification passed 31 focused tests, full Biome lint, and TypeScript checking. The repository's default Vitest database bootstrap could not run because Docker Desktop is stopped, so the focused database-free suites were rerun with a temporary no-database configuration that was removed afterward.

No further provider call is authorized.
