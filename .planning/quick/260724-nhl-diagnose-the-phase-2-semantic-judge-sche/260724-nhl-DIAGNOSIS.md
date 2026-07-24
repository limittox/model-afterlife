---
quick_id: 260724-nhl
status: complete
scope: offline-only
provider_calls: 0
---

# Semantic judge `schema-invalid` diagnosis

## Finding

The paid judge generation and strict OpenRouter route verification completed successfully. The failure occurred afterward when the returned structured object was parsed by the stricter local semantic-judge schema.

This root-cause boundary is confirmed:

1. The retry-2 ledger contains a generation ID plus input and output token usage for the judge call.
2. `OpenRouterSemanticJudgeProvider` can record those values only after `generateText()` returns and `validateOpenRouterMetadata()` succeeds.
3. The provider then parses `result.output` with `SemanticJudgeWireResultSchema`.
4. The ledger's final `schema-invalid` code is the privacy-safe classification of that local Zod rejection.
5. The following provenance-injection parse cannot be the cause because it adds application-owned literal values to an object that has already passed the same remaining schema.

## Contract mismatch

The provider-facing transport schema intentionally contains only structural constraints, while the local schema adds:

| Field | Transport schema | Local schema |
|---|---|---|
| Five scores | Any number | Integer from 0 through 4 |
| Five reasons | Any string | Trimmed, non-empty, maximum 160 characters |
| Critical failure IDs | Any string array | At most 12 entries; each trimmed, non-empty, maximum 80 characters |

This two-schema pattern is intentional. It was introduced after provider routes rejected richer JSON Schema keywords such as string and collection bounds. Local validation remains the canonical fail-closed boundary.

## What cannot be recovered

The exact rejected field cannot be determined from the saved evidence. Raw judge output was correctly excluded from logs and results, telemetry output recording was disabled, and all judge Zod issues currently collapse to `schema-invalid`.

An offline reproduction confirmed that a fractional score, an oversized reason, and too many critical-failure IDs all produce the exact observed sequence: usage is recorded, then the result becomes `schema-invalid`.

## Recommended remediation

Before another paid attempt, add a privacy-safe semantic-judge classifier that records only the failing field and constraint category, never its value. Suggested stable categories include:

- `judge-schema-score-invalid`
- `judge-schema-reason-empty`
- `judge-schema-reason-too-long`
- `judge-schema-critical-id-invalid`
- `judge-schema-critical-id-count`

This diagnostic improvement does not change the approved prompt, model, route, calibration labels, or raw-data retention policy.

After the exact constraint is known, make one targeted product decision. Do not silently truncate, clamp, or otherwise rewrite judge output. Any prompt or judge-contract change must receive a new prompt/schema version and calibration review before semantic gating is approved again.

## Verification

- Zero external model or catalog calls were made.
- Focused offline tests passed 18/18.
- Phase 2 privacy scanning passed across 11 public/result files.
- A local mock reproduced all identified contract-mismatch classes without credentials or network access.
