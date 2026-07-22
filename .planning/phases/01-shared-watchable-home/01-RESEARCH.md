# Phase 1: Shared Watchable Home - Research

**Researched:** 2026-07-22
**Domain:** Deterministic shared-world clock, event journal, observer synchronization, and React/Phaser presentation
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Home Composition
- **D-01:** Use a compact hub layout with a central Common Room and surrounding functional zones.
- **D-02:** The visible Phase 1 zones are the Common Room, Memory Garden, Library, and Tea Nook. They should feel like believable retirement-home spaces first, with technical humor supplied by resident behavior and scene content.
- **D-03:** Entry begins with an establishing view of the whole home. If a primary scene is active, it is clearly highlighted without hiding the wider setting.
- **D-04:** Between scenes, the home is calm but visibly alive. Several residents may perform subdued quiet routines, but ambient activity must not compete with the primary scene.

### Scene Presentation
- **D-05:** Use a hybrid dialogue presentation: short speech bubbles anchor turns to sprites in the world, while a semantic dialogue panel contains the complete readable scene.
- **D-06:** When a scene begins, the camera gently frames its speakers without overriding deliberate visitor control.
- **D-07:** A typical Phase 1 authored scene contains four to eight brief turns and lasts roughly 30 to 60 seconds at the default presentation pace.
- **D-08:** Keep a compact scene card visible throughout the scene. It identifies the premise, location, participants, and scene progress.
- **D-09:** Present no more than one primary dialogue scene at a time. Background residents and bubbles remain visually subordinate.

### Viewer Controls
- **D-10:** Present observer controls in a small persistent dock rather than a game-style toolbar or hover-only interface.
- **D-11:** Selecting a resident starts camera follow. Deliberate manual panning automatically unfollows, and the interface always makes the follow state visible.
- **D-12:** Pausing is local presentation control only. Canonical home time continues; the visitor may resume from the paused presentation point or discard the local delay by jumping live.
- **D-13:** Desktop camera controls support drag-to-pan, wheel and explicit buttons for zoom, keyboard movement, reset view, and jump to live.
- **D-14:** Observer actions never change schedules, resident positions, scene outcomes, canonical time, or any state seen by other visitors.

### Time and Recovery States
- **D-15:** Show a fictional home clock and day period together with an unambiguous Live or Paused indicator. Do not derive canonical home time from the visitor's timezone.
- **D-16:** After reconnecting or returning from a background tab, load the current canonical snapshot immediately without replaying missed movement. Briefly confirm the transition with “Caught up to live.”
- **D-17:** During initial loading or temporary connection trouble, keep the last valid home visible when available and use a calm, non-blocking status banner. Never leave the experience behind an indefinite spinner.
- **D-18:** When there is no primary scene, scene delivery fails, or a provider is unavailable, residents continue quiet routines and the interface plainly explains the current state. Do not silently replay an old scene or disguise a real failure as fictional canon.

### the agent's Discretion
- Exact placeholder sprite shapes, provisional palette, easing durations, quiet-routine animation details, control-dock placement, and concise status copy may be chosen during UI design and planning, provided they preserve the decisions above.
- The planner may choose responsive breakpoints and implementation details for the Phase 1 desktop proof. Full simplified-mobile presentation is reserved for Phase 3.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 1 scope. Previously established later-phase work remains governed by the roadmap.
</user_constraints>

## Summary

Phase 1 should be a single Next.js application organized as a modular vertical slice: a pure world-domain kernel computes canonical events; PostgreSQL stores the append-only journal and rebuildable public projection; a Trigger.dev scheduled task wakes the kernel and catches up missed logical ticks; route handlers expose a coherent snapshot and ordered updates; React owns semantic status, transcript, recovery, and controls; Phaser owns only pixel rendering and camera presentation. [VERIFIED: project artifacts] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components]

The browser must never advance canon. While visible, it can poll ordered updates every five seconds; on focus, reconnect, cursor gap, or Jump to live it must replace local live state with a fresh canonical snapshot. TanStack Query exposes the required interval, reconnect, and focus controls, and Playwright supports two isolated browser contexts in one scenario for convergence testing. [CITED: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery] [CITED: https://playwright.dev/docs/browser-contexts]

The highest-risk seam is replay-safe world advancement, not canvas rendering. The phase should therefore lead with a production-quality tracer that writes a real canonical advance, reads it through the public snapshot route, and renders a real world state in the observer shell. Expansion work then adds replay equivalence, ordered polling and catch-up, camera/presentation controls, all approved UI states, and end-to-end verification. [VERIFIED: project artifacts]

**Primary recommendation:** Build a tracer-first shared-world slice around `advanceWorldTo(targetTick)`, a transactional event append/projection update, `GET /api/world/snapshot`, and one observer page before expanding the renderer and recovery matrix. [VERIFIED: project artifacts]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Logical home clock and schedule resolution | API / Backend domain | Database / Storage | Canon must advance independently of browsers; the domain function accepts an injected time and emits deterministic events. [VERIFIED: project artifacts] |
| Event journal, current projection, and replay | Database / Storage | API / Backend domain | PostgreSQL owns ordered durable history; pure reducers rebuild the projection. [VERIFIED: project artifacts] |
| Scheduled catch-up | API / Backend worker | Database / Storage | Trigger.dev is a wake-up and retry layer; the database remains the dedupe and truth boundary. [CITED: https://trigger.dev/docs/tasks/scheduled] |
| Snapshot and ordered-update delivery | API / Backend | Database / Storage | Server routes sanitize and serialize canonical public state; clients receive read-only contracts. [VERIFIED: project artifacts] |
| Live polling and reconnect recovery | Browser / Client | API / Backend | The client requests updates while visible and replaces state from the server on recovery. [CITED: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery] |
| Pixel home, sprites, bubbles, and camera | Browser / Client (Phaser) | Browser / Client (React bridge) | Phaser renders presentation only; a typed bridge receives public state and emits local observer intents. [CITED: https://docs.phaser.io/phaser/concepts/cameras] |
| Status strip, transcript, scene card, banners, controls | Browser / Client (React DOM) | Browser / Client (Phaser bridge) | Complete dialogue, state, and controls remain semantic and accessible outside the canvas. [VERIFIED: 01-UI-SPEC.md] |
| Pause, follow, pan, zoom, reset, jump-live | Browser / Client | API / Backend for fresh snapshot only | These are local presentation controls and have no canonical write path. [VERIFIED: 01-CONTEXT.md] |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WRLD-01 | Every visitor observes the same canonical home timeline rather than a session-specific world. | One database-owned snapshot head and two-context convergence test. [VERIFIED: REQUIREMENTS.md] |
| WRLD-02 | The home advances schedules, resident locations, event eligibility, and relationship state while no visitor is watching. | Scheduled `advanceWorldTo` catch-up task driven by fixed epoch and logical ticks. [CITED: https://trigger.dev/docs/tasks/scheduled] |
| WRLD-03 | A returning or reconnecting visitor receives the current canonical state without replaying missed animations or creating divergent state. | Focus/reconnect refetch replaces local live state with a fresh snapshot. [CITED: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery] |
| WRLD-04 | The home contains one compact, immediately readable environment with distinct functional areas and meaningful quiet routines. | UI contract defines a four-zone hub, stable labels, quiet routines, and primary-scene hierarchy. [VERIFIED: 01-UI-SPEC.md] |
| WRLD-08 | Operators can replay canonical events to reproduce world state and rebuild public projections deterministically. | Pure reducer, canonical serializer/hash, and replay CLI/test. [VERIFIED: project research] |
| VIEW-01 | Entry identifies home time, location, scene or routine, speakers, premise, and Live/Paused state. | Semantic shell consumes the coherent snapshot before canvas decoration. [VERIFIED: 01-UI-SPEC.md] |
| VIEW-02 | At most one primary scene appears with clear speaker identity, readable short turns, and focused staging. | Authored complete scene record feeds one scene card, transcript, and supplementary bubble. [VERIFIED: 01-CONTEXT.md] |
| VIEW-03 | Desktop visitors can pan, zoom, follow/unfollow, reset, and jump live without influence. | Phaser camera APIs plus a local-only bridge; no canonical mutation endpoint. [CITED: https://docs.phaser.io/phaser/concepts/cameras] |
| VIEW-04 | Visitors can pause, read, resume from the paused point, or jump live. | Local presentation cursor buffers ordered updates; Jump live discards delay and fetches a snapshot. [VERIFIED: 01-CONTEXT.md] |
| VIEW-05 | Quiet routines do not obscure or compete with the primary scene. | Renderer layer ordering and semantic single-scene invariant. [VERIFIED: 01-UI-SPEC.md] |
| VIEW-06 | Quiet, loading, failure, reconnecting, and outage states remain explanatory and watchable. | Last-valid-snapshot retention plus the approved 36-state UI matrix. [VERIFIED: 01-UI-SPEC.md] |
| VIEW-08 | Client presentation derives from server snapshots and ordered updates and never authors canon. | Read-only public routes and local-only observer-intent types. [VERIFIED: REQUIREMENTS.md] |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 24 LTS | Runtime and tooling | Installed locally as 24.16.0; matches the project stack. [VERIFIED: local environment] |
| pnpm | 11.15.1 target | Package manager | Pin through `packageManager`; local Corepack is available even though the active pnpm is 9.5.0. [VERIFIED: npm registry and local environment] |
| Next.js | 16.2.11 | App Router shell and route handlers | Official docs support narrow client boundaries and client-only dynamic imports. [CITED: https://nextjs.org/docs/app/guides/lazy-loading] |
| React / React DOM | 19.2.8 | Semantic observer UI | React owns the status, transcript, banners, and controls declared by the UI contract. [VERIFIED: npm registry] |
| TypeScript | 6.0.3 pinned | Shared contracts and pure domain logic | Deliberate project-stack pin; package exists on npm even though 7.0.2 is current. [VERIFIED: npm registry] |
| Phaser | 4.2.1 | Pixel renderer and camera | Official Phaser docs cover camera follow, scroll/centering, pixel rounding, and scale configuration. [CITED: https://docs.phaser.io/phaser/concepts/cameras] |
| Tailwind CSS | 4.3.3 | Tokenized semantic shell | Implements the approved manual token layer; the canvas consumes typed tokens instead. [VERIFIED: 01-UI-SPEC.md] |

### Data, scheduling, delivery, and tests

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PostgreSQL / Neon | 18.x managed | Canonical journal and projections | Use one shared database and reviewed migrations. [VERIFIED: project research] |
| Drizzle ORM / Kit | 0.45.2 / 0.31.10 | Typed schema, queries, reviewed SQL migrations | Use WebSocket/serverless sessions for interactive world-advance transactions; use HTTP for one-shot reads if desired. [CITED: https://orm.drizzle.team/docs/connect-neon] |
| `@neondatabase/serverless` | 1.1.0 | Neon HTTP/WebSocket connection | Official docs distinguish one-shot HTTP from session/interactive WebSocket transactions. [CITED: https://neon.com/docs/serverless/serverless-driver] |
| `ws` / `bufferutil` | 8.21.1 / 4.1.0 | Node WebSocket support for Neon Pool | Required by the official Drizzle Neon Node pattern where the global WebSocket is not used. [CITED: https://orm.drizzle.team/docs/connect-neon] |
| Trigger.dev SDK / CLI | 4.5.6 | Scheduled catch-up task | Use a declarative UTC schedule; treat task delivery as a wake-up, not canonical proof. [CITED: https://trigger.dev/docs/tasks/scheduled] |
| TanStack Query | 5.101.4 | Visible-tab polling and recovery refetch | Configure a five-second interval, no background interval, and focus/reconnect snapshot recovery. [CITED: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery] |
| Zod | 4.4.3 | Public snapshot/update runtime contracts | Validate server responses at the client boundary and cursor query parameters at the route boundary. [VERIFIED: npm registry] |
| Vitest / fast-check | 4.1.10 / 4.9.0 | Unit, replay, and property tests | Prove deterministic chunking, idempotence, state hashing, and cursor monotonicity. [VERIFIED: project research] |
| Playwright | 1.61.1 | Two-viewer, reconnect, camera, and UI-state tests | Use multiple isolated browser contexts for convergence. [CITED: https://playwright.dev/docs/browser-contexts] |
| Biome | 2.5.5 | Formatting and linting | Keep the greenfield TypeScript surface consistent. [VERIFIED: npm registry] |

**Installation:** Pin the exact versions in `package.json` and `pnpm-lock.yaml`; do not install OpenAI, Sentry, asset-authoring, or Phase 2 generation packages in this phase. [VERIFIED: ROADMAP.md]

## Package Legitimacy Audit

> The seam found no nonexistent or slopsquatted package names. Several official packages are marked `SUS` solely because their current release is less than the seam's age threshold; the execution plan must use one blocking package-identity checkpoint before installation. [VERIFIED: package-legitimacy seam]

| Package | Registry | Current release signal | Weekly downloads | Source repo | Verdict | Disposition |
|---------|----------|------------------------|------------------|-------------|---------|-------------|
| `next` | npm | published 2026-07-21 | 47.7M | `vercel/next.js` | SUS: too-new | Flagged; verify official package page before install |
| `react`, `react-dom` | npm | published 2026-07-21 | 151M+ each | `facebook/react` | SUS: too-new | Flagged; verify official package pages |
| `phaser` | npm | published 2026-07-09 | 254K | `phaserjs/phaser` | SUS: too-new | Flagged; verify official package page |
| `tailwindcss`, `@tailwindcss/postcss` | npm | published 2026-07-16 | 28M+ | `tailwindlabs/tailwindcss` | SUS: too-new | Flagged; verify official package pages |
| `drizzle-orm`, `drizzle-kit` | npm | published 2026-03 | 12M+ | `drizzle-team/drizzle-orm` | OK | Approved |
| `@neondatabase/serverless` | npm | published 2026-04 | 2.8M | `neondatabase/serverless` | OK | Approved |
| `@trigger.dev/sdk`, `trigger.dev` | npm | published 2026-07-21 | 415K+ | `triggerdotdev/trigger.dev` | SUS: too-new | Flagged; verify official package pages |
| `@tanstack/react-query` | npm | published 2026-07-21 | 60M | `TanStack/query` | SUS: too-new | Flagged; verify official package page |
| `zod` | npm | published 2026-05 | 233M | `colinhacks/zod` | OK | Approved |
| `typescript` | npm | published 2026-07-08 | 238M | `microsoft/TypeScript` | SUS: too-new | Flagged; install the verified 6.0.3 pin |
| `ws` | npm | published 2026-07-14 | 235M | `websockets/ws` | SUS: too-new | Flagged; verify official package page |
| `bufferutil`, `@types/ws`, `dotenv` | npm | published 2025-2026 | 6M+ | documented repos | OK | Approved |
| `vitest`, `fast-check`, `@playwright/test` | npm | published 2026-06/07 | 27M+ | official repos | SUS: too-new | Flagged; verify official package pages |
| `@biomejs/biome` | npm | published 2026-07-21 | 11M | `biomejs/biome` | SUS: too-new | Flagged; verify official package page |

**Packages removed due to SLOP verdict:** none. [VERIFIED: package-legitimacy seam]

**Packages flagged as suspicious [SUS]:** official but recently published package releases listed above. One grouped, blocking human-verification checkpoint is required before the install task. [VERIFIED: package-legitimacy seam]

No audited package reports a postinstall script in current npm metadata. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Trigger.dev UTC schedule / direct test trigger
                   |
                   v
        advanceWorldTo(targetTick)
       pure clock + reducer + replay
                   |
                   v
PostgreSQL transaction: journal append + projection head + snapshot
                   |
            +------+------+
            |             |
            v             v
 GET /snapshot      GET /updates?after=cursor
            |             |
            +------v------+
              WorldObserver
      React semantic UI + local presentation store
            |                         |
            v                         v
 typed render bridge            transcript/status/
            |                   recovery/control dock
            v
      Phaser pixel world
  rooms + residents + bubbles + camera
```

### Recommended Project Structure

```text
src/
├── app/
│   ├── api/world/snapshot/route.ts
│   ├── api/world/updates/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── db/
│   ├── client.ts
│   └── schema.ts
├── features/world/
│   ├── contracts/
│   ├── domain/            # clock, reducer, replay, canonical serialization
│   ├── server/            # repository, advance service, snapshot/update queries
│   ├── client/            # query hook, local presentation reducer, React shell
│   ├── renderer/          # client-only Phaser adapter and typed bridge
│   └── fixtures/          # provisional residents, routines, complete authored scene
└── trigger/world-clock.ts
drizzle/
tests/
├── unit/
├── integration/
└── e2e/
```

### Pattern 1: Pure deterministic kernel with side-effect adapters

`advance(state, fromTick, toTick, seed)` must not read wall time, environment, database, browser state, or random globals. Derive a target logical tick in the Trigger/server adapter, then pass it into the pure kernel. Persist stable occurrence keys such as `world:{worldId}:tick:{tick}:rule:{ruleId}`. [VERIFIED: project architecture research]

### Pattern 2: Selective event journal with transactional projection

Append immutable `world_events` and update the current public projection in the same interactive transaction. Use a unique occurrence key and one world-scoped transaction/advisory lock so duplicate wake-ups converge. Drizzle supports interactive transactions and PostgreSQL unique indexes. [CITED: https://orm.drizzle.team/docs/transactions] [CITED: https://orm.drizzle.team/docs/indexes-constraints]

### Pattern 3: Snapshot for recovery, ordered updates for live presentation

Bootstrap from a coherent snapshot containing `schemaVersion`, `worldId`, `logicalTick`, `homeTime`, `throughSequence`, residents, rooms, one complete scene or quiet status, and a canonical state hash. Live polling requests ordered public updates after the cursor. Any gap, focus return, reconnect, or Jump live replaces the live projection from a fresh snapshot rather than replaying missed movement. [VERIFIED: 01-CONTEXT.md]

### Pattern 4: Narrow React-to-Phaser boundary

Create one `'use client'` entry and dynamically import the renderer with SSR disabled. Pass serializable public render state into a typed bridge; receive only local intents such as `residentSelected`, `manualPanStarted`, and `cameraSettled`. Destroy the Phaser game on unmount. [CITED: https://nextjs.org/docs/app/guides/lazy-loading] [CITED: https://nextjs.org/docs/app/api-reference/directives/use-client]

### Pattern 5: Local presentation state machine

Track `mode: live | paused | behind-live`, `followedResidentId`, camera interaction, presentation cursor, buffered complete scene turns, and last valid snapshot only in the client. Resume advances from the paused presentation cursor; Jump live clears the delay and requests a snapshot. None of these states appears in canonical tables or write routes. [VERIFIED: 01-CONTEXT.md]

### Pattern 6: Complete authored scenes only

Seed at least one immutable, complete four-to-eight-turn provisional scene. Publish it to the public projection as a complete record; do not stream partial turns. The scene rail can reveal turns according to local presentation time while every canonical scene remains complete. [VERIFIED: 01-UI-SPEC.md]

### Anti-Patterns to Avoid

- **Browser-owned timers as canon:** background throttling and client clocks violate WRLD-01/02/03. Use server target ticks. [VERIFIED: project research]
- **Phaser as the domain model:** renderer interpolation is disposable presentation, not resident truth. [VERIFIED: project artifacts]
- **Partial scene publication:** UI-SPEC requires withholding incomplete/invalid scenes as a whole. [VERIFIED: 01-UI-SPEC.md]
- **Polling from every component:** one query owner should drive the public projection; TanStack Query notes that every observer with an interval creates a timer. [CITED: https://tanstack.com/query/v5/docs/framework/react/guides/polling]
- **Raw string idempotency assumed global inside Trigger tasks:** current Trigger.dev v4 defaults raw keys to run scope; use explicit global scope where the task-level key is needed, while retaining database uniqueness. [CITED: https://trigger.dev/docs/idempotency]
- **Production `drizzle-kit push`:** use generated, reviewed SQL migrations and `migrate`. [CITED: https://orm.drizzle.team/docs/migrations]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client polling/focus/reconnect state | Ad-hoc intervals across components | TanStack Query `refetchInterval`, focus, and reconnect options | Centralized request state and recovery semantics. [CITED: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery] |
| Pixel camera primitives | Custom canvas transform engine | Phaser cameras, follow, center, bounds, and scale manager | Existing browser rendering and input semantics. [CITED: https://docs.phaser.io/phaser/concepts/cameras] |
| Durable recurring execution | Next.js in-memory singleton timer | Trigger.dev scheduled task | Browser and request lifetimes cannot own a persistent clock. [CITED: https://trigger.dev/docs/tasks/scheduled] |
| SQL escaping or schema diffs | String-concatenated queries or manual drift | Drizzle parameterization and generated reviewed migrations | Avoid injection and unreviewed schema changes. [CITED: https://orm.drizzle.team/docs/migrations] |
| Determinism checking | Visual inspection of one timeline | Vitest plus fast-check properties and canonical hashes | Exercises chunking, duplicate, and replay invariants. [VERIFIED: project research] |

**Key insight:** Hand-roll the small world rules because they are the product's canonical logic; reuse libraries for delivery, camera, query lifecycle, transactions, migrations, and testing. [VERIFIED: project artifacts]

## Common Pitfalls

### Pitfall 1: Catch-up depends on scheduler punctuality
**What goes wrong:** missed minutes become holes or duplicate wakes become duplicate events.
**How to avoid:** every wake computes the target tick from a fixed epoch and advances from the committed head under a transaction plus unique occurrence keys. [VERIFIED: project research]
**Warning signs:** a task assumes `payload.timestamp` equals the only tick it may process, or no replay test crosses a missed interval.

### Pitfall 2: Snapshot and update schemas drift
**What goes wrong:** the client applies an update to the wrong projection version or silently skips a gap.
**How to avoid:** share Zod contracts, include `schemaVersion` and `throughSequence`, reject noncontiguous cursors, and refresh the snapshot. [VERIFIED: project research]
**Warning signs:** client state accepts `any`, or update application has no gap branch.

### Pitfall 3: Local pause accidentally pauses data acquisition
**What goes wrong:** resuming has no paused point or falsely appears live.
**How to avoid:** keep polling/buffering complete canonical updates while local presentation is paused; separate acquisition cursor from presentation cursor. [VERIFIED: 01-CONTEXT.md]
**Warning signs:** Pause disables the query or changes server time.

### Pitfall 4: Phaser remount leaks canvases and listeners
**What goes wrong:** hot navigation or error recovery creates duplicate games, keyboard handlers, or query subscribers.
**How to avoid:** one renderer owner, stable bridge instance, explicit `game.destroy(true)`, and mount/unmount test coverage. [CITED: https://docs.phaser.io/phaser/concepts/game]
**Warning signs:** multiple canvases after navigation or controls fire twice.

### Pitfall 5: UI state coverage is implemented as decorative loading only
**What goes wrong:** quiet, stale snapshot, partial scene, overflow, long text, and hard failure regress despite a polished happy path.
**How to avoid:** plan every one of the 36 approved considerations into fixtures, component states, and Playwright assertions. [VERIFIED: 01-UI-SPEC.md]
**Warning signs:** indefinite spinner, fake dialogue placeholders, blank scene rail, or last valid home discarded during a refetch error.

## Code Examples

### Browser-only renderer boundary

```typescript
// Source: https://nextjs.org/docs/app/guides/lazy-loading
'use client';
import dynamic from 'next/dynamic';

export const PixelWorld = dynamic(() => import('./PhaserWorld'), {
  ssr: false,
  loading: () => null,
});
```

### Pixel camera configuration

```typescript
// Source: https://docs.phaser.io/phaser/concepts/cameras
const game = new Phaser.Game({ pixelArt: true, roundPixels: true });
camera.startFollow(target, true, 0.12, 0.12);
camera.setZoom(integerZoom);
```

### Scheduled catch-up entry

```typescript
// Source: https://trigger.dev/docs/tasks/scheduled
export const worldClock = schedules.task({
  id: 'advance-world-clock',
  cron: '* * * * *',
  run: async ({ timestamp }) => advanceWorldTo(targetTickFor(timestamp)),
});
```

### Visible-tab polling and focus recovery

```typescript
// Source: https://tanstack.com/query/v5/docs/framework/react/reference/useQuery
useQuery({
  queryKey: ['world', cursor],
  queryFn: fetchOrderedUpdates,
  refetchInterval: 5_000,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: 'always',
  refetchOnReconnect: 'always',
});
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Client or request-process game loop | Durable schedule wakes a deterministic catch-up service | Browser/session lifetime cannot split canon. [CITED: https://trigger.dev/docs/tasks/scheduled] |
| Phaser imported through the server graph | Narrow client component and `next/dynamic({ ssr: false })` | Avoids browser API execution during SSR. [CITED: https://nextjs.org/docs/app/guides/lazy-loading] |
| Full realtime socket server for passive one-way viewing | Snapshot plus five-second visible-tab polling and focus recovery | Lower operational complexity while preserving convergence. [VERIFIED: project research] |
| Mutable current row only | Append-only world events plus rebuildable projection | Enables replay and deterministic recovery. [VERIFIED: project research] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | One real minute equals one Phase 1 logical/home minute, with an injected clock in tests. [ASSUMED] | Open Questions | Product cadence may later choose a faster fictional clock; the epoch/tick adapter must remain configurable. |
| A2 | Four provisional, non-provider-branded residents are sufficient to demonstrate a primary scene plus quiet routines. [ASSUMED] | Architecture Patterns | Phase 2 replaces them with the approved six-resident ensemble; public contracts must not encode a fixed count. |
| A3 | Five-second foreground polling is adequate for a 30-60 second authored scene. [ASSUMED] | Summary | Execution must measure perceived freshness and preserve the cursor seam if cadence changes. |

## Open Questions (RESOLVED)

1. **Clock rate** — RESOLVED for Phase 1: one logical tick per real minute, derived from a fixed UTC epoch; retain a configurable adapter so later product testing can change the mapping without rewriting events. [ASSUMED]
2. **Delivery mechanism** — RESOLVED: cursor polling every five seconds while visible, plus an unconditional fresh snapshot on focus/reconnect/gap/Jump live. [VERIFIED: project research]
3. **Database transaction mode** — RESOLVED: use the Neon WebSocket/serverless session path for interactive world-advance transactions; reserve HTTP for one-shot reads. [CITED: https://orm.drizzle.team/docs/connect-neon]
4. **Development environment** — RESOLVED: use a dedicated test/development PostgreSQL URL and Trigger.dev development task runner; the walking-skeleton runbook must also document a full local route-to-database-to-renderer check. [VERIFIED: project artifacts]
5. **Cloud credentials** — RESOLVED as execution setup: `DATABASE_URL` and Trigger.dev project authentication are human-provided `user_setup`, not planning blockers. [VERIFIED: local environment]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Build/runtime | ✓ | 24.16.0 | — |
| Corepack | pnpm pin | ✓ | 0.35.0 | npm can activate pnpm if needed |
| pnpm | Package/install | ✓, upgrade required | 9.5.0 active; target 11.15.1 | `corepack use pnpm@11.15.1` |
| Docker | Local PostgreSQL option | ✓ | 28.3.2 | Managed Neon development branch |
| Vercel CLI | Optional cloud deploy | ✗ | — | Walking skeleton permits documented local full-stack run |
| Trigger.dev CLI | Scheduled task development | ✗ globally | — | Install the audited `trigger.dev` dev dependency |
| PostgreSQL CLI | Database inspection | ✗ | — | Drizzle migrations and container health checks |
| Neon database | Canonical persistence | credentials not present | — | User supplies `DATABASE_URL` |

**Missing dependencies with no fallback:** Neon/Trigger credentials are required before cloud-backed execution, and are represented as `user_setup`. [VERIFIED: local environment]

**Missing dependencies with fallback:** global Trigger/Vercel/psql CLIs are not required; use pinned project-local tooling and the documented local full-stack run. [VERIFIED: local environment]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No visitor accounts or protected operator surface in Phase 1. [VERIFIED: PROJECT.md] |
| V3 Session Management | no | No sessions; local presentation state is noncanonical. [VERIFIED: PROJECT.md] |
| V4 Access Control | yes | Public API is read-only; scheduled world writes run server-side with secrets and no browser-callable mutation route. [VERIFIED: REQUIREMENTS.md] |
| V5 Input Validation | yes | Validate `after` cursor and every public snapshot/update with Zod; parameterize SQL. [CITED: https://neon.com/docs/serverless/serverless-driver] |
| V6 Cryptography | yes, transferred | TLS and secret transport are owned by Neon/Trigger/Vercel; never expose credentials to the browser. [VERIFIED: project research] |

### Known Threat Patterns for the Phase 1 Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Forged cursor or oversized polling query | Tampering / DoS | Parse bounded numeric cursor; cap update count; reject malformed queries. [VERIFIED: project research] |
| Browser attempts to author time or outcomes | Tampering / Elevation | Expose read-only routes only; keep task/database credentials server-only; E2E assert observer actions do not alter the state hash. [VERIFIED: REQUIREMENTS.md] |
| SQL injection | Tampering | Drizzle/Neon parameterization; no concatenated SQL from requests. [CITED: https://neon.com/docs/serverless/serverless-driver] |
| Authored transcript rendered as HTML | Information disclosure / XSS | Render text nodes only; do not use `dangerouslySetInnerHTML`. [VERIFIED: project pitfalls research] |
| Duplicate scheduled wake-ups | Tampering / Repudiation | Transactional writer boundary, unique occurrence keys, and replay evidence. [CITED: https://trigger.dev/docs/idempotency] |
| Dependency-name confusion | Supply chain | Exact pins, lockfile, legitimacy audit, and blocking identity checkpoint for SUS packages. [VERIFIED: package-legitimacy seam] |

## Sources

### Primary official documentation (MEDIUM confidence by configured classifier)

- [Next.js client directive](https://nextjs.org/docs/app/api-reference/directives/use-client), [server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), and [lazy loading](https://nextjs.org/docs/app/guides/lazy-loading) — client boundary and SSR-disabled dynamic imports.
- [Phaser cameras](https://docs.phaser.io/phaser/concepts/cameras), [core pixel configuration](https://docs.phaser.io/api-documentation/constant/core), [game lifecycle](https://docs.phaser.io/phaser/concepts/game), and [scale manager](https://docs.phaser.io/phaser/concepts/scale-manager) — renderer and camera contract.
- [Drizzle Neon connection](https://orm.drizzle.team/docs/connect-neon), [transactions](https://orm.drizzle.team/docs/transactions), [indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints), and [migrations](https://orm.drizzle.team/docs/migrations) — persistence and migration patterns.
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver) — HTTP versus WebSocket transaction semantics and parameterized queries.
- [Trigger.dev scheduled tasks](https://trigger.dev/docs/tasks/scheduled), [idempotency](https://trigger.dev/docs/idempotency), and [task overview](https://trigger.dev/docs/tasks/overview) — durable wake-up, retries, TTL, and dedupe behavior.
- [TanStack Query useQuery](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery), [polling](https://tanstack.com/query/v5/docs/framework/react/guides/polling), and [focus refetch](https://tanstack.com/query/v5/docs/framework/react/guides/window-focus-refetching) — polling and recovery controls.
- [Playwright browser contexts](https://playwright.dev/docs/browser-contexts) — two-viewer convergence testing.

### Project-local primary inputs (HIGH confidence for scope)

- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/phases/01-shared-watchable-home/01-CONTEXT.md`
- `.planning/phases/01-shared-watchable-home/01-UI-SPEC.md`
- `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`, `.planning/research/SUMMARY.md`

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — versions were checked against live npm metadata; official packages with very recent releases remain deliberately flagged by the legitimacy seam.
- Architecture: MEDIUM-HIGH — server authority, replay, snapshot recovery, and renderer isolation align across project decisions and official framework capabilities.
- Pitfalls: HIGH for project scope — each major failure mode maps directly to Phase 1 requirements or approved UI states.

**Research date:** 2026-07-22
**Valid until:** 2026-08-21 for architecture; re-check exact package versions immediately before install.
