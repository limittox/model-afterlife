---
id: 260724-prh
type: quick
status: complete
created: 2026-07-24
---

# Fix resident text validity and prepare the final reference checkpoint

## Goal

Prevent empty or over-budget resident dialogue without weakening the 240-grapheme publication gate, improve privacy-safe diagnosis, and prepare a guarded continuation that reuses both accepted reference cases.

## Tasks

1. Version the resident prompt and require non-empty dialogue of at most 180 Unicode graphemes, leaving deterministic headroom below the existing 240-grapheme publication limit.
2. Refine privacy-safe text failure classification and add a retry-5 mode that validates cumulative 135 plus the two accepted cases, then runs only the final radio-labels case.
3. Add focused regression coverage after implementation, run offline verification and privacy checks, then commit and push without making provider calls.

## Constraints

- Make zero provider, catalog, resident, or judge calls.
- Do not weaken the existing 240-grapheme deterministic publication gate.
- Do not regenerate the two accepted reference cases.
- The future checkpoint must start only at cumulative 135, make exactly 5 generations, and stop at cap 140.
- Stop fail-closed on any provider, schema, deterministic, semantic, or accounting failure.
- Never persist or print prompts, dialogue, raw responses, exception messages, headers, credentials, or failing values.
- Preserve unrelated `next-env.d.ts` and `.codex/` changes.
