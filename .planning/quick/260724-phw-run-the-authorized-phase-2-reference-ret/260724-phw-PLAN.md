---
id: 260724-phw
type: quick
status: complete
created: 2026-07-24
---

# Run authorized Phase 2 reference retry-4

## Goal

Run the prepared continuation once, consuming exactly 10 authorized generations from cumulative 129 through the hard cap of 139, then preserve and publish its privacy-safe evidence.

## Tasks

1. Verify the committed retry-4 preflight, confirm local `main` matches `origin/main`, confirm the retry-4 ledger is absent, and confirm the OpenRouter key is available without exposing it.
2. Run `eval:phase-02:live:retry-4` once with authorization and cap 139, using its built-in 21-second pacing and fail-closed accounting.
3. Validate the resulting ledger and completed reference evidence, run the privacy scan, record the outcome, then commit and push only intentional artifacts.

## Constraints

- Run no admission generations or catalog requests.
- Reuse the accepted tea-timer case and run only the two unfinished reference cases.
- Make no more and no fewer than 10 generations if every call succeeds.
- Start only from the exact cumulative 129 checkpoint and never exceed cumulative cap 139.
- Stop on the first provider, schema, deterministic, semantic, or accounting failure; do not retry automatically.
- Never persist or print prompts, dialogue, raw responses, exception messages, headers, credentials, or failing values.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
