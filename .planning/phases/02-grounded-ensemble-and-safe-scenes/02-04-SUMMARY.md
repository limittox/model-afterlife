---
phase: 02-grounded-ensemble-and-safe-scenes
plan: "04"
subsystem: publication-quality-and-evaluation
tags: [validation, calibration, openrouter, evaluation, privacy, verification]

requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    plan: "03"
    provides: Replayable ensemble state, deterministic scene eligibility, and failure-safe continuity
provides:
  - Exhaustive fail-closed publication validation with immutable per-validator evidence
  - Human-approved reject-only semantic calibration and metadata-only observability
  - Frozen and live six-resident acceptance evidence plus one complete offline verification command
affects: [phase-3-profiles, phase-3-recaps, phase-4-operations]

key-files:
  created:
    - src/features/world/generation/validators/
    - src/features/world/generation/semantic-judge.ts
    - evals/calibration/review.html
    - evals/promptfooconfig.yaml
    - scripts/verify-phase-02.ts
  modified:
    - src/features/world/generation/conduct-scene.ts
    - src/features/world/generation/openrouter-resident-turn-provider.ts
    - src/features/world/server/seed-data.ts
    - src/features/world/domain/replay.ts
    - scripts/seed-world.ts

key-decisions:
  - "Only a complete current validation manifest can create the nominal accepted capability consumed by publication."
  - "The semantic judge is independent and reject-only; it cannot rewrite dialogue, access tools, or publish."
  - "The exact approved label set is enabled only at correlation 1.00 with zero critical false negatives."
  - "Live acceptance is bounded by explicit cumulative call ceilings and preserves privacy-safe ledgers after every stop."
  - "A grounded-ensemble initialization epoch upgrades the pre-release four-resident journal without deleting its auditable history."

patterns-established:
  - "Deterministic-first gating: cheap application validators run before any independent semantic judgment."
  - "Frozen-default evaluation: normal verification is credential-free; paid live evidence requires explicit authorization."
  - "Metadata-only observability: prompts, generated/rejected text, response bodies, and secrets stay out of telemetry and result artifacts."
  - "Epoch-safe replay: the latest initialization event defines the active canonical schema while earlier history remains append-only."

requirements-completed:
  - WRLD-06
  - WRLD-07
  - RSID-03
  - RSID-04
  - SCEN-01
  - SCEN-02
  - SCEN-03
  - SCEN-04
  - SCEN-05
  - SCEN-06
  - SCEN-07
  - SCEN-08
  - SCEN-09
  - SCEN-10
  - TRNS-01
  - TRNS-02
  - TRNS-03

duration: multi-session
completed: 2026-07-24T19:07:23+10:00
tasks: 4
status: complete
---

# Phase 2 Plan 04: Calibrated Publication and Final Proof Summary

**The six-resident ensemble now has fail-closed publication gates, approved semantic calibration, bounded live-provider evidence, private observability, and a fully green database-backed release verifier.**

## Accomplishments

- Added exhaustive, versioned deterministic validators for identity, schema, cast/order, turn bounds, premise and ending, approved claims, outcome/effects, injection, brevity, novelty, and public-data safety.
- Restricted publication to a complete accepted validation capability; rejected, stale, duplicate, filtered, timed-out, or failed candidates remain private and produce no canonical mutation.
- Added an independent reject-only semantic judge with no dialogue, tool, repository, or publication capability.
- Approved label-set hash `da152d06706d999d9669e4b07966bb356dde59921b7cc0744e56ca0036457766` at aggregate correlation `1.00` with zero critical false negatives.
- Added privacy-safe metadata tracing, frozen Promptfoo evaluation, bounded live accounting, sanitized checkpoint ledgers, and one consolidated verification command.
- Completed the six-resident admission evidence and all three live reference cases at cumulative generation count 140 without route fallback or identity drift.
- Resolved the deferred database replay proof by upgrading the local four-resident development journal through an append-only initialization epoch.

## Key implementation commits

1. **Fail-closed publication gate** - `be26096`
2. **Semantic review and calibration tooling** - `2b97a1a`
3. **Frozen acceptance tooling** - `1a0dc3b`
4. **Approve and enable exact calibration** - `3633468`
5. **Bound and complete the live reference proof** - `1088af7` through `e4da50a`
6. **Complete database-backed verification** - `869fe92`

## Final validation evidence

- Unit, integration, and property suite: 239/239 tests passed across 42 files.
- Canonical database replay: committed and rebuilt state hashes matched exactly.
- Frozen application matrix: 24/24 cases passed.
- Frozen Promptfoo matrix: 24/24 cases passed.
- Live reference subset: 3/3 cases accepted; final retry-5 consumed exactly five generations from cumulative 135 to 140.
- Privacy scan: passed across 15 public/result files with no private body or secret exposure.
- Browser verification: 61/61 Playwright cases passed.
- Biome lint, TypeScript checking, and the Next.js production build passed.

## Deviations and discoveries

- At the user's direction, implementation was not driven through TDD. Focused regression tests were added after supported changes, followed by the complete consolidated gate.
- The final verifier found stale assertions left behind by the completed retry ledger and schema migrations; those expectations were updated without changing provider behavior.
- The persistent Phase 1 development database contained a four-resident initialization and 2,098 historical events. The seed path now appends one versioned grounded-ensemble initialization instead of deleting or mutating that history.
- Persistent transparency copy reduced the 1024x640 world stage below the intended 2x canvas height. The medium-desktop status strip was compacted by 16px, restoring the tested integer scale without removing disclosure content.

## Phase result

All Phase 2 roadmap success criteria have automated, human-review, frozen, fault-path, live-provider, privacy, replay, browser, and production-build evidence. Phase 2 is complete and Phase 3 can begin.

