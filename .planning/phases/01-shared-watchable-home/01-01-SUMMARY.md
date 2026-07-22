---
phase: 01-shared-watchable-home
plan: "01"
subsystem: database
tags: [nextjs, react, postgres, drizzle, neon, vitest, observer-only]

requires: []
provides:
  - PostgreSQL-backed singleton world, append-only event, and public projection schema
  - Read-only versioned public snapshot contract and GET route
  - Semantic observer shell with local-only pause, resume, and jump-live controls
  - Reproducible Docker, migration, seed, test, build, and security-audit path
affects: [01-02-world-advancement, 01-03-observer-runtime, 01-04-watchable-home]

tech-stack:
  added: [Next.js 16.2.11, React 19.2.8, PostgreSQL 18, Drizzle 0.45.2, Neon serverless 1.1.0, Vitest 4.1.10]
  patterns: [server-owned canon, GET-only public boundary, versioned Zod snapshot, local presentation reducer, immutable seed occurrence]

key-files:
  created:
    - src/db/schema.ts
    - src/features/world/contracts/public-world.ts
    - src/features/world/server/read-current-snapshot.ts
    - src/app/api/world/snapshot/route.ts
    - src/features/world/client/ObserverSkeleton.tsx
    - tests/integration/walking-skeleton.test.ts
    - drizzle/0000_world_skeleton.sql
  modified: []

key-decisions:
  - "Use the approved Neon serverless driver for application queries through the official local WebSocket proxy; use node-postgres only for local Drizzle tooling."
  - "Keep disposable drizzle-kit push work isolated from the migration-managed application database through PUSH_DATABASE_URL."
  - "Pin patched transitive overrides in pnpm-workspace.yaml so the production dependency audit has no known vulnerabilities."
  - "Expose canonical world state only through GET and keep Pause, Resume, and Jump-live in a pure client presentation reducer."

patterns-established:
  - "Canonical boundary: public routes read validated projections; only server modules import the database client."
  - "Local observer intent: presentation actions can replace or delay a snapshot but never call a mutation service."
  - "Database lifecycle: prototype with an isolated push database, then migrate and seed the separate application database."

requirements-completed: [WRLD-01, VIEW-01, VIEW-04, VIEW-08]

coverage:
  - id: D1
    description: "A real PostgreSQL projection crosses a read-only route into a stable versioned public snapshot for independent viewers."
    requirement: WRLD-01
    verification:
      - kind: integration
        ref: "tests/integration/walking-skeleton.test.ts#returns the same committed snapshot to two independent viewers"
        status: pass
      - kind: other
        ref: "HTTP smoke check: GET / and two GET /api/world/snapshot requests"
        status: pass
    human_judgment: false
  - id: D2
    description: "Pause, Resume, and Jump-live affect only local presentation state and preserve the canonical database hash."
    requirement: VIEW-04
    verification:
      - kind: integration
        ref: "tests/integration/walking-skeleton.test.ts#keeps pause, resume, and jump-live presentation state local"
        status: pass
    human_judgment: false
  - id: D3
    description: "The public observer surface exposes no canonical mutation route or browser secret and builds from a frozen audited lockfile."
    requirement: VIEW-08
    verification:
      - kind: integration
        ref: "tests/integration/walking-skeleton.test.ts#exposes no browser-callable canonical mutation route or secret"
        status: pass
      - kind: other
        ref: "corepack pnpm install --frozen-lockfile; db:migrate; db:seed; lint; typecheck; build; audit --prod"
        status: pass
    human_judgment: false
  - id: D4
    description: "The observer homepage renders wordmark, fictional home time, location, Live status, quiet activity, and local presentation controls."
    requirement: VIEW-01
    verification:
      - kind: other
        ref: "HTTP smoke check returned 200 and rendered the Model Afterlife wordmark"
        status: pass
      - kind: other
        ref: "corepack pnpm build"
        status: pass
    human_judgment: false

duration: 20 min
completed: 2026-07-22
status: complete
---

# Phase 1 Plan 01: PostgreSQL Observer Tracer Summary

**A seeded PostgreSQL canon now reaches a read-only Next.js observer with a stable public contract and provably local presentation controls.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-07-22T18:48:59+10:00
- **Completed:** 2026-07-22T19:09:17+10:00
- **Tasks:** 2
- **Files modified:** 32

## Accomplishments

- Established the singleton world, append-only event journal, current projection, reviewed migration, and deterministic immutable seed on real PostgreSQL.
- Delivered a versioned Zod snapshot through `GET /api/world/snapshot` into a semantic observer with home identity and quiet status.
- Proved two-viewer convergence and that Pause, Resume, and Jump-live leave the canonical database hash unchanged.
- Locked the audited stack with frozen installs, controlled native builds, and zero known production vulnerabilities.

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify the identity of recently published packages before installation** - human approval recorded; no file commit required.
2. **Task 2: Build, push, and prove PostgreSQL-backed observer tracer** - `9300c15` (feat)

**Plan metadata:** this commit

## Files Created/Modified

- `src/db/schema.ts` - Defines the singleton world, ordered immutable events, and canonical public projection.
- `drizzle/0000_world_skeleton.sql` - Reviewed initial PostgreSQL migration.
- `scripts/seed-world.ts` - Idempotently inserts one immutable occurrence and its deterministic projection.
- `src/features/world/contracts/public-world.ts` - Defines and validates schema version 1 with exactly one complete scene or quiet status.
- `src/app/api/world/snapshot/route.ts` - Exposes the only public world route as GET-only.
- `src/features/world/client/ObserverSkeleton.tsx` - Renders the shared snapshot and local presentation controls.
- `tests/integration/walking-skeleton.test.ts` - Proves stable reads, quiet-state validity, mutation absence, and unchanged canonical state.
- `README.md` - Documents the complete local database-to-browser run.

## Decisions Made

- Application queries retain the approved Neon serverless driver locally through Neon's official WebSocket proxy; the official `pg` driver is development-only for Drizzle Kit's direct TCP commands.
- `db:push` targets a dedicated disposable database, while `db:migrate` and the application use a separately initialized database. This preserves repeatable migrations after schema prototyping.
- Pnpm native build permissions are explicitly limited to Bufferutil, Esbuild, and Sharp; unrelated optional Depot tooling remains blocked.
- Patched transitive versions of Engine.IO, ws, Sharp, PostCSS, and OpenTelemetry Core are exact lockfile overrides, eliminating all production audit findings without changing the approved top-level pins.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added node-postgres for local Drizzle tooling**
- **Found during:** Task 2 database push
- **Issue:** With only the Neon driver present, Drizzle Kit selected WebSocket mode and rejected the local direct PostgreSQL URL.
- **Fix:** Added official `pg@8.22.0` and `@types/pg@8.20.0` as development-only dependencies; application queries still use Neon.
- **Files modified:** `package.json`, `pnpm-lock.yaml`
- **Verification:** `db:push` reached the isolated local database and applied the reviewed schema.
- **Committed in:** `9300c15`

**2. [Rule 1 - Correctness] Updated the PostgreSQL 18 Docker volume root**
- **Found during:** Task 2 local database startup
- **Issue:** PostgreSQL 18 rejects the legacy `/var/lib/postgresql/data` volume target.
- **Fix:** Mounted the scoped volume at `/var/lib/postgresql`, matching the image's version-aware layout.
- **Files modified:** `docker-compose.yml`
- **Verification:** Docker reported PostgreSQL healthy and the app database migrated from empty.
- **Committed in:** `9300c15`

**3. [Rule 3 - Blocking] Separated push and migration databases**
- **Found during:** Task 2 migration proof
- **Issue:** Running `db:push` and then `db:migrate` against the same fresh database would bypass Drizzle's migration journal and make the repeatable migration fail on existing tables.
- **Fix:** Added an initialized application database and a separate `PUSH_DATABASE_URL` configuration.
- **Files modified:** `.env.example`, `docker-compose.yml`, `drizzle.push.config.ts`, `scripts/init-local-postgres.sql`, `README.md`
- **Verification:** Push succeeded on the disposable database; migration succeeded from an empty application database and remained idempotent.
- **Committed in:** `9300c15`

**4. [Rule 2 - Security] Patched vulnerable transitive dependencies**
- **Found during:** Task 2 production dependency audit
- **Issue:** Approved top-level packages resolved older transitive Engine.IO, ws, Sharp, PostCSS, and OpenTelemetry versions with high/moderate advisories.
- **Fix:** Pinned compatible patched overrides in `pnpm-workspace.yaml` and regenerated the frozen lockfile.
- **Files modified:** `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- **Verification:** `corepack pnpm audit --prod` reports no known vulnerabilities; tests and production build pass.
- **Committed in:** `9300c15`

---

**Total deviations:** 4 auto-fixed (1 correctness, 1 security, 2 blocking)
**Impact on plan:** Every deviation was required to make the approved architecture reproducible and secure; no product scope was added.

## Issues Encountered

- PostgreSQL 18's new volume convention, Drizzle Kit's driver auto-selection, and non-TTY strict push prompt were diagnosed from their direct error output and resolved at their configuration sources.
- Pnpm 11 moved override settings from `package.json` to `pnpm-workspace.yaml`; the lockfile was regenerated only after confirming the new settings home.
- `tsconfck@3.1.3`, a Drizzle Kit transitive, declares a TypeScript 5 peer range while the project deliberately pins audited TypeScript 6.0.3. Typechecking, migration generation, tests, and build all pass with the deliberate project pin.

## User Setup Required

**External services require manual configuration only for cloud development.** See [01-USER-SETUP.md](./01-USER-SETUP.md) for:

- A dedicated Neon development branch and `DATABASE_URL`
- A Trigger.dev development project and `TRIGGER_SECRET_KEY`
- Cloud verification commands and the local-proxy removal step

## Next Phase Readiness

- Plan 02 can build deterministic server-owned advancement on the proven journal/projection transaction boundary.
- The snapshot schema, canonical singleton ID, local Docker stack, and end-to-end integration test are ready for extension.
- No high-severity threat or implementation blocker remains open.

---
*Phase: 01-shared-watchable-home*
*Completed: 2026-07-22*
