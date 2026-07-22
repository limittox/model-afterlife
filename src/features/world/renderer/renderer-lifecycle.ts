export type DisposableGame = { destroy(removeCanvas: boolean): void };

export function disposeWorldGame(
	game: DisposableGame,
	detachListeners: ReadonlyArray<() => void> = [],
): void {
	for (const detach of detachListeners) detach();
	game.destroy(true);
}

