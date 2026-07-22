import Phaser from "phaser";
import { HomeScene } from "./HomeScene.ts";
import type { RendererBridge } from "./renderer-bridge.ts";
import type { PresentationTokens } from "./renderer-types.ts";
import { HOME_HEIGHT, HOME_WIDTH } from "./world-layout.ts";

export function createWorldGame(
	parent: HTMLElement,
	bridge: RendererBridge,
	tokens: PresentationTokens,
): Phaser.Game {
	return new Phaser.Game({
		type: Phaser.AUTO,
		parent,
		width: HOME_WIDTH,
		height: HOME_HEIGHT,
		backgroundColor: tokens.colors.dominant,
		transparent: false,
		pixelArt: true,
		roundPixels: true,
		antialias: false,
		autoFocus: false,
		banner: false,
		fps: { target: 8, forceSetTimeOut: true },
		scale: {
			mode: Phaser.Scale.ScaleModes.NONE,
			autoCenter: Phaser.Scale.Center.NO_CENTER,
			autoRound: true,
		},
		scene: [new HomeScene(bridge, tokens)],
	});
}
