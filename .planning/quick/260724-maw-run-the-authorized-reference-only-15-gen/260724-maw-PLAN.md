---
id: 260724-maw
type: quick
status: complete
created: 2026-07-24
---

# Run authorized Phase 2 reference continuation

## Goal

Use the user's exact authorization to run only the three Phase 2 reference scenes and judges, with at most 15 new generations and cumulative ceiling 120.

## Tasks

1. Verify the repository is on the pushed recovery commit, the preserved checkpoint is exactly `105`, no continuation ledger exists, and the local OpenRouter key is available without printing it.
2. Run `eval:phase-02:live:continue` with exact authorization and monitor its durable sanitized ledger until it passes or stops fail-closed.
3. Validate the resulting accounting, reference evidence, and privacy scan; record the result, commit only task-owned artifacts, and push.

## Constraints

- Do not rerun the 30-generation admission matrix.
- Do not exceed 15 new generations or cumulative generation 120.
- Stop on the first provider, schema, deterministic, semantic, or accounting failure.
- Never print or persist prompts, generated dialogue, authorization headers, or credentials.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
