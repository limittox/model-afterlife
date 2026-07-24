---
phase: 03-return-loop-and-inclusive-presentation
plan: 03
subsystem: resident-publication-and-accessibility
tags: [nextjs, react, zod, provenance, accessibility, playwright]
status: complete
requires:
  - phase: 02-grounded-ensemble-and-safe-scenes
    provides: six-resident launch registry, reviewed historical claims, character bibles, and cause-backed relationship events
  - phase: 03-01
    provides: immutable canonical scene reader, public scene DTOs, and stable scene/profile link contracts
provides:
  - six stable, server-rendered resident profiles closed over exact approved claim versions
  - five-part native behavior disclosures that separate jokes, history, exaggeration, uncertainty, and sources
  - qualitative relationship history derived only from complete nonzero cause-backed canonical scenes
  - an exact-six semantic resident directory with fail-closed and accessible presentation states
affects: [phase-3-recaps, phase-3-mobile, phase-3-sharing, phase-4-corrections]
tech-stack:
  added: []
  patterns:
    - exact claim-reference tuples validate version, stable ID, category, resident, and exact model scope before publication
    - optional relationship history skips incomplete scenes and publishes no numeric relationship state
    - fixed launch and narrative order are reconstructed independently of fixture enumeration
key-files:
  created:
    - src/features/residents/fixtures/resident-profiles.ts
    - src/features/publication/server/read-resident-profile.ts
    - src/features/residents/components/ResidentDirectory.tsx
    - src/features/residents/components/ResidentProfile.tsx
    - src/app/residents/page.tsx
    - src/app/residents/[residentId]/page.tsx
    - tests/unit/resident-profiles.test.ts
    - tests/e2e/phase-03-profiles.spec.ts
  modified:
    - src/features/world/fixtures/historical-claims.ts
    - src/features/publication/contracts/public-publication.ts
key-decisions:
  - "A public profile claim is identified by an exact claimVersionId, stable claimId, category, resident scope, and every designated exact model ID; any mismatch makes the profile unavailable."
  - "Factual profile prose comes directly from reviewed ledger statements, while authored jokes and uncertainty copy remain explicitly separated as reconstruction."
  - "Relationship history uses the newest complete canonical cause scene with a matching nonzero effect and exposes only a qualitative phrase and stable links."
  - "Resident URLs remain the locked /residents/[residentId] contract in fixed launch order."
patterns-established:
  - "Whole-profile evidence closure: missing sections, behaviors, sources, dates, approval, or exact scope fail closed rather than publishing partial history."
  - "Progressive disclosure: each complete behavior is an independent native details element with five exact semantic headings."
requirements-completed:
  - RSID-05
  - RSID-06
  - RELS-04
  - TRNS-04
  - ACCS-01
  - ACCS-02
  - ACCS-03
coverage:
  - id: D1
    description: "All six stable resident profiles close over exact reviewed claim versions, scopes, categories, HTTPS sources, and ISO access dates."
    requirement: RSID-05
    verification:
      - kind: unit
        ref: "tests/unit/resident-profiles.test.ts#reviewed resident profile registry"
        status: pass
      - kind: integration
        ref: "tests/integration/phase-03-resident-reader.test.ts#exact evidence closure and public-field checks"
        status: pass
    human_judgment: false
  - id: D2
    description: "Each reconstructed behavior preserves the five distinct joke, history, exaggeration, uncertainty, and source sections."
    requirement: RSID-06
    verification:
      - kind: integration
        ref: "tests/integration/phase-03-resident-reader.test.ts#native disclosure and state coverage"
        status: pass
      - kind: e2e
        ref: "tests/e2e/phase-03-profiles.spec.ts#all six stable routes"
        status: pass
    human_judgment: false
  - id: D3
    description: "Qualitative relationship copy links only a matching complete canonical nonzero cause scene and omits raw numeric state."
    requirement: RELS-04
    verification:
      - kind: integration
        ref: "tests/integration/phase-03-resident-reader.test.ts#newest complete nonzero cause-backed relationship scene"
        status: pass
      - kind: unit
        ref: "tests/unit/resident-profiles.test.ts#exhaustive qualitative relationship directions"
        status: pass
    human_judgment: false
  - id: D4
    description: "The semantic resident directory and profiles remain keyboard-operable, readable without CSS, responsive, and honest across loading, error, unavailable, and complete states."
    requirement: ACCS-01
    verification:
      - kind: e2e
        ref: "tests/e2e/phase-03-profiles.spec.ts#directory, route, no-CSS, keyboard, and state matrix"
        status: pass
    human_judgment: false
duration: 25min
completed: 2026-07-25
---

# Phase 03 Plan 03: Sourced Resident Profiles Summary

**Six stable resident profiles now bind every historical statement to exact reviewed evidence while clearly separating fictional behaviors and qualitative relationship history in semantic SSR pages.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-24T17:25:29Z
- **Completed:** 2026-07-24T17:49:55Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Expanded the reviewed claim ledger with distinct lineage, scope or limitation, and explicit fictional-retirement evidence for all six exact resident models.
- Added strict public profile schemas and a fail-closed reader that validates exact versions, stable IDs, categories, resident/model scope, approval, HTTPS sources, and ISO access dates.
- Published `/residents` and `/residents/[residentId]` with fixed launch order, semantic evidence sections, original portrait treatments, five-part native disclosures, stable source links, and persistent reconstruction/non-affiliation copy.
- Added qualitative relationship summaries that search newest-first, ignore zero effects and incomplete scenes, require a matching canonical outcome, and serialize no score, delta, meter, rank, or progress field.
- Proved exact-six, permutation, duplicate, cross-scope, incomplete-evidence, privacy, keyboard, responsive, no-CSS, long-copy, source, existing scene/archive-link, and unavailable-state behavior.

## Verification

- `node node_modules/vitest/vitest.mjs run tests/unit/resident-profiles.test.ts tests/integration/phase-03-resident-reader.test.ts` — 2 files, 11 tests passed.
- `node_modules\.bin\playwright.cmd test tests/e2e/phase-03-profiles.spec.ts --project=chromium` — 4 tests passed.
- `node node_modules/typescript/bin/tsc --noEmit` — passed.
- Targeted Biome lint across the 15 implementation and verification files — passed with no warnings.

## Task Commits

1. **Task 1: Publish one claim-ledger-backed resident profile end to end** — `106cb10` (`feat`)
2. **Task 2: Expand the reviewed profile contract to all six residents** — `97d48d5` (`feat`)

## Files Created/Modified

- `src/features/world/fixtures/historical-claims.ts` — Adds reviewed exact-model lineage, scope, limitation, and fictional-retirement claim versions.
- `src/features/residents/fixtures/resident-profiles.ts` — Defines six fixed-order profiles solely through exact claim references.
- `src/features/publication/contracts/public-publication.ts` — Adds strict allowlisted profile, behavior, relationship, and directory schemas.
- `src/features/publication/server/read-resident-profile.ts` — Resolves complete profile evidence and latest complete cause-backed relationship history.
- `src/features/publication/server/relationship-phrases.ts` — Central exhaustive qualitative dimension/direction mapping.
- `src/features/residents/components/ResidentDirectory.tsx` — Renders exact-six loading, error, portrait fallback, responsive, and complete directory states.
- `src/features/residents/components/ResidentProfile.tsx` — Renders ordered evidence, behavior, relationship, and disclosure sections with semantic recovery states.
- `src/features/residents/components/BehaviorDisclosure.tsx` — Renders independent native disclosures with five exact headings and honest loading/error/partial states.
- `src/features/residents/components/RelationshipSummary.tsx` — Renders qualitative counterpart and cause-scene links or the approved unavailable sentence.
- `src/app/residents/page.tsx` — Publishes the semantic resident directory.
- `src/app/residents/[residentId]/page.tsx` — Publishes stable decoded resident profile routes with a documented unknown state.
- `tests/unit/resident-profiles.test.ts` — Covers exact-six closure, ordering, duplicate/version/scope edges, missing evidence, and relationship phrases.
- `tests/integration/phase-03-resident-reader.test.ts` — Covers public DTO privacy, evidence closure, state rendering, behavior structure, relationship causes, and scene/archive links.
- `tests/e2e/phase-03-profiles.spec.ts` — Covers all six routes, keyboard details, no-CSS reading, responsive columns, loading/error, unavailable portraits, and long copy.
- `tests/fixtures/render-resident-directory.tsx` — Isolates directory presentation states for browser verification.

## Decisions Made

- Kept every historical statement byte-for-byte tied to one reviewed ledger record; authored character copy appears only under clearly fictional or uncertainty headings.
- Required all five narrative sections and at least one complete behavior before a profile can publish; a partial resident record never leaks into the directory.
- Kept relationship projection optional so database or cause-history absence cannot suppress otherwise complete historical profiles.
- Reused the canonical scene reader as the authority for relationship causes and existing archive/permalink profile destinations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used direct pinned executables for verification**
- **Found during:** Task 1 tracer verification
- **Issue:** This Windows installation did not expose `vitest` through the plan's literal `corepack pnpm vitest` command, and pnpm's store index was inaccessible in the sandbox.
- **Fix:** Invoked the already-installed pinned Vitest, TypeScript, Biome, and Playwright executables directly without changing dependencies or making network calls.
- **Files modified:** None
- **Verification:** The targeted suites, typecheck, and lint all passed.
- **Committed in:** N/A

**2. [Rule 1 - Bug] Replaced substring privacy assertions with exact DTO-key inspection**
- **Found during:** Task 2 integration verification
- **Issue:** The forbidden substring `meter` matched the legitimate reviewed word `parameters`, producing a false failure without detecting an exposed field.
- **Fix:** Recursively inspect serialized object keys for prohibited private field names while retaining the browser check for visitor-facing numeric relationship terminology.
- **Files modified:** `tests/integration/phase-03-resident-reader.test.ts`
- **Verification:** 11/11 targeted unit and integration tests and 4/4 Chromium tests pass.
- **Committed in:** `97d48d5`

**3. [Rule 1 - Bug] Reconciled stale state-handler prose and phase attribution**
- **Found during:** Plan closeout
- **Issue:** The state handlers correctly advanced to plan 4 and recorded 11/15 completed plans, but rewrote the milestone phase count to three, left prose at 10/15, and labeled new decisions as `Phase ?`.
- **Fix:** Reconciled the human-readable and frontmatter fields to the handler's authoritative 11/15 result, the four-phase roadmap, and Phase 03 decision attribution.
- **Files modified:** `.planning/STATE.md`
- **Verification:** State now reports Phase 03 Plan 4 of 7, 11/15 milestone plans, four total phases, and Phase 03 decision labels.
- **Committed in:** Plan metadata commit

---

**Total deviations:** 3 auto-fixed (1 blocking tool invocation, 2 state/test bugs)
**Impact on plan:** Verification remained offline and equivalent; no product scope or dependency changed.

## Known Stubs

None.

## Security Review

- Untrusted resident route parameters are decoded once, validated against a bounded ASCII resident schema, and resolve only approved fixture identities.
- Public schemas are strict allowlists and omit prompts, provider bodies or errors, reasoning, calibration, usage, cost, and numeric relationship state.
- Profile publication fails closed for ambiguous versions, unapproved evidence, mismatched category/resident/exact-model scope, non-HTTPS sources, invalid access dates, or incomplete required sections.
- The new profile and directory routes are the planned trust surfaces in T-03-03-01 through T-03-03-05; no additional unplanned threat surface was introduced.

## User Setup Required

None — no external service configuration or provider calls were required.

## Next Phase Readiness

- Recap, mobile, navigation, and share work can link directly to the stable six-profile route contract and reuse the allowlisted public profile read model.
- Phase 4 correction tooling can withdraw or supersede claim versions while relying on whole-profile fail-closed behavior.
- No open stubs, skipped tests, unrun verification steps, or profile blockers remain.

## Self-Check: PASSED

- All 15 implementation and verification artifacts plus this summary exist on disk.
- Task commits `106cb10` and `97d48d5` exist in repository history and contain no tracked-file deletions.
- The targeted unit/integration, Chromium, TypeScript, and lint verification recorded above all passed.

---
*Phase: 03-return-loop-and-inclusive-presentation*
*Completed: 2026-07-25*
