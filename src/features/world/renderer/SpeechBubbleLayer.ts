import type { RenderWorldState } from "./renderer-types.ts";

export const MAX_BUBBLE_LINES = 2;
const MAX_LINE_LENGTH = 28;

export type SpeechBubble = {
	speakerId: string;
	speakerRenderId: `resident:${string}`;
	lines: [string, string];
	fullText: string;
};

function fitBubbleLines(text: string): [string, string] {
	const words = text.trim().split(/\s+/);
	const lines = ["", ""];
	let lineIndex = 0;
	let truncated = false;

	for (const word of words) {
		const candidate = lines[lineIndex]
			? `${lines[lineIndex]} ${word}`
			: word;
		if (candidate.length <= MAX_LINE_LENGTH) {
			lines[lineIndex] = candidate;
			continue;
		}
		if (lineIndex === 0) {
			lineIndex = 1;
			if (word.length <= MAX_LINE_LENGTH) {
				lines[lineIndex] = word;
			} else {
				lines[lineIndex] = word.slice(0, MAX_LINE_LENGTH - 1);
				truncated = true;
			}
			continue;
		}
		truncated = true;
		break;
	}

	if (truncated) {
		lines[1] = `${lines[1].slice(0, MAX_LINE_LENGTH - 1).trimEnd()}â€¦`;
	}

	return [lines[0], lines[1]];
}

export function createSpeechBubble(
	state: RenderWorldState | null,
): SpeechBubble | null {
	const turn = state?.showSpeechBubble ? state.scene?.activeTurn : null;
	if (!turn) return null;
	return {
		speakerId: turn.speakerId,
		speakerRenderId: turn.speakerRenderId,
		lines: fitBubbleLines(turn.text),
		fullText: turn.text,
	};
}

export class SpeechBubbleLayer {
	getCurrent(state: RenderWorldState | null): SpeechBubble | null {
		return createSpeechBubble(state);
	}
}
