---
id: 260724-oxi
type: quick
status: complete
created: 2026-07-24
---

# Prepare guarded Phase 2 reference retry-3

## Goal

Prepare, but do not run, a reference-only checkpoint that accepts only the reviewed cumulative 119 state, makes exactly 15 paced generations, and stops at cumulative cap 134.

## Tasks

1. Move privacy-safe semantic-judge issue classification into shared production code and use it in both the live reference runner and one-shot diagnostic.
2. Add an exact retry-3 preflight, separate ledger, dedicated command, and documentation without altering prior ledgers or rerunning admission.
3. Add post-implementation regression coverage and run focused offline verification, then commit and push the guarded setup.

## Constraints

- Make zero provider or catalog calls during this setup task.
- Do not rerun the 30-generation admission matrix.
- The future checkpoint may make at most 15 generations, starting at 119 and capped exactly at 134.
- Stop on the first provider, schema, deterministic, semantic, or accounting failure.
- Never persist prompts, dialogue, raw responses, exception messages, headers, credentials, or failing values.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
