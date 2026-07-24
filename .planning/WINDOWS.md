---
schema_version: 1
open_count: 0
waived_count: 0
fixed_count: 1
total_count: 1
last_updated: 2026-07-24T16:55:09.489Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 03 | deviation | tests/integration/migration-manifest.test.ts |  | Updated the migration manifest regression expectation for the ordered 0003 provenance migration. | fixed |  | 2026-07-24T16:54:39.817Z | 2026-07-24T16:55:09.489Z |

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
  }
]
````
