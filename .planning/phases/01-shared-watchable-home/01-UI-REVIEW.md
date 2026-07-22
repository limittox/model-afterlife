# Phase 1 — UI Review

**Audited:** 2026-07-22  
**Baseline:** `01-UI-SPEC.md` (approved 2026-07-22)  
**Screenshots:** Not captured (no dev server on ports 3000, 5173, or 8080)  
**Existing visual evidence:** `test-results/phase-1-home.png` reviewed; existing Playwright specifications and execution summaries were inspected but not rerun.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Approved loading, quiet, recovery, and playback labels are present, but the focus-revealed world summary leaks the internal term `tick`. |
| 2. Visuals | 2/4 | The scene hierarchy is legible, but the full-width dock and ASCII direction buttons read like a game action bar and violate the authored-icon contract. |
| 3. Color | 2/4 | The palette is exact, but amber is used on the current room and transcript turn beyond the four reserved accent roles. |
| 4. Typography | 2/4 | The four tokens exist, but the home clock renders Pixelify at body size and Phaser requests font-family names that the `next/font` setup does not register. |
| 5. Spacing | 3/4 | Layout widths and most spacing use the approved scale; the scene card and canvas label padding depart from the declared token usage. |
| 6. Experience Design | 2/4 | State and accessibility coverage is broad, but hard failure leaves contradictory loading surfaces, the location is an inert button, and required default transitions are absent. |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Redesign the observer dock so it does not read as gameplay** — the existing 1280×720 evidence shows a nearly full-width action row with `<`, `^`, `v`, and `>` buttons — replace the ASCII controls with authored 16px SVGs/tooltips, demote directional panning to help or a compact secondary group, and preserve Pause/Jump-to-live as the primary presentation actions.
2. **Bring typography back onto the approved font contract** — the clock uses Pixelify at inherited 16px and Phaser's literal family names do not match the generated `next/font` families — assign the clock the 28px display role and pass a registered/resolved font family into canvas rendering (or define explicit global `@font-face` names).
3. **Make hard failure a single honest state** — the error banner says the home could not load while the world and scene rail continue to say `Opening the home…` — branch those surfaces on connection state so no-cache failure shows the approved error/retry treatment without simultaneous loading copy.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

- **WARNING — internal simulation vocabulary reaches a visitor-facing focus surface.** `PixelWorldViewport.tsx:107-109` reveals `Shared home · tick {logicalTick}` when its hidden summary receives focus. The approved copy contract asks visitor copy to avoid infrastructure terminology. Use a home-time or scene-state label instead of the journal/clock unit.
- The canonical strings are otherwise implemented exactly: loading and recovery copy in `ConnectionBanner.tsx:14-42`, quiet/unavailable copy in `SceneRail.tsx:33-47`, and `Pause presentation`, `Resume presentation`, and `Jump to live` in `ObserverControlDock.tsx:118-151`.
- The scan found no generic `Submit`, `Click Here`, `OK`, `Cancel`, or `Save` labels and no visitor-facing provider, polling, cursor, snapshot, job, or database copy in the semantic components.

### Pillar 2: Visuals (2/4)

- **WARNING — the dock conflicts with the “never game-like” contract.** `ObserverControlDock.tsx:51-107` places zoom, reset, and four directional controls in the same persistent row as presentation actions; `globals.css:545-559` styles that row as a bottom overlay spanning most of the world. In `test-results/phase-1-home.png`, this reads as an action bar and competes with the home.
- **WARNING — icon implementation diverges from the design system.** `ObserverControlDock.tsx:86-105` uses raw `<`, `^`, `v`, and `>` glyphs rather than the required project-authored 16px SVG icons. Accessible names and native title tooltips are present, but the visual contract is not met.
- Positive evidence: `HomeScene.ts:129-191` differentiates all four rooms by structure, `HomeScene.ts:200-223` gives only the current speaker an amber floor marker, and `HomeScene.ts:390-419` keeps a single bounded supplementary bubble. The existing image shows a clear scene card/transcript and one highlighted speaker.
- **WARNING — final visual character requires judgment.** Whether the provisional geometry feels like an original, cozy “living television set,” whether the active scene sufficiently dominates ambient residents, and whether the revised dock avoids gameplay connotations cannot be established from code alone. `needs_human_review: true`

### Pillar 3: Color (2/4)

- **WARNING — amber exceeds its explicit reservation.** The UI spec reserves accent for the active-speaker marker, Live/Paused badge outline, focus ring, and Jump-to-live action. The allowed uses appear at `globals.css:80-84`, `globals.css:228-234`, `globals.css:581-583`, and `HomeScene.ts:218-223`, but `globals.css:392-394` also colors the current room border amber and `globals.css:530-533` adds an amber transcript-turn edge. Change those two indicators to primary text/structural border or use shape/weight without accent.
- The seven semantic colors match the approved values exactly in `globals.css:3-18` and `renderer-types.ts:15-25`. Error red is correctly limited to the error-banner edge at `globals.css:273-275`.
- The existing 1280×720 evidence broadly preserves dominant dark world space, secondary rail/status surfaces, and restrained accent coverage; exact 60/30/10 area distribution was not remeasured without a live capture.

### Pillar 4: Typography (2/4)

- **WARNING — the home clock violates the display role.** `.display-type` only changes family at `globals.css:102-105`; it does not assign `--type-display`. Consequently `HomeStatusStrip.tsx:45-49` renders Pixelify at the inherited 16px body size, despite the contract requiring Pixelify never below 20px and defining Display as 28px/600/1.2.
- **WARNING — canvas fonts are not wired to the registered families.** `layout.tsx:6-18` exposes generated families through `--font-atkinson` and `--font-pixelify`, while `HomeScene.ts:144-155` and `HomeScene.ts:411-419` request literal `Pixelify Sans` and `Atkinson Hyperlegible Next`. Those literal family names are never registered in source, so canvas text can fall back to generic sans-serif. Pass resolved family names through presentation tokens or add explicit global `@font-face` declarations.
- Positive evidence: `globals.css:36-39` declares exactly 14/16/20/28px, and source usage is restricted to weights 400 and 600 (`globals.css:56-60`, `globals.css:107-125`, `globals.css:164-177`). Transcript names and turns follow the label/body split.

### Pillar 5: Spacing (3/4)

- **WARNING — scene-card padding uses the wrong declared role.** The contract assigns `lg`/24px to scene-card and rail section padding. The rail uses 24px at `globals.css:445-455`, but `.scene-card` uses `md`/16px at `globals.css:482-486`. Use `var(--space-lg)` unless a documented compact-card exception is approved.
- **WARNING — canvas room-label padding bypasses the fixed scale.** `HomeScene.ts:144-153` uses `{ x: 3, y: 1 }`, neither of which belongs to the 4/8/16/24/32/48/64 scale. Use token-derived 4px source padding or record a pixel-art exception in the contract.
- Positive evidence: both token declarations use only the approved seven values (`globals.css:11-17`, `globals.css:29-35`); 44px hit targets are enforced at `globals.css:63-68`; and fixed 360px/320px rail widths are implemented at `globals.css:240-246` and `globals.css:597-605`. Existing Playwright assertions cover those rail widths and horizontal overflow at 1024/1280.

### Pillar 6: Experience Design (2/4)

- **WARNING — no-cache failure communicates loading and failure simultaneously.** `ConnectionBanner.tsx:14-22` renders the approved hard error, but `PixelWorldViewport.tsx:38-49` and `SceneRail.tsx:15-29` branch only on missing snapshot and continue to render `Opening the home…`. Pass connection/error state into both surfaces and render one coherent retryable failure state.
- **WARNING — location is presented as an action but has no action.** `HomeStatusStrip.tsx:51-62` uses a `<button>` solely to preserve an accessible name/title; it has no click handler. This creates a misleading focus stop. Use a non-button element with truncation plus an accessible tooltip pattern, or give the control a real inspect action.
- **WARNING — the default motion contract is not implemented.** The spec requires 200ms ease-out interface/banner transitions and a one-time 150ms speaker-marker entrance. `globals.css:255-267` defines no banner transition and `HomeScene.ts:218-223` draws the marker statically; only the reduced-motion override exists at `globals.css:700-707`. Add the default transitions/entrance and retain the zero-duration override.
- Positive evidence: the implementation retains a semantic transcript (`DialogueTranscript.tsx:18-32`), explicit disabled reasons (`ObserverControlDock.tsx:36-50`), a polite announcement region (`WorldObserver.tsx:126-128`), foreground recovery and local-only controls, and a reduced-motion query (`WorldObserver.tsx:42-48`). Existing browser specifications cover loading, quiet, cached failure, hard retry, overflow, 200% reflow, keyboard order, pause/resume/jump-live, two-viewer convergence, and all six speech-bubble states.
- **WARNING — calmness and control discoverability remain subjective.** Confirm with keyboard and pointer users that drag/wheel/follow behavior is discoverable without making the interface feel controllable like a game. `needs_human_review: true`

---

## Files Audited

- `.planning/phases/01-shared-watchable-home/01-CONTEXT.md`
- `.planning/phases/01-shared-watchable-home/01-UI-SPEC.md`
- `.planning/phases/01-shared-watchable-home/01-01-PLAN.md` through `01-04-PLAN.md`
- `.planning/phases/01-shared-watchable-home/01-01-SUMMARY.md` through `01-04-SUMMARY.md`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/features/world/client/WorldObserver.tsx`
- `src/features/world/components/HomeStatusStrip.tsx`
- `src/features/world/components/ConnectionBanner.tsx`
- `src/features/world/components/PixelWorldViewport.tsx`
- `src/features/world/components/SceneRail.tsx`
- `src/features/world/components/SceneCard.tsx`
- `src/features/world/components/DialogueTranscript.tsx`
- `src/features/world/components/ObserverControlDock.tsx`
- `src/features/world/components/ResidentFocusChip.tsx`
- `src/features/world/renderer/PixelWorld.tsx`
- `src/features/world/renderer/PhaserWorld.tsx`
- `src/features/world/renderer/create-world-game.ts`
- `src/features/world/renderer/HomeScene.ts`
- `src/features/world/renderer/SpeechBubbleLayer.ts`
- `src/features/world/renderer/CameraController.ts`
- `src/features/world/renderer/renderer-bridge.ts`
- `src/features/world/renderer/renderer-types.ts`
- `src/features/world/renderer/world-layout.ts`
- `src/features/world/renderer/integer-display-scale.ts`
- `tests/e2e/semantic-observer.spec.ts`
- `tests/e2e/shared-home.spec.ts`
- `tests/unit/renderer-bridge.test.ts`
- `tests/unit/presentation-reducer.test.ts`
- `test-results/phase-1-home.png`

Registry audit skipped: `components.json` is absent and the approved UI spec permits no third-party registry blocks.
