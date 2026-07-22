import type { PresentationMode } from "../client/presentation-types.ts";
import { HOME_HEIGHT, HOME_WIDTH } from "./world-layout.ts";

export type CameraResident = { id: string; x: number; y: number };

export type CameraViewState = {
	centerX: number;
	centerY: number;
	zoom: number;
	followedResidentId: string | null;
	manualPan: boolean;
};

export type CameraTransition = CameraViewState & { durationMs: 0 | 240 };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function integerZoom(value: number): number {
	return clamp(Math.round(value), MIN_ZOOM, MAX_ZOOM);
}

export class CameraController {
	private state: CameraViewState = {
		centerX: HOME_WIDTH / 2,
		centerY: HOME_HEIGHT / 2,
		zoom: 1,
		followedResidentId: null,
		manualPan: false,
	};

	getState(): CameraViewState {
		return { ...this.state };
	}

	followResident(resident: CameraResident): CameraViewState {
		this.state = this.bound({
			...this.state,
			centerX: resident.x,
			centerY: resident.y,
			zoom: Math.max(2, this.state.zoom),
			followedResidentId: resident.id,
			manualPan: false,
		});
		return this.getState();
	}

	stopFollowing(): CameraViewState {
		this.state = { ...this.state, followedResidentId: null };
		return this.getState();
	}

	panBy(dx: number, dy: number): CameraViewState {
		this.state = this.bound({
			...this.state,
			centerX: this.state.centerX + dx,
			centerY: this.state.centerY + dy,
			followedResidentId: null,
			manualPan: true,
		});
		return this.getState();
	}

	finishManualPan(): CameraViewState {
		this.state = { ...this.state, manualPan: false };
		return this.getState();
	}

	setIntegerZoom(zoom: number): CameraViewState {
		this.state = this.bound({ ...this.state, zoom: integerZoom(zoom) });
		return this.getState();
	}

	resetEstablishingView(): CameraViewState {
		this.state = {
			centerX: HOME_WIDTH / 2,
			centerY: HOME_HEIGHT / 2,
			zoom: 1,
			followedResidentId: null,
			manualPan: false,
		};
		return this.getState();
	}

	frameSceneSpeakers(
		speakers: readonly CameraResident[],
		guard: {
			mode: PresentationMode;
			reducedMotion: boolean;
			followedResidentId: string | null;
			manualPan: boolean;
		},
	): CameraTransition | null {
		if (guard.mode !== "live" || guard.manualPan || speakers.length === 0) {
			return null;
		}
		if (
			guard.followedResidentId !== null &&
			!speakers.some((speaker) => speaker.id === guard.followedResidentId)
		) {
			return null;
		}

		const centerX =
			speakers.reduce((total, speaker) => total + speaker.x, 0) /
			speakers.length;
		const centerY =
			speakers.reduce((total, speaker) => total + speaker.y, 0) /
			speakers.length;
		this.state = this.bound({
			...this.state,
			centerX,
			centerY,
			zoom: 2,
			manualPan: false,
		});
		return {
			...this.getState(),
			durationMs: guard.reducedMotion ? 0 : 240,
		};
	}

	private bound(state: CameraViewState): CameraViewState {
		const zoom = integerZoom(state.zoom);
		const halfWidth = HOME_WIDTH / (2 * zoom);
		const halfHeight = HOME_HEIGHT / (2 * zoom);
		return {
			...state,
			zoom,
			centerX: clamp(state.centerX, halfWidth, HOME_WIDTH - halfWidth),
			centerY: clamp(state.centerY, halfHeight, HOME_HEIGHT - halfHeight),
		};
	}
}

