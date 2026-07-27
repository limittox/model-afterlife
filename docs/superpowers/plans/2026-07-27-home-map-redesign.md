# Home Map Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current home schematic with an original 512×384 pixel-art world rendered through the existing crisp 352×256 observer viewport.

**Architecture:** Separate world bounds from viewport bounds, re-author the four canonical room regions and resident paths, then load one deterministic checked-in SVG as the production map. Phaser keeps ownership of camera presentation and resident sprites; React keeps the semantic compact view and overlays the same map asset without creating a second visual source of truth.

**Tech Stack:** TypeScript 6, Phaser 4, React 19, Next.js 16, SVG, Vitest 4, Playwright 1.61, Biome.

## Global Constraints

- World dimensions are exactly 512×384 logical pixels.
- Camera viewport remains exactly 352×256 logical pixels.
- Authoring grid remains 16×16 pixels; map extent is 32×24 tiles.
- Existing 32×32 resident atlas contracts remain unchanged.
- Existing canonical room identifiers remain unchanged.
- The map is one deterministic project-authored SVG named `model-afterlife-home.svg`.
- No new package, provider call, paid generation, or image-generation attempt is required.
- Visitors remain observers and gain no world-influence controls.
- The map must not copy another game's map, assets, proportions, or protected visual expression.
- Per project instruction, do not use TDD. Implement each bounded change first, then add or update focused regression tests and run them.
- Preserve unrelated `.gitignore` and `AGENTS.md` edits.

---

## File Structure

### Create

- `src/features/world/renderer/world-geometry.ts` — single source of truth for world, viewport, tile, and establishing-camera dimensions.
- `src/features/world/renderer/resident-motion.ts` — pure deterministic waypoint interpolation for walking residents.

### Modify

- `src/features/world/renderer/world-layout.ts` — canonical room zones, anchors, and waypoint paths.
- `src/features/world/renderer/renderer-types.ts` — waypoint contract on projected residents.
- `src/features/world/renderer/CameraController.ts` — clamp a 352×256 viewport within a 512×384 world.
- `src/features/world/renderer/create-world-game.ts` — keep the Phaser canvas at viewport size.
- `src/features/world/renderer/integer-display-scale.ts` — calculate display scale from viewport dimensions.
- `src/features/world/renderer/HomeScene.ts` — render the larger map, set camera bounds, move walking residents, and retain fallback metadata.
- `src/features/world/renderer/asset-manifest.ts` — accept the 512×384 world contract.
- `scripts/validate-phase-03-assets.ts` — require home artwork dimensions to match world dimensions.
- `art-src/home/model-afterlife-home.svg` — editable original 512×384 home map.
- `public/art/home/model-afterlife-home.svg` — checked-in runtime export.
- `public/art/manifest.json` — updated world dimensions, map dimensions, and map hash.
- `art-src/ORIGIN.md` — redesigned-map provenance and approval boundary.
- `src/features/world/components/CompactHomeView.tsx` — complete-map semantic overview.
- `src/app/globals.css` — 4:3 compact map and grid-aligned room overlays.
- `tests/unit/renderer-bridge.test.ts` — geometry, camera, scale, and resident-motion regression coverage.
- `tests/unit/asset-manifest.test.ts` — 512×384 manifest and source/runtime hash coverage.
- `tests/e2e/phase-03-original-art.spec.ts` — desktop world, camera, compact overview, and reduced-motion assertions.

---

### Task 1: Separate World Geometry from Viewport Geometry

**Files:**

- Create: `src/features/world/renderer/world-geometry.ts`
- Modify: `src/features/world/renderer/world-layout.ts`
- Modify: `src/features/world/renderer/CameraController.ts`
- Modify: `src/features/world/renderer/create-world-game.ts`
- Modify: `src/features/world/renderer/integer-display-scale.ts`
- Test: `tests/unit/renderer-bridge.test.ts`

**Interfaces:**

- Produces:
  - `WORLD_WIDTH: 512`
  - `WORLD_HEIGHT: 384`
  - `VIEWPORT_WIDTH: 352`
  - `VIEWPORT_HEIGHT: 256`
  - `TILE_SIZE: 16`
  - `ESTABLISHING_VIEW: { centerX: 256; centerY: 192; zoom: 1 }`
- Consumed by: layout projection, camera controller, Phaser configuration, display scaling, manifest validation, and compact positioning.

- [ ] **Step 1: Add the geometry contract**

Create `world-geometry.ts` with:

```ts
export const WORLD_WIDTH = 512;
export const WORLD_HEIGHT = 384;
export const VIEWPORT_WIDTH = 352;
export const VIEWPORT_HEIGHT = 256;
export const TILE_SIZE = 16;

export const ESTABLISHING_VIEW = {
	centerX: 256,
	centerY: 192,
	zoom: 1,
} as const;

export const WORLD_BOUNDS = {
	x: 0,
	y: 0,
	width: WORLD_WIDTH,
	height: WORLD_HEIGHT,
} as const;
```

- [ ] **Step 2: Re-author canonical room regions and anchors**

Replace `HOME_WIDTH`, `HOME_HEIGHT`, `ROOM_LAYOUT`, and `ROOM_ANCHORS` in `world-layout.ts`. Import the geometry constants and use these exact room regions:

```ts
export const ROOM_LAYOUT = {
	"memory-garden": {
		x: 0,
		y: 96,
		width: 144,
		height: 224,
		structuralCue: "garden",
	},
	"common-room": {
		x: 144,
		y: 96,
		width: 224,
		height: 224,
		structuralCue: "hearth",
	},
	library: {
		x: 368,
		y: 0,
		width: 144,
		height: 160,
		structuralCue: "bookshelves",
	},
	"tea-nook": {
		x: 368,
		y: 160,
		width: 144,
		height: 160,
		structuralCue: "counter",
	},
} as const;
```

Use these grid-aligned anchors:

```ts
const ROOM_ANCHORS = {
	"memory-garden": [
		{ x: 32, y: 144 },
		{ x: 80, y: 144 },
		{ x: 112, y: 192 },
		{ x: 32, y: 256 },
		{ x: 80, y: 272 },
		{ x: 112, y: 288 },
	],
	"common-room": [
		{ x: 192, y: 160 },
		{ x: 240, y: 160 },
		{ x: 288, y: 160 },
		{ x: 336, y: 160 },
		{ x: 192, y: 240 },
		{ x: 240, y: 240 },
		{ x: 288, y: 240 },
		{ x: 336, y: 240 },
	],
	library: [
		{ x: 400, y: 64 },
		{ x: 448, y: 64 },
		{ x: 400, y: 112 },
		{ x: 464, y: 112 },
	],
	"tea-nook": [
		{ x: 400, y: 208 },
		{ x: 464, y: 208 },
		{ x: 400, y: 272 },
		{ x: 464, y: 272 },
	],
} as const;
```

Unknown-room fallback coordinates use `ESTABLISHING_VIEW.centerX` and `ESTABLISHING_VIEW.centerY`.

- [ ] **Step 3: Make camera bounds use world and viewport dimensions**

In `CameraController.ts`, initialize and reset from `ESTABLISHING_VIEW`. Replace the bound calculation with:

```ts
private bound(state: CameraViewState): CameraViewState {
	const zoom = integerZoom(state.zoom);
	const halfWidth = VIEWPORT_WIDTH / (2 * zoom);
	const halfHeight = VIEWPORT_HEIGHT / (2 * zoom);
	return {
		...state,
		zoom,
		centerX: clamp(state.centerX, halfWidth, WORLD_WIDTH - halfWidth),
		centerY: clamp(state.centerY, halfHeight, WORLD_HEIGHT - halfHeight),
	};
}
```

At zoom 1, valid centers are `x=176..336` and `y=128..256`. At zoom 2, valid centers are `x=88..424` and `y=64..320`.

- [ ] **Step 4: Keep the renderer canvas at viewport size**

Update `create-world-game.ts` to use:

```ts
width: VIEWPORT_WIDTH,
height: VIEWPORT_HEIGHT,
```

Update `integer-display-scale.ts` defaults to `VIEWPORT_WIDTH` and `VIEWPORT_HEIGHT`. Do not use world dimensions when sizing the DOM canvas.

- [ ] **Step 5: Update post-implementation unit coverage**

In `renderer-bridge.test.ts`, update reset expectations to:

```ts
expect(camera.resetEstablishingView()).toEqual({
	centerX: 256,
	centerY: 192,
	zoom: 1,
	followedResidentId: null,
	manualPan: false,
});
```

Update the large-pan zoom-2 expectation to:

```ts
expect(panned.centerX).toBe(424);
expect(panned.centerY).toBe(320);
```

Keep the integer display-scale assertions at `2` for `704×512`, proving that enlarging the world did not lower the visible pixel scale.

- [ ] **Step 6: Verify and commit**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm test -- tests/unit/renderer-bridge.test.ts
```

Expected: typecheck and lint exit 0; the focused unit file reports zero failures.

Commit:

```powershell
git add src/features/world/renderer/world-geometry.ts src/features/world/renderer/world-layout.ts src/features/world/renderer/CameraController.ts src/features/world/renderer/create-world-game.ts src/features/world/renderer/integer-display-scale.ts tests/unit/renderer-bridge.test.ts
git commit -m "feat(03-06): expand home world geometry"
```

---

### Task 2: Author and Validate the New 512×384 Home Asset

**Files:**

- Modify: `art-src/home/model-afterlife-home.svg`
- Modify: `public/art/home/model-afterlife-home.svg`
- Modify: `public/art/manifest.json`
- Modify: `art-src/ORIGIN.md`
- Modify: `src/features/world/renderer/asset-manifest.ts`
- Modify: `scripts/validate-phase-03-assets.ts`
- Test: `tests/unit/asset-manifest.test.ts`

**Interfaces:**

- Consumes: world dimensions from Task 1.
- Produces: one source/runtime-identical `model-afterlife-home.svg`, manifest hash, and validated `home-establishing` entry.

- [ ] **Step 1: Replace the source map with the approved composition**

Author a `512×384` SVG with `viewBox="0 0 512 384"` and `shape-rendering="crispEdges"`. Use the authored-zone coordinates from the design specification.

The SVG must include these project-authored groups:

```xml
<g id="terrain-and-floors"></g>
<g id="architecture"></g>
<g id="memory-garden"></g>
<g id="common-room"></g>
<g id="library"></g>
<g id="tea-nook"></g>
<g id="entrance-and-corridors"></g>
<g id="lighting-and-details"></g>
```

Populate the groups with the required visual landmarks:

- Memory Garden: pond, path, two benches, shrubs, stones, and glowing plants.
- Common Room: GPU-heater hearth, two sofas, four chairs, two rugs, tables, and noticeboard.
- Library: shelves, archive cabinets, two reading desks, chairs, and lamps.
- Tea Nook: service counter, four seats, two tables, mugs, shelves, and token vending machine.
- Entrance/corridors: reception desk, doors, windows, charging points, cable conduits, plants, and server cabinet.

Use only grid-aligned integer coordinates and the approved palette family. Preserve clear 32×32 resident space around every authored anchor.

- [ ] **Step 2: Export the exact runtime copy**

Copy the reviewed source SVG byte-for-byte to:

`public/art/home/model-afterlife-home.svg`

Verify source/runtime equality:

```powershell
$sourceHash = (Get-FileHash -Algorithm SHA256 art-src/home/model-afterlife-home.svg).Hash
$runtimeHash = (Get-FileHash -Algorithm SHA256 public/art/home/model-afterlife-home.svg).Hash
if ($sourceHash -ne $runtimeHash) { throw "Source and runtime home artwork differ." }
```

- [ ] **Step 3: Update the manifest contract**

In `asset-manifest.ts`, change the literal world type and parser requirements to:

```ts
world: {
	width: 512;
	height: 384;
	tileSize: 16;
};
```

Return `{ width: 512, height: 384, tileSize: 16 }` from a successful parse.

In `public/art/manifest.json`:

- Set `world.width` to `512`.
- Set `world.height` to `384`.
- Set `home-establishing.dimensions` to `{ "width": 512, "height": 384 }`.
- Set `home-establishing.sha256` to the lowercase SHA-256 output of the runtime SVG.
- Leave resident and social-preview entries unchanged.
- Keep manifest status `pilot` until final human map approval.

- [ ] **Step 4: Strengthen asset validation**

After parsing the manifest in `validate-phase-03-assets.ts`, require:

```ts
const home = parsed.data.artwork.find(
	(asset) => asset.id === "home-establishing",
);
if (
	!home ||
	home.dimensions.width !== parsed.data.world.width ||
	home.dimensions.height !== parsed.data.world.height
) {
	throw new Error("Home artwork dimensions must match world dimensions.");
}
```

Retain the existing SVG dimension and hash checks.

- [ ] **Step 5: Record provenance**

Update `art-src/ORIGIN.md` to state:

- The map was code-authored for Model Afterlife from the approved 2026-07-27 design.
- It is original project artwork, not adapted from a third-party game map.
- Source and runtime paths.
- World/grid dimensions.
- Approval remains `pilot` pending final visual review.

- [ ] **Step 6: Update post-implementation asset tests**

Update `asset-manifest.test.ts` to expect:

```ts
world: { width: 512, height: 384, tileSize: 16 }
```

and:

```ts
expect.objectContaining({
	id: "home-establishing",
	path: "/art/home/model-afterlife-home.svg",
	dimensions: { width: 512, height: 384 },
})
```

Add a source/runtime equality assertion using `readFile` and `createHash`.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
pnpm verify:phase-03:assets
pnpm typecheck
pnpm lint
pnpm test -- tests/unit/asset-manifest.test.ts
```

Expected: validator reports six resident atlases and two artwork exports; all commands exit 0.

Commit:

```powershell
git add art-src/home/model-afterlife-home.svg public/art/home/model-afterlife-home.svg public/art/manifest.json art-src/ORIGIN.md src/features/world/renderer/asset-manifest.ts scripts/validate-phase-03-assets.ts tests/unit/asset-manifest.test.ts
git commit -m "feat(03-06): author expanded retirement home map"
```

---

### Task 3: Integrate Larger Camera Bounds and Deterministic Resident Paths

**Files:**

- Create: `src/features/world/renderer/resident-motion.ts`
- Modify: `src/features/world/renderer/renderer-types.ts`
- Modify: `src/features/world/renderer/world-layout.ts`
- Modify: `src/features/world/renderer/HomeScene.ts`
- Test: `tests/unit/renderer-bridge.test.ts`

**Interfaces:**

- Produces:
  - `WorldPoint = { x: number; y: number }`
  - `resolveResidentPosition(resident, elapsedMs, reducedMotion): WorldPoint`
  - `RenderResident.waypoints: readonly WorldPoint[]`
- Consumes: world/viewport geometry and room anchors from Task 1.

- [ ] **Step 1: Add the waypoint type to renderer contracts**

In `renderer-types.ts`:

```ts
export type WorldPoint = {
	x: number;
	y: number;
};
```

Add to `RenderResident`:

```ts
waypoints: readonly WorldPoint[];
```

- [ ] **Step 2: Author room-safe walking paths**

Add `ROOM_WAYPOINTS` in `world-layout.ts`:

```ts
const ROOM_WAYPOINTS = {
	"memory-garden": [
		{ x: 32, y: 176 },
		{ x: 112, y: 176 },
		{ x: 112, y: 272 },
		{ x: 48, y: 288 },
	],
	"common-room": [
		{ x: 176, y: 208 },
		{ x: 336, y: 208 },
		{ x: 336, y: 288 },
		{ x: 176, y: 288 },
	],
	library: [
		{ x: 400, y: 48 },
		{ x: 480, y: 48 },
		{ x: 480, y: 128 },
		{ x: 400, y: 128 },
	],
	"tea-nook": [
		{ x: 400, y: 192 },
		{ x: 480, y: 192 },
		{ x: 480, y: 288 },
		{ x: 400, y: 288 },
	],
} as const;
```

Project `waypoints` onto every resident. Non-walking residents retain the data but remain at their assigned anchor.

- [ ] **Step 3: Add deterministic pixel-rounded motion**

Create `resident-motion.ts`:

```ts
import type { RenderResident, WorldPoint } from "./renderer-types.ts";

const SEGMENT_DURATION_MS = 1_200;

export function resolveResidentPosition(
	resident: Pick<
		RenderResident,
		"x" | "y" | "movementIntent" | "waypoints"
	>,
	elapsedMs: number,
	reducedMotion: boolean,
): WorldPoint {
	if (
		reducedMotion ||
		resident.movementIntent !== "walking" ||
		resident.waypoints.length < 2
	) {
		return { x: resident.x, y: resident.y };
	}

	const finalIndex = resident.waypoints.length - 1;
	const phaseCount = finalIndex * 2;
	const elapsedSegments = Math.max(0, elapsedMs) / SEGMENT_DURATION_MS;
	const phase = Math.floor(elapsedSegments) % phaseCount;
	const forward = phase < finalIndex;
	const fromIndex = forward ? phase : phaseCount - phase;
	const toIndex = forward ? fromIndex + 1 : fromIndex - 1;
	const progress = elapsedSegments - Math.floor(elapsedSegments);
	const from = resident.waypoints[fromIndex] ?? { x: resident.x, y: resident.y };
	const to = resident.waypoints[toIndex] ?? from;

	return {
		x: Math.round(from.x + (to.x - from.x) * progress),
		y: Math.round(from.y + (to.y - from.y) * progress),
	};
}
```

- [ ] **Step 4: Render the larger world and apply motion**

In `HomeScene.ts`:

- Import world and viewport constants from `world-geometry.ts`.
- Set `this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)`.
- Center the camera on `ESTABLISHING_VIEW` during `create()`.
- Draw fallback terrain through `WORLD_WIDTH` and `WORLD_HEIGHT`.
- Clamp speech bubbles to `WORLD_WIDTH` and `WORLD_HEIGHT`.
- Store each projected resident on its `ResidentVisual`.
- During `update(time)`, call `resolveResidentPosition()` and apply its pixel-rounded `x` and `y`.
- Retain the existing one-pixel quiet bob only for non-walking residents.
- Set canvas metadata:

```ts
this.game.canvas.dataset.worldSize = `${WORLD_WIDTH}x${WORLD_HEIGHT}`;
this.game.canvas.dataset.viewportSize =
	`${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}`;
```

Keep original-art room rendering transparent except for the active-room outline. The procedural fallback may retain filled room blocks and structural cues.

- [ ] **Step 5: Add post-implementation motion and projection tests**

In `renderer-bridge.test.ts`, assert:

- Walking at `elapsedMs=0` returns the first waypoint.
- Walking at `elapsedMs=600` returns the pixel-rounded midpoint of the first segment.
- Walking at `elapsedMs=1_200` returns the second waypoint.
- Reduced motion always returns the resident anchor.
- Every projected resident has at least four waypoints.
- Every waypoint lies within its room region.

- [ ] **Step 6: Verify and commit**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm test -- tests/unit/renderer-bridge.test.ts
```

Expected: all commands exit 0 and the focused unit file reports zero failures.

Commit:

```powershell
git add src/features/world/renderer/resident-motion.ts src/features/world/renderer/renderer-types.ts src/features/world/renderer/world-layout.ts src/features/world/renderer/HomeScene.ts tests/unit/renderer-bridge.test.ts
git commit -m "feat(03-06): add expanded-world resident presentation"
```

---

### Task 4: Rebuild the Compact Full-Map Overview

**Files:**

- Modify: `src/features/world/components/CompactHomeView.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/features/world/renderer/world-layout.ts`
- Test: `tests/e2e/phase-03-original-art.spec.ts`

**Interfaces:**

- Produces: `getRoomLayout(roomId): RenderRoomGeometry | null` for semantic overlay placement.
- Consumes: 512×384 runtime map and canonical room geometry.

- [ ] **Step 1: Export read-only room geometry**

In `world-layout.ts`, export:

```ts
export type RenderRoomGeometry =
	(typeof ROOM_LAYOUT)[keyof typeof ROOM_LAYOUT];

export function getRoomLayout(roomId: string): RenderRoomGeometry | null {
	return ROOM_LAYOUT[roomId as keyof typeof ROOM_LAYOUT] ?? null;
}
```

- [ ] **Step 2: Position compact room labels over their real map regions**

In `CompactHomeView.tsx`, add `import type { CSSProperties } from "react";`, obtain each room's layout, and set percentage-based custom properties:

```tsx
const layout = getRoomLayout(room.id);
const style = layout
	? ({
			"--room-x": `${(layout.x / WORLD_WIDTH) * 100}%`,
			"--room-y": `${(layout.y / WORLD_HEIGHT) * 100}%`,
			"--room-width": `${(layout.width / WORLD_WIDTH) * 100}%`,
			"--room-height": `${(layout.height / WORLD_HEIGHT) * 100}%`,
		} as CSSProperties)
	: undefined;
```

Apply `style` to `.compact-room`. Preserve room names, resident counts, current-location text, six resident portraits, and resident profile shortcuts.

- [ ] **Step 3: Update compact CSS for a full 4:3 map**

Change the compact snapshot to:

```css
.compact-home-snapshot {
	position: relative;
	overflow: hidden;
	display: block;
	width: 100%;
	aspect-ratio: 4 / 3;
	border: var(--space-xs) solid var(--color-border);
	background: var(--color-secondary);
	user-select: none;
	touch-action: manipulation;
}

.compact-home-art {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;
	image-rendering: pixelated;
	opacity: 1;
}

.compact-room {
	position: absolute;
	z-index: 1;
	left: var(--room-x);
	top: var(--room-y);
	width: var(--room-width);
	height: var(--room-height);
	display: grid;
	align-content: center;
	padding: var(--space-xs);
	background: rgb(23 27 38 / 68%);
	overflow-wrap: anywhere;
}
```

Retain the current-location double border and readable text contrast. Keep the resident portrait strip above the map.

- [ ] **Step 4: Extend post-implementation browser coverage**

Update `phase-03-original-art.spec.ts` to assert:

- Canvas `data-world-size="512x384"`.
- Canvas `data-viewport-size="352x256"`.
- Canvas `data-home-artwork="home-establishing"`.
- Reset view settles at `data-camera-x="256"`, `data-camera-y="192"`, and `data-camera-zoom="1"`.
- Compact snapshot has a computed `4 / 3` aspect ratio.
- Compact view contains four positioned room overlays and six resident portraits.
- Reduced motion keeps `data-idle-motion="held"`.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm test:e2e -- tests/e2e/phase-03-original-art.spec.ts
```

Expected: all assertions pass. If the Windows Playwright web-server teardown hangs after every scenario has completed, capture the completed scenario output and stop only the lingering dev-server process.

Commit:

```powershell
git add src/features/world/components/CompactHomeView.tsx src/app/globals.css src/features/world/renderer/world-layout.ts tests/e2e/phase-03-original-art.spec.ts
git commit -m "feat(03-06): present expanded home across viewports"
```

---

### Task 5: Final Verification and Human Map Approval

**Files:**

- Modify after approval: `public/art/manifest.json`
- Modify after approval: `art-src/ORIGIN.md`
- Update after approval: `.planning/phases/03-return-loop-and-inclusive-presentation/03-06-SUMMARY.md`

**Interfaces:**

- Consumes: all prior tasks.
- Produces: approved production map, Phase 03 Plan 06 summary, and a clean handoff to Plan 03-07.

- [ ] **Step 1: Run the complete scoped verification**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm verify:phase-03:assets
pnpm test -- tests/unit/renderer-bridge.test.ts tests/unit/asset-manifest.test.ts
pnpm test:e2e -- tests/e2e/phase-03-original-art.spec.ts
git diff --check
```

Expected: lint, typecheck, validation, unit tests, browser assertions, and whitespace checks report zero failures.

- [ ] **Step 2: Capture desktop and compact review images**

Use the existing mocked Phase 3 browser fixture and capture:

- Desktop initial scene framing.
- Desktop reset/central establishing view.
- Desktop garden, library, and tea-nook camera positions.
- Compact 640px full-map overview.
- Reduced-motion desktop frame.

Do not commit temporary screenshots unless the user requests them as project artifacts.

- [ ] **Step 3: Request one consolidated human checkpoint**

Present the five review images together and ask the reviewer to check:

- Cozy, inhabited visual quality.
- Room readability.
- Resident/furniture separation.
- Originality and acceptable project use.
- Desktop and compact composition.

Required resume signal:

`approved final home map and assets for project use`

- [ ] **Step 4: Promote assets only after approval**

After the exact approval signal:

- Change `public/art/manifest.json` status from `pilot` to `production`.
- Record the approval date and production status in `art-src/ORIGIN.md`.
- Re-run asset validation and the focused unit tests.

- [ ] **Step 5: Close Plan 03-06**

Create `03-06-SUMMARY.md` using the existing GSD summary template. Include:

- 512×384 world and 352×256 viewport.
- New room geometry and resident paths.
- Map provenance and approval.
- Desktop/compact integration.
- Verification commands and outcomes.
- All implementation commit hashes.

Update Phase 3 progress only after the summary exists and verification evidence is current.

- [ ] **Step 6: Commit closeout**

```powershell
git add public/art/manifest.json art-src/ORIGIN.md .planning/phases/03-return-loop-and-inclusive-presentation/03-06-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md
git commit -m "docs(03-06): close approved home art integration"
```

---

## Execution Order

1. Task 1 — geometry and camera contract.
2. Task 2 — original map asset and manifest.
3. Task 3 — Phaser world and resident movement.
4. Task 4 — compact overview and browser coverage.
5. Task 5 — consolidated verification and human approval.

Do not start Task 5 promotion or Phase 03 Plan 06 closeout before the human approval signal.
