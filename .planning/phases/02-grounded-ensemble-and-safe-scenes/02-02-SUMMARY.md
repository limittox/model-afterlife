---
phase: 02-grounded-ensemble-and-safe-scenes
plan: "02"
subsystem: resident-ensemble
tags: [openrouter, resident-registry, historical-grounding, phaser, accessibility]

requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    plan: "01"
    provides: Strict OpenRouter scene tracer, exact authorship evidence, and private-first publication
provides:
  - Exact six-resident grounded launch registry and 24-case reference corpus
  - Sanitized live strict-route admission evidence for five samples per resident
  - Six registry-owned public identities with distinct semantic roles, routines, palettes, and silhouettes
  - Prompt boundaries that keep untrusted context inert and relationship effects application-owned
affects: [02-03-relationships, 02-04-publication-gates, phase-3-profiles]

key-files:
  created:
    - evals/results/phase-02-live-admission.json
    - evals/datasets/phase-02-reference.jsonl
    - src/features/world/fixtures/character-bibles.ts
    - src/features/world/fixtures/historical-claims.ts
    - src/features/world/generation/run-admission-canaries.ts
  modified:
    - src/features/world/fixtures/launch-residents.ts
    - src/features/world/fixtures/provisional-world.ts
    - src/features/world/contracts/public-world.ts
    - src/features/world/server/to-public-snapshot.ts
    - src/features/world/renderer/renderer-types.ts
    - src/features/world/renderer/HomeScene.ts
    - src/features/world/components/PixelWorldViewport.tsx

key-decisions:
  - "The launch cast is GPT-4o, Claude Sonnet 4.5, Gemini 2.5 Pro, DeepSeek V3.2, Llama 3.3 70B Instruct, and Qwen3 235B A22B Instruct 2507 over exact strict OpenRouter routes."
  - "Public resident names, roles, and visual variants come from the validated registry rather than mutable canonical event payloads."
  - "Six original pixel variants use unique palette and silhouette signatures without provider logos or mascots."
  - "Relationship effects are application-owned and never accepted from a resident model response."

patterns-established:
  - "Registry-owned presentation: canonical movement state carries location and activity while public serialization joins validated resident identity metadata."
  - "Exact-six public boundary: snapshots reject missing, extra, or duplicate resident IDs, names, roles, and visual variants."
  - "Fail-closed admission: direct route, attempt one, exact model/upstream/quantization, empty pipeline, structured schema, and complete provenance are all mandatory."

requirements-completed: [RSID-01, RSID-02, RSID-03, RSID-04, SCEN-06, TRNS-03]

coverage:
  - id: D1
    description: The exact six requested and canonical models pass strict live route admission.
    requirement: RSID-01
    verification:
      - kind: live
        ref: evals/results/phase-02-live-admission.json
        status: pass
    human_judgment: false
  - id: D2
    description: Six stable identities have unique roles, routine sets, and provider-neutral visual signatures.
    requirement: RSID-02
    verification:
      - kind: unit
        ref: tests/unit/resident-registry.test.ts, tests/unit/public-world-contract.test.ts, and tests/unit/renderer-bridge.test.ts
        status: pass
      - kind: e2e
        ref: tests/e2e/semantic-observer.spec.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Documented fact, reported reputation, and fictional exaggeration remain exhaustive separate categories.
    requirement: RSID-03
    verification:
      - kind: unit
        ref: tests/unit/historical-grounding.test.ts
        status: pass
    human_judgment: false
  - id: D4
    description: Prompt context is version-scoped and inert while public scenes retain exact model attribution and disclosure.
    requirement: SCEN-06
    verification:
      - kind: unit
        ref: tests/unit/resident-prompt.test.ts and tests/unit/public-world-contract.test.ts
        status: pass
      - kind: e2e
        ref: tests/e2e/semantic-observer.spec.ts
        status: pass
    human_judgment: false

duration: multi-session
started: 2026-07-23T02:01:47+10:00
completed: 2026-07-24T13:59:44+10:00
tasks: 4
files-modified: 44
status: complete
---

# Phase 2 Plan 02: Grounded Six-Resident Ensemble Summary

**The home now presents the exact six admitted language-model residents as distinct, historically grounded characters backed by current strict-route OpenRouter evidence.**

## Accomplishments

- Added six versioned model records, character bibles, 18 categorized historical claims, and a 24-case reference corpus with deterministic coverage.
- Built strict OpenRouter admission around exact requested/canonical identities, approved upstreams and quantizations, first-attempt direct routing, bounded structured output, sanitized provenance, and fail-closed whole-cast behavior.
- Completed one Qwen3 DeepInfra FP8 canary followed by the paced final matrix: all six residents passed five samples each. Cumulative authorized generation accounting ended at 71/71 with no retries or substitutions.
- Replaced the four public archetype placeholders with six exact resident IDs and registry-owned names, roles, routine cues, and original visual variants.
- Added six unique Phaser palette/silhouette recipes and exposed each resident's role and current routine through the semantic observer without logos or provider affiliation cues.

## Task Commits

1. **Seed the grounded registry and corpus** — `e323f81`, amended cast in `f87a204` and Qwen3 replacement in `6be74a9`
2. **Complete the credential checkpoint** — user-supplied local server-only key confirmed; final bounded reservation recorded in `5a6f130`
3. **Run fail-closed admission and prompt conformance** — `a8b3548`, `11d1523`, `ab1f52c`, with successful live evidence in `cd9d0c5`
4. **Present six distinct public residents** — `6845bc6`

## Verification

- Live admission: 6 residents × 5 samples, all `openrouter_verified`, direct attempt one, empty pipeline, valid schema.
- Focused unit verification: 48 tests passed across public contracts, renderer projection, registry, grounding, replay, and presentation state.
- Browser verification: all 50 mocked semantic-observer Playwright cases passed, including 1024px/1280px layouts and active, quiet, loading, reconnecting, error, overflow, keyboard, and reduced-motion states.
- Full Biome lint, TypeScript checking, and the Next.js production build passed.
- The database-backed integration suite was not rerun during manual close because Docker Desktop is stopped. No database schema changed; fresh-state serialization, deterministic replay, registry validation, and production build coverage passed.

## Deviations from Plan

### User-directed workflow change

Task 4 was implemented without TDD at the user's explicit request during safe-resume recovery. Tests were updated after implementation and then run as focused unit and browser verification.

### Provider admission amendments

The planned Qwen 2.5 resident repeatedly failed structured admission and was replaced, with approval, by Qwen3 235B A22B Instruct 2507 over DeepInfra FP8. DeepSeek R1 0528 was similarly superseded by DeepSeek V3.2 over DeepInfra FP4. Both final residents passed strict-route live admission.

## Issues Encountered

- Rapid admission calls repeatedly reached provider HTTP 429 limits. The final matrix uses deterministic 21-second generation spacing with no retry behavior.
- Earlier Qwen output attempted to populate application-owned relationship effects. The wire schema now excludes that field and injects an empty local value.
- Docker Desktop remained stopped during final manual closure, so database-backed tests were left as an explicit verification caveat rather than silently reported as run.

## Next Plan Readiness

- Plan 02-03 can build typed relationships, bounded memories, deterministic cooldowns, and cast balancing on six stable resident IDs.
- The final provider-call allowance is fully consumed at 71/71. No further OpenRouter call is authorized.
- Human calibration and final publication-gate evaluation remain in Plan 02-04.

## Self-Check: PASSED

- All key source and evidence files exist.
- The Task 4 implementation commit is present.
- Focused unit, browser, lint, typecheck, and build verification passed.
- The only remaining working-tree changes are the user's pre-existing `next-env.d.ts` edit and untracked `.codex/`.

---
*Phase: 02-grounded-ensemble-and-safe-scenes*
*Completed: 2026-07-24*
