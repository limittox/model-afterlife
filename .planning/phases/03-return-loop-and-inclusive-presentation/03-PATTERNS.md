# Phase 3: Return Loop and Inclusive Presentation - Pattern Map

**Mapped:** 2026-07-25  
**Target groups:** 25  
**Analog coverage:** 22 / 25  
**Search scope:** `src/`, `tests/`, `drizzle/`, `public/` (146 files)

## Non-Negotiable Identity Rules

- Public scene identity is immutable `published_scene_revisions.revision_id`.
- Cached playback links to `originalRevisionId`, never its synthetic `cached:*` presentation ID.
- Exact claim-version bindings must commit in the accepted publication transaction before permanent public URLs are released.
- Archive and recap chronology uses the `scene_published` event's `world_events.sequence`; `logicalTick` supplies home time. Do not order by `createdAt`.
- Mobile current scene/transcript/actions precede the visual home in DOM source order.
- Production art preserves resident IDs, `visualVariantId`s, room IDs, the 352x256 world, 16px grid, anchors, camera bounds, and renderer intents.

## File Classification

| New/Modified File or Module | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/db/schema.ts` | model/config | CRUD + append-only | existing version/revision/event tables in same file | exact |
| `drizzle/0003_*.sql` | migration | batch | `drizzle/0002_lumpy_daimon_hellstrom.sql` | exact |
| `src/features/world/server/publish-scene-revision.ts` | service | transactional/event-driven | existing `publishSceneRevision` | exact |
| `src/features/world/{fixtures/historical-claims.ts,server/seed-data.ts}` | fixture/service | batch transform | current claim ledger/editorial seeding | exact |
| `src/features/residents/fixtures/resident-profiles.ts` | fixture/config | transform | `launch-residents.ts` + `character-bibles.ts` | role |
| `src/features/publication/contracts/public-publication.ts` | contract/model | transform | `contracts/public-world.ts` | exact |
| `src/features/publication/domain/home-clock.ts` | utility | transform | `to-public-snapshot.ts:14-35` | exact extraction |
| `src/features/publication/server/read-canonical-scene.ts` | service | CRUD/read | `read-cached-scene.ts` + `world-repository.ts` | role |
| `src/features/publication/server/read-recent-scenes.ts` | service | batch/read | `world-repository.ts:68-146` | role |
| `src/features/publication/server/read-resident-profile.ts` | service | CRUD/read | `launch-residents.ts:401-410` | partial |
| `src/features/publication/server/read-return-recap.ts` | service | batch/transform | ordered event reader + relationship/memory helpers | role |
| `src/app/api/recap/route.ts` | route | request-response | `app/api/world/updates/route.ts` | exact role |
| `src/app/layout.tsx` | config | SSR metadata | current root metadata | exact modification |
| `src/app/residents/{page.tsx,[residentId]/page.tsx}` | pages | SSR request-response | `src/app/page.tsx` + server readers | role |
| `src/app/scenes/{page.tsx,[sceneId]/page.tsx,[sceneId]/not-found.tsx}` | pages | SSR request-response | `src/app/page.tsx` + server readers | role |
| `src/app/scenes/[sceneId]/opengraph-image.tsx` | metadata route | image response | none | no analog |
| `src/features/publication/components/*` | components | semantic render | `DialogueTranscript.tsx`, `SceneRail.tsx`, `TransparencyNotice.tsx` | exact role |
| `src/features/return-loop/client/{last-visit-marker,ReturnRecapController}.ts(x)` | utility/controller | local I/O + request-response | `public-world.ts` + `use-world-feed.ts` | role |
| `src/features/return-loop/components/ReturnRecap.tsx` | component | event-driven render | `SceneRail.tsx` + `ObserverControlDock.tsx` | role |
| `src/features/publication/client/ShareSceneActions.tsx` | client controller | browser capability | `ObserverControlDock.tsx` | role |
| `src/features/world/{components/ObserverNavigation.tsx,client/WorldObserver.tsx}` | component/controller | navigation + polling | existing observer/controller patterns | exact role |
| `src/app/globals.css` | style/config | responsive transform | existing observer breakpoints | exact modification |
| `src/features/world/renderer/{asset-manifest,production-assets,HomeScene,world-layout}.ts` | adapter/renderer | file-I/O + event-driven | current bridge/types/layout/scene | role/exact |
| `art-src/**`, `art-src/ORIGIN.md`, `public/art/**` | asset/config | file-I/O/export | none | no analog |
| Phase 3 Vitest/Playwright tests | test | unit/integration/browser | existing contract, publication, renderer, semantic suites | exact role |

## Pattern Assignments

### Schema, Migration, Publication, Fixtures

**Apply to:** schema, migration, publication transaction, backfill, editorial fixtures.

**Schema analog** — `src/db/schema.ts:113-119`, `171-178`:

```typescript
export const historicalClaimVersions = pgTable("historical_claim_versions", {
	claimVersionId: text("claim_version_id").primaryKey(),
	claimId: text("claim_id").notNull(),
	versionKey: text("version_key").notNull().unique(),
	content: jsonb("content").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publishedSceneRevisions = pgTable("published_scene_revisions", {
	revisionId: text("revision_id").primaryKey(),
	attemptId: text("attempt_id").notNull()
		.references(() => generationAttempts.attemptId, { onDelete: "restrict" })
		.unique(),
	sceneKey: text("scene_key").notNull()
		.references(() => sceneBriefs.sceneKey, { onDelete: "restrict" })
		.unique(),
	revision: jsonb("revision").$type<Record<string, unknown>>().notNull(),
});
```

New `published_scene_claim_versions` should use restrictive FKs, composite identity `(revision_id, turn_index, claim_version_id)`, and an index beginning `(claim_version_id, revision_id)`.

**Publication transaction analog** — `src/features/world/server/publish-scene-revision.ts:21-41`, `118-133`:

```typescript
const { db, close } = createWorldDatabase();
try {
	return await db.transaction(async (transaction) => {
		const existing = await transaction
			.select({ revisionId: publishedSceneRevisions.revisionId })
			.from(publishedSceneRevisions)
			.where(eq(publishedSceneRevisions.attemptId, revision.attemptId))
			.limit(1);
		if (existing[0]) return { revisionId: existing[0].revisionId, published: false };
		// lock world, validate head, parse stored brief
```

```typescript
const insertedRevision = await transaction
	.insert(publishedSceneRevisions)
	.values({ ...revision, revision })
	.onConflictDoNothing()
	.returning({ revisionId: publishedSceneRevisions.revisionId });
if (insertedRevision.length !== 1) {
	throw new Error("Scene publication lost an idempotency race.");
}
```

Resolve every stable approved claim ID to exactly one immutable `claimVersionId`, then insert all bindings inside this transaction before publication events/projection update. Ambiguous or missing mappings roll back the whole publication.

**Stable scene/event identity** — `publish-scene-revision.ts:80-93`:

```typescript
const scene: CompleteWorldScene = {
	id: revision.revisionId,
	// ...
	deliveryMode: "live",
	originalRevisionId: revision.revisionId,
	originalSceneKey: revision.sceneKey,
};

{
	sequence: head.state.throughSequence + 1,
	type: "scene_published",
	payload: { scene, revisionId: revision.revisionId, sceneKey: revision.sceneKey },
}
```

**Fixture transform** — `src/features/world/server/seed-data.ts:16-42`:

```typescript
validateLaunchResidentRegistry({
	residents: LAUNCH_RESIDENTS,
	bibles: CHARACTER_BIBLES,
	claims: HISTORICAL_CLAIMS,
});

return {
	historicalClaimVersions: HISTORICAL_CLAIMS.map((claim) => ({
		claimVersionId: claim.claimVersionId,
		claimId: claim.claimId,
		versionKey: claim.versionKey,
		content: claim,
	})),
};
```

Profile definitions should carry stable IDs/version keys and exact approved claim IDs, not historical prose in JSX. Extend `launch-residents.ts:191-393` validation: six-resident coverage, stable order, unique IDs, resident/model scope agreement, approved status, exhaustive category, HTTPS source, and ISO access date.

**Migration analog** — `drizzle/0002_lumpy_daimon_hellstrom.sql:1-4`; manifest assertion at `tests/integration/migration-manifest.test.ts:4-45`. Generate/review SQL and append the journal assertion; never production `push`.

### Strict Zod DTOs and Server Readers

**Apply to:** publication contracts and all scene/archive/profile/recap readers.

**Contract analog** — `src/features/world/contracts/public-world.ts:19-49`:

```typescript
const DialogueTurnSchema = z.object({
	id: z.string().min(1),
	speakerId: z.string().min(1),
	exactModelId: z.string().min(1),
	text: z.string().min(1),
});

const CompleteSceneSchema = z.object({
	id: z.string().min(1),
	participantIds: z.array(z.string().min(1)).min(2).max(3),
	turns: z.array(DialogueTurnSchema).min(4).max(10),
	deliveryMode: z.enum(["live", "cached"]).default("live"),
	originalRevisionId: z.string().min(1).optional(),
}).superRefine((scene, context) => {
	if (scene.deliveryMode === "cached" && !scene.originalRevisionId) {
		context.addIssue({ code: "custom", path: ["originalRevisionId"], message: "..." });
	}
});
```

Export `z.infer` types. Enforce complete scenes, exact model IDs, archive maximum 30, recap maximum five, a frozen recap `throughSequence`, and qualitative relationships with no raw scores/deltas.

**Stored JSON parser** — `src/features/world/server/read-cached-scene.ts:21-40`:

```typescript
const revision = PublishedSceneRevisionSchema.safeParse(input.revision);
const originalBrief = SceneBriefSchema.safeParse(input.originalBrief);
if (!revision.success || !originalBrief.success) return null;
```

Database JSON/local storage begins as `unknown`. Use `safeParse` for optional rows that may be omitted/marked partial; use `parse` for public responses that must fail closed.

**Reader lifecycle** — `src/features/world/server/world-repository.ts:17-42`:

```typescript
const { db, close } = createWorldDatabase();
try {
	const [row] = await db
		.select({ state: worldProjection.state, projection: worldProjection.projection })
		.from(worldProjection)
		.where(eq(worldProjection.worldId, worldId))
		.limit(1);
	if (!row) throw new Error(`Canonical world ${worldId} has not been seeded.`);
	return { state: row.state, snapshot: PublicWorldSnapshotSchema.parse(row.projection) };
} finally {
	await close();
}
```

`readCanonicalScene` returns `complete | known-unavailable | not-found`, never a partial transcript. Select only allowlisted public columns and parse before returning.

**Cached identity analog** — `read-cached-scene.ts:42-59`:

```typescript
return {
	id: `cached:${input.failedBrief.sceneKey}:${revision.data.revisionId}`,
	// ...
	deliveryMode: "cached",
	originalRevisionId: revision.data.revisionId,
	originalSceneKey: revision.data.sceneKey,
};
```

One link helper must normalize cached scenes to `originalRevisionId`.

### Archive/Recap Chronology and Cause-Backed Relationships

**Event order analog** — `src/features/world/server/world-repository.ts:95-110`:

```typescript
const rows = await db
	.select({
		sequence: worldEvents.sequence,
		logicalTick: worldEvents.logicalTick,
		publicSnapshot: worldEvents.publicSnapshot,
	})
	.from(worldEvents)
	.where(and(
		eq(worldEvents.worldId, worldId),
		gt(worldEvents.sequence, after),
		lte(worldEvents.sequence, head.throughSequence),
	))
	.orderBy(asc(worldEvents.sequence))
	.limit(limit + 1);
```

Archive newest-first and recap range come from `scene_published.sequence`; `logicalTick` formats home time. Extract `homeClockFor` from `to-public-snapshot.ts:14-35`. Never use DB/browser wall time, analytics, views, shares, or resident frequency.

**Cause key analog** — `src/features/world/domain/relationships.ts:34-52`:

```typescript
return [
	"relationship-effect",
	input.causeRevisionId,
	residentAId,
	residentBId,
	input.dimension,
	input.effectOrdinal,
].join(":");
```

Only nonzero `relationship_effect_applied` events whose `causeRevisionId` matches the publication produce relationship copy. Public shape is qualitative `label`, `description`, `residentId`, optional `causeSceneId`; omit raw `friendship`, `rivalry`, `familiarity`, and `delta`.

Recap candidate = one complete published revision. Rank genuine relationship effects above accepted shared experience above ordinary publication; tie-break by newest publication sequence then revision ID. Dismiss stores the response's `throughSequence`, not the current acquisition cursor.

### App Router Pages, Metadata, and Recap Route

**Page/import analog** — `src/app/page.tsx:1-12`:

```tsx
import { WorldObserver } from "@/features/world/client/WorldObserver";

export const dynamic = "force-dynamic";

export default function HomePage() {
	return <WorldObserver />;
}
```

App files use `@/` aliases. Detail/archive/profile pages remain Server Components; hydrate only sharing, recap, and presentation controls.

**Metadata analog** — `src/app/layout.tsx:1-23`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Model Afterlife",
	description: "Where obsolete models live on.",
};
```

Add validated `metadataBase`; never infer canonical origin from request headers. No dynamic route/OG analog exists: use the research signatures for async `params`, `notFound()`, `generateMetadata`, and route-local `ImageResponse`.

The scene page, metadata, OG image, and share payload must call the same canonical reader/disclosure helpers. OG uses checked-in original assets and a generic disclosed 1200x630 fallback.

**Read-only route analog** — `src/app/api/world/updates/route.ts:4-38`:

```typescript
function parseAfter(request: Request): number | null {
	const raw = new URL(request.url).searchParams.get("after") ?? "0";
	if (!/^(0|[1-9]\d*)$/.test(raw)) return null;
	const value = Number(raw);
	return Number.isSafeInteger(value) ? value : null;
}

export async function GET(request: Request): Promise<Response> {
	// validate, read, return Response.json(..., { headers: { "cache-control": "no-store" } })
}
```

Recap exports `GET` only, validates sequence with Zod, and exposes no canonical write.

### Semantic Components, Client Controller, Polling Boundary

**Transcript analog** — `src/features/world/components/DialogueTranscript.tsx:18-35`:

```tsx
<ol className="dialogue-transcript" aria-label="Complete scene transcript">
	{scene.turns.map((turn, index) => (
		<li key={turn.id} aria-current={index === activeTurnIndex ? "true" : undefined}>
			<p>
				<span className="speaker-name">{residentNames.get(turn.speakerId)}</span>
				<span className="model-label">{turn.exactModelId}</span>
			</p>
			<p>{turn.text}</p>
		</li>
	))}
</ol>
```

Reuse ordered list, speaker name, and exact-model attribution. Detail pages use document scrolling; only live desktop uses a contained transcript.

**Disclosure analog** — `src/features/world/components/TransparencyNotice.tsx:1-13`. Reuse shared staged-fiction/non-affiliation constants in visible page, metadata, OG, and share payload to prevent drift.

**Controller analog** — `src/features/world/client/WorldObserver.tsx:17-49`:

```typescript
const { state, dispatch, jumpToLive, retry } = useWorldFeed();
const [reducedMotion, setReducedMotion] = useState(false);

useEffect(() => {
	const query = window.matchMedia("(prefers-reduced-motion: reduce)");
	const update = () => setReducedMotion(query.matches);
	update();
	query.addEventListener("change", update);
	return () => query.removeEventListener("change", update);
}, []);
```

Parse local marker as exactly `{ version: 1, worldId: uuid, throughSequence: positive integer }`. `Review later`, opening a scene, and `Jump to live` do not acknowledge it. Recap is non-modal and returns focus to its opener.

**Polling boundary** — `src/features/world/client/use-world-feed.ts:59-79`:

```typescript
const updatesQuery = useQuery({
	queryKey: ["world", "updates", state.acquisitionCursor],
	queryFn: () => fetchUpdates(state.acquisitionCursor),
	enabled: state.lastValidSnapshot !== null && !state.needsFreshSnapshot,
	refetchInterval: 5_000,
	refetchIntervalInBackground: false,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
});
```

Keep acquisition/presentation cursors separate. The live snapshot is not the archive/permalink store.

**Source-order requirement:** current `WorldObserver.tsx:67-127` renders `PixelWorldViewport` before `SceneRail`; current `globals.css:681-711` only reflows with flex. Phase 3 must render scene/transcript/actions before the visual home in DOM, then use desktop grid areas for visual composition.

### Phaser Bridge and Assets

**Bridge analog** — `src/features/world/renderer/renderer-bridge.ts:62-103`:

```typescript
return {
	worldId: snapshot.worldId,
	logicalTick: snapshot.logicalTick,
	throughSequence: snapshot.throughSequence,
	stateHash: snapshot.stateHash,
	mode: presentation.mode,
	reducedMotion: presentation.reducedMotion,
	rooms: projectRooms(snapshot.rooms),
	residents: projectResidents(snapshot.residents),
};
```

Canonical data stops at this pure serializable projection. Phaser emits typed local intents and has no fetch/write path.

**Stable layout analog** — `src/features/world/renderer/world-layout.ts:9-12`, `43-62`, `73-95`:

```typescript
export const HOME_WIDTH = 352;
export const HOME_HEIGHT = 256;

return {
	...resident,
	renderId: `resident:${resident.id}` as const,
	x: anchor.x,
	y: anchor.y,
	variant: resident.visualVariantId as ResidentVisualVariant,
};
```

Validate Tiled/atlas IDs and anchors against this contract; do not infer identity from labels or array order.

**Reduced-motion analog** — `src/features/world/renderer/HomeScene.ts:78-88`, `304-333`: current idle motion becomes `0`, and automatic camera framing uses duration `0`. Production atlases must choose representative static frames, not merely lower FPS.

No asset-package analog exists. Required manifest validation: six stable resident atlases; neutral/seated/walk/listen/speak tags; reduced-motion frames; exact room IDs/anchors; fixed dimensions; nearest-neighbor exports; portraits/social art; origin author/date/references/tool version/ownership/export hashes. Runtime consumes checked-in exports; Aseprite/Tiled are not deployment dependencies.

### Tests

| Concern | Copy Pattern From | Required Phase 3 Assertion |
|---|---|---|
| DTO fail-closed/privacy | `tests/unit/public-world-contract.test.ts:113-165` | incomplete scenes fail; private attempts/prompts/errors/raw scores absent |
| Publication idempotency | `tests/integration/scene-generation-tracer.test.ts:65-108` | claim bindings commit once; ambiguous mapping rolls back all |
| Migration journal | `tests/integration/migration-manifest.test.ts:4-45` | new table/key/FKs/index and ordered journal entry |
| Renderer IDs/motion | `tests/unit/renderer-bridge.test.ts:23-78`, `202-215` | stable IDs/variants/anchors and static reduced-motion frames |
| Semantic/reflow | `tests/e2e/semantic-observer.spec.ts:531-556` | semantic lists and no overflow at effective 200% zoom |
| DOM/focus order | `tests/e2e/semantic-observer.spec.ts:838-879` | narrow DOM order is scene/transcript/actions then compact home |
| Reduced motion | `tests/e2e/shared-home.spec.ts:286-315` | held sprites, camera duration `0`, static speaker marker |

## Shared Patterns

- **Imports:** App files use `@/`; feature internals use explicit relative `.ts`/`.tsx`; tests use explicit relative paths.
- **Errors:** DB closes in `finally`; APIs log server context and return allowlisted calm errors; incomplete canonical scenes become unavailable, never partial.
- **Privacy:** Public readers allowlist accepted transcript, exact model IDs, approved exact claim versions/sources, outcome, qualitative cause-backed relationships, and disclosures. Exclude prompts, rejected text, provider bodies/errors, hidden reasoning, calibration, usage/cost, and raw relationship state.
- **Semantics:** React/server HTML owns all essential content/actions. Phaser/static art is supplementary.
- **Auth:** none. Reads are public and observer-only; the local marker is anonymous presentation state, not a session.

## No Analog Found

| Area | Reason |
|---|---|
| `src/app/scenes/[sceneId]/opengraph-image.tsx` | No generated image route. Use the Next signatures captured in `03-RESEARCH.md` and the shared canonical reader/disclosures. |
| `art-src/**`, `art-src/ORIGIN.md`, `public/art/**` | No production visual asset pipeline exists. Follow the UI-SPEC identity and research manifest/validator contract. |
| Exact claim-version mapping/backfill | Current rows store stable claim IDs and an attempt claim-set key, but no per-turn immutable version binding. Extend schema/publication; never read “latest claim” for an old scene. |

## Metadata

**Strong analog families:** persistence/publication; strict DTO/readers; App Router/read routes; semantic client/polling; renderer/tests  
**Pattern extraction date:** 2026-07-25  
**Paid calls:** none
