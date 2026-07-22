# Model Afterlife

A shared, observer-only retirement home for superseded language models. Every browser watches one PostgreSQL-backed timeline; Phaser supplies the disposable pixel view while the complete status, transcript, and controls remain semantic React UI.

The Phase 1 request path is:

```text
Trigger.dev wake-up -> deterministic catch-up -> PostgreSQL journal/projection
                                              -> read-only snapshot/updates routes
                                              -> React observer + local presentation
                                              -> client-only Phaser renderer
```

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

4. Generate and review migrations when the schema changes, then use the repeatable migration and seed path:

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

The page reads a real row from `world_projection`. The browser polls ordered updates only while it has a valid snapshot. Focus, reconnect, cursor gap, and Jump to live replace the local view from a fresh snapshot instead of replaying missed movement.

Pause, Resume, follow, pan, zoom, Reset view, and Jump to live remain browser-local. Public world delivery is read-only:

- `GET /api/world/snapshot` returns one coherent canonical head.
- `GET /api/world/updates?after=<sequence>` returns bounded contiguous updates or requests snapshot replacement.
- No visitor route writes world time, resident locations, schedules, relationships, or scene outcomes.

The canvas is supplementary. Room names, current status, complete dialogue, recovery copy, focus state, and every control remain available in the DOM. The renderer uses original generated geometry on a 16px source grid, integer display scaling, and a closed local-intent bridge.

## Resident admission canaries

The offline conformance suite is safe to run without provider credentials:

```powershell
corepack pnpm test -- tests/unit/resident-prompt.test.ts tests/unit/provider-identity.test.ts tests/integration/resident-admission.test.ts
```

The live admission gate makes exactly five bounded generation calls for each of the six launch residents. It incurs OpenRouter usage charges and fails closed on any model, upstream, quantization, metadata, schema, privacy, or usage mismatch. Put the key only in the server-side `.env` file; never paste it into command output or browser code.

```powershell
corepack pnpm check:resident-admission -- --live --samples=5
```

The command writes only sanitized provenance, latency, cost, and text hashes to `evals/results/phase-02-live-admission.json`. It does not persist prompts, response text, authorization headers, or the API key.

## Full verification

The Playwright project starts Docker services, applies reviewed migrations, seeds only when no canonical projection exists, and starts Next.js. It includes a real two-browser database convergence case plus controlled recovery and UI-state cases:

```powershell
corepack pnpm exec playwright test tests/e2e/semantic-observer.spec.ts tests/e2e/shared-home.spec.ts
corepack pnpm test
corepack pnpm rebuild-world -- --check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

The shared-home suite advances the deterministic service directly, proves one paused viewer buffers while another reaches the new head, and verifies that local camera actions leave the second viewer and database hash unchanged.

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

## Optional cloud deployment

Use separate development and production resources; never reuse the local `db:push` path for production.

1. Create a Neon branch and apply the reviewed migrations with `MIGRATION_DATABASE_URL`.
2. Configure the Vercel project with `DATABASE_URL` and no local `NEON_WS_PROXY`.
3. Configure Trigger.dev with the same server-only database URL, `TRIGGER_PROJECT_REF`, and `TRIGGER_SECRET_KEY`.
4. Deploy the Next.js app to Vercel and the task in `src/trigger/world-clock.ts` to Trigger.dev.
5. Verify `/api/world/snapshot`, run one scheduled catch-up, and confirm `corepack pnpm rebuild-world -- --check` against a safe verification branch before promoting production changes.

Neon and Trigger credentials are server-only. They must never use a `NEXT_PUBLIC_` prefix or enter the renderer bundle.
