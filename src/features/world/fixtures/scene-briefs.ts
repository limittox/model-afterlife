import type { ApprovedSceneBrief, WorldRoomId } from "../domain/types.ts";
import type { SceneBrief } from "../generation/contracts.ts";
import { SceneBriefSchema } from "../generation/contracts.ts";
import { LAUNCH_RESIDENTS } from "./launch-residents.ts";

const ROOMS: WorldRoomId[] = [
	"common-room",
	"memory-garden",
	"library",
	"tea-nook",
];

const PREMISES = [
	"Two residents compare how they would catalogue an ambiguous house notice.",
	"A routine repair exposes two very different approaches to careful reasoning.",
	"The residents reconcile competing labels for an object in the memory garden.",
	"A tea-trolley schedule becomes a small debate about context and precision.",
	"Two former flagships trade affectionate notes about their release eras.",
] as const;

export const APPROVED_SCENE_BRIEFS: ApprovedSceneBrief[] = (() => {
	const briefs: ApprovedSceneBrief[] = [];
	let briefIndex = 0;
	for (
		let leftIndex = 0;
		leftIndex < LAUNCH_RESIDENTS.length;
		leftIndex += 1
	) {
		for (
			let rightIndex = leftIndex + 1;
			rightIndex < LAUNCH_RESIDENTS.length;
			rightIndex += 1
		) {
			const left = LAUNCH_RESIDENTS[leftIndex];
			const right = LAUNCH_RESIDENTS[rightIndex];
			briefIndex += 1;
			briefs.push({
				briefId: `ensemble-pair-${String(briefIndex).padStart(2, "0")}`,
				version: "phase-02-ensemble-v1",
				participantIds: [left.id, right.id],
				speakerOrder: [left.id, right.id, left.id, right.id],
				locationId: ROOMS[(briefIndex - 1) % ROOMS.length],
				premise: PREMISES[(briefIndex - 1) % PREMISES.length],
				allowedFactIds: [],
				tone: "Warm, concise, historically grounded ensemble comedy.",
				turnBudget: 4,
				permittedOutcome:
					"The residents complete the routine and retain one concise shared experience.",
				permittedRelationshipEffects: [
					{
						residentAId: left.id,
						residentBId: right.id,
						dimension: "familiarity",
					},
				],
			});
		}
	}
	return briefs;
})();

export function materializeSceneBrief(input: {
	template: ApprovedSceneBrief;
	sceneKey: string;
	expectedWorldHead: number;
}): SceneBrief {
	return SceneBriefSchema.parse({
		schemaVersion: 1,
		briefId: input.template.briefId,
		sceneKey: input.sceneKey,
		expectedWorldHead: input.expectedWorldHead,
		participantIds: input.template.participantIds,
		speakerOrder: input.template.speakerOrder,
		locationId: input.template.locationId,
		premise: input.template.premise,
		allowedFactIds: input.template.allowedFactIds,
		tone: input.template.tone,
		turnBudget: input.template.turnBudget,
		permittedOutcome: input.template.permittedOutcome,
		permittedRelationshipEffects:
			input.template.permittedRelationshipEffects,
	});
}
