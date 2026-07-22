---
phase: 01-shared-watchable-home
verified: 2026-07-22T11:39:01Z
status: human_needed
score: 4/5 roadmap must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "At 1280x720, watch one active scene and a quiet period, then use the camera and presentation controls."
    expected: "The Common Room, Memory Garden, Library, and Tea Nook read immediately; one scene is clearly primary; routines stay calm; bubbles remain supplementary; art feels original and provider-neutral; and the dock feels observational rather than like a game action bar or operations dashboard."
    why_human: "Immediate readability, focal hierarchy, originality, calmness, and game-like visual connotation are judgment-tier claims. The 14/24 UI audit and existing screenshot provide evidence but cannot authoritatively resolve them."
  - test: "Observe live polling, Pause, Resume, Jump to live, and a reconnect/focus return during ordinary viewing."
    expected: "The five-second feed feels live enough for the scene pace; Pause and Resume are understandable; Jump to live and reconnect clearly replace from current canon without apparent movement replay or confusing mixed loading/error messaging."
    why_human: "The state transitions and ordering invariants are automated, but perceived liveness and recovery clarity require real-time human observation."
---

# Phase 1: Shared Watchable Home Verification Report

**Phase Goal:** Visitors can observe and control the presentation of one compact home whose canonical timeline advances independently of every browser.
**Verified:** 2026-07-22T11:39:01Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Roadmap truth | Status | Evidence |
|---|---|---|---|
| 1 | Two visitors share home time, resident locations, and primary scene; reconnecting or returning catches up without replaying missed movement. | VERIFIED | `tests/e2e/shared-home.spec.ts:83` compares two isolated real-database contexts by world ID, tick, sequence, hash, locations, and scene, then advances canon and proves local pause/camera isolation plus convergence. Recovery paths are exercised in `tests/e2e/semantic-observer.spec.ts:625-686`. The definitive browser gate is 50/50. |
| 2 | The compact home makes functional areas, current location, speakers, premise, live/paused state, one primary scene, and quiet routines immediately understandable. | UNCERTAIN — HUMAN | The facts are present and wired in `HomeStatusStrip`, `PixelWorldViewport`, `SceneCard`, `DialogueTranscript`, and `HomeScene`; semantic/layout tests cover them. “Immediately understandable,” calm focal hierarchy, originality, and the non-game-like dock prohibition remain visual judgments. The UI audit scored 14/24 and specifically flags the full-width ASCII-direction dock. |
| 3 | A desktop visitor can pan, zoom, follow/unfollow, reset, pause/read/resume, and jump live without influencing residents. | VERIFIED | Local reducer transitions are exercised in `presentation-reducer.test.ts`; camera/follow/reset/framing in `renderer-bridge.test.ts`; timed pause/resume in `semantic-observer.spec.ts:374-396`; and cross-viewer non-influence in `shared-home.spec.ts:83-157`. The client issues GET requests only. |
| 4 | Quiet, loading, reconnection, and unavailable-scene states remain watchable and explanatory rather than indefinitely spinning or freezing. | VERIFIED with UI warning | `ConnectionBanner`, `PixelWorldViewport`, and `SceneRail` render explicit quiet/loading/retry/unavailable states; partial scenes are rejected whole and cached state remains visible. The 50/50 browser gate covers these states. The no-cache hard-error banner is correct, but the viewport and rail simultaneously retain “Opening the home…” copy; this is a clarity warning, not an indefinite spinner/frozen-home failure. |
| 5 | Canonical event replay reproduces public state, while client-side time or outcome changes never alter canon. | VERIFIED | Pure/property tests cover deterministic direct-vs-chunked advancement, same-tick sequence ordering, dedupe, canonical serialization, and replay. PostgreSQL tests cover row locking, contiguous journal writes, duplicate wakes, exact replay/hash equality, and read-only public routes. `rebuild-world -- --check` definitively matched sequence and hash. |

**Score:** 4/5 roadmap truths verified; 1 judgment-dependent truth requires human confirmation. No truth is present-but-behavior-unverified: the state transitions and ordering invariants have behavioral tests.

### Plan-Specific Must-Haves

All 78 PLAN truth entries were checked in addition to the five roadmap criteria. Mechanical assertions are substantiated by source and behavioral tests. The unresolved entries are the explicitly flagged judgment claims about immediate readability, perceived liveness, calm visual hierarchy, discoverability, original/provider-neutral feel, and whether the dock reads as gameplay; they are consolidated into the two human checks above.

The three repeated prohibitions resolve as follows:

| Prohibition | Disposition | Evidence |
|---|---|---|
| Observer controls must not alter canonical state or affect other visitors. | VERIFIED | GET-only client source, unchanged database hash, and two-context isolation test. |
| Failures/outages must not become resident dialogue or silently replay old canon. | VERIFIED | Error-state semantic components, bubble suppression during connection trouble, whole-scene Zod validation, and browser state-matrix coverage. |
| Interface/art must not mimic a game action bar, operations dashboard, provider logos, or copied assets. | HUMAN NEEDED | Source has no provider/remote/copy assets, but the screenshot and UI audit flag the full-width ASCII directional dock as potentially game-like. This is the judgment-tier remainder. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `package.json`, `src/db/schema.ts`, `drizzle/0000_world_skeleton.sql` | Pinned runtime and canonical persistence | VERIFIED | Exact package manager/dependency pins, singleton world, append-only events, projection, uniqueness, and reviewed fresh-install migration are substantive. |
| `src/app/api/world/snapshot/route.ts`, `src/app/api/world/updates/route.ts` | Read-only coherent public feed | VERIFIED | GET-only, no-store, validated cursor, bounded contiguous updates, snapshot recovery on gaps. |
| `src/features/world/client/WorldObserver.tsx` | Rendered semantic observer | VERIFIED (supersedes Plan 01 path) | Plan 01 named `ObserverSkeleton.tsx`; code review deliberately removed that duplicate. `page.tsx` now renders the stronger `WorldObserver`, and walking-skeleton tests target the real imported reducer/client path. This is not a product gap. |
| `src/features/world/domain/advance.ts`, `replay.ts`, `canonical.ts` | Deterministic kernel and rebuild | VERIFIED | Pure, non-browser domain logic with property and replay evidence. |
| `src/features/world/server/advance-world-to.ts`, `world-repository.ts` | Atomic catch-up and canonical reads | VERIFIED | PostgreSQL row lock, transaction, occurrence/sequence uniqueness, projection update, coherent reads. |
| `src/trigger/world-clock.ts` | Browser-independent scheduled wake | VERIFIED | Timestamp-derived target tick, one-minute schedule, bounded retries/TTL, concurrency-one queue. |
| `src/features/world/client/presentation-reducer.ts`, `use-world-feed.ts` | Local presentation plus recovery | VERIFIED | Separate acquisition/presentation cursors, foreground polling, snapshot replacement, stale-response protection, bounded buffering. |
| Semantic components under `src/features/world/components/` | Status, scene, transcript, controls, recovery | VERIFIED | Substantive and rendered by `WorldObserver`; complete dialogue remains semantic DOM text. |
| Renderer files under `src/features/world/renderer/` | Client-only disposable pixel view | VERIFIED | SSR-disabled island, serializable bridge, closed local intent union, integer scaling, listener cleanup, and indirect `game.destroy(true)` through `disposeWorldGame`. |
| Unit/integration/E2E tests | Behavioral evidence | VERIFIED | 61/61 unit+integration, playback repeat 5/5, and full E2E 50/50 are definitive gates; the tests were inspected and exercise the claimed transitions/data flow. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `src/app/page.tsx` | `WorldObserver.tsx` | Server page renders query owner and observer | WIRED | `WorldQueryClient` wraps `WorldObserver`. |
| `use-world-feed.ts` | snapshot/update routes | GET fetch + Zod parse + reducer dispatch | WIRED | Snapshot bootstrap/recovery and five-second foreground updates feed one reducer. |
| Snapshot/update routes | `world-repository.ts` | Server read services | WIRED | Current projection and bounded ordered event snapshots are returned. |
| `world-clock.ts` | `advance-world-to.ts` | Scheduled timestamp to target tick | WIRED | The task calls the canonical writer exactly once per delivery. |
| `advance-world-to.ts` | PostgreSQL event/projection tables | One locked transaction | WIRED | Events and matching projection/head commit atomically. |
| `WorldObserver.tsx` | presentation reducer | Local dispatch actions | WIRED | Pause/resume/follow/pan/camera actions never reach a mutation endpoint. |
| `WorldObserver.tsx` | `PixelWorld.tsx` | Serializable render projection | WIRED | Phaser is a disposable view of the same validated snapshot used by semantic DOM. |
| `PhaserWorld.tsx` | renderer lifecycle/bridge | subscriptions and cleanup | WIRED | Tool pattern checks miss the indirection, but source calls `disposeWorldGame`, which calls `game.destroy(true)`. |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Produces real data | Status |
|---|---|---|---|---|
| Semantic observer and renderer | `presentedSnapshot` | `/api/world/snapshot` and `/api/world/updates` via `useWorldFeed` | PostgreSQL `world_projection` and ordered `world_events` | FLOWING |
| Canonical projection | `WorldState` / public snapshot | Trigger timestamp → target tick → pure `advance` → transactional event inserts | Deterministic events and persisted projection/hash | FLOWING |
| Scene rail and bubble | Complete scene/active local turn | One Zod-validated canonical scene; local playback index | Full DOM transcript; at most one supplementary bubble | FLOWING |
| Local controls | presentation/camera actions | Browser reducer and closed renderer-control/intent unions | Local state only; no server write capability | FLOWING (local-only by design) |

### Behavioral Spot-Checks

No large command or server was launched during this verification. The supplied definitive gates were accepted only after inspecting their test bodies and corresponding implementation:

| Behavior | Evidence | Result | Status |
|---|---|---|---|
| Deterministic clock/replay/duplicate safety | 61/61 unit+integration; substantive property, transaction, duplicate-wake, and rebuild tests inspected | Passed | PASS |
| Pause/resume timed playback | Dedicated browser repetition 5/5; reducer and scene-playback tests inspected | Passed repeatedly | PASS |
| Complete observer and two-viewer flow | Full E2E 50/50; state matrix and real PostgreSQL multi-context test inspected | Passed | PASS |
| Static quality and deployability | Lint, typecheck, production build | Passed | PASS |
| Supply chain | Production dependency audit | No vulnerabilities | PASS |
| Replay command | Deterministic replay check | Sequence/hash match | PASS |

### Probe Execution

No migration/tooling probe script or PLAN-declared `probe-*.sh` exists for this phase. Step 7c is not applicable.

### Requirements Coverage

| Requirement | Source plans | Status | Evidence |
|---|---|---|---|
| WRLD-01 | 01, 02, 04 | SATISFIED | Canonical projection plus two-viewer convergence and stable snapshot identity. |
| WRLD-02 | 02 | SATISFIED | Scheduled browser-independent catch-up advances time, locations, eligibility, relationships, and quiet/scene state. |
| WRLD-03 | 02, 03, 04 | SATISFIED | Fresh-snapshot replacement on gap/focus/reconnect/jump-live without movement replay. |
| WRLD-04 | 04 | NEEDS HUMAN | Four structural named zones and routines exist; immediate readability and meaningful calmness require visual confirmation. |
| WRLD-08 | 02 | SATISFIED | Exact journal replay/hash/sequence rebuild evidence. |
| VIEW-01 | 01, 03, 04 | NEEDS HUMAN | All required facts are present; immediate identifiability and hierarchy remain judgment-dependent. |
| VIEW-02 | 03, 04 | SATISFIED | Exactly one complete scene, speaker identity, short-turn playback, and full semantic transcript. |
| VIEW-03 | 04 | SATISFIED | Pan, integer zoom, follow/unfollow, reset, and jump-live covered across unit/E2E tests. |
| VIEW-04 | 01, 03, 04 | SATISFIED | Local pause/read/resume and fresh jump-live with continued acquisition. |
| VIEW-05 | 04 | NEEDS HUMAN | Several subdued routines and one-scene rendering are implemented; non-competition is a visual hierarchy judgment. |
| VIEW-06 | 03, 04 | SATISFIED with warning | Quiet/loading/reconnecting/unavailable/retry behavior is present and tested; hard-error/loading copy overlap should be judged in UAT. |
| VIEW-08 | 01, 02, 03, 04 | SATISFIED | Server-owned snapshots/updates only; client has no time/outcome or mutation authority. |

No Phase 1 requirement is orphaned: all 12 roadmap IDs appear in PLAN frontmatter and have implementation evidence.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|---|---|---|---|
| Phase source set | No unreferenced TBD/FIXME/XXX debt markers, no placeholder implementation, no public canonical mutation route, no `dangerouslySetInnerHTML`, and no client database/secret import | None | No blocker anti-pattern. |
| `ObserverControlDock.tsx` / `globals.css` | Full-width dock with ASCII direction glyphs | WARNING / human judgment | May violate the non-game-like visual prohibition; does not break local control behavior. |
| `PixelWorldViewport.tsx` and `SceneRail.tsx` | No-cache hard failure retains loading copy while error banner shows retry | WARNING | Mixed messaging, but no indefinite spinner or frozen home. |
| `HomeStatusStrip.tsx`, `HomeScene.ts`, `globals.css` | UI-audit typography, accent-reservation, inert-location-button, and spacing deviations | WARNING | UI-contract polish issues; none removes a Phase 1 capability or canonical invariant. |

### Human Verification Required

#### 1. Consolidated living-television and visual-prohibition check

**Test:** At 1280x720, watch an active scene and a quiet period, then use camera and presentation controls.

**Expected:** The four zones read immediately; one scene remains primary; routines are calm; bubbles supplement the transcript; art feels original/provider-neutral; camera movement is gentle; and the dock feels observational, not like gameplay or an operations dashboard.

**Why human:** This consolidates both deferred PLAN human checks, WRLD-04/VIEW-01/VIEW-05 visual judgment, and the unresolved visual prohibition.

#### 2. Perceived liveness and recovery clarity

**Test:** Observe ordinary five-second live updates, Pause, Resume, Jump to live, and reconnect/focus recovery.

**Expected:** The feed feels live enough for 30–60 second scenes, playback controls are understandable, catch-up does not appear to replay missed movement, and error/recovery surfaces communicate one coherent state.

**Why human:** Automated evidence proves state transitions and ordering, but not perceived liveness or copy clarity in real time.

### Gaps Summary

No automated blocker was found. The phase goal's canonical-world and observer-control mechanics are implemented and behaviorally proven. Status remains `human_needed` because the roadmap uses immediate-readability language, the plans defer two visual/experience checks, and the judgment-tier non-game-like/original-art prohibition cannot be silently passed. The UI audit's remaining mechanical warnings are real polish issues, but they do not independently falsify the Phase 1 goal or any canonical invariant.

### Verification Notes

- `ROADMAP.md` marks the phase `mode: mvp`, but its goal is not in the required user-story syntax; `user-story.validate` reports all three missing slots. The delegated verification request explicitly fixed the exact goal to verify, so this report uses the roadmap goal/success criteria and records the mode mismatch as planning metadata rather than an implementation gap.
- The Plan 01 `ObserverSkeleton.tsx` artifact and two literal Plan 04 key-link patterns fail mechanical path/pattern queries because later remediation removed a duplicate component and introduced cleanup/action indirection. Manual source tracing proves the intended artifacts and links through `WorldObserver`, `disposeWorldGame`, typed renderer intents, and reducer dispatch. Treating those obsolete literal paths as product blockers would contradict goal-backward verification.

---

_Verified: 2026-07-22T11:39:01Z_
_Verifier: generic-agent workaround (gsd-verifier role instructions)_
