---
id: 260724-nbq
type: quick
status: complete
created: 2026-07-24
---

# Run authorized Phase 2 reference retry-2

## Goal

Validate the exact cumulative `113` fail-closed checkpoint, then run the prepared reference-only retry once with at most 15 new generations and an exact cumulative ceiling of 128.

## Tasks

1. Verify the committed checkpoint, clean retry-2 ledger state, matching local and remote branch heads, and local key availability without exposing secrets.
2. Run the dedicated retry-2 command with 21-second pacing, durable per-call accounting, and fail-closed behavior.
3. Verify the sanitized result and privacy constraints, record the outcome in the quick-task artifacts and project state, then commit and push only intentional files.

## Constraints

- Do not rerun the 30-generation admission matrix or any earlier reference checkpoint.
- Do not exceed 15 new generations or cumulative generation 128.
- Stop on the first provider, schema, deterministic, semantic, or accounting failure; do not retry automatically.
- Never persist or print prompts, dialogue, exception messages, response bodies, headers, credentials, or other sensitive provider data.
- Preserve all prior ledgers and unrelated `next-env.d.ts` and `.codex/` changes.
