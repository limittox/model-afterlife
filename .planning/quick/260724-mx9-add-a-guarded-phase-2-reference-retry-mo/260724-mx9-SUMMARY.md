---
quick_id: 260724-mx9
status: complete
outcome: failed_closed
completed: 2026-07-24
setup_commit: c672ac5
evidence_commit: 57f9de2
fix_commit: 4d9d16d
---

# Quick Task 260724-mx9 Summary

The authorized reference retry validated the exact cumulative `109` starting state, skipped admission, and made four paced resident calls for the first tea-timer scene. All four provider calls passed strict route, schema, and provenance checks. Deterministic validation then stopped the run before judging at cumulative `113/124`.

Sanitized validator evidence identified the exact rejection: `identity.unverified`. Every other deterministic check passed, including `premise.pass`; the semantic gate remained intentionally uncalibrated because no judge call had run.

The root cause was a scene-conductor comparison that accepted only the requested model slug. Claude's strict OpenRouter evidence correctly selected its immutable canonical model ID, so the conductor downgraded otherwise verified evidence. The conductor now accepts the canonical observation only when `openrouter_verified` provenance also binds it to the requested alias.

A second retry mode validates all three prior ledgers and the exact identity-gate evidence, writes a separate ledger, and requires a fresh exact cumulative ceiling of 128.

## Verification

- Focused generation, retry-preflight, and failure-classification suites passed 28/28 tests.
- Phase 2 privacy scan passed across ten public/result files.
- Biome lint and TypeScript typecheck passed.
- No judge or later resident call ran after deterministic rejection.
- No call was made after the identity fix.

## Remaining Checkpoint

A complete reference retry requires a fresh 15-generation authorization starting at cumulative 113 and ending at exact ceiling 128.
