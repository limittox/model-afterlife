# Walking Skeleton — Model Afterlife

**Phase:** 1
**Generated:** 2026-07-22

## Capability Proven End-to-End

A visitor opens the observer page, sees a canonical home snapshot written to PostgreSQL by the server-owned world-advance path, and can locally pause or jump back to the current shared state without changing canon.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2 App Router + React 19 | Keeps semantic status, transcript, recovery, and controls in the DOM while supporting server routes and a browser-only renderer island. |
| World renderer | Phaser 4 behind one typed client bridge | Provides pixel camera and scene primitives without giving the canvas domain authority. |
| Data layer | PostgreSQL/Neon + Drizzle | The append-only world journal, unique occurrence keys, interactive transaction, and rebuildable projection need relational constraints and ordered durable state. |
| Scheduling | Trigger.dev scheduled task calling a pure `advanceWorldTo` service | Scheduled delivery wakes catch-up work; the database remains the canonical dedupe and truth boundary. |
| Live delivery | Coherent snapshot plus ordered cursor polling | A passive one-way observer experience does not need a bidirectional socket server; focus/reconnect/gaps replace state from a fresh snapshot. |
| Auth | None in Phase 1 | The experience is public and observer-only; operator/admin surfaces belong to later phases. |
| Deployment target | Vercel web + Neon Postgres + Trigger.dev Cloud, with a documented local full-stack run | Matches the project stack while keeping the Phase 1 walking skeleton verifiable without a globally installed cloud CLI. |
| Directory layout | Feature-oriented modules under `src/features/world`, with `src/app`, `src/db`, and `src/trigger` adapters | Preserves inward dependencies: browser/server/database/task adapters depend on public contracts and pure domain logic. |

## Stack Touched in Phase 1

- [ ] Project scaffold (framework, build, lint, test runner)
- [ ] Routing — observer page plus snapshot and ordered-update routes
- [ ] Database — canonical advance write plus snapshot/update read
- [ ] UI — local Pause/Resume/Jump-live and camera interaction wired to server-owned state
- [ ] Deployment — cloud-capable configuration plus documented local full-stack run

## Out of Scope (Deferred to Later Slices)

- Final six real-model residents, historical claim bibles, sourced traits, and real-model art
- Language-model generation, scene validation, prompt/model provenance, and publication governance
- Production pixel assets, profiles, archive, recaps, scene permalinks, sharing, and full mobile presentation
- Accounts, operator UI, analytics, cost controls, correction workflows, and public-launch hardening

## Subsequent Slice Plan

- Phase 2: Add the grounded six-resident ensemble, persistent relationships, and bounded safe scene generation.
- Phase 3: Add production presentation, profiles, history explanations, archive, recaps, accessibility/mobile completion, and sharing.
- Phase 4: Add public operations, correction controls, analytics, budgets, recovery evidence, and launch review.
