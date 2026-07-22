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

   `drizzle/0000_world_skeleton.sql` is the reviewed source of truth. `DATABASE_PURPOSE` must be `development` or `test` before Drizzle Kit will run. The optional `corepack pnpm db:push` command is isolated to `PUSH_DATABASE_URL`, a disposable local schema-prototyping database; it never targets the migrated application database.

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
