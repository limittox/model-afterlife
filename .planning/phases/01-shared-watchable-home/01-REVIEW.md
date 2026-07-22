---
phase: 01-shared-watchable-home
reviewed: 2026-07-22T11:22:50Z
depth: standard
files_reviewed: 90
files_reviewed_list:
  - .env.example
  - .gitignore
  - ATTRIBUTIONS.md
  - README.md
  - biome.json
  - docker-compose.yml
  - drizzle.config.ts
  - drizzle.push.config.ts
  - drizzle/0000_world_skeleton.sql
  - next.config.ts
  - package.json
  - playwright.config.ts
  - pnpm-workspace.yaml
  - postcss.config.mjs
  - public/fonts/OFL.txt
  - scripts/init-local-postgres.sql
  - scripts/rebuild-world.ts
  - scripts/seed-world.ts
  - src/app/api/world/snapshot/route.ts
  - src/app/api/world/updates/route.ts
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/db/client.ts
  - src/db/schema.ts
  - src/features/world/client/WorldObserver.tsx
  - src/features/world/client/presentation-reducer.ts
  - src/features/world/client/presentation-types.ts
  - src/features/world/client/scene-playback.ts
  - src/features/world/client/use-scene-playback.ts
  - src/features/world/client/use-world-feed.ts
  - src/features/world/client/world-query-client.tsx
  - src/features/world/components/ConnectionBanner.tsx
  - src/features/world/components/DialogueTranscript.tsx
  - src/features/world/components/HomeStatusStrip.tsx
  - src/features/world/components/ObserverControlDock.tsx
  - src/features/world/components/PixelWorldViewport.tsx
  - src/features/world/components/ResidentFocusChip.tsx
  - src/features/world/components/SceneCard.tsx
  - src/features/world/components/SceneRail.tsx
  - src/features/world/contracts/public-world.ts
  - src/features/world/domain/advance.ts
  - src/features/world/domain/canonical.ts
  - src/features/world/domain/clock.ts
  - src/features/world/domain/events.ts
  - src/features/world/domain/replay.ts
  - src/features/world/domain/types.ts
  - src/features/world/fixtures/provisional-world.ts
  - src/features/world/fixtures/ui-states.ts
  - src/features/world/renderer/CameraController.ts
  - src/features/world/renderer/HomeScene.ts
  - src/features/world/renderer/PhaserWorld.tsx
  - src/features/world/renderer/PixelWorld.tsx
  - src/features/world/renderer/SpeechBubbleLayer.ts
  - src/features/world/renderer/create-world-game.ts
  - src/features/world/renderer/integer-display-scale.ts
  - src/features/world/renderer/renderer-bridge.ts
  - src/features/world/renderer/renderer-lifecycle.ts
  - src/features/world/renderer/renderer-types.ts
  - src/features/world/renderer/world-layout.ts
  - src/features/world/server/advance-world-to.ts
  - src/features/world/server/read-current-snapshot.ts
  - src/features/world/server/read-snapshot.ts
  - src/features/world/server/rebuild-world-projection.ts
  - src/features/world/server/seed-data.ts
  - src/features/world/server/to-public-snapshot.ts
  - src/features/world/server/world-repository.ts
  - src/trigger/world-clock.ts
  - tests/database-test-environment.ts
  - tests/e2e/global-setup.ts
  - tests/e2e/semantic-observer.spec.ts
  - tests/e2e/shared-home.spec.ts
  - tests/global-setup.ts
  - tests/integration/database-seeding.test.ts
  - tests/integration/migration-manifest.test.ts
  - tests/integration/test-database-environment.test.ts
  - tests/integration/walking-skeleton.test.ts
  - tests/integration/world-api.test.ts
  - tests/integration/world-catchup.test.ts
  - tests/integration/world-repository.test.ts
  - tests/setup.ts
  - tests/unit/presentation-reducer.test.ts
  - tests/unit/public-world-contract.test.ts
  - tests/unit/renderer-bridge.test.ts
  - tests/unit/scene-playback.test.ts
  - tests/unit/world-clock.test.ts
  - tests/unit/world-replay.property.test.ts
  - trigger.config.ts
  - tsconfig.json
  - vitest.config.ts
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 1: Code Review Report

**Reviewed:** 2026-07-22T11:22:50Z
**Depth:** standard
**Files Reviewed:** 90
**Status:** clean

## Summary

The complete Phase 1 implementation was re-reviewed through `4ced298` after remediation commits `878577f..4ced298`. The original six blockers and three warnings are resolved, the remediation diff introduced no new blocker or warning, and all reviewed files now meet the Phase 1 correctness, security, and maintainability bar.

The requested base `81b9d6f` was not a valid commit, so the mandated fallback `d2c7ff1323bfd5e6ce6516ad5d0900e30c0a903b` (the parent of `9300c15`) remains the review base. Planning artifacts, `.codex`, lockfiles, generated Drizzle metadata, generated Next types, binary fonts, and ignored files were excluded.

## Narrative Findings (AI reviewer)

No unresolved narrative findings remain.

## Resolution Evidence

### CR-01: Deployment-sized first wake — resolved

Seeding now anchors the initialized world at `targetTickFor(Date.now(), WORLD_EPOCH_MS)`, so the first scheduled wake advances only the post-deployment gap instead of materializing more than 290,000 historical ticks. Unit evidence constructs the July 22 deployment tick and proves the first wake emits at most four events.

### CR-02: Re-seeding canonical state — resolved

`seedWorld` now uses `onConflictDoNothing` for the canonical projection and reconstructs the seed event from its persisted tick. The integration test runs the seed script against an existing canonical head and proves sequence, hash, and internal state remain unchanged.

### CR-03: Incremental migration failure — resolved

The unreleased two-step migration was squashed into one fresh-install migration containing the complete Phase 1 schema. The disposable test database is recreated, migrated from empty, and seeded on every unit/integration and E2E run; the migration-manifest test verifies there is exactly one journal entry and that all required non-null columns exist in it.

### CR-04: Stale snapshot rewind — resolved

Snapshot requests now carry monotonically increasing generations. Both the hook and reducer reject superseded generations, lower sequences, and changed world IDs. The reducer test proves an update to sequence 11 cannot be rewound by an older sequence-10 snapshot.

### CR-05: Paused-buffer recovery dead path — resolved

Recovery intent now lives in reducer state as `snapshotRequestGeneration` plus `snapshotReason`; `useWorldFeed` keys and enables the snapshot query directly from that state. `connection-restored` cannot clear a pending recovery. The 101-update test proves overflow creates a durable fresh-snapshot request and leaves the observer honestly reconnecting.

### CR-06: Scene pinned to final turn — resolved

Scene playback now has explicit turn index, remaining duration, and running timestamp state. It consumes `presentationDurationMs`, advances the current marker/bubble/progress through each turn, and freezes/resumes the remaining turn time locally. Pure playback tests pass, the renderer test selects a requested active turn, and the synchronized browser test passed five repeated runs plus the final full suite.

### WR-01: Contradictory public update envelopes — resolved

The Zod contracts now require update sequence, logical tick, and hash to match the embedded snapshot; envelopes must be contiguous, share one world, and report the exact included head. Recovery envelopes cannot contain updates or claim more pages. Contract tests reject contradictory metadata, gaps, and wrong response boundaries.

### WR-02: Persistent-history test coupling — resolved

Both Vitest and Playwright now target the explicitly checked `model_afterlife_test` database. Global setup terminates its connections, drops and recreates only that exact database, applies the reviewed migration, and seeds a known canonical state. The walking-skeleton assertion no longer assumes a quiet head, and an integration guard verifies the disposable test URL.

### WR-03: Duplicate observer implementation — resolved

`ObserverSkeleton.tsx` was deleted. Walking-skeleton and source-boundary checks now exercise the reducer and client modules actually imported by `src/app/page.tsx`.

## Verification

- `corepack pnpm test`: **61/61 passed** across 13 unit/integration files, including database recreation, migration, repeated seed, deployment anchor, monotonic recovery, buffer overflow, public contracts, and scene playback.
- Isolated playback browser repetition: **5/5 passed** after synchronizing the fake clock with the resumed effect.
- Isolated full Playwright run: **50/50 passed in 57.9s**, including shared two-viewer convergence and timed Pause/Resume playback.
- `corepack pnpm lint`: passed across 75 files.
- `corepack pnpm typecheck`: passed.
- `corepack pnpm build`: passed with all application and API routes compiled.
- `corepack pnpm rebuild-world -- --check`: passed; replayed and committed sequence/hash matched exactly.

All reviewed files meet quality standards. No issues found.

---

_Reviewed: 2026-07-22T11:22:50Z_
_Reviewer: generic-agent workaround (gsd-code-reviewer role instructions)_
_Depth: standard_
