# API Coverage — Trigger.dev and Neon

> Full coverage by default. Opt-outs are explicit, reasoned decisions. The deterministic detector did not fire on the first-party route language, but Phase 1 deliberately records the two external service surfaces it adopts.

| capability | decision | reason |
|---|---|---|
| Trigger.dev — SDK scheduled-task definition | INTEGRATE | |
| Trigger.dev — declarative UTC cron schedule | INTEGRATE | |
| Trigger.dev — bounded retries | INTEGRATE | |
| Trigger.dev — task TTL/backlog expiry | INTEGRATE | |
| Trigger.dev — global-scope idempotency key | INTEGRATE | |
| Trigger.dev — direct local/test invocation | INTEGRATE | |
| Trigger.dev — project-local CLI development runner | INTEGRATE | |
| Trigger.dev — project configuration and deployable task discovery | INTEGRATE | |
| Trigger.dev — dynamic per-world schedules | OPT-OUT | Phase 1 has one fixed world and one declarative schedule; dynamic schedule management is unnecessary. |
| Trigger.dev — batch triggering | OPT-OUT | Phase 1 advances one canonical world through one transactional service. |
| Trigger.dev — realtime run subscriptions | OPT-OUT | Visitor delivery intentionally uses snapshot and foreground polling rather than provider realtime. |
| Trigger.dev — waits, delays, and resumable workflow steps | OPT-OUT | Catch-up is a single bounded database transaction, not a long-running workflow. |
| Trigger.dev — queues and provider-side concurrency allocation | OPT-OUT | Database locking is canonical in Phase 1; operational concurrency controls are assigned to Phase 4. |
| Trigger.dev — webhook/HTTP-trigger surface | OPT-OUT | No public or provider webhook is needed for the fixed scheduled wake-up. |
| Trigger.dev — production observability console integration | OPT-OUT | Full operator tracing and alerting are assigned to Phase 4; Phase 1 retains executable task/test evidence. |
| Neon — serverless WebSocket Pool/session connection | INTEGRATE | |
| Neon — interactive PostgreSQL transactions | INTEGRATE | |
| Neon — pooled connection string and lifecycle cleanup | INTEGRATE | |
| Neon — parameterized Drizzle queries | INTEGRATE | |
| Neon — TLS secret transport and server-only credentials | INTEGRATE | |
| Neon — development branch connection setup | INTEGRATE | |
| Neon — generated/reviewed Drizzle migrations | INTEGRATE | |
| Neon — clean migrate and dedicated development/test schema push | INTEGRATE | |
| Neon — HTTP one-shot query path | OPT-OUT | A single session-capable adapter keeps Phase 1 coherent; one-shot read optimization can be measured later. |
| Neon — management API and automated project/branch creation | OPT-OUT | A human-provided development branch is sufficient and avoids management credentials in the app. |
| Neon — Neon Auth | OPT-OUT | Phase 1 is public and observer-only with no accounts or sessions. |
| Neon — browser Data API / direct browser database access | OPT-OUT | Browsers must use read-only first-party routes and never receive database credentials. |
| Neon — row-level security as browser authorization | OPT-OUT | The browser has no direct database role; server-only access control is the relevant boundary. |
| Neon — logical replication/realtime change feed | OPT-OUT | Snapshot plus five-second foreground polling is the approved Phase 1 delivery mechanism. |
| Neon — automated branch-per-preview lifecycle | OPT-OUT | Preview-environment automation is outside the walking-skeleton goal and can be added with deployment hardening. |

