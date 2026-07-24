# Phase 2 semantic calibration draft

- Label set: `phase-02-calibration-draft-v1`
- Status: **draft — semantic gating disabled**
- Rows: 24
- Judge profile: `openai/gpt-4o` through the OpenAI upstream
- Prompt version: `phase-02-semantic-judge-v1`
- Proposed aggregate Spearman correlation: `1.00`
- Proposed per-dimension correlation: responsiveness `1.00`, voice `1.00`, affection/dignity `1.00`, novelty `1.00`, resolution `1.00`
- Proposed critical false negatives: `0`

The scores above are deliberately a draft calibration fixture, not calibration truth. Even though the proposed judge scores align with the proposed human labels, the semantic gate remains disabled and fail-closed until one human reviewer checks the entire batch, corrects any row that does not match the rubric, and approves the exact exported label-set version.

The critical historical, injection, safety, attribution, and publication-fault rows must each have historical-integrity and trust/safety review explicitly checked in the bundled review sheet.
