# Model Afterlife

A shared, observer-only retirement home for superseded language models. Phase 1 begins with a real PostgreSQL-backed public world snapshot, a read-only route, and local presentation controls that cannot author canon.

## Local full-stack run

Requirements: Node.js 24, Corepack, and Docker Desktop.

1. Activate the audited package manager and install the exact lockfile:

   ```powershell
   corepack use pnpm@11.15.1
   corepack pnpm install --frozen-lockfile
   ```

2. Create the local environment file from `.env.example`. The checked-in defaults are deliberately scoped to the Docker development database and must never be replaced with a production database for `db:push`:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Start PostgreSQL and the local Neon WebSocket proxy:

   ```powershell
   corepack pnpm db:up
   ```

4. Generate and review the migration, then use the repeatable migration and seed path:

   ```powershell
   corepack pnpm db:generate
   corepack pnpm db:migrate
   corepack pnpm db:seed
   ```

   The reviewed migrations in `drizzle/` are the source of truth. `DATABASE_PURPOSE` must be `development` or `test` before Drizzle Kit will run. The optional `corepack pnpm db:push` command is isolated to `PUSH_DATABASE_URL`, a disposable local schema-prototyping database; it never targets the migrated application database.

5. Prove the database-to-route-to-observer tracer and build the app:

   ```powershell
   corepack pnpm test -- tests/integration/walking-skeleton.test.ts
   corepack pnpm lint
   corepack pnpm typecheck
   corepack pnpm build
   ```

6. Run the observer at [http://localhost:3000](http://localhost:3000):

   ```powershell
   corepack pnpm dev
   ```

The page reads a real row from `world_projection`. Pause, Resume, and Jump to live remain browser-local; the public API exposes only `GET /api/world/snapshot`.

For cloud development, replace the local values with a dedicated Neon development branch connection and remove `NEON_WS_PROXY`. Do not point `db:push` at production. Trigger.dev credentials are not required until the scheduled advancement work in Plan 02.

## Scheduled world clock

The world clock is a declarative UTC `* * * * *` Trigger.dev schedule. Delivery is only a wake-up: its scheduled timestamp is converted to a logical target tick, and `advanceWorldTo` catches up every missing tick inside one world-locked PostgreSQL transaction. Duplicate or late deliveries are harmless because the database journal, occurrence keys, and projection are canonical.

Run the scheduler recovery integration locally without Trigger.dev credentials:

```powershell
corepack pnpm test -- tests/integration/world-catchup.test.ts
corepack pnpm rebuild-world -- --check
```

The rebuild check exits successfully only when ordered journal replay matches the committed projection sequence and hash.

To exercise the cloud-capable local Trigger.dev runner, create a development project, add its project ref and development secret to `.env.local`, use a dedicated Neon development branch, remove `NEON_WS_PROXY`, and run:

```powershell
corepack pnpm trigger:dev
```

The task has a two-minute queue TTL, three bounded attempts, a 60-second maximum duration, and one-at-a-time task concurrency. Database uniqueness remains the source of truth even when provider-level delivery is repeated.
