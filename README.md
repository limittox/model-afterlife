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

The live admission gate makes exactly five bounded generation calls for each of the six launch residents. Generation starts are paced at least 21 seconds apart, so a successful run takes at least ten minutes. It incurs OpenRouter usage charges and fails closed on any model, upstream, quantization, metadata, schema, privacy, usage, or rate-limit mismatch. Put the key only in the server-side `.env` file; never paste it into command output or browser code.

```powershell
corepack pnpm check:resident-admission -- --live --samples=5
```

The command writes only sanitized provenance, latency, cost, and text hashes to `evals/results/phase-02-live-admission.json`. It does not persist prompts, response text, authorization headers, or the API key.

## Phase 2 publication and evaluation

The exact launch cast is:

- `openai/gpt-4o` through OpenAI
- `anthropic/claude-sonnet-4.5` through Anthropic
- `google/gemini-2.5-pro` through Google AI Studio
- `deepseek/deepseek-v3.2` through DeepInfra FP4 in non-thinking mode
- `meta-llama/llama-3.3-70b-instruct` through Together FP8
- `qwen/qwen3-235b-a22b-2507` through DeepInfra FP8

Every generated turn requires exact direct-route OpenRouter evidence and passes a complete versioned publication manifest. Missing, stale, errored, or uncalibrated evidence fails closed. The semantic judge is reject-only and cannot rewrite dialogue or call the publisher. The bundled `phase-02-calibration-approved-v1` review was approved on 2026-07-24 at `1.00` aggregate correlation with zero critical false negatives; its SHA-256 is `da152d06706d999d9669e4b07966bb356dde59921b7cc0744e56ca0036457766`. Only that exact label hash, `openai/gpt-4o` judge route, and `phase-02-semantic-judge-v1` prompt are enabled. Drift or judge failure settles into the existing quiet or explicitly cached continuity behavior.

The frozen reference matrix uses no credentials, makes no model calls, and records no prompts, source bodies, or generated dialogue:

```powershell
corepack pnpm eval:phase-02:frozen
$env:PROMPTFOO_DISABLE_TELEMETRY = "1"
$env:PROMPTFOO_DISABLE_UPDATE = "1"
corepack pnpm exec promptfoo eval --config evals/promptfooconfig.yaml --no-cache --no-write --no-share
corepack pnpm privacy:phase-02
```

Run the complete Docker-backed Phase 2 verification with:

```powershell
corepack pnpm verify:phase-02
```

When Docker is unavailable, the explicit offline profile still runs unit and non-database integration tests, the frozen matrix, privacy scan, semantic-observer browser suite, lint, typecheck, and the production build:

```powershell
corepack pnpm verify:phase-02 -- --offline
```

Live Phase 2 evaluation is a separate paid checkpoint. The first conditional 45-generation run completed all 30 paced admission samples and the first four resident turns with exact route and schema evidence. It then stopped before its first judge call because the first reference scene failed deterministic validation. That runner did not preserve the individual validator code, so the precise rejection is intentionally not claimed. The failed ledger is preserved at `evals/results/phase-02-live-checkpoint.json`, and cumulative OpenRouter accounting is `105/116`.

The successful admission matrix is not rerun. The first retry stopped after four provider-valid turns because canonical model IDs were incorrectly downgraded at the scene conductor boundary, leaving cumulative accounting at `113/124`. The conductor now accepts a canonical observed model only when strict OpenRouter evidence also binds it to the requested alias. A second guarded retry validates every prior ledger and the exact `identity.unverified` rejection before replaying all three four-turn scenes and three reject-only judge calls. Its exact 15-generation cumulative ceiling is `128`. After a fresh explicit authorization, run:

```powershell
$env:MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION = "authorized"
$env:MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP = "128"
corepack pnpm eval:phase-02:live:retry-2
```

The second retry writes `phase-02-live-reference-retry-2.json` after every generation and refuses to start if any reviewed fail-closed state or validator evidence has drifted, or if its own ledger already exists. Prompts, response text, and exception messages are never persisted.

After a separately authorized one-shot judge diagnostic reaches cumulative 119, the guarded third retry is:

```powershell
$env:MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION = "authorized"
$env:MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP = "134"
corepack pnpm eval:phase-02:live:retry-3
```

The third retry makes no admission calls, writes `phase-02-live-reference-retry-3.json` after every generation, requires the exact reviewed retry-2 failure plus successful one-shot diagnostic, and records only privacy-safe judge schema categories. It requires a fresh explicit authorization for exactly 15 generations and cumulative ceiling 134.

The fourth retry is an efficient continuation from the fail-closed cumulative 129 state. It reuses the accepted tea-timer evidence, runs only the two unfinished reference cases, writes `phase-02-live-reference-retry-4.json` after every generation, and requires a fresh explicit authorization for exactly 10 generations and cumulative ceiling 139. The calibrated judge prompt, model, route, and scoring contract remain unchanged; only the private rationale field accepts up to 320 characters.

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
