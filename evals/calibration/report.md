# Phase 2 semantic calibration report

- Label set: `phase-02-calibration-approved-v1`
- Canonical-LF label SHA-256: `da152d06706d999d9669e4b07966bb356dde59921b7cc0744e56ca0036457766`
- Status: **approved — semantic gating eligible**
- Human review: bundled 24-row review approved on `2026-07-24`
- Rows: 24
- Judge profile: `openai/gpt-4o` through the OpenAI upstream
- Prompt version: `phase-02-semantic-judge-v1`
- Aggregate Spearman correlation: `1.00`
- Per-dimension correlation: responsiveness `1.00`, voice `1.00`, affection/dignity `1.00`, novelty `1.00`, resolution `1.00`
- Critical false negatives: `0`

The project owner reviewed and approved the complete bundled batch without corrections. This exact label version is calibration truth for `phase-02-semantic-judge-v1`; any label, prompt, model, or route change requires a new version and review.

The semantic judge remains reject-only: it cannot rewrite dialogue or publish a scene. Missing evidence, a non-pass recommendation, any critical failure ID, route drift, or a calibration mismatch continues to fail closed.
