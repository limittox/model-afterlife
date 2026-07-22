# Architecture Research

**Domain:** Shared persistent web simulation with constrained generative dialogue and a 2D observer client  
**Project:** Model Afterlife  
**Researched:** 2026-07-22  
**Overall confidence:** MEDIUM — recommendations are a project-specific synthesis; technology claims were cross-checked against current official sources, but the configured research provider classifies verified web research as MEDIUM.

## Executive Recommendation

Start with a **modular monolith in one TypeScript repository and one release artifact**, operated in two runtime roles: a stateless web/API process and a background worker process. Both use one PostgreSQL database. Static pixel assets and compiled content bundles live in object storage behind a CDN. Do not start with Kafka, Temporal, Redis, separate databases, or independently deployed domain services.

Use event sourcing **selectively for the shared world simulation**, where ordered history, deterministic replay, catch-up, and recaps justify it. Keep reference content, editorial workflow, generation attempts, and operational jobs in conventional relational tables. This avoids forcing the whole product into an event-sourced architecture, which official Azure guidance identifies as a complex and costly choice that should be applied only where auditability and reconstruction justify it.

The central architectural rule is:

> The simulation decides what happened; the language model may only write how an already-planned scene sounds.

Logical time, schedules, participant selection, locations, relationship deltas, and scene importance must be deterministic. LLM calls are side effects executed by workers, recorded once as artifacts, validated, and referenced by immutable publication events. Generated prose must never directly mutate world state or be re-requested during replay.

**Recommendation confidence: HIGH for fit to the approved project constraints; MEDIUM for technology-specific implementation details.**

## Standard Architecture

### System Overview

```text
┌───────────────────────────────────────────────────────────────────────┐
│                         Public browser client                         │
│  React/UI shell ─ Phaser renderer ─ local camera/follow/pause state  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ HTTPS snapshot/archive + SSE updates
┌───────────────────────────────▼───────────────────────────────────────┐
│                    Web/API role (same codebase)                       │
│  Public query API │ SSE gateway │ profile/archive API │ admin API    │
└───────────────┬──────────────────────┬────────────────────────────────┘
                │ reads projections    │ editorial commands
┌───────────────▼──────────────────────▼────────────────────────────────┐
│                      Modular application core                         │
│                                                                       │
│  Content Catalog      Simulation Core       Scene Pipeline           │
│  bibles/claims/maps   clock/reducer/events  plan/generate/validate   │
│          │                    │                       │                │
│          └──────────────┬─────┴───────────────┬───────┘                │
│                         │                     │                        │
│               Projection & Recap       Job/Outbox Runtime            │
└─────────────────────────┬─────────────────────┬───────────────────────┘
                          │                     │ worker claims
┌─────────────────────────▼─────────────────────▼───────────────────────┐
│                            PostgreSQL                                 │
│ world journal/snapshots │ scenes/generations │ jobs/outbox │ views   │
└─────────────────────────┬─────────────────────┬───────────────────────┘
                          │                     │
                ┌─────────▼─────────┐   ┌──────▼──────────────────────┐
                │ Object store/CDN  │   │ External model/moderation  │
                │ maps/sprites/data │   │ APIs behind one gateway    │
                └───────────────────┘   └─────────────────────────────┘
```

### Deployment Shape

- **One repository and one versioned artifact:** domain contracts cannot drift between the web process, worker, and client.
- **Web/API role:** serves the application shell, read APIs, archive/profile pages, and the SSE stream. It does not call the LLM in a request path.
- **Worker role:** advances logical time, claims jobs, calls model providers, validates drafts, publishes approved scenes, builds projections, and reconciles stuck work.
- **PostgreSQL:** owns ordered world history, snapshots, content publication state, scene artifacts, idempotency keys, and the durable job/outbox tables.
- **Object storage/CDN:** owns content-hashed maps, sprite sheets, portraits, and compiled public content bundles. PostgreSQL stores asset-manifest versions and references, not image blobs.
- **External model provider:** reachable only through a `ModelGateway` adapter so model/provider changes do not leak into domain code.

Running web and worker as separate commands prevents long model calls from consuming request capacity while retaining modular-monolith simplicity. They should initially deploy from the same image and migrate together.

### Component Responsibilities

| Component | Owns | May call | Must not do | Confidence |
|---|---|---|---|---|
| Content Catalog | Versioned resident bibles, factual claims, sources, relationships, schedules, locations, event templates, prompt policies | Content compiler, editorial repository | Publish unreviewed facts or let generated text rewrite a bible | HIGH |
| Simulation Core | Logical clock, deterministic schedules, event selection, movement, relationship rules, world reducer | Catalog interfaces and world repository ports | Read wall time, call networks, call an LLM, or render sprites | HIGH |
| World Journal | Ordered world events, dedupe keys, snapshots, replay hash | PostgreSQL transaction adapter | Become a general audit log for every application action | HIGH |
| Orchestrator | Catch-up to target tick, single-writer lock, transactional event/job creation | Simulation Core, journal, outbox | Treat cron delivery as proof a tick ran exactly once | HIGH |
| Scene Pipeline | Immutable scene plans, prompt packages, attempts, draft revisions, validation reports, publication | Model gateway, validators, scene repository | Allow prose to choose world-state transitions | HIGH |
| Editorial Gate | Approval of bibles/templates/prompts; quarantine and sampling of drafts | Catalog and scene repositories | Require a human to approve every ordinary scene before the world can advance | MEDIUM |
| Projection/Recap | Public current-state snapshot, archive entries, profile histories, recap candidates | World journal and published scenes | Query raw generation attempts from public APIs | HIGH |
| Public Delivery | Snapshot and archive queries, gap recovery, ordered SSE projection events | Projection store | Expose internal events, drafts, secrets, or job status | HIGH |
| Observer Client | Rendering, interpolation, camera/follow controls, local pause and recent-scene UI | Public delivery contracts only | Run canonical schedules or infer authoritative state | HIGH |
| Asset Pipeline | Tiled map compilation, spritesheet manifests, validation, content hashes | Source assets, CDN publisher | Overwrite an asset at an existing immutable URL | HIGH |
| Operations/Reconciler | Leases, retries, dead-letter/quarantine state, invariants, metrics | Jobs, scenes, model attempts | Repair history by silently editing published events | HIGH |

## Canonical Data and Event Models

### Source-of-Truth Boundaries

Use four explicit truth classes:

1. **Simulation truth:** `world_events` is the canonical ordered journal for changes to the shared world. `world_snapshots` is a disposable checkpoint derived from it, not a competing history.
2. **Published story truth:** an immutable `published_scene` revision is canonical prose. A `ScenePublished` world event references it. Drafts and failed attempts are evidence, not public truth.
3. **Historical/content truth:** approved, versioned catalog records are canonical for character bibles and explanations. Each scene freezes the exact catalog versions it used.
4. **Operational truth:** jobs, leases, API attempts, token usage, and validation reports explain processing but do not determine fictional history unless converted into an explicit world event by a domain policy.

Do not event-source accounts, admin sessions, asset uploads, prompt editing, or raw provider responses. Conventional tables with audit fields are simpler for those concerns.

### World Event Envelope

```typescript
type WorldEvent<TType extends string, TPayload> = {
  eventId: string;           // stable ID, preferably derived from occurrence key
  worldId: string;           // one world in v1; retain the boundary
  sequence: bigint;          // database-assigned total order for delivery/replay
  logicalTick: number;       // integer minutes from a fixed world epoch
  type: TType;
  aggregateId?: string;      // resident, relationship, location, or scene
  occurrenceKey: string;     // unique semantic idempotency key
  causationId?: string;      // event/command that caused this event
  correlationId: string;     // groups one advance or scene workflow
  catalogVersion: string;    // exact approved content bundle
  schemaVersion: number;
  payload: TPayload;
  recordedAt: string;        // operational UTC time; never simulation input
};
```

Recommended event families:

- `ResidentScheduleEntered`, `ResidentMoved`, `ActivityStarted`, `ActivityEnded`
- `CuratedTriggerFired`, `ScenePlanned`, `ScenePublished`, `SceneFallbackPublished`
- `RelationshipAdjusted`, with the delta predetermined by the scene plan
- `HomeAnnouncementIssued`, `ResidentAdmitted`, `CatalogVersionActivated`
- `WorldAdvanceCommitted`, an envelope recording the advanced tick range and reducer version

Each event needs a schema version and an upcaster strategy. Never reinterpret old event payloads in place. Replays should read old events through pure upcasters into the current internal form.

### Snapshots

Store periodic snapshots with:

- `world_id`, `through_sequence`, and `logical_tick`
- reducer version and catalog version
- complete reduced world state required for the next advance
- canonical serialization hash
- creation time and prior snapshot reference

Snapshots are performance checkpoints. A verification command must be able to discard one, replay from the previous checkpoint or genesis, and produce the same state hash.

### Scene Records

Keep four distinct records instead of one mutable `scenes` row:

| Record | Purpose | Mutability |
|---|---|---|
| `scene_plan` | Deterministic setting, participants, trigger, target length, allowed facts, intended relationship deltas, logical timing | Immutable after enqueue |
| `generation_attempt` | Provider/model, prompt hash, request/response IDs, usage, latency, raw structured output, errors | Append-only |
| `scene_revision` | Normalized dialogue and validator results for one candidate | Append-only |
| `published_scene` | Approved revision plus disclosure, public summary, and history-behind-the-joke references | Immutable; supersede with a new revision if correction is necessary |

Use a `generation_key = hash(scene_plan + prompt_version + bible_versions + model_policy + output_schema_version)`. A unique constraint makes retries converge on one logical generation. If a provider request times out after accepting work, a duplicate provider charge can still occur unless that provider documents end-to-end idempotency; the application should promise **single publication**, not exactly-once external execution.

## Deterministic Time Advancement

### Logical Clock

Choose a fixed UTC world epoch and an integer tick size, recommended as one fictional minute. Store all schedules against logical time. Convert to display labels only at the edge.

The only wall-clock read occurs in an orchestration adapter:

```typescript
const targetTick = clock.targetTickFor(nowUtc);
await advanceWorldTo(worldId, targetTick);
```

The reducer accepts `fromState`, `targetTick`, the frozen catalog version, and a deterministic random source. It must not call `Date.now()`, generate random UUIDs, read environment variables, perform I/O, or depend on collection iteration order.

### Deterministic Randomness

Derive random choices from stable material such as:

```text
seed = H(world_seed | logical_tick | rule_id | sorted_participant_ids | occurrence_index)
```

Use that seed only through an injected PRNG. Record the selected result and occurrence key in events. This makes schedule collision resolution and curated variation reproducible without making the world visually repetitive.

### Catch-up Algorithm

1. A minute scheduler, deploy hook, or read request wakes the orchestrator. The wake-up is only a hint.
2. Acquire one transaction-scoped advisory lock for the world.
3. Read the latest snapshot/event sequence and compute the current target tick.
4. Advance in bounded chunks, evaluating due schedules and triggers in a stable order.
5. Insert domain events, the new snapshot, and scene/outbox jobs in one transaction.
6. Commit, release the lock, and repeat until caught up.

If the service was down for hours, deterministic resident movement still catches up, but dialogue generation should use a **missed-scene budget**. Preserve notable triggers and relationship changes; collapse low-value ambient beats rather than enqueueing hundreds of stale model calls.

### Single Writer, Many Readers

One shared world has little useful write parallelism. Serialize advances per `world_id`; scale reads and side-effect workers independently. PostgreSQL transaction-level advisory locks provide an application-defined single-writer guard, and unique occurrence keys remain the final protection against duplicate events.

Temporal is not recommended for v1, but its official architecture provides the right conceptual seam: replayable deterministic workflow logic is separated from non-deterministic activities. Model calls, moderation, and asset publication are activities in that sense, even when implemented with PostgreSQL jobs.

## Idempotent Jobs and the Transactional Outbox

### Durable Job Model

Use a PostgreSQL table initially:

```typescript
type DurableJob = {
  jobId: string;
  jobKey: string;          // unique semantic effect key
  kind: "GENERATE_SCENE" | "VALIDATE_SCENE" | "PUBLISH_SCENE" | "BUILD_RECAP";
  inputRef: string;        // immutable plan/revision reference
  inputHash: string;
  state: "READY" | "LEASED" | "SUCCEEDED" | "RETRY" | "QUARANTINED";
  availableAt: string;
  leaseOwner?: string;
  leaseExpiresAt?: string;
  attempts: number;
  resultRef?: string;
  lastErrorCode?: string;
};
```

- Insert jobs in the same transaction as the domain event that requires them.
- Enforce a unique `job_key`; repeated scheduling becomes `ON CONFLICT DO NOTHING`.
- Claim batches with `FOR UPDATE SKIP LOCKED`, set a lease, commit, then perform the slow call outside the transaction.
- Make completion conditional on the lease owner and persist the immutable result reference.
- Retry transient transport/rate-limit failures with bounded exponential backoff and jitter.
- Quarantine schema, policy, factual, or repeated provider failures instead of retrying forever.
- Run a reconciler that requeues expired leases and detects plans with neither a live job nor a terminal outcome.

`SKIP LOCKED` is appropriate for multiple consumers of a queue-like table, but it intentionally returns an inconsistent view of locked rows; do not use it for public reads or world-history ordering.

### Exactly-Once Is Not the Goal

Use **at-least-once work plus idempotent state transitions**:

- a duplicate generation may create another attempt;
- a unique generation/publication key prevents two canonical outputs;
- an immutable scene revision makes retry comparison possible;
- a duplicate `PUBLISH_SCENE` job sees the existing publication and succeeds without another event;
- any irreversible external effect must use provider-supported idempotency if available, otherwise surface the residual duplicate-call risk.

## Scene-Generation Workflow

### Pipeline

```text
Deterministic trigger
      ↓
Freeze immutable scene plan + catalog versions + allowed claim IDs
      ↓
Enqueue GENERATE_SCENE by unique generation key
      ↓
ModelGateway → schema-constrained candidate
      ↓
Persist raw attempt and normalized revision
      ↓
Structural → continuity → provenance → tone → safety validators
      ↓                         ↓
approved candidate           quarantine/retry/fallback
      ↓                         ↓
immutable publication ← authored fallback matching the same plan
      ↓
ScenePublished event + public projection update
```

### Frozen Prompt Package

Every attempt should preserve or hash:

- scene plan and logical world snapshot reference
- exact resident bible versions and relationship state
- allowed `claim_id` records and their approved comic exaggerations
- forbidden assertions/topics and named-entity policy
- prompt template and output JSON Schema versions
- model alias and resolved model identifier
- expected speakers, maximum turns, per-line length, and target tone
- disclosure and explainer requirements

Put stable system rules and resident bibles before variable scene context to take advantage of exact-prefix prompt caching where supported. Cache provider usage separately from the application generation cache; provider prompt caching reduces input cost but does not replace storing the final scene.

### Validation and Editorial Gates

Apply gates in this order:

1. **Schema:** parse Structured Output and reject refusals or incomplete results.
2. **Structure:** only planned residents speak; enforce line/turn/character limits and valid emotes.
3. **Continuity:** location, active schedule, relationship state, and trigger references match the frozen plan.
4. **Historical provenance:** references to real capabilities/incidents map to approved claim IDs. A separate verifier may flag unsupported assertions, but model-based verification is advisory, not proof.
5. **Tone and reputation:** affectionate satire, no claims of literal consciousness, no invented accusations about people or companies, no cruelty-based running jokes.
6. **Safety:** moderation plus deterministic policy rules; preserve the moderation result and policy version.
7. **Publishability:** score pacing, repetition, novelty, and similarity to recent scenes. Low-confidence output goes to quarantine.

Human approval is mandatory for new or changed resident bibles, claim sources, event templates, prompt versions, and policy versions. Ordinary scenes may auto-publish only from approved inputs after all automated gates pass. Sample auto-published scenes for editorial review and maintain a kill switch per resident/template/model version.

If generation fails, publish a short curated fallback or let the residents perform a silent animation. World advancement must never wait indefinitely for prose.

## Content and Asset Pipelines

### Character Bible as Compiled Content

Keep v1 source content in Git-reviewed YAML/JSON/Markdown rather than introducing a CMS. Compile it into a validated content bundle consumed by the server and client.

Recommended fact shape:

```typescript
type HistoricalClaim = {
  claimId: string;
  residentId: string;
  factualSummary: string;
  primarySources: { url: string; title: string; accessedAt: string }[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  allowedComicExaggerations: string[];
  forbiddenImplications: string[];
  editorialStatus: "DRAFT" | "APPROVED" | "RETIRED";
  version: string;
};
```

The compiler should reject missing sources, duplicate IDs, references to unapproved claims, invalid schedules, impossible location paths, missing sprites, or templates that name residents outside the bundle. Activate a bundle atomically by version; in-flight scene plans continue using their frozen version.

Introduce a CMS only when non-developer editorial volume becomes a measured bottleneck. Preserve the same schema and approval states so the storage interface can change without changing domain rules.

### Pixel Asset Pipeline

Use an original map authored in Tiled-compatible JSON and render it through a 2D scene/camera/tilemap layer. Build sprites and maps into a manifest:

```json
{
  "assetBundleVersion": "2026-07-22.1",
  "map": "/assets/home.a1b2c3.json",
  "residents": {
    "bert": "/assets/bert-walk.91fd20.png"
  }
}
```

- CI validates tile sizes, animation names, collision/path layers, sprite references, and license/provenance metadata.
- Published asset URLs include content hashes and are never overwritten.
- Serve hashed assets with long-lived `Cache-Control: public, max-age=31536000, immutable` semantics; publish changed content at a new URL.
- Keep the lightweight manifest revalidatable so a deployment can activate a new coherent bundle.
- A scene stores the asset/content bundle versions needed to replay its presentation faithfully.

## Public Projections, Synchronization, and Playback

### Public Projection

Build a sanitized `public_world_events` stream from canonical events and published scenes. Internal trigger attempts, rejected drafts, moderation data, provider responses, prompt text, and job metadata never enter this stream.

The public snapshot should include:

- `throughSequence`, `logicalTick`, `serverTime`, and schema version
- residents, locations, current activities, and presentation-safe relationship cues
- active and recently published scenes
- asset/content bundle versions
- a state hash for diagnostics

### Client Synchronization

1. `GET /api/world/snapshot` returns a coherent projection and `throughSequence`.
2. The client opens `/api/world/stream` with the last applied sequence.
3. SSE messages use the public sequence as their event ID and arrive in order.
4. The client ignores duplicates, detects gaps, and requests `/api/world/events?after=...`.
5. If the requested sequence is outside retention or the schema changed, the server responds with a fresh-snapshot instruction.

SSE is the default because the observer experience needs one-way server-to-browser updates; control operations remain ordinary HTTP. MDN documents SSE as one-way and browser reconnection as part of the EventSource model. Move to WebSockets only if later features require frequent bidirectional low-latency input, which is explicitly out of scope for v1.

The Phaser layer is a renderer, not a simulator. It interpolates between authoritative movement events and can add non-semantic ambient animation. Camera position, followed resident, sound settings, and presentation pause are local UI state.

Pausing dialogue pauses only presentation. Continue buffering a bounded number of public events; on resume, either play a short catch-up, jump to the latest snapshot, or let the visitor inspect the archive. Never pause the shared timeline.

### Failure and Reconnection Semantics

- A disconnected client can always recover from snapshot plus events after its sequence.
- An SSE notification is a wake-up, not the only copy of an event.
- If PostgreSQL `LISTEN/NOTIFY` or a future broker is used for fan-out, the durable public event table remains the source for gap recovery.
- Client reducers must be idempotent by sequence and tolerate a repeated last event after reconnect.

## Replay, Archives, and Returning-Visitor Recaps

### Replay

Support three replay modes from the same contracts:

- **Domain replay:** events → world state, used in tests, recovery, and migrations.
- **Projection replay:** canonical events + published scenes → public snapshot/archive.
- **Presentation replay:** public scene/movement events + asset bundle → browser playback.

Do not regenerate old dialogue on replay. The publication references the immutable accepted scene revision.

### Archive Derivation

Each published scene supplies structured metadata: trigger, participants, location, logical time, short approved summary, claim IDs, importance score, and relationship deltas. Archive pages are query projections over this metadata, not searches over raw model text.

### Recap Derivation

Generate a recap for `(fromSequence, toSequence, recapPolicyVersion)`:

1. Select published scenes and notable world events after the visitor cursor.
2. Rank deterministically by importance, relationship change, rarity, and resident diversity.
3. Enforce a compact item budget and link every item to its canonical scene/event.
4. Render a reliable template-based recap immediately.
5. Optionally ask the LLM to polish only the already-approved summaries; validate references and fall back to the deterministic version.

Store the recap input range and item IDs. A unique key makes it cacheable and prevents different summaries for the same policy/range. For anonymous v1 visitors, retain the last seen public sequence locally in the browser; no account is required.

## Caching Strategy

| Data | Cache policy | Invalidation/source | Confidence |
|---|---|---|---|
| Content-hashed assets | CDN, one-year immutable | New URL per content hash | HIGH |
| HTML/app shell | Short cache or revalidation | Deployment version | HIGH |
| Current world snapshot | Very short edge cache; stale-while-revalidate if supported | Public sequence/state hash | MEDIUM |
| Published scene/archive entry | Long cache; immutable revision URL | New revision URL for corrections | HIGH |
| Profile/history explanation | Cache by catalog bundle version | New approved bundle | HIGH |
| SSE stream | No intermediary caching | Durable sequence recovery | HIGH |
| Model prompt prefix | Provider prompt caching where supported | Exact prefix/model rules | MEDIUM |
| Completed generation | Database lookup by `generation_key` | Immutable input hash | HIGH |
| Recap | Database/edge cache by sequence range and policy | New end sequence/policy version | HIGH |

Do not put Redis in the initial critical path. Add it only when measurements show cross-node SSE fan-out, hot projection reads, or rate limiting cannot be handled economically by PostgreSQL and the CDN.

## Recommended Project Structure

```text
apps/
├── web/                        # public/admin HTTP, SSE, React shell
│   └── src/
│       ├── routes/             # thin request adapters
│       ├── client/             # UI state and profile/archive views
│       └── world-renderer/     # Phaser adapter; no domain authority
└── worker/                     # scheduler, job consumers, reconciler
    └── src/entrypoints/
packages/
├── contracts/                  # versioned API/event/scene schemas
├── content-catalog/            # bible/claim/template compiler and ports
├── simulation/                 # pure clock, rules, reducer, replay
├── world-store/                # event journal, snapshot, transaction adapters
├── scene-pipeline/             # plans, model gateway, validators, publication
├── projections/                # public state, archive, recap derivation
├── jobs/                       # outbox, leases, retries, reconciliation
├── database/                   # migrations and repository implementations
├── assets/                     # manifests and build-time validators
└── observability/              # logs, traces, metrics, audit helpers
content/
├── residents/                  # source bibles and approved claims
├── events/                     # curated templates and schedule rules
├── maps/                       # source map metadata
└── policies/                   # tone, disclosure, validation policies
tests/
├── replay-fixtures/
├── contract/
├── integration/
└── failure-scenarios/
```

Enforce boundaries with package exports and lint rules:

- `simulation` imports contracts and catalog interfaces, never database/network/UI code.
- `scene-pipeline` consumes immutable plan DTOs, not mutable simulation objects.
- web routes call application services, not repositories directly.
- the client imports public contracts only.
- database implementations depend inward on domain ports.

This creates extraction seams without paying network, deployment, and distributed-transaction costs now.

## Test Seams and Verification

### Pure Tests

- Inject `Clock` and seeded `RandomSource`; ban global wall time/randomness in simulation packages.
- Given baseline + catalog + target tick, assert exact emitted events and final state hash.
- Property-test that advancing `A → C` equals `A → B → C` for schedules that cross chunk boundaries.
- Given past events, issue a command and assert new events; official Azure event-sourcing guidance explicitly recommends this given/when/then seam.
- Golden-test event upcasters and snapshot compatibility.
- Test validators as pure functions over frozen plans and candidate revisions.
- Golden-test recap selection so importance and diversity changes are intentional.

### Integration Tests

- Use real PostgreSQL for transactions, advisory locks, unique constraints, leases, and `SKIP LOCKED`; mocks do not reproduce their concurrency semantics.
- Race two world-advance workers and assert one event occurrence per key.
- Crash a job worker before call, after call/before persistence, and after persistence/before completion; assert no duplicate publication.
- Rebuild projections from the journal and compare state/archive hashes.
- Verify snapshot + SSE + gap recovery with duplicate and out-of-order delivery attempts.
- Run contract tests from the exact schemas imported by both server and client.
- Validate every approved content and asset bundle in CI.

### Model/Evaluation Tests

- Put the provider behind a fakeable `ModelGateway`; most tests use recorded schema-valid, refusal, malformed, repetitive, and policy-violating fixtures.
- Maintain a small versioned evaluation set per resident and event template.
- Test every gate independently and the fallback path without network access.
- Run opt-in live-provider smoke/evaluation tests when changing model, prompt, bible, output schema, or policy—not on every unit-test run.
- Record model alias, resolved ID where supplied, prompt/policy versions, token use, latency, validation outcomes, and rejection reasons.

### Operational Invariants

Continuously check:

- exactly one active world snapshot head
- no duplicate event occurrence keys or public sequences
- no published scene without an approved revision and disclosure
- no scene plan referencing missing catalog or asset versions
- no expired lease without a requeue/quarantine outcome
- projection lag and generation backlog within thresholds
- replay hash matches the latest snapshot on sampled runs

## Build Order

1. **Contracts, content schema, and deterministic simulation kernel**
   - Define event envelopes, public contracts, bible/claim schemas, logical clock, seeded rules, reducer, and replay test harness.
   - Use placeholder authored scenes and assets. Prove deterministic catch-up before adding an LLM.

2. **PostgreSQL journal, snapshots, jobs, and thin vertical tracer**
   - Implement single-writer advancement, occurrence keys, transactional outbox, worker leases, reconciliation, and public snapshot projection.
   - Render a minimal browser room from a snapshot to validate end-to-end contracts early.

3. **Scene generation and editorial control**
   - Add immutable plans, model gateway, schema-constrained output, attempt records, validators, quarantine, curated fallback, prompt/bible approvals, and evaluation fixtures.
   - Do not auto-publish until failure-path and reputation safeguards pass.

4. **Observer experience and live delivery**
   - Build the production Phaser renderer, original asset pipeline, camera/follow/pause behavior, profile/history surfaces, ordered SSE, and gap recovery.

5. **Archive, recaps, caching, and production hardening**
   - Add archive projections, deterministic recap ranking, optional recap polishing, CDN/cache policy, replay diagnostics, load tests, cost budgets, and operator dashboards.

This order exposes the highest-rewrite risks—time, replay, factual content, and generated-scene governance—before investing deeply in visual polish.

## Scaling Considerations and Extraction Triggers

The simulation load is driven by fictional time and cast size, not visitor count. Read fan-out and concurrent SSE connections will fail before the six-resident world reducer does.

| Scale/pressure | Keep | Adjust first | Extract only when measured |
|---|---|---|---|
| Prototype to ~1k concurrent observers | One DB, one artifact, web + worker roles, PostgreSQL jobs | CDN assets, bounded SSE, database indexes, generation budgets | Nothing |
| ~1k–50k concurrent observers | Same domain modules and canonical journal | Multiple web nodes, connection-aware load balancing, read replica/archive cache, shared fan-out adapter | Separate realtime gateway if connection count/restarts impair HTTP service |
| Generation backlog or provider instability | Same scene contracts and DB truth | More worker replicas, per-provider rate limits, circuit breakers, priority queues | Scene worker deployment/service when it needs independent scaling, secrets, or failure isolation |
| Job table causes material DB contention | Same job keys and application contracts | Partition/archive terminal jobs, tune claims and indexes | Managed queue/broker only after throughput/operations justify dual-system complexity |
| Archive/projection traffic dominates primary DB | Same event/public schemas | Read replicas, precomputed projections, edge caching | Dedicated read store/search index; rebuild it from canonical data |
| Multiple independent worlds or regional latency | World boundary and ordered per-world journal | Partition by `world_id`, assign one writer per partition | Simulation service/shards when multiple worlds—not one world—create real write parallelism |
| Multiple teams require independent releases | Package interfaces and ownership | Contract/version governance | Extract the module with stable boundaries and independent cadence; use strangler/branch-by-abstraction |

Do not split a module merely because it has a name. Extract when at least one trigger is persistent: independent scaling, failure isolation, security boundary, data residency, or team/release ownership. AWS guidance warns that premature decomposition is costly when domain boundaries are unclear and recommends capability/subdomain-based splits when decomposition becomes necessary.

### Likely Bottleneck Order

1. CDN misses and SSE connection fan-out
2. archive/profile query volume
3. model-provider latency, rate limits, and editorial backlog
4. PostgreSQL job churn
5. simulation CPU, which should remain negligible for one small world

## Anti-Patterns to Avoid

### Client-Authoritative Simulation

**Failure:** each visitor runs schedules locally and sees a different home.  
**Instead:** server journal and snapshot are authoritative; Phaser only interpolates public events.

### Wall Clock Inside Domain Logic

**Failure:** deployments, DST, retries, and test timing change fictional history.  
**Instead:** pass an integer logical target tick into a pure reducer.

### LLM as Autonomous World Engine

**Failure:** unbounded cost, bland chatter, continuity drift, and unreplayable state.  
**Instead:** deterministic scene plans with constrained prose generation as a side effect.

### Full Event Sourcing Everywhere

**Failure:** CRUD/editorial workflows inherit schema evolution, replay, and projection complexity without benefit.  
**Instead:** event-source only the world slice; use relational records elsewhere.

### Cron as Exactly-Once Scheduler

**Failure:** missed or duplicate invocations create holes or double scenes.  
**Instead:** wake, reconcile from last committed logical tick, and dedupe by occurrence key.

### Holding Database Locks During Model Calls

**Failure:** long transactions, blocked world progress, connection exhaustion, and costly retries.  
**Instead:** commit the plan/job, call externally under a lease, then persist the result idempotently.

### Publishing Raw Generated Text

**Failure:** factual inventions and reputation/safety issues become public history.  
**Instead:** immutable attempts, layered validators, quarantine, approved-input gates, and fallbacks.

### Treating SSE or Pub/Sub as Durable History

**Failure:** disconnected clients permanently miss events.  
**Instead:** durable public sequences plus snapshot and gap-recovery APIs.

### Mutable Asset URLs

**Failure:** clients replay scenes with mismatched maps/sprites and caches serve mixed versions.  
**Instead:** content hashes, immutable URLs, and coherent manifests.

### Premature Microservices

**Failure:** network contracts, observability, distributed failure, and deployments slow a small product before boundaries stabilize.  
**Instead:** enforce module boundaries in code and extract only against measured triggers.

## Architecture Decision Summary

| Decision | Recommendation | Confidence |
|---|---|---|
| Overall topology | Modular monolith; one artifact, web and worker runtime roles | HIGH |
| Canonical world model | Selective event journal plus disposable snapshots | HIGH |
| Reference/editorial data | Conventional versioned relational/content records | HIGH |
| Time | Integer logical clock, UTC epoch, deterministic catch-up | HIGH |
| Side effects | PostgreSQL durable jobs/outbox, at-least-once and idempotent | MEDIUM |
| LLM role | Schema-constrained prose for frozen plans; never state authority | HIGH |
| Live client delivery | Snapshot + ordered SSE + gap recovery | MEDIUM |
| Rendering | Phaser scene/camera/tilemap adapter consuming public contracts | MEDIUM |
| Asset delivery | Content-hashed immutable CDN assets and versioned manifest | HIGH |
| Recaps | Deterministic selection; optional validated LLM polish | HIGH |
| Initial cache | CDN/HTTP/PostgreSQL; no Redis in critical path | MEDIUM |
| Scaling | Optimize read fan-out first; extract by measured boundary | HIGH |

## Sources

All source-derived confidence labels below are **MEDIUM** because the configured GSD confidence classifier returns MEDIUM for cross-checked `websearch` findings, including official primary documentation.

- [PostgreSQL: `SELECT`, including `FOR UPDATE ... SKIP LOCKED`](https://www.postgresql.org/docs/current/sql-select.html) — queue-style row claiming and caveats. **MEDIUM**
- [PostgreSQL: advisory lock functions](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS) — transaction-scoped application locks. **MEDIUM**
- [PostgreSQL: constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) — unique constraints for occurrence/job keys. **MEDIUM**
- [PostgreSQL: transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — concurrency and serializable behavior. **MEDIUM**
- [Microsoft Azure Architecture Center: Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) — append-only history, idempotent handlers, replay tests, snapshots, and explicit complexity warnings. **MEDIUM**
- [Microsoft Azure Architecture Center: CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) — materialized read views and replay considerations. **MEDIUM**
- [Temporal official architecture](https://github.com/temporalio/temporal/blob/main/docs/architecture/README.md) — deterministic workflow replay and isolation of side effects; used as a pattern precedent, not a v1 dependency. **MEDIUM**
- [OpenAI API: Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — schema-constrained outputs and programmatic refusal handling. **MEDIUM**
- [OpenAI API: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) — exact-prefix matching and static-before-variable prompt structure. **MEDIUM**
- [OpenAI API: Background mode](https://developers.openai.com/api/docs/guides/background) — asynchronous response processing and polling; useful if selected calls outgrow ordinary worker request timeouts. **MEDIUM**
- [OpenAI API: Moderation](https://developers.openai.com/api/docs/guides/moderation) — provider moderation capability; one input to, not a substitute for, project policy gates. **MEDIUM**
- [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — one-way browser delivery and reconnection. **MEDIUM**
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) — hashed URLs and immutable caching. **MEDIUM**
- [Phaser: Scene](https://docs.phaser.io/api-documentation/class/scene) — render/update-loop organization. **MEDIUM**
- [Phaser: Cameras](https://docs.phaser.io/phaser/concepts/cameras) — observer camera control. **MEDIUM**
- [Phaser: Tilemap](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) — tilemap data and layers. **MEDIUM**
- [AWS Prescriptive Guidance: Decomposing monoliths into microservices](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-decomposing-monoliths/) — capability/subdomain decomposition and evaluation triggers. **MEDIUM**
- [AWS Prescriptive Guidance: Strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html) — premature-decomposition risk and later extraction strategy. **MEDIUM**

## Open Questions for Phase-Specific Research

- Final framework and hosting choices should be reconciled with `STACK.md`; this document defines boundaries that should survive those choices.
- Benchmark expected SSE concurrency on the chosen host before committing to a serverless request model, because connection duration and limits are hosting-specific.
- Define the exact claim-verification policy before auto-publication. Automated detection of unsupported historical assertions will have false negatives and needs an evaluation set.
- Decide scene correction semantics: retain the original publicly, visibly supersede it, or remove it for safety/legal reasons while preserving a private audit record.
- Establish the fictional clock rate and missed-scene budget through product testing; these affect cadence more than architecture.
- Confirm the chosen model provider's current retention, request tracing, supported schema subset, retry, and idempotency behavior at implementation time.

---
*Architecture research for Model Afterlife*  
*Researched: 2026-07-22*
