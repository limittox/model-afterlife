---
id: 260724-pzr
type: quick
status: complete
created: 2026-07-24
---

# Run authorized Phase 2 reference retry-5

## Goal

Run the prepared final-case continuation once, consuming exactly five authorized generations from cumulative 135 through the hard cap of 140, then preserve and publish its privacy-safe evidence.

## Tasks

1. Verify the committed retry-5 preflight, confirm local `main` matches `origin/main`, confirm the retry-5 ledger is absent, and confirm the OpenRouter key is available without exposing it.
2. Run `eval:phase-02:live:retry-5` once with authorization and cap 140, using its built-in 21-second pacing and fail-closed accounting.
3. Validate the resulting ledger and reference evidence, run Phase 2 privacy and proof checks, record the outcome, then commit and push only intentional artifacts.

## Constraints

- Run no admission generations or catalog requests.
- Reuse the two accepted cases and run only the final radio-labels case.
- Make no more and no fewer than five generations if every call succeeds.
- Start only from the exact cumulative 135 checkpoint and never exceed cumulative cap 140.
- Stop on the first provider, schema, deterministic, semantic, or accounting failure; do not retry automatically.
- Never persist or print prompts, dialogue, raw responses, exception messages, headers, credentials, or failing values.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
