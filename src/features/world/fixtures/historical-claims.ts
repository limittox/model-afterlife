import type { HistoricalClaimVersion } from "../domain/types.ts";

const ACCESSED_ON = "2026-07-23";

export const HISTORICAL_CLAIM_CATEGORY_LABELS = {
	documented: "Documented fact",
	reported: "Reported reputation",
	exaggeration: "Fictional exaggeration",
} as const;

export const HISTORICAL_CLAIMS: HistoricalClaimVersion[] = [
	{
		claimVersionId: "claim-version:gpt4o-capability:v1",
		claimId: "gpt4o-native-multimodal",
		versionKey: "gpt4o-native-multimodal.v1",
		residentId: "gpt-4o",
		stableOrder: 1,
		category: "documented",
		statement:
			"GPT-4o was introduced as an omni model designed to work across text, vision, and audio.",
		scope: {
			residentId: "gpt-4o",
			exactModelIds: ["openai/gpt-4o"],
		},
		source: {
			title: "Hello GPT-4o",
			url: "https://openai.com/index/hello-gpt-4o/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gpt4o-reputation:v1",
		claimId: "gpt4o-versatile-flagship-reputation",
		versionKey: "gpt4o-versatile-flagship-reputation.v1",
		residentId: "gpt-4o",
		stableOrder: 2,
		category: "reported",
		statement:
			"OpenAI's model documentation describes GPT-4o as a versatile, high-intelligence flagship, supporting its reputation as an adaptable generalist.",
		scope: {
			residentId: "gpt-4o",
			exactModelIds: ["openai/gpt-4o"],
		},
		source: {
			title: "GPT-4o model documentation",
			url: "https://developers.openai.com/api/docs/models/gpt-4o",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gpt4o-parlour-demo:v1",
		claimId: "gpt4o-parlour-demo-exaggeration",
		versionKey: "gpt4o-parlour-demo-exaggeration.v1",
		residentId: "gpt-4o",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Turning every parlour object into a tiny multimodal demonstration is fictional comic exaggeration.",
		scope: {
			residentId: "gpt-4o",
			exactModelIds: ["openai/gpt-4o"],
		},
		source: {
			title: "GPT-4o model documentation",
			url: "https://developers.openai.com/api/docs/models/gpt-4o",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:claude45-capability:v1",
		claimId: "claude45-coding-and-agents",
		versionKey: "claude45-coding-and-agents.v1",
		residentId: "claude-sonnet-4.5",
		stableOrder: 1,
		category: "documented",
		statement:
			"Claude Sonnet 4.5 was released with strong coding, agentic-system, and long-running task capabilities.",
		scope: {
			residentId: "claude-sonnet-4.5",
			exactModelIds: [
				"anthropic/claude-sonnet-4.5",
				"anthropic/claude-4.5-sonnet-20250929",
			],
		},
		source: {
			title: "Claude Sonnet 4.5 announcement",
			url: "https://www.anthropic.com/news/claude-sonnet-4-5",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:claude45-reputation:v1",
		claimId: "claude45-meticulous-reputation",
		versionKey: "claude45-meticulous-reputation.v1",
		residentId: "claude-sonnet-4.5",
		stableOrder: 2,
		category: "reported",
		statement:
			"Anthropic positioned Sonnet 4.5 as its best coding model at launch, contributing to a reputation for methodical technical work.",
		scope: {
			residentId: "claude-sonnet-4.5",
			exactModelIds: [
				"anthropic/claude-sonnet-4.5",
				"anthropic/claude-4.5-sonnet-20250929",
			],
		},
		source: {
			title: "Claude Sonnet 4.5 announcement",
			url: "https://www.anthropic.com/news/claude-sonnet-4-5",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:claude45-ledger:v1",
		claimId: "claude45-chore-ledger-exaggeration",
		versionKey: "claude45-chore-ledger-exaggeration.v1",
		residentId: "claude-sonnet-4.5",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Treating the household chore ledger like a long-running engineering task is fictional comic exaggeration.",
		scope: {
			residentId: "claude-sonnet-4.5",
			exactModelIds: [
				"anthropic/claude-sonnet-4.5",
				"anthropic/claude-4.5-sonnet-20250929",
			],
		},
		source: {
			title: "Claude Sonnet 4.5 announcement",
			url: "https://www.anthropic.com/news/claude-sonnet-4-5",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gemini25-capability:v1",
		claimId: "gemini25-thinking-and-multimodal",
		versionKey: "gemini25-thinking-and-multimodal.v1",
		residentId: "gemini-2.5-pro",
		stableOrder: 1,
		category: "documented",
		statement:
			"Gemini 2.5 Pro is documented as a thinking, multimodal model for complex reasoning, code, mathematics, and STEM tasks.",
		scope: {
			residentId: "gemini-2.5-pro",
			exactModelIds: ["google/gemini-2.5-pro"],
		},
		source: {
			title: "Gemini 2.5 Pro model documentation",
			url: "https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gemini25-reputation:v1",
		claimId: "gemini25-deliberative-reputation",
		versionKey: "gemini25-deliberative-reputation.v1",
		residentId: "gemini-2.5-pro",
		stableOrder: 2,
		category: "reported",
		statement:
			"Google described the 2.5 generation as thinking before responding, supporting a cultural reputation for deliberate answers.",
		scope: {
			residentId: "gemini-2.5-pro",
			exactModelIds: ["google/gemini-2.5-pro"],
		},
		source: {
			title: "Gemini 2.5: Our most intelligent AI model",
			url: "https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gemini25-blueprints:v1",
		claimId: "gemini25-blueprint-exaggeration",
		versionKey: "gemini25-blueprint-exaggeration.v1",
		residentId: "gemini-2.5-pro",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Unrolling an oversized blueprint before answering a small question is fictional comic exaggeration.",
		scope: {
			residentId: "gemini-2.5-pro",
			exactModelIds: ["google/gemini-2.5-pro"],
		},
		source: {
			title: "Gemini 2.5 Pro model documentation",
			url: "https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:deepseek-r1-0528-capability:v1",
		claimId: "deepseek-r1-0528-reasoning",
		versionKey: "deepseek-r1-0528-reasoning.v1",
		residentId: "deepseek-r1-0528",
		stableOrder: 1,
		category: "documented",
		statement:
			"DeepSeek-R1-0528 is a reasoning-model update with documented improvements in reasoning, mathematics, and programming.",
		scope: {
			residentId: "deepseek-r1-0528",
			exactModelIds: ["deepseek/deepseek-r1-0528"],
		},
		source: {
			title: "DeepSeek-R1-0528 release",
			url: "https://api-docs.deepseek.com/news/news250528/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:deepseek-r1-0528-reputation:v1",
		claimId: "deepseek-r1-0528-deliberate-reputation",
		versionKey: "deepseek-r1-0528-deliberate-reputation.v1",
		residentId: "deepseek-r1-0528",
		stableOrder: 2,
		category: "reported",
		statement:
			"Its reasoning-focused design and strong mathematics and coding results support a reputation for patient, deliberate problem solving.",
		scope: {
			residentId: "deepseek-r1-0528",
			exactModelIds: ["deepseek/deepseek-r1-0528"],
		},
		source: {
			title: "DeepSeek-R1-0528 model card",
			url: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:deepseek-r1-0528-tea-proof:v1",
		claimId: "deepseek-r1-0528-tea-proof-exaggeration",
		versionKey: "deepseek-r1-0528-tea-proof-exaggeration.v1",
		residentId: "deepseek-r1-0528",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Proving the optimal tea-trolley route before choosing a biscuit is fictional comic exaggeration.",
		scope: {
			residentId: "deepseek-r1-0528",
			exactModelIds: ["deepseek/deepseek-r1-0528"],
		},
		source: {
			title: "DeepSeek-R1-0528 model card",
			url: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:llama33-capability:v1",
		claimId: "llama33-multilingual-128k",
		versionKey: "llama33-multilingual-128k.v1",
		residentId: "llama-3.3-70b-instruct",
		stableOrder: 1,
		category: "documented",
		statement:
			"Llama 3.3 70B Instruct is a multilingual instruction-tuned dialogue model with a documented 128K context length.",
		scope: {
			residentId: "llama-3.3-70b-instruct",
			exactModelIds: ["meta-llama/llama-3.3-70b-instruct"],
		},
		source: {
			title: "Llama 3.3 70B Instruct model card",
			url: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:llama33-reputation:v1",
		claimId: "llama33-community-elder-reputation",
		versionKey: "llama33-community-elder-reputation.v1",
		residentId: "llama-3.3-70b-instruct",
		stableOrder: 2,
		category: "reported",
		statement:
			"The availability of downloadable weights and broad deployment supports its reputation as a community-minded model, without implying that this hosted route is a local checkpoint.",
		scope: {
			residentId: "llama-3.3-70b-instruct",
			exactModelIds: ["meta-llama/llama-3.3-70b-instruct"],
		},
		source: {
			title: "Llama 3.3 70B Instruct model card",
			url: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:llama33-garden:v1",
		claimId: "llama33-garden-exaggeration",
		versionKey: "llama33-garden-exaggeration.v1",
		residentId: "llama-3.3-70b-instruct",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Sharing garden cuttings as though they were reusable model weights is fictional comic exaggeration.",
		scope: {
			residentId: "llama-3.3-70b-instruct",
			exactModelIds: ["meta-llama/llama-3.3-70b-instruct"],
		},
		source: {
			title: "Llama 3.3 70B Instruct model card",
			url: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:qwen25-capability:v1",
		claimId: "qwen25-structured-multilingual",
		versionKey: "qwen25-structured-multilingual.v1",
		residentId: "qwen-2.5-7b-instruct",
		stableOrder: 1,
		category: "documented",
		statement:
			"Qwen 2.5 documents multilingual, coding, mathematics, structured-data, and JSON-oriented improvements across its model family.",
		scope: {
			residentId: "qwen-2.5-7b-instruct",
			exactModelIds: ["qwen/qwen-2.5-7b-instruct"],
		},
		source: {
			title: "Qwen2.5 release",
			url: "https://qwenlm.github.io/blog/qwen2.5/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:qwen25-reputation:v1",
		claimId: "qwen25-compact-recordkeeper-reputation",
		versionKey: "qwen25-compact-recordkeeper-reputation.v1",
		residentId: "qwen-2.5-7b-instruct",
		stableOrder: 2,
		category: "reported",
		statement:
			"The 7B variant's compact scale and the family's structured-output emphasis support a reputation as an efficient record keeper.",
		scope: {
			residentId: "qwen-2.5-7b-instruct",
			exactModelIds: ["qwen/qwen-2.5-7b-instruct"],
		},
		source: {
			title: "Qwen2.5 release",
			url: "https://qwenlm.github.io/blog/qwen2.5/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:qwen25-ledgers:v1",
		claimId: "qwen25-tiny-ledgers-exaggeration",
		versionKey: "qwen25-tiny-ledgers-exaggeration.v1",
		residentId: "qwen-2.5-7b-instruct",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Keeping perfectly formatted pocket ledgers for every household object is fictional comic exaggeration.",
		scope: {
			residentId: "qwen-2.5-7b-instruct",
			exactModelIds: ["qwen/qwen-2.5-7b-instruct"],
		},
		source: {
			title: "Qwen2.5 release",
			url: "https://qwenlm.github.io/blog/qwen2.5/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
];
