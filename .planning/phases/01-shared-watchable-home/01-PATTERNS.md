# Phase 1: Shared Watchable Home - Pattern Map

**Mapped:** 2026-07-22
**Files analyzed:** 28 proposed application files/groups
**Analogs found:** 0 / 28

## Greenfield Finding

There is no application source code outside `.planning/` and workflow-owned `.codex/`. No existing product file is a valid analog, and `.codex/` must not be copied as application architecture. Phase 1 plans must therefore reference the official patterns and project contracts in `01-RESEARCH.md` and `01-UI-SPEC.md` for every new file.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | build/tooling | None | no analog |
| `pnpm-lock.yaml` | config | dependency resolution | None | no analog |
| `tsconfig.json` | config | build/tooling | None | no analog |
| `next.config.ts` | config | build/tooling | None | no analog |
| `postcss.config.mjs` | config | build/tooling | None | no analog |
| `biome.json` | config | validation | None | no analog |
| `vitest.config.ts` | config | validation | None | no analog |
| `playwright.config.ts` | config | validation | None | no analog |
| `drizzle.config.ts` | config | schema/migration | None | no analog |
| `trigger.config.ts` | config | scheduled execution | None | no analog |
| `src/app/layout.tsx` | route/layout | request-response | None | no analog |
| `src/app/page.tsx` | route/page | request-response | None | no analog |
| `src/app/globals.css` | style/tokens | presentation | None | no analog |
| `src/db/client.ts` | provider | request-response/transaction | None | no analog |
| `src/db/schema.ts` | model | event-driven/CRUD | None | no analog |
| `src/features/world/contracts/public-world.ts` | contract | transform | None | no analog |
| `src/features/world/domain/clock.ts` | utility | transform | None | no analog |
| `src/features/world/domain/reducer.ts` | service | event-driven/transform | None | no analog |
| `src/features/world/domain/replay.ts` | service | batch/transform | None | no analog |
| `src/features/world/server/world-repository.ts` | service | transaction/CRUD | None | no analog |
| `src/features/world/server/advance-world.ts` | service | event-driven/transaction | None | no analog |
| `src/app/api/world/snapshot/route.ts` | route | request-response | None | no analog |
| `src/app/api/world/updates/route.ts` | route | request-response | None | no analog |
| `src/trigger/world-clock.ts` | worker | scheduled/event-driven | None | no analog |
| `src/features/world/client/WorldObserver.tsx` | component/provider | polling/state | None | no analog |
| `src/features/world/client/presentation-reducer.ts` | store/reducer | event-driven/transform | None | no analog |
| `src/features/world/renderer/PhaserWorld.tsx` | component | render bridge | None | no analog |
| `src/features/world/renderer/create-home-game.ts` | adapter | event-driven/render | None | no analog |

## Pattern Assignments

### Project scaffold and configuration

**Files:** `package.json`, tool configs, `src/app/layout.tsx`, `src/app/globals.css`

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → Standard Stack and browser-only renderer boundary.
- `01-UI-SPEC.md` → manual Tailwind token layer, exact fonts, color roles, type scale, spacing scale, desktop breakpoints, and focus treatment.
- Keep the root App Router shell server-rendered; put only interactive observer islands behind `'use client'`.

### Database schema and repository

**Files:** `src/db/client.ts`, `src/db/schema.ts`, `drizzle.config.ts`, migration SQL, `world-repository.ts`

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → selective event journal, interactive transaction, unique occurrence keys, projection head, canonical state hash, and reviewed migrations.
- Official Drizzle transaction, Neon connection, and constraints links cited in research.
- The repository implements ports consumed by the pure domain; domain files never import Drizzle or environment variables.

### World domain and replay

**Files:** `clock.ts`, `reducer.ts`, `replay.ts`, public contracts, fixtures

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → pure deterministic kernel with injected target tick and stable seed material.
- `01-CONTEXT.md` D-14/D-15 → canonical state is server-owned and timezone-independent.
- `REQUIREMENTS.md` WRLD-08 → replay must reproduce public state.
- Ban `Date.now()`, `Math.random()`, database access, and browser APIs from domain modules; pass values through explicit parameters.

### Snapshot and ordered-update routes

**Files:** `snapshot/route.ts`, `updates/route.ts`

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → snapshot bootstrap, bounded ordered updates, cursor gap recovery, Zod boundary validation.
- Routes remain read-only and return sanitized public contracts only.
- Validate and bound the `after` cursor and page size before repository calls.

### Trigger.dev clock adapter

**Files:** `trigger.config.ts`, `src/trigger/world-clock.ts`

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → scheduled catch-up is a wake-up; database occurrence keys are canonical dedupe.
- Official Trigger.dev scheduled-task and idempotency patterns cited in research.
- The adapter supplies time to `advanceWorldTo`; it does not contain schedule or reducer rules.

### React observer and local presentation state

**Files:** `WorldObserver.tsx`, presentation reducer, semantic component files created by the plans

**Analog:** None.

**Use instead:**
- `01-UI-SPEC.md` → component inventory, 36 state considerations, keyboard order, copy, semantic transcript, and persistent control dock.
- `01-CONTEXT.md` D-10–D-18 → local pause/follow/camera/recovery behavior.
- `01-RESEARCH.md` → one query owner, separate acquisition and presentation cursors, last-valid-snapshot retention.

### Phaser renderer and bridge

**Files:** `PhaserWorld.tsx`, `create-home-game.ts`, bridge/types, provisional render assets

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → `'use client'` plus SSR-disabled dynamic import, explicit mount/unmount, pixel/camera patterns.
- `01-UI-SPEC.md` → 16px source grid, integer scaling, stable room IDs/camera targets, supplementary two-line bubbles, restrained active-speaker marker.
- The bridge accepts public render state and emits local intents only. It exposes no canonical mutation callback.

### Tests

**Files:** unit, integration, and Playwright suites created by the plans

**Analog:** None.

**Use instead:**
- `01-RESEARCH.md` → replay/chunking properties, duplicate wake-up integration, cursor gap behavior, two-context convergence.
- `01-UI-SPEC.md` → approved loading, empty, error, partial, overflow, long-text, focus, and reduced-motion states.
- Use deterministic clock/seed fixtures and a dedicated test database; do not mock PostgreSQL concurrency semantics for the writer test.

## Shared Patterns

### Inward dependency direction

`renderer/client → public contracts ← server adapter → pure domain`; database and Trigger adapters depend on domain ports, never the reverse.

### Server-authoritative data

Only the scheduled/server path may write journal or projection rows. Every visitor route is read-only. Camera, follow, pause, transcript reveal, and recovery notices remain client-local.

### Complete-scene boundary

The public contract carries zero or one complete authored scene. React may reveal turns at the local presentation pace; neither the API nor renderer exposes a partial canonical transcript.

### Error retention

Client query errors preserve the last valid snapshot. Hard errors with no snapshot use the canonical retry surface. Renderer state is never cleared merely because a background refetch failed.

### Semantic/canvas split

React DOM is authoritative for labels, clock, scene premise, full transcript, status, recovery, controls, focus, and announcements. Phaser is supplementary visual staging.

### Verification-first file contracts

Every production module is paired with a focused test or covered by a named integration/E2E scenario. Verify commands use project-local binaries through pnpm and fail on missing inputs.

## No Analog Found

All proposed product files have no existing codebase analog because the repository is greenfield. Plans must state `No codebase analog — follow 01-RESEARCH.md and 01-UI-SPEC.md` in actions for these files rather than inventing a precedent.

## Metadata

**Analog search scope:** all files outside `.planning/` and workflow-owned `.codex/`

**Files scanned:** 0 application files

**Pattern extraction date:** 2026-07-22
