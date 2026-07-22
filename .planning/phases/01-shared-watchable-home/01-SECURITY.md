---
phase: 01
slug: shared-watchable-home
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-22
verified: 2026-07-22
---

# Phase 1 — Security

> ASVS Level 1 verification of the threat registers authored in all four Phase 1 plans. Blocking threshold: high.

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser → public world API | Anonymous observers read the canonical projection and ordered updates | Validated, public-only JSON snapshots |
| Next.js/Trigger.dev → PostgreSQL | Server-owned readers and one scheduled writer access the journal/projection | Database connection secret and canonical state |
| Public JSON → React/Phaser | Runtime-validated state is projected into semantic DOM and supplementary canvas objects | Plain room, resident, scene, and dialogue data |
| Local observer input → presentation | Camera, follow, pause, resume, and jump-live actions remain browser-local | Closed intent/action unions; no canonical capability |
| Registry/lockfile → build | Exact dependency identities become executable application code | Pinned packages and committed integrity metadata |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation and verification evidence | Status |
|-----------|----------|-----------|----------|-------------|--------------------------------------|--------|
| P1-T1 | Tampering / Elevation | Public world API | high | mitigate | Snapshot and update routes export GET only; real observer source has no mutation request; two-viewer E2E proves local controls leave canonical hashes convergent. | closed |
| P1-T2 | Tampering | SQL persistence | high | mitigate | Drizzle parameterization, singleton/occurrence/sequence constraints, atomic transactions, reviewed baseline migration, and an exact-name guarded disposable test database. | closed |
| P1-T3 | Tampering | Dependency supply chain | high | mitigate | Approved dependency identities, exact pins, committed lockfile, frozen package manager, and `pnpm audit --prod` reporting no known vulnerabilities. | closed |
| P1-T4 | Information disclosure | Client bundle | medium | mitigate | Database access stays in server modules; source assertions reject database URLs, Trigger secrets, database clients, and projection access from the observer bundle. | closed |
| P2-T1 | Tampering / Repudiation | Duplicate scheduled wakes | high | mitigate | World row lock, immutable occurrence keys, contiguous journal sequences, and repeated/concurrent delivery integration tests. | closed |
| P2-T2 | Tampering / Elevation | Browser cursor/time input | high | mitigate | Safe-integer cursor validation, GET-only handlers, no public target-tick input, and server-derived schedule time. | closed |
| P2-T3 | Denial of service | Update reads and catch-up | medium | mitigate | 100-update cap, bounded scheduler duration/retries, serialized queue, deployment-time seed tick, and a deployment-sized first-wake regression. | closed |
| P2-T4 | Information disclosure | Public contracts | medium | mitigate | Explicit Zod projections expose no journal payloads, connection details, task metadata, provider internals, or secrets. | closed |
| P3-T1 | Tampering | Public feed responses | high | mitigate | Cross-field/envelope Zod invariants, monotonic request generations/cursors, stale-response rejection, fresh-snapshot recovery, and last-valid presentation preservation. | closed |
| P3-T2 | Elevation / Tampering | Observer actions | high | mitigate | Local reducer and renderer-control unions only; GET-only acquisition; canonical hashes tested across independent viewers and local camera changes. | closed |
| P3-T3 | Information disclosure / XSS | Transcript | medium | mitigate | React text nodes only, no `dangerouslySetInnerHTML`, bounded validated dialogue, and provider-neutral public copy. | closed |
| P3-T4 | Denial of service | Polling and update buffer | medium | mitigate | One foreground query owner, five-second polling, 100-item page/buffer caps, and overflow/gap recovery driven by a durable snapshot request generation. | closed |
| P4-T1 | Tampering / Elevation | Renderer intents | high | mitigate | Closed local intent union, renderer source contains no fetch/write path, and renderer/camera tests prove controls cannot mutate render canon. | closed |
| P4-T2 | Information disclosure / XSS | Canvas bubble text | medium | mitigate | Validated plain Phaser text, no HTML or remote assets, two-line bounds, and complete dialogue retained in semantic DOM. | closed |
| P4-T3 | Denial of service | Phaser lifecycle/input | medium | mitigate | Single renderer owner, bounded geometric assets/residents/bubble, listener cleanup, `game.destroy(true)`, and lifecycle/remount browser coverage. | closed |
| P4-T4 | Spoofing | Visual identity | medium | mitigate | Original provider-neutral geometric art, text/shape room cues, no provider marks or remote imagery, and attribution/source assertions. | closed |

## Accepted Risks Log

No accepted risks.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-22 | 16 | 16 | 0 | Codex, ASVS L1 artifact and implementation verification |

## Verification Evidence

- 61/61 unit and integration tests passed against a freshly recreated test database.
- 50/50 Playwright tests passed, including independent-viewer convergence, recovery, semantic safety, and renderer lifecycle coverage.
- Lint, TypeScript, production build, dependency audit, and deterministic journal replay all passed.
- The final Phase 1 code review is clean with no blocker or warning.

## Sign-Off

- [x] All threats have a disposition.
- [x] Accepted risks are documented (none).
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-07-22
