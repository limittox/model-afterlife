# Stack Research

**Domain:** Persistent observer-only pixel-art web simulation with constrained LLM dialogue
**Researched:** 2026-07-22
**Confidence:** MEDIUM

## Recommendation in One Sentence

Build a **Next.js 16.2 / React 19 site with a client-only Phaser 4 canvas**, store the canonical event-sourced world in **Neon PostgreSQL 18**, advance it with **Trigger.dev 4 durable scheduled tasks**, deliver changes through **cursor-based TanStack Query polling**, and generate validated scene records through the **OpenAI Responses API with Zod 4 Structured Outputs**.

This stack keeps the simulation deterministic and cheap. The browser renders a projection of server-owned state; it never becomes the source of truth, and an LLM never drives the clock, schedules, movement, or relationship rules.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 24 LTS (Krypton) | Production and tooling runtime | Node 24 is the current LTS line; Node 26 is still Current. It satisfies every selected package's runtime floor without adopting a non-LTS production runtime. |
| pnpm | 11.15.1 | Package manager and lockfile | Fast, strict dependency installation with one lockfile. Pin through Corepack and commit `pnpm-lock.yaml`. |
| Next.js | 16.2.11 | App Router, server-rendered profiles/history, route handlers, asset delivery | The product needs more than a game canvas: metadata, resident profiles, recaps, API routes, disclosures, and a simplified mobile view. Next.js provides that shell while Phaser remains a browser-only island. |
| React / React DOM | 19.2.8 | Site chrome, panels, profile cards, scene history, accessibility | React should own semantic UI and observer controls; it should not render hundreds of moving world sprites. |
| TypeScript | 6.0.3, deliberately pinned | Shared domain, API, database, job, and generation types | TypeScript 7.0.2 is current but does not expose the programmatic compiler API until 7.1. The official migration guidance recommends side-by-side TypeScript 6 for tools that need that API. Start on 6.0.3 to avoid a two-compiler setup during the MVP. |
| Phaser | 4.2.1 | WebGL/Canvas pixel-world renderer, cameras, sprites, animation, tilemaps | Phaser 4 is now stable and browser-first. Core support includes Tiled JSON maps, cameras, sprite animation, `pixelArt`, and `roundPixels`; these directly match a compact, observer-only 2D home. Use core APIs and avoid assuming Phaser 3 plugins are compatible. |
| Tailwind CSS | 4.3.3 | Responsive site chrome and overlay styling | Useful for panels and the simplified mobile presentation. Keep the canvas itself independent of Tailwind and DOM layout. |

### Data, Scheduling, and Delivery

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PostgreSQL on Neon | PostgreSQL 18.4 | Canonical world state, schedules, event log, scenes, relationships, prompt versions, generation runs | The domain is relational and transactional. PostgreSQL uniqueness constraints, transactions, JSONB, and ordered event IDs are a better fit than a document store. Neon made PostgreSQL 18 generally available for production and provides serverless connection handling and branching. |
| `@neondatabase/serverless` | 1.1.0 | Serverless PostgreSQL connection | Use the HTTP path for short Next.js queries and the appropriate pooled connection for migrations or transactions. Co-locate Neon and Vercel regions. |
| Drizzle ORM / Drizzle Kit | 0.45.2 / 0.31.10 | Typed SQL schema and reviewed migrations | Drizzle is thin, serverless-ready, and has first-party Neon HTTP support. Use code-first `generate` plus reviewed SQL and `migrate`; never use `push` against production. |
| Trigger.dev SDK / CLI | 4.5.6 | Durable clock tick, event materialization, dialogue generation, recap generation | Trigger.dev supplies scheduled tasks, retries, queues, concurrency limits, idempotency keys, checkpoint/resume, and task traces. Those are the missing guarantees in a plain cron-triggered function. |
| TanStack React Query | 5.101.4 | Foreground snapshot and event polling | A shared observer feed does not need bidirectional sockets. Poll a cursor endpoint every 5 seconds while visible, stop background polling, and refetch on focus. This is cheaper and easier to recover than maintaining socket state. |

### Model Integration and Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| OpenAI JavaScript SDK | 6.48.0 | Server-side Responses API calls | The official SDK identifies Responses as the primary API and supports structured parsing. Calls belong only in Trigger.dev tasks; never expose credentials or generation controls to the browser. |
| GPT-5.6 Terra | `gpt-5.6-terra`, configurable | Baseline dialogue reconstruction model | Official guidance positions Terra as the balance of quality and cost. Start with `reasoning.effort: "low"` for short, bounded scenes; compare Luna on the same scene eval set before optimizing cost. Record the returned model identifier, prompt version, latency, and token usage for every run. |
| Zod | 4.4.3 | Shared runtime schemas and Structured Output contracts | Zod 4 is stable, supports native JSON Schema conversion, and is accepted by OpenAI SDK 6.48. Use one schema for generated scene beats, API payloads, and database-bound validation. |

Do not ask the model for free-form transcript text alone. Generate a compact object such as `sceneTitle`, `beats[]`, `speakerId`, `line`, `intent`, `factRefs[]`, `relationshipDeltas[]`, and `safetyFlags[]`; reject unknown resident IDs, excessive line lengths, uncited historical claims, or deltas outside authored limits before committing the scene.

The model is a replaceable adapter behind an interface. `gpt-5.6-terra` is the initial evaluated baseline, not a permanent business rule. Version prompts and character-bible inputs separately from model selection.

### Testing and Observability

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| Vitest | 4.1.10 | Unit and integration tests | Test pure clock calculations, schedule resolution, relationship rules, Zod contracts, cursor APIs, and idempotent reducers. Run `tsc` separately because Vitest transforms TypeScript but does not type-check it. |
| fast-check | 4.9.0 | Seeded property tests | Verify determinism, replay equivalence, no duplicate events, monotonic cursors, bounded relationship values, and catch-up behavior over many generated timelines. Preserve failing seeds in CI output. |
| Playwright | 1.61.1 | Browser and visual regression tests | Test the Next/Phaser boundary, camera follow, pause/review controls, reconnect/catch-up, desktop Chromium, WebKit, and a simplified mobile viewport. Freeze the clock and seed, then use screenshots for stable canvas smoke tests. |
| Sentry for Next.js | 10.67.0 | Browser/server errors and performance traces | Capture Next.js and client failures with release identifiers. Do not enable session replay by default for the canvas; it adds weight while providing little sprite-level diagnosis. |
| Trigger.dev dashboard + structured generation rows | 4.5.6 / application schema | Job and AI observability | Tag every task/log with `tick_id`, `event_id`, `scene_id`, `prompt_version`, and `model`. Persist generation status, schema failures, retries, latency, and token usage in PostgreSQL so cost and quality can be audited together. |

Use live model calls only in a separate evaluation lane, not ordinary unit tests. Maintain a small, reviewed corpus of event frames and expected constraints; score character fidelity, factual grounding, brevity, repetition, and safety before changing the model or prompt.

### Hosting and Asset Workflow

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel | Managed | Next.js web, route handlers, static sprites/maps | Lowest-friction Next.js deployment and CDN delivery. Use the Node runtime for server routes; keep durable simulation work out of request handlers. |
| Neon | Managed PostgreSQL 18 | Persistent state and branching | Serverless-friendly PostgreSQL with pooled connections and isolated branches for preview/test environments. |
| Trigger.dev Cloud | v4 | Durable jobs | Deploy background tasks independently of the Vercel request lifecycle. Use one concurrency-limited queue for the canonical world clock and a separate bounded generation queue. |
| Aseprite | 1.3.17.2 stable | Source sprites, animation tags, sprite sheets | Keep `.aseprite` source files under `art-src/`; export tagged PNG atlases plus JSON. Do not standardize on 1.3.18 betas. |
| Tiled | 1.12.2 | Retirement-home map and object layers | Phaser directly loads Tiled JSON. Use object layers and custom properties for named rooms, waypoints, seats, doors, and camera bounds. Use one tileset image per layer because Phaser's Tiled parser does not support collection-of-images tilesets. |

Commit both editable art sources and deterministic runtime exports. Aseprite is a licensed desktop tool, so v1 should not require it on CI: export locally through a checked-in CLI script, commit PNG/JSON outputs under `public/assets/`, and have CI validate dimensions, frame tags, duplicate keys, tile properties, and asset hashes.

## Required Stack Patterns

### 1. Client-only render island

Place Phaser behind a small `'use client'` wrapper and load the game module dynamically with SSR disabled. Next.js/React owns headings, controls, drawers, dialogue history, profile content, focus order, and disclosures. Phaser owns the canvas, camera, sprites, tile layers, and visual interpolation. Connect them through a narrow typed bridge; never mount React components per resident.

### 2. Deterministic clock with catch-up

Define a fixed epoch and tick duration. Each scheduled job computes the latest due tick from wall-clock time, then transactionally materializes any missing ticks. A unique `(world_id, tick_number)` key and Trigger.dev idempotency key make delayed or duplicate invocations harmless. The task must catch up from stored state rather than trusting cron precision.

### 3. Append-only event log plus projections

Write immutable domain events first, then update current resident/location/relationship projections in the same transaction. Store generated scenes as immutable artifacts linked to the authored trigger event and prompt version. This gives recaps, recent-scene history, debugging, and deterministic replay one common source.

### 4. Cursor polling with client interpolation

Expose a bootstrap snapshot and `events?after=<event_id>`. While the tab is visible, TanStack Query polls every 5 seconds and applies new events in order; on focus or cursor gaps it requests a fresh snapshot. Phaser interpolates residents locally between authoritative waypoints, so network polling does not make movement appear five seconds at a time.

### 5. Bounded generation queue

Authored simulation events enqueue scene-generation work; they do not call the model inside the canonical clock transaction. Limit concurrency, use `event_id + prompt_version` as an idempotency key, parse with Zod, run deterministic policy checks, and only then publish the scene. On failure, the world continues and the event remains eligible for retry or a curated fallback.

## Installation

```bash
# Runtime and web
pnpm add next@16.2.11 react@19.2.8 react-dom@19.2.8 phaser@4.2.1 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3

# Data, jobs, polling, and model integration
pnpm add drizzle-orm@0.45.2 @neondatabase/serverless@1.1.0 @trigger.dev/sdk@4.5.6 @tanstack/react-query@5.101.4 openai@6.48.0 zod@4.4.3 @sentry/nextjs@10.67.0

# Development and verification
pnpm add -D typescript@6.0.3 drizzle-kit@0.31.10 trigger.dev@4.5.6 vitest@4.1.10 @vitest/coverage-v8@4.1.10 fast-check@4.9.0 @playwright/test@1.61.1 @biomejs/biome@2.5.5
```

Pin Node 24 and pnpm 11.15.1 in project metadata. Keep exact dependency versions in the lockfile; use controlled dependency-update PRs rather than floating production installs.

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Browser world | Phaser 4 | PixiJS 8 | Choose PixiJS if the team wants to build its own scene, camera, animation, and tilemap abstractions and values a thinner renderer more than Phaser's integrated framework. |
| Site framework | Next.js App Router | Vite React SPA plus separate API | Choose Vite only if profiles, recaps, metadata, and APIs move to a separate backend and the site becomes almost entirely client-side. |
| Database | Neon PostgreSQL | Supabase PostgreSQL | Supabase becomes attractive if accounts, authorization, storage, or managed realtime become first-class features; those are out of scope in v1. |
| ORM | Drizzle | Prisma | Prisma is reasonable when its schema language and broader tooling outweigh a larger runtime and less direct SQL control. The event-log domain benefits from Drizzle's explicit SQL. |
| Scheduling | Trigger.dev | Vercel Cron | Vercel Cron is sufficient for a best-effort daily maintenance task. It is not the canonical world engine because failed invocations are not retried and duplicate/overlapping invocations must be handled manually. |
| Delivery | Cursor polling | Hosted realtime provider | Add Ably, Pusher, or Supabase Realtime only after measurement shows 5-second foreground polling harms the viewing experience or traffic makes polling wasteful. |
| Model baseline | GPT-5.6 Terra | GPT-5.6 Luna | Promote Luna only when the same scene evaluation corpus meets the quality bar at lower cost; use Sol selectively for offline character-bible synthesis, not routine dialogue. |
| Map authoring | Tiled | LDtk | Use LDtk if its level-design workflow is materially better and the team accepts maintaining a custom importer; Tiled has the direct Phaser path. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `setInterval` or an in-memory game loop inside Next.js | Serverless instances sleep, restart, scale horizontally, and do not own a durable singleton clock. | Trigger.dev schedule plus a PostgreSQL tick ledger and catch-up calculation. |
| Socket.IO/WebSocket server in Vercel Functions | Vercel explicitly does not support Functions acting as WebSocket servers, and this observer-only feed does not need bidirectional state. | Cursor polling now; a hosted realtime provider only if later justified. |
| Vercel Cron as the sole world scheduler | It does not retry failures, can deliver duplicates, and can overlap invocations; Hobby timing is also imprecise. | Trigger.dev durable task with idempotency and a database uniqueness guard. |
| Autonomous-agent or multi-agent frameworks for resident dialogue | Residents do not need tools, planning loops, or autonomy. Those abstractions increase latency, cost, and nondeterminism while weakening editorial control. | One bounded Responses API call that fills a strict scene schema. |
| LLM-generated schedules, movement, or relationship state | A malformed or drifting response would corrupt the canonical timeline and make replay impossible. | Deterministic domain rules; let the model write only dialogue and explicitly bounded proposed deltas. |
| Direct browser-to-model calls | Exposes secrets and bypasses validation, cost controls, provenance, and moderation. | Trigger.dev server-side adapter and validated persisted scenes. |
| Firestore as the canonical store | The domain needs ordered events, multi-row constraints, transactional projections, joins, and auditable migrations. | PostgreSQL. |
| Redis in v1 | It adds operational state before there is a demonstrated cache or fan-out bottleneck. | PostgreSQL constraints and Trigger.dev idempotency; add Redis only from measured need. |
| TypeScript 7.0 in the initial toolchain | It is stable but has no programmatic compiler API until 7.1, so framework/lint tooling may require a side-by-side TypeScript 6 setup. | Pin TypeScript 6.0.3 and reassess after Next.js and the selected tools document TS 7 support. |
| Phaser 3 plugins in Phaser 4 by assumption | Phaser 4 is a new major and plugin compatibility cannot be presumed. | Phaser 4 core APIs; spike every third-party plugin before adopting it. |
| Unreviewed Drizzle `push` in production | It bypasses the reviewed, versioned SQL migration trail and can apply destructive schema changes. | `drizzle-kit generate`, review the SQL, then `drizzle-kit migrate`. |
| Aseprite beta releases or CI-only proprietary asset generation | Betas reduce repeatability, and requiring a licensed desktop binary in CI creates avoidable build friction. | Aseprite 1.3.17.2 locally; commit validated runtime exports. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.11 | Node >=20.9; React 18.2 or 19.x | Use Node 24 LTS and React 19.2.8. |
| Next.js 16.2.11 | TypeScript >=5.1 | Pin 6.0.3 until the TypeScript 7 programmatic-API transition is absorbed by tooling. |
| Phaser 4.2.1 | Modern browser client | Import only in a client component; do not execute Phaser during SSR. |
| Neon serverless 1.1.0 | Node >=19 | Node 24 LTS is supported. Prefer HTTP for one-shot queries and WebSocket/pool semantics only where transactions require them. |
| Trigger.dev 4.5.6 | Node >=18.20; React 18/19; Zod 3/4 | Node 24, React 19, and Zod 4 satisfy the published ranges. |
| OpenAI 6.48.0 | Zod ^3.25 or ^4.0 | Zod 4.4.3 is within the published range; 6.47 also fixed Zod 4 mini-schema handling. |
| Playwright 1.61.1 | Node 22, 24, or 26 | Node 24 is the common supported production and test runtime. |
| Tiled 1.12.2 JSON | Phaser 4 tilemap loader | Use embedded sheet-based tilesets; do not use collection-of-images tilesets. |

## Confidence and Validation Gaps

| Area | Confidence | Reason / Required Validation |
|------|------------|------------------------------|
| Framework and runtime versions | MEDIUM | Checked against official release documentation and live npm metadata; the research seam classifies cross-checked web research as MEDIUM. |
| PostgreSQL, jobs, and polling | MEDIUM | Capabilities are documented and fit the workload; validate regional latency, one-minute catch-up, duplicate invocation handling, and polling cost in a vertical slice. |
| Phaser 4 asset pipeline | MEDIUM | Core capabilities are documented, but Phaser 4 is a recent major. Spike one Tiled room, six animated sprites, camera follow, and mobile memory before committing the full art pipeline. |
| Dialogue model choice | MEDIUM | Terra is the documented quality/cost choice, but character comedy is product-specific. The project needs its own evaluation set before locking the model and reasoning effort. |
| TypeScript 6 pin | MEDIUM | The TypeScript 7 API limitation is explicit; reassess after Next.js and lint/tool dependencies publish unambiguous TS 7 support. |

## Sources

Primary documentation and release metadata were checked on 2026-07-22.

- [Phaser release archive](https://phaser.io/download/archive), [Phaser pixel-art configuration](https://docs.phaser.io/api-documentation/constant/core), and [Phaser 4 tilemaps](https://docs.phaser.io/api-documentation/4.0.0/class/tilemaps-tilemap)
- [Next.js 16.2 release](https://nextjs.org/blog/next-16-2), [Next.js installation requirements](https://nextjs.org/docs/app/getting-started/installation), and [Next.js deployment modes](https://nextjs.org/docs/app/getting-started/deploying)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [TypeScript 7.0 release and compatibility guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [PostgreSQL versioning and support policy](https://www.postgresql.org/support/versioning/)
- [Neon PostgreSQL 18 GA changelog index](https://neon.com/blog/category/changelog), [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver), and [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon), [Drizzle migration fundamentals](https://orm.drizzle.team/docs/migrations), and [Drizzle Kit overview](https://orm.drizzle.team/docs/kit-overview)
- [Trigger.dev task overview](https://trigger.dev/docs/tasks/overview), [scheduled tasks](https://trigger.dev/docs/tasks/scheduled), and [durable execution](https://trigger.dev/docs/how-it-works)
- [TanStack Query polling](https://tanstack.com/query/v5/docs/framework/react/guides/polling) and [`useQuery` refetch controls](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery)
- [OpenAI current model guidance](https://developers.openai.com/api/docs/guides/latest-model), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), and [official OpenAI JavaScript SDK](https://github.com/openai/openai-node)
- [Zod 4](https://zod.dev/packages/zod) and [Zod JSON Schema conversion](https://zod.dev/json-schema)
- [Vitest 4](https://vitest.dev/), [fast-check deterministic property testing](https://fast-check.dev/docs/introduction/what-is-property-based-testing/), and [Playwright](https://playwright.dev/docs/intro)
- [Sentry JavaScript SDK releases](https://github.com/getsentry/sentry-javascript/releases) and [Sentry Next.js package](https://www.npmjs.com/package/@sentry/nextjs)
- [Vercel cron behavior](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), and [Vercel platform limits](https://vercel.com/docs/limits)
- [Aseprite stable release notes](https://www.aseprite.org/release-notes/), [sprite-sheet export](https://www.aseprite.org/docs/sprite-sheet/), [CLI export](https://www.aseprite.org/docs/cli/), and [Tiled JSON map format](https://doc.mapeditor.org/en/stable/reference/json-map-format/)
- Exact JavaScript package versions were verified from their publishers' live npm metadata on 2026-07-22.

---
*Stack research for: Model Afterlife*
*Researched: 2026-07-22*
