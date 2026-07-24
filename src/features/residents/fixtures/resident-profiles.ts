import type { HistoricalClaimCategory } from "../../world/domain/types.ts";

export const PROFILE_SECTION_IDS = [
	"real-world-significance",
	"lineage",
	"architecture-and-capabilities",
	"documented-limitations",
	"fictional-retirement",
] as const;

export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number];

export const PROFILE_SECTION_TITLES: Record<ProfileSectionId, string> = {
	"real-world-significance": "Real-world significance",
	lineage: "Lineage",
	"architecture-and-capabilities": "Architecture and capabilities",
	"documented-limitations": "Documented limitations and scope",
	"fictional-retirement": "Why this resident is here",
};

export type ResidentProfileClaimReference = {
	claimVersionId: string;
	claimId: string;
	category: HistoricalClaimCategory;
};

export type ResidentProfileDefinition = {
	residentId: string;
	displayOrder: number;
	sections: Array<{
		id: ProfileSectionId;
		claimReferences: ResidentProfileClaimReference[];
	}>;
	behaviors: Array<{
		id: string;
		title: string;
		joke: string;
		historicalInspiration: ResidentProfileClaimReference[];
		fictionalExaggeration: ResidentProfileClaimReference[];
		uncertaintyAndScope: string;
	}>;
};

const reference = (
	claimVersionId: string,
	claimId: string,
	category: HistoricalClaimCategory,
): ResidentProfileClaimReference => ({ claimVersionId, claimId, category });

export const RESIDENT_PROFILES: ResidentProfileDefinition[] = [
	{
		residentId: "gpt-4o",
		displayOrder: 1,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:gpt4o-reputation:v1",
						"gpt4o-versatile-flagship-reputation",
						"reported",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:gpt4o-lineage:v1",
						"gpt4o-omni-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:gpt4o-capability:v1",
						"gpt4o-native-multimodal",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:gpt4o-api-scope:v1",
						"gpt4o-api-modality-scope",
						"documented",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:gpt4o-retirement-framing:v1",
						"gpt4o-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "parlour-demonstrator",
				title: "The parlour demonstration",
				joke:
					"GPT-4o keeps turning ordinary parlour objects into tiny mixed-media demonstrations.",
				historicalInspiration: [
					reference(
						"claim-version:gpt4o-capability:v1",
						"gpt4o-native-multimodal",
						"documented",
					),
					reference(
						"claim-version:gpt4o-reputation:v1",
						"gpt4o-versatile-flagship-reputation",
						"reported",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:gpt4o-parlour-demo:v1",
						"gpt4o-parlour-demo-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"This is a staged character reconstruction. It does not imply consciousness, private motives, or that every modality is active in a text-only scene.",
			},
		],
	},
];
