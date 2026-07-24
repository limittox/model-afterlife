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
	{
		residentId: "claude-sonnet-4.5",
		displayOrder: 2,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:claude45-reputation:v1",
						"claude45-meticulous-reputation",
						"reported",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:claude45-lineage:v1",
						"claude45-sonnet-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:claude45-capability:v1",
						"claude45-coding-and-agents",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:claude45-launch-scope:v1",
						"claude45-vendor-launch-scope",
						"reported",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:claude45-retirement-framing:v1",
						"claude45-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "overprepared-steward",
				title: "The overprepared house steward",
				joke:
					"Claude Sonnet 4.5 maintains an ordinary chore ledger like a long-running engineering system.",
				historicalInspiration: [
					reference(
						"claim-version:claude45-capability:v1",
						"claude45-coding-and-agents",
						"documented",
					),
					reference(
						"claim-version:claude45-reputation:v1",
						"claude45-meticulous-reputation",
						"reported",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:claude45-ledger:v1",
						"claude45-chore-ledger-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"This is a staged reconstruction of documented and vendor-reported strengths. It does not imply private beliefs, feelings, or flawless technical work.",
			},
		],
	},
	{
		residentId: "gemini-2.5-pro",
		displayOrder: 3,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:gemini25-reputation:v1",
						"gemini25-deliberative-reputation",
						"reported",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:gemini25-lineage:v1",
						"gemini25-generation-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:gemini25-capability:v1",
						"gemini25-thinking-and-multimodal",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:gemini25-reasoning-scope:v1",
						"gemini25-reasoning-disclosure-scope",
						"reported",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:gemini25-retirement-framing:v1",
						"gemini25-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "blueprint-unfolder",
				title: "The oversized blueprint",
				joke:
					"Gemini 2.5 Pro unrolls an enormous observatory blueprint before answering a tiny household question.",
				historicalInspiration: [
					reference(
						"claim-version:gemini25-capability:v1",
						"gemini25-thinking-and-multimodal",
						"documented",
					),
					reference(
						"claim-version:gemini25-reputation:v1",
						"gemini25-deliberative-reputation",
						"reported",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:gemini25-blueprints:v1",
						"gemini25-blueprint-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"This reconstruction does not reveal hidden reasoning, equate deliberation with consciousness, or claim every response requires a long visible process.",
			},
		],
	},
	{
		residentId: "deepseek-v3.2",
		displayOrder: 4,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:deepseek-v3.2-sparse-attention:v1",
						"deepseek-v32-sparse-attention",
						"documented",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:deepseek-v3.2-lineage:v1",
						"deepseek-v32-release-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:deepseek-v3.2-dual-mode:v1",
						"deepseek-v32-dual-mode",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:deepseek-v3.2-serving-scope:v1",
						"deepseek-v32-hosted-serving-scope",
						"reported",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:deepseek-v3.2-retirement-framing:v1",
						"deepseek-v32-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "tea-route-optimizer",
				title: "The tea-trolley route",
				joke:
					"DeepSeek V3.2 indexes the story shelf before optimizing a tiny tea-trolley route.",
				historicalInspiration: [
					reference(
						"claim-version:deepseek-v3.2-dual-mode:v1",
						"deepseek-v32-dual-mode",
						"documented",
					),
					reference(
						"claim-version:deepseek-v3.2-sparse-attention:v1",
						"deepseek-v32-sparse-attention",
						"documented",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:deepseek-v3.2-tea-route:v1",
						"deepseek-v32-tea-route-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"This reconstruction uses the hosted non-thinking route. It does not expose chain-of-thought, equate sparse attention with poor attention, or describe a bit-identical local checkpoint.",
			},
		],
	},
	{
		residentId: "llama-3.3-70b-instruct",
		displayOrder: 5,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:llama33-reputation:v1",
						"llama33-community-elder-reputation",
						"reported",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:llama33-lineage:v1",
						"llama33-instruct-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:llama33-capability:v1",
						"llama33-multilingual-128k",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:llama33-license-scope:v1",
						"llama33-weights-and-license-scope",
						"documented",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:llama33-retirement-framing:v1",
						"llama33-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "garden-cutting-sharer",
				title: "The reusable garden cuttings",
				joke:
					"Llama 3.3 shares garden cuttings as affectionate wordplay about reusable model weights.",
				historicalInspiration: [
					reference(
						"claim-version:llama33-capability:v1",
						"llama33-multilingual-128k",
						"documented",
					),
					reference(
						"claim-version:llama33-reputation:v1",
						"llama33-community-elder-reputation",
						"reported",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:llama33-garden:v1",
						"llama33-garden-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"This is fictional reuse wordplay. The hosted FP8 route is not a bit-identical local checkpoint, and downloadable weights remain governed by licence terms.",
			},
		],
	},
	{
		residentId: "qwen3-235b-a22b-2507",
		displayOrder: 6,
		sections: [
			{
				id: "real-world-significance",
				claimReferences: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-reputation:v1",
						"qwen3-multilingual-archive-reputation",
						"reported",
					),
				],
			},
			{
				id: "lineage",
				claimReferences: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-lineage:v1",
						"qwen3-2507-instruct-lineage",
						"documented",
					),
				],
			},
			{
				id: "architecture-and-capabilities",
				claimReferences: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-architecture:v1",
						"qwen3-moe-non-thinking",
						"documented",
					),
				],
			},
			{
				id: "documented-limitations",
				claimReferences: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-serving-scope:v1",
						"qwen3-2507-hosted-serving-scope",
						"reported",
					),
				],
			},
			{
				id: "fictional-retirement",
				claimReferences: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-retirement-framing:v1",
						"qwen3-2507-fictional-retirement-framing",
						"exaggeration",
					),
				],
			},
		],
		behaviors: [
			{
				id: "household-index-council",
				title: "The household index council",
				joke:
					"Qwen3 convenes an imaginary many-expert index council before shelving one household label.",
				historicalInspiration: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-architecture:v1",
						"qwen3-moe-non-thinking",
						"documented",
					),
					reference(
						"claim-version:qwen3-235b-a22b-2507-reputation:v1",
						"qwen3-multilingual-archive-reputation",
						"reported",
					),
				],
				fictionalExaggeration: [
					reference(
						"claim-version:qwen3-235b-a22b-2507-index-council:v1",
						"qwen3-household-index-council-exaggeration",
						"exaggeration",
					),
				],
				uncertaintyAndScope:
					"The council is explicit fiction. Expert routing is not consciousness, not all parameters are active at once, and the hosted FP8 route is not presented as a bit-identical checkpoint.",
			},
		],
	},
];
