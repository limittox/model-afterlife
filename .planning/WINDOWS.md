---
schema_version: 1
open_count: 0
waived_count: 0
fixed_count: 13
total_count: 13
last_updated: 2026-07-24T19:24:17.050Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 03 | deviation | tests/integration/migration-manifest.test.ts |  | Updated the migration manifest regression expectation for the ordered 0003 provenance migration. | fixed |  | 2026-07-24T16:54:39.817Z | 2026-07-24T16:55:09.489Z |
| 2 | 03 | deviation | src/app/scenes/[sceneId]/page.tsx |  | Decoded percent-encoded canonical revision IDs before strict route validation. | fixed |  | 2026-07-24T17:21:11.544Z | 2026-07-24T17:21:43.857Z |
| 3 | 03 | deviation | playwright.config.ts |  | Added the named Chromium project required by the phase verification command. | fixed |  | 2026-07-24T17:21:12.171Z | 2026-07-24T17:21:44.470Z |
| 4 | 03 | deviation | scripts/backfill-scene-claim-versions.ts |  | Used Node 24 native TypeScript execution so the local backfill loaded the guarded database environment. | fixed |  | 2026-07-24T17:21:12.813Z | 2026-07-24T17:21:45.111Z |
| 5 | 03 | deviation | tests/integration/phase-03-resident-reader.test.ts |  | Used direct pinned executables because the literal pnpm Vitest command was unavailable in this Windows sandbox. | fixed |  | 2026-07-24T17:52:40.646Z | 2026-07-24T17:53:05.778Z |
| 6 | 03 | deviation | tests/integration/phase-03-resident-reader.test.ts |  | Replaced a substring privacy assertion that matched the reviewed word parameters with exact public DTO key inspection. | fixed |  | 2026-07-24T17:52:41.274Z | 2026-07-24T17:53:06.381Z |
| 7 | 03 | deviation | .planning/STATE.md |  | Reconciled stale state-handler plan-count prose, total phase count, and Phase 03 decision attribution. | fixed |  | 2026-07-24T17:52:41.920Z | 2026-07-24T17:53:07.016Z |
| 8 | 03 | deviation | src/features/return-loop/client/last-visit-marker.ts |  | Selected exact baseline fields from a valid observed snapshot | fixed |  | 2026-07-24T18:20:53.694Z | 2026-07-24T18:21:24.704Z |
| 9 | 03 | deviation | src/features/return-loop/client/ReturnRecapController.tsx |  | Kept the frozen recap request alive while polling advanced | fixed |  | 2026-07-24T18:20:54.314Z | 2026-07-24T18:21:25.317Z |
| 10 | 03 | deviation | src/app/globals.css |  | Added required responsive recap and navigation styles omitted from the plan file list | fixed |  | 2026-07-24T18:20:54.953Z | 2026-07-24T18:21:25.949Z |
| 11 | 03 | deviation | .planning/STATE.md |  | Reconciled state-handler phase count, progress prose, activity, and Phase 03 decision attribution | fixed |  | 2026-07-24T18:22:44.801Z | 2026-07-24T18:22:45.698Z |
| 12 | 03 | deviation | tests/e2e/phase-03-inclusive-observer.spec.ts | 220 | Polling focus regression now waits for an application-owned hydration transition before focusing the retained Pause action. | fixed |  | 2026-07-24T19:21:50.257Z | 2026-07-24T19:22:09.449Z |
| 13 | 03 | deviation | .planning/STATE.md |  | Reconciled stale state-handler total phase count, Plan 05 activity, 13-of-15 progress prose, and recent trend. | fixed |  | 2026-07-24T19:24:13.084Z | 2026-07-24T19:24:17.050Z |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "03",
    "file": "tests/integration/migration-manifest.test.ts",
    "line": null,
    "description": "Updated the migration manifest regression expectation for the ordered 0003 provenance migration.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T16:54:39.817Z",
    "resolved_at": "2026-07-24T16:55:09.489Z"
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "03",
    "file": "src/app/scenes/[sceneId]/page.tsx",
    "line": null,
    "description": "Decoded percent-encoded canonical revision IDs before strict route validation.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:21:11.544Z",
    "resolved_at": "2026-07-24T17:21:43.857Z"
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "03",
    "file": "playwright.config.ts",
    "line": null,
    "description": "Added the named Chromium project required by the phase verification command.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:21:12.171Z",
    "resolved_at": "2026-07-24T17:21:44.470Z"
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "03",
    "file": "scripts/backfill-scene-claim-versions.ts",
    "line": null,
    "description": "Used Node 24 native TypeScript execution so the local backfill loaded the guarded database environment.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:21:12.813Z",
    "resolved_at": "2026-07-24T17:21:45.111Z"
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "03",
    "file": "tests/integration/phase-03-resident-reader.test.ts",
    "line": null,
    "description": "Used direct pinned executables because the literal pnpm Vitest command was unavailable in this Windows sandbox.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:52:40.646Z",
    "resolved_at": "2026-07-24T17:53:05.778Z"
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "03",
    "file": "tests/integration/phase-03-resident-reader.test.ts",
    "line": null,
    "description": "Replaced a substring privacy assertion that matched the reviewed word parameters with exact public DTO key inspection.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:52:41.274Z",
    "resolved_at": "2026-07-24T17:53:06.381Z"
  },
  {
    "id": 7,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "Reconciled stale state-handler plan-count prose, total phase count, and Phase 03 decision attribution.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T17:52:41.920Z",
    "resolved_at": "2026-07-24T17:53:07.016Z"
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "03",
    "file": "src/features/return-loop/client/last-visit-marker.ts",
    "line": null,
    "description": "Selected exact baseline fields from a valid observed snapshot",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T18:20:53.694Z",
    "resolved_at": "2026-07-24T18:21:24.704Z"
  },
  {
    "id": 9,
    "kind": "deviation",
    "phase": "03",
    "file": "src/features/return-loop/client/ReturnRecapController.tsx",
    "line": null,
    "description": "Kept the frozen recap request alive while polling advanced",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T18:20:54.314Z",
    "resolved_at": "2026-07-24T18:21:25.317Z"
  },
  {
    "id": 10,
    "kind": "deviation",
    "phase": "03",
    "file": "src/app/globals.css",
    "line": null,
    "description": "Added required responsive recap and navigation styles omitted from the plan file list",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T18:20:54.953Z",
    "resolved_at": "2026-07-24T18:21:25.949Z"
  },
  {
    "id": 11,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "Reconciled state-handler phase count, progress prose, activity, and Phase 03 decision attribution",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T18:22:44.801Z",
    "resolved_at": "2026-07-24T18:22:45.698Z"
  },
  {
    "id": 12,
    "kind": "deviation",
    "phase": "03",
    "file": "tests/e2e/phase-03-inclusive-observer.spec.ts",
    "line": 220,
    "description": "Polling focus regression now waits for an application-owned hydration transition before focusing the retained Pause action.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T19:21:50.257Z",
    "resolved_at": "2026-07-24T19:22:09.449Z"
  },
  {
    "id": 13,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "Reconciled stale state-handler total phase count, Plan 05 activity, 13-of-15 progress prose, and recent trend.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-24T19:24:13.084Z",
    "resolved_at": "2026-07-24T19:24:17.050Z"
  }
]
````
