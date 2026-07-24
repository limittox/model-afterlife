---
id: 260724-nhl
type: quick
status: complete
created: 2026-07-24
---

# Diagnose semantic-judge schema failure offline

## Goal

Trace the retry-2 semantic judge's `schema-invalid` result through saved, privacy-safe evidence and the local request/response validation path, then identify the root cause without making any provider call.

## Tasks

1. Inspect the saved accounting evidence, judge schema, transport adapter, prompt construction, and error-classification path.
2. Compare the failing judge path with working structured-output paths and reproduce the relevant validation boundary locally where possible.
3. Record the supported root-cause finding, confidence, and smallest recommended remediation; do not implement or run a paid canary in this diagnostic task.

## Constraints

- Make zero external model or catalog calls.
- Do not print or persist prompts, dialogue, raw response bodies, headers, credentials, or exception messages.
- Do not use TDD or the heavyweight GSD debug workflow.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
