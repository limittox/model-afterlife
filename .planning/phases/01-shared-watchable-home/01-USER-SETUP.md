# Phase 1: User Setup Required

**Generated:** 2026-07-22
**Phase:** 01-shared-watchable-home
**Status:** Incomplete

Local execution is complete and needs no external account. Complete these items only when moving the canonical world and scheduled advancement to cloud development services.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `DATABASE_URL` | Neon Console → Project → dedicated development branch → Connection Details → pooled connection string | `.env.local` and deployment environment |
| [ ] | `TRIGGER_SECRET_KEY` | Trigger.dev Dashboard → Model Afterlife development project → API keys → development secret | `.env.local` and deployment environment |

Keep `DATABASE_PURPOSE=development`. Remove the local `NEON_WS_PROXY` value when using Neon Cloud. Never use a production database for `db:push`; prefer reviewed migrations for shared environments.

## Account Setup

- [ ] **Create or select a Neon project**
  - URL: https://console.neon.tech/
  - Use a dedicated development branch, not production.
  - Skip if: A development branch already exists for Model Afterlife.

- [ ] **Create or select a Trigger.dev project**
  - URL: https://cloud.trigger.dev/
  - Use the development environment while Plan 02 scheduling is being proven.
  - Skip if: A Model Afterlife development project already exists.

## Dashboard Configuration

- [ ] **Copy the Neon development connection**
  - Location: Neon Console → Project → development branch → Connection Details
  - Set: `DATABASE_URL` to the pooled connection string.
  - Notes: `MIGRATION_DATABASE_URL` may use the branch's direct connection when migrations are run outside the app.

- [ ] **Copy the Trigger.dev development secret**
  - Location: Trigger.dev Dashboard → Project → API keys
  - Set: `TRIGGER_SECRET_KEY` to the development secret.
  - Notes: The scheduled task is wired in Plan 02; the secret is not required for the completed local tracer.

## Verification

After completing setup, verify with:

```powershell
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm test -- tests/integration/walking-skeleton.test.ts
corepack pnpm build
```

Expected results:

- Migrations and the deterministic seed reach the dedicated Neon development branch.
- The snapshot integration test and production build pass without `NEON_WS_PROXY`.
- Trigger.dev verification begins with Plan 02's scheduled advancement task.

---

**Once all items complete:** Mark status as "Complete" at the top of this file.
