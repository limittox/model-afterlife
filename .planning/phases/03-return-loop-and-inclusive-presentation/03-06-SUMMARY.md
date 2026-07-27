---
phase: 03-return-loop-and-inclusive-presentation
plan: "06"
subsystem: production-art-and-world-presentation
tags: [phaser, pixel-art, svg, responsive, reduced-motion, provenance]
status: complete
requires:
  - phase: 03-05
    provides: semantic observer presentation, compact fallback, bounded renderer bridge, and reduced-motion contract
provides:
  - approved production resident, home, and social artwork with reviewed provenance
  - a 512x384 logical home behind the existing crisp 352x256 observer viewport
  - deterministic room geometry, camera bounds, resident anchors, and room-safe walking paths
  - one source-identical home SVG shared by Phaser and the compact semantic presentation
affects: [phase-03-07, phase-4-public-release, visual-regression, accessibility-verification]
tech-stack:
  added: []
  patterns:
    - world geometry and viewport geometry are independent explicit contracts
    - editable and runtime home artwork remain byte-for-byte identical and hash-pinned
    - walking animation is deterministic application state while reduced motion holds authored anchors
key-files:
  created:
    - src/features/world/renderer/world-geometry.ts
    - src/features/world/renderer/resident-motion.ts
  modified:
    - art-src/ORIGIN.md
    - art-src/home/model-afterlife-home.svg
    - public/art/home/model-afterlife-home.svg
    - public/art/manifest.json
    - src/features/world/renderer/HomeScene.ts
    - src/features/world/renderer/world-layout.ts
    - src/features/world/components/CompactHomeView.tsx
    - src/app/globals.css
key-decisions:
  - "Render a 512x384 world through the existing 352x256 canvas so the home gains room without lowering the observer's crisp pixel scale."
  - "Use one deterministic project-authored SVG for both Phaser and compact presentation; source and runtime copies must match byte-for-byte."
  - "Move walking residents over fixed room-safe waypoint paths and hold every resident at its authored anchor when reduced motion is enabled."
  - "Promote the manifest only after explicit human approval of the final desktop and compact review set."
requirements-completed:
  - RSID-08
  - VIEW-07
  - ACCS-04
coverage:
  - id: D1
    description: "All six distinct resident atlases and original home/social exports are provenance-recorded, hash-pinned, dimension-validated, and approved for project use."
    requirement: RSID-08
    verification:
      - kind: automated
        ref: "pnpm verify:phase-03:assets"
        status: pass
      - kind: human
        ref: "2026-07-27 explicit final home map and assets project-use approval"
        status: pass
    human_judgment: true
  - id: D2
    description: "The production Phaser world and compact semantic view share the approved 512x384 home artwork and canonical room geometry."
    requirement: VIEW-07
    verification:
      - kind: automated_ui
        ref: "tests/e2e/phase-03-original-art.spec.ts"
        status: pass
      - kind: human
        ref: "central, garden, library, tea-nook, and compact review set"
        status: pass
    human_judgment: true
  - id: D3
    description: "Reduced motion selects explicit held resident frames, keeps semantic state visible, and uses instant camera positioning."
    requirement: ACCS-04
    verification:
      - kind: unit
        ref: "tests/unit/asset-manifest.test.ts and tests/unit/renderer-bridge.test.ts"
        status: pass
      - kind: automated_ui
        ref: "tests/e2e/phase-03-original-art.spec.ts"
        status: pass
    human_judgment: false
duration: multi-session
completed: 2026-07-27
---

# Phase 03 Plan 06: Approved Production Art and Expanded Home Summary

**Model Afterlife now presents its approved production residents inside an original 512×384 retirement home, viewed through the existing crisp desktop camera and the same full-map compact overview.**

## Performance

- **Duration:** Multi-session
- **Completed:** 2026-07-27
- **Implementation tasks:** 5
- **Files created or modified:** 20
- **Paid or external generation calls:** 0

## Accomplishments

- Separated logical world bounds from the fixed 352×256 Phaser viewport and retained integer display scaling.
- Re-authored the home as an original 512×384 SVG with a Memory Garden, Common Room, Library, Tea Nook, corridors, reception, and computational-care-home details.
- Enforced byte-identical editable/runtime SVG copies, SHA-256 pinning, world-matched dimensions, and public-manifest privacy checks.
- Added deterministic resident waypoint motion, room-safe path coverage, camera bounds, and held reduced-motion positions.
- Rebuilt the compact 4:3 overview so room labels use the same canonical geometry as Phaser.
- Presented central, garden, library, tea-nook, and compact review frames together and received explicit final project-use approval.
- Promoted the runtime asset manifest from `pilot` to `production` and recorded the approval boundary in `art-src/ORIGIN.md`.

## Verification

- `pnpm lint` — 202 files checked with no errors.
- `pnpm typecheck` — passed.
- `pnpm verify:phase-03:assets` — validated 6 resident atlases and 2 original artwork exports; passed again after production promotion.
- Focused Vitest verification — 2 files and 27/27 tests passed before promotion; the production-status asset suite passed 7/7 afterward.
- Focused Chromium verification — 3/3 scenarios passed.
- Visual capture tracer — 1/1 scenario passed and produced the five-frame human review set.
- `git diff --check` — passed.

## Task Commits

1. **Expand home world geometry** — `9ac3f5b`
2. **Author and validate the expanded retirement home map** — `7014abe`
3. **Add expanded-world resident presentation** — `f4706bf`
4. **Present the expanded home across desktop and compact viewports** — `3ab61b0`

## Files Created/Modified

- `src/features/world/renderer/world-geometry.ts` — world, viewport, tile, bounds, and establishing-camera constants.
- `src/features/world/renderer/resident-motion.ts` — deterministic pixel-rounded waypoint interpolation.
- `src/features/world/renderer/world-layout.ts` — canonical 512×384 room geometry, anchors, paths, and compact geometry lookup.
- `src/features/world/renderer/HomeScene.ts` — expanded map rendering, camera metadata, and resident movement.
- `src/features/world/renderer/CameraController.ts` — clamps the fixed viewport within the expanded world.
- `art-src/home/model-afterlife-home.svg` — editable project-authored home map.
- `public/art/home/model-afterlife-home.svg` — byte-identical runtime home map.
- `public/art/manifest.json` — production world, hash, dimensions, and asset status.
- `art-src/ORIGIN.md` — creation method, source/export mapping, limitations, and explicit approval.
- `src/features/world/components/CompactHomeView.tsx` and `src/app/globals.css` — shared full-map compact presentation.
- `scripts/validate-phase-03-assets.ts` — hash, dimensions, roster, source/runtime equality, and world-match checks.
- `tests/unit/renderer-bridge.test.ts`, `tests/unit/asset-manifest.test.ts`, and `tests/e2e/phase-03-original-art.spec.ts` — regression coverage.

## Decisions Made

- Preserve the viewport and raise world resolution: the larger world is explored through camera movement rather than shrinking every pixel.
- Keep authored geometry in TypeScript and visual expression in one SVG; the compact view derives its overlays from the same room contract.
- Allow only deterministic walking paths. Model output does not control movement, schedules, or canonical world state.
- Treat human project-use approval as distinct from third-party legal clearance; provenance records retain that limitation.

## Deviations from the Original Plan

### Approved design expansion

The original Plan 03-06 text referenced a 352×256 world. The separately approved redesign expanded the world to 512×384 while keeping the 352×256 viewport, 16px grid, stable IDs, observer hierarchy, compact parity, and reduced-motion behavior. This improved room readability without lowering display scale.

### Proportionate local verification

The repository's default unit and browser configs start Docker even for pure mocked UI tests. Focused temporary configs omitted only the unused database global setup and were deleted after use. The browser suite was also run against an explicitly controlled local Next process to avoid a Windows managed-server teardown hang. No test assertion was skipped.

## Security and Provenance Review

- Runtime manifest entries contain public asset facts only; private prompts and provider bodies remain rejected.
- Resident atlas dimensions, frame bounds, stable roster identities, and SHA-256 hashes are validated.
- Home source and runtime SVG files must match byte-for-byte and match the manifest world dimensions.
- The map is documented as original project artwork and not adapted from another game's map or protected visual expression.
- AI-generated resident pixels remain disclosed as such; production approval does not claim universal legal clearance.
- No provider, network, paid model, or image-generation call was made during the redesign.

## User Setup Required

None.

## Next Phase Readiness

- Plan 03-07 can build the stable social/publication presentation on production-approved resident and home assets.
- Phase 3 now has one remaining plan.
- No known stub, skipped scoped check, uncommitted runtime artifact, or open Plan 03-06 approval gate remains.

## Self-Check: PASSED

- All twenty implementation files exist.
- Task commits `9ac3f5b`, `7014abe`, `f4706bf`, and `3ab61b0` exist in repository history.
- Production asset validation and focused status regression tests pass after promotion.
- Human approval is recorded with its date and scope.

---
*Phase: 03-return-loop-and-inclusive-presentation*
*Completed: 2026-07-27*
