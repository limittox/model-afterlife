# Phase 2 Pattern Map: Grounded Ensemble and Safe Scenes

**Mapped:** 2026-07-22  
**Basis:** Phase 1 application code plus `02-CONTEXT.md`, `02-AI-SPEC.md`, and `02-RESEARCH.md`

## Architecture Summary

Phase 2 extends the existing selective event-sourced world. It must preserve this dependency direction:

`Trigger/provider adapters -> scene application services -> pure scene/world domain <- Zod contracts`

`PostgreSQL repositories -> scene application services -> canonical publication transaction`

`public snapshot -> React semantic observer + disposable Phaser renderer`

Provider calls and private attempts live outside the pure reducer. Only one successful `publishSceneRevision()` transaction may turn a candidate into a canonical event and relationship/memory change.

## File and Pattern Assignments

| Proposed file/group | Role | Closest existing analog | Pattern to preserve |
|---|---|---|---|
| `src/features/residents/contracts/*.ts` | Versioned Zod content/model contracts | `src/features/world/contracts/public-world.ts` | Strict boundary parsing, inferred TypeScript types, explicit schema versions |
| `src/features/residents/registry/*.ts` | Exact six-resident seed registry | `src/features/world/fixtures/provisional-world.ts` | Stable IDs and deterministic data, but replace provisional authored dialogue and archetypes |
| `src/features/scenes/contracts/*.ts` | Brief, turn, attempt, validation and revision contracts | `src/features/world/contracts/public-world.ts` | Schema-first, no partial public scene, 4-10 complete turns |
| `src/features/scenes/domain/eligibility.ts` | Pure cooldown/balance selection | `src/features/world/domain/advance.ts` | Explicit inputs, stable ordering, no time/random/database/provider access |
| `src/features/scenes/domain/validation.ts` | Pure deterministic validation | `src/features/world/domain/canonical.ts`, `events.ts` | Total deterministic functions and exhaustive typed results |
| `src/features/scenes/providers/provider-registry.ts` | Exact model/upstream registry for one strict OpenRouter transport | No Phase 1 analog | Follow `02-AI-SPEC.md`/`02-RESEARCH.md`; dependency injection and fake language models in tests |
| `src/features/scenes/providers/generate-resident-turn.ts` | One exact resident turn call | No Phase 1 analog | One bounded call, `maxRetries: 0`, no tools/streaming, preserve raw identity evidence |
| `src/features/scenes/server/scene-attempt-repository.ts` | Private attempt persistence | `src/features/world/server/world-repository.ts` | Open/close database per operation, typed selects/inserts, no private records in public routes |
| `src/features/scenes/server/publish-scene-revision.ts` | Atomic canon boundary | `src/features/world/server/advance-world-to.ts` | Lock canonical world, derive candidate state, insert unique event/revision/effects, update projection in one transaction |
| `src/features/scenes/server/conduct-scene.ts` | Sequential bounded conductor | No direct analog | Application service over injected provider/repository/validators; never imported by pure domain |
| `src/trigger/generate-scene.ts` | Durable private generation job | `src/trigger/world-clock.ts` | Stable task ID, explicit retry/TTL/queue, testable exported runner, global idempotency key |
| `src/features/world/domain/types.ts`, `events.ts`, `advance.ts`, `replay.ts` | Canonical typed relationships and generation request events | Existing same files | Add discriminated events and preserve exact replay/occurrence-key behavior |
| `src/features/world/server/advance-world-to.ts` | Commit eligibility and return job requests | Existing same file | Provider-free canonical transaction; only trigger after commit |
| `src/db/schema.ts`, `drizzle/0001_*.sql` | Phase 2 private/canonical persistence | Existing schema and `drizzle/0000_world_skeleton.sql` | Explicit checks/unique indexes/FKs, reviewed migration, required schema push |
| `src/features/world/server/to-public-snapshot.ts` | Sanitized publication projection | Existing same file | Whitelist public provenance; never spread private attempt objects |
| `src/features/world/components/DialogueTranscript.tsx`, `SceneCard.tsx`, `HomeStatusStrip.tsx` | Minimal provenance and persistent disclosure | Existing same files | Semantic DOM remains authoritative; no provider logos; complete scene only |
| `src/features/world/renderer/renderer-types.ts`, `HomeScene.ts` | Six original visual variants | Existing same files | Renderer consumes public variant data and emits local-only intents |
| `tests/unit/scenes/*.test.ts` | Deterministic invariants | `tests/unit/world-replay.property.test.ts` | Frozen inputs, property tests where state/event combinations matter |
| `tests/integration/scene-publication.test.ts` | DB idempotency/fault evidence | `tests/integration/world-repository.test.ts`, `world-catchup.test.ts` | Real PostgreSQL, duplicate/concurrent writes, no mocked transaction semantics |
| `tests/e2e/generated-scene.spec.ts` | Public observer evidence | `tests/e2e/semantic-observer.spec.ts` | Mock public GET routes only; assert complete transcript, disclosure, quiet fallback and no client writes |
| `evals/*` | Frozen/live AI evaluation | No Phase 1 analog | Follow `02-AI-SPEC.md`; frozen CI by default and explicit secret-gated live matrix |

## Reusable Code Patterns

### Stable occurrence keys

`src/features/world/domain/advance.ts` builds occurrence keys from world, tick, and rule identity. Phase 2 generation requests should follow the same form, for example:

`world:{worldId}:tick:{tick}:scene-request:{briefId}`

The scene job derives one stable `sceneKey` from that request. Attempt ordinals and publication keys are separate so Trigger retries never become editorial attempts.

### Immutable event replay

`replayWorldEvents()` sorts by logical tick and sequence and ignores duplicate occurrence keys. New `scene_generation_requested`, `scene_published`, and typed `relationship_changed`/memory events must reduce deterministically and be included in the property suite.

### Transactional canonical write

`advanceWorldTo()` already locks the singleton world row with `FOR UPDATE`, calculates the proposed state, inserts with unique occurrence handling, and updates the projection in one transaction. `publishSceneRevision()` should reuse this shape but must additionally:

1. verify the attempt and expected canonical version,
2. insert immutable scene revision under a unique publication key,
3. apply only validated typed effects with their cause,
4. insert canonical event(s),
5. update projection and state hash,
6. return the existing revision on an idempotent conflict.

No network call may occur while the canonical row lock is held.

### Complete public scene boundary

`PublicWorldSnapshotSchema` requires exactly one complete scene or quiet state. Keep that invariant. Increase the scene maximum from 8 to 10, add exact public authorship metadata per turn, and expose no candidate until the full revision is published.

### Public whitelisting

`toPublicWorldSnapshot()` maps fields explicitly instead of returning database rows. Preserve that method for model/version provenance, relationship-derived public state, and new quiet reasons. Provider response IDs, raw prompts, source excerpts, validator evidence and cost stay private.

### Trigger adapter seam

`world-clock.ts` exports `runWorldClockAt()` with an injectable writer and separately declares the Trigger task. `generate-scene.ts` should export a similarly testable `runGenerateScene(payload, dependencies)` and keep Trigger.dev configuration at the edge.

Use `idempotencyKeys.create(sceneKey, { scope: "global" })`. Raw string keys inside a task default to run scope in Trigger.dev 4.3.1+, which is insufficient across separate clock runs.

### Semantic/canvas split

The React transcript, labels and disclosures remain the accessible source of truth. Phaser receives `visualVariant`, speaker activity and room placement only. It must not receive prompts, claim ledgers, validation records or canonical mutation callbacks.

## New Patterns Without Existing Analogs

### Provider identity evidence

Create a provider-normalized result containing requested and canonical slugs, selected upstream/model, OpenRouter generation ID, strategy, route attempt, pipeline, usage/cost, and an explicit evidence kind. Only validated direct, first-attempt router metadata over an approved route qualifies as `openrouter_verified`; the adapter must not mistake a requested/top-level model ID for proof.

### Private attempt isolation

All provider inputs/outputs and validation failures are stored in Phase 2 private tables. Public snapshot/update routes must continue selecting only canonical projection data. Add source scans/tests that reject imports of attempt repositories from `src/app/api/world/**` and client code.

### Frozen provider doubles

Use AI SDK-compatible fake language models or an injected `ResidentTurnProvider` in unit/integration tests. Fixtures must include provider timeout, refusal/filter, invalid JSON, wrong resolved model, duplicate response, claim mismatch and clean outputs. Default `pnpm test` performs no live API call.

### Calibrated semantic judge

The judge is a separate application role with no resident ID and no publication method. It emits versioned scores/evidence only. Publication requires deterministic blockers plus calibrated semantic results; no judge output may rewrite the transcript.

## Test Pattern Assignments

| Risk | Existing test pattern | Phase 2 extension |
|---|---|---|
| Duplicate canon | world replay property and repository conflict tests | Duplicate Trigger delivery, same scene request, concurrent publication, delayed attempt completion |
| Provider failure | dependency-injected world-clock writer | Injected resident provider failures at each turn; assert private disposition and unchanged canon |
| Partial scene leakage | semantic observer rejects a 3-turn snapshot | Candidate rows and partial turns never appear in snapshot/update responses |
| Viewer convergence | Phase 1 two-context E2E | Two contexts converge on the same immutable published revision/provenance |
| Local controls cannot mutate canon | client source scan and GET-only E2E | Disclosure/provenance additions keep the observer read-only |
| Determinism | stable seed/tick and replay hash | Eligibility, cast rotation, cooldowns, memories and typed effects reproduce exactly |

## Files Executors Must Read Before Editing

- `.planning/phases/02-grounded-ensemble-and-safe-scenes/02-CONTEXT.md`
- `.planning/phases/02-grounded-ensemble-and-safe-scenes/02-AI-SPEC.md`
- `.planning/phases/02-grounded-ensemble-and-safe-scenes/02-RESEARCH.md`
- `src/db/schema.ts`
- `src/features/world/domain/types.ts`
- `src/features/world/domain/events.ts`
- `src/features/world/domain/advance.ts`
- `src/features/world/domain/replay.ts`
- `src/features/world/server/advance-world-to.ts`
- `src/features/world/server/to-public-snapshot.ts`
- `src/features/world/contracts/public-world.ts`
- `src/trigger/world-clock.ts`
- relevant existing unit/integration/E2E analog named above

## Landmines

- Do not call providers from `advance.ts`, reducers, repository transactions, public routes, or client code.
- Do not let Trigger.dev retry count become scene attempt count.
- Do not insert relationship changes during candidate generation.
- Do not use mutable aliases, OpenRouter automatic routing, hidden model/provider fallbacks, or responses missing validated router metadata.
- Do not expose raw response bodies, prompts, validation evidence, provider response IDs, cost or source excerpts publicly.
- Do not add a second scene/provenance endpoint when the canonical snapshot can carry the minimal public fields.
- Do not redesign the Phase 1 observer; make the smallest semantic and visual extensions required by RSID/TRNS.
- Do not run live provider tests in the default test suite.

## Pattern Map Completion

Phase 2 has strong analogs for contracts, pure domain rules, PostgreSQL canonical writes, Trigger adapters, public projection and observer presentation. Strict OpenRouter orchestration, private attempts, admission canaries and AI evaluation are new and must follow `02-AI-SPEC.md` plus `02-RESEARCH.md` rather than inventing framework-specific agent behavior.
