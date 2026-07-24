---
id: 260724-oha
type: quick
status: complete
created: 2026-07-24
---

# Run one paid semantic-judge diagnostic

## Goal

Make exactly one GPT-4o semantic-judge generation through the approved OpenRouter/OpenAI route using an existing reference fixture, then persist only privacy-safe accounting and field-level schema classifications.

## Tasks

1. Add a one-shot diagnostic command with exact authorization for cumulative generation 119, a fresh durable ledger, and no retry path.
2. Verify the command offline and commit the guarded setup.
3. Run the single paid call, verify privacy-safe evidence, record the outcome, and push intentional changes.

## Constraints

- Exactly one new generation; cumulative accounting moves from 118 to at most 119.
- No resident generation, catalog lookup, retry, fallback, prompt/output logging, or raw exception persistence.
- Use an existing public reference fixture as judge input.
- Preserve the approved production prompt, model, route, schemas, and calibration.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
