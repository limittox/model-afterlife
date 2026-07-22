import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import { PixelWorld } from "../renderer/PixelWorld.tsx";
import { projectSnapshotToRenderState } from "../renderer/renderer-bridge.ts";
import type { RendererIntent } from "../renderer/renderer-types.ts";
import type { RendererControlEnvelope } from "../renderer/renderer-types.ts";
import type { PresentationMode } from "../client/presentation-types.ts";

export function PixelWorldViewport({
	snapshot,
	followedResidentId,
	onFollow,
	onManualPan,
	mode,
	reducedMotion,
	manualPan,
	rendererControl,
	onCameraSettled,
	onPanBy,
}: {
	snapshot: PublicWorldSnapshot | null;
	followedResidentId: string | null;
	onFollow: (residentId: string, residentName: string) => void;
	onManualPan: () => void;
	mode: PresentationMode;
	reducedMotion: boolean;
	manualPan: boolean;
	rendererControl: RendererControlEnvelope | null;
	onCameraSettled: (
		intent: Extract<RendererIntent, { type: "cameraSettled" }>,
	) => void;
	onPanBy: (dx: number, dy: number) => void;
}) {
	if (!snapshot) {
		return (
			<section className="pixel-world pixel-world-empty" aria-label="Home view">
				<div className="home-silhouette" aria-hidden="true">
					<span />
					<span />
					<span />
					<span />
				</div>
				<h2>Opening the home…</h2>
				<p>The shared home will appear here when it is ready.</p>
			</section>
		);
	}

	const primaryLocation =
		snapshot.scene?.locationId ?? snapshot.quiet?.locationId ?? null;
	const renderState = projectSnapshotToRenderState(snapshot, {
		mode,
		reducedMotion,
		followedResidentId,
		manualPan,
	});
	const handleIntent = (intent: RendererIntent) => {
		if (intent.type === "residentSelected") {
			onFollow(intent.residentId, intent.residentName);
		} else if (intent.type === "manualPanStarted") {
			onManualPan();
		} else {
			onCameraSettled(intent);
		}
	};
	const handleKeyboardPan = (key: string) => {
		const offsets: Record<string, { dx: number; dy: number }> = {
			ArrowUp: { dx: 0, dy: -16 },
			w: { dx: 0, dy: -16 },
			ArrowDown: { dx: 0, dy: 16 },
			s: { dx: 0, dy: 16 },
			ArrowLeft: { dx: -16, dy: 0 },
			a: { dx: -16, dy: 0 },
			ArrowRight: { dx: 16, dy: 0 },
			d: { dx: 16, dy: 0 },
		};
		return offsets[key] ?? null;
	};

	return (
		<section
			className="pixel-world"
			aria-labelledby="home-view-heading"
			data-world-id={snapshot.worldId}
			data-logical-tick={snapshot.logicalTick}
			data-through-sequence={snapshot.throughSequence}
			data-state-hash={snapshot.stateHash}
			data-scene-id={snapshot.scene?.id ?? "quiet"}
			onKeyDown={(event) => {
				const pan = handleKeyboardPan(event.key);
				if (!pan) return;
				event.preventDefault();
				onPanBy(pan.dx, pan.dy);
			}}
		>
			<div className="world-summary visually-hidden">
				<p className="scene-label">Shared home · tick {snapshot.logicalTick}</p>
				<h2 id="home-view-heading">A compact home, quietly carrying on</h2>
				<p>
					Four named rooms, {snapshot.residents.length} residents, and{" "}
					{snapshot.scene ? "one primary scene" : "quiet routines"} are in view.
				</p>
				<button
					className="world-keyboard-target"
					type="button"
					onKeyDown={(event) => {
						if (
							[
								"ArrowUp",
								"ArrowDown",
								"ArrowLeft",
								"ArrowRight",
								"w",
								"a",
								"s",
								"d",
							].includes(event.key)
						) {
								event.preventDefault();
							}
					}}
				>
					Explore home view with keyboard
				</button>
			</div>
			<PixelWorld
				state={renderState}
				onIntent={handleIntent}
				control={rendererControl}
			/>
			<fieldset className="room-grid visually-hidden">
				<legend className="visually-hidden">Rooms and residents</legend>
				{snapshot.rooms.map((room) => {
					const residents = snapshot.residents.filter(
						(resident) => resident.roomId === room.id,
					);
					return (
						<section
							className={
								room.id === primaryLocation
									? "home-room primary-room"
									: "home-room"
							}
							key={room.id}
							aria-label={`${room.name}${room.id === primaryLocation ? ", current scene location" : ""}`}
						>
							<h3>{room.name}</h3>
							{residents.length === 0 ? (
								<p className="room-quiet">Quiet for the moment</p>
							) : (
								<ul className="room-residents">
									{residents.map((resident) => (
										<li key={resident.id}>
											<button
												className="resident-marker"
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													onFollow(resident.id, resident.name);
												}}
												aria-label={`Follow ${resident.name}`}
												title={`Follow ${resident.name}`}
												aria-pressed={followedResidentId === resident.id}
											>
												<span className="resident-sprite" aria-hidden="true" />
												<span>
													<strong>{resident.name}</strong>
													<small>{resident.activity}</small>
												</span>
											</button>
										</li>
									))}
								</ul>
							)}
						</section>
					);
				})}
			</fieldset>
		</section>
	);
}
