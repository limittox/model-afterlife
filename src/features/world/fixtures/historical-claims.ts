import type { HistoricalClaimVersion } from "../domain/types.ts";

const ACCESSED_ON = "2026-07-23";
const QWEN3_ACCESSED_ON = "2026-07-24";

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
		claimVersionId: "claim-version:gpt4o-lineage:v1",
		claimId: "gpt4o-omni-lineage",
		versionKey: "gpt4o-omni-lineage.v1",
		residentId: "gpt-4o",
		stableOrder: 4,
		category: "documented",
		statement:
			"OpenAI introduced GPT-4o as GPT-4's omni-model successor, with the letter o standing for omni.",
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
		claimVersionId: "claim-version:gpt4o-api-scope:v1",
		claimId: "gpt4o-api-modality-scope",
		versionKey: "gpt4o-api-modality-scope.v1",
		residentId: "gpt-4o",
		stableOrder: 5,
		category: "documented",
		statement:
			"The GPT-4o API model page documents text and image input with text output; a staged text scene does not establish that every GPT-4o modality is active.",
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
		claimVersionId: "claim-version:gpt4o-retirement-framing:v1",
		claimId: "gpt4o-fictional-retirement-framing",
		versionKey: "gpt4o-fictional-retirement-framing.v1",
		residentId: "gpt-4o",
		stableOrder: 6,
		category: "exaggeration",
		statement:
			"Presenting GPT-4o as a retired parlour host is fictional staging, not a claim that OpenAI retired the model or that the model is conscious.",
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
		claimVersionId: "claim-version:deepseek-v3.2-dual-mode:v1",
		claimId: "deepseek-v32-dual-mode",
		versionKey: "deepseek-v3.2-dual-mode.v1",
		residentId: "deepseek-v3.2",
		stableOrder: 1,
		category: "documented",
		statement:
			"DeepSeek-V3.2 supports both non-thinking and thinking operation; this resident is configured in non-thinking mode.",
		scope: {
			residentId: "deepseek-v3.2",
			exactModelIds: [
				"deepseek/deepseek-v3.2",
				"deepseek/deepseek-v3.2-20251201",
			],
		},
		source: {
			title: "DeepSeek API change log: DeepSeek-V3.2",
			url: "https://api-docs.deepseek.com/updates/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:deepseek-v3.2-sparse-attention:v1",
		claimId: "deepseek-v32-sparse-attention",
		versionKey: "deepseek-v3.2-sparse-attention.v1",
		residentId: "deepseek-v3.2",
		stableOrder: 2,
		category: "documented",
		statement:
			"DeepSeek-V3.2 introduces DeepSeek Sparse Attention to reduce computational complexity while preserving performance in long-context scenarios.",
		scope: {
			residentId: "deepseek-v3.2",
			exactModelIds: [
				"deepseek/deepseek-v3.2",
				"deepseek/deepseek-v3.2-20251201",
			],
		},
		source: {
			title: "DeepSeek-V3.2 model card",
			url: "https://huggingface.co/deepseek-ai/DeepSeek-V3.2",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:deepseek-v3.2-tea-route:v1",
		claimId: "deepseek-v32-tea-route-exaggeration",
		versionKey: "deepseek-v3.2-tea-route-exaggeration.v1",
		residentId: "deepseek-v3.2",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Indexing the entire story shelf before optimizing a tea-trolley route is fictional comic exaggeration.",
		scope: {
			residentId: "deepseek-v3.2",
			exactModelIds: [
				"deepseek/deepseek-v3.2",
				"deepseek/deepseek-v3.2-20251201",
			],
		},
		source: {
			title: "DeepSeek-V3.2 model card",
			url: "https://huggingface.co/deepseek-ai/DeepSeek-V3.2",
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
		claimVersionId: "claim-version:qwen3-235b-a22b-2507-architecture:v1",
		claimId: "qwen3-moe-non-thinking",
		versionKey: "qwen3-moe-non-thinking.v1",
		residentId: "qwen3-235b-a22b-2507",
		stableOrder: 1,
		category: "documented",
		statement:
			"Qwen3 235B A22B Instruct 2507 is a mixture-of-experts model with 235 billion total parameters, 22 billion activated parameters, and non-thinking-only output.",
		scope: {
			residentId: "qwen3-235b-a22b-2507",
			exactModelIds: [
				"qwen/qwen3-235b-a22b-2507",
				"qwen/qwen3-235b-a22b-07-25",
			],
		},
		source: {
			title: "Qwen3-235B-A22B-Instruct-2507 model card",
			url: "https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507",
			accessedOn: QWEN3_ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:qwen3-235b-a22b-2507-reputation:v1",
		claimId: "qwen3-multilingual-archive-reputation",
		versionKey: "qwen3-multilingual-archive-reputation.v1",
		residentId: "qwen3-235b-a22b-2507",
		stableOrder: 2,
		category: "reported",
		statement:
			"Qwen reports stronger instruction following, multilingual long-tail coverage, open-ended text quality, and long-context understanding for this exact model, which supports its archive-curator reputation.",
		scope: {
			residentId: "qwen3-235b-a22b-2507",
			exactModelIds: [
				"qwen/qwen3-235b-a22b-2507",
				"qwen/qwen3-235b-a22b-07-25",
			],
		},
		source: {
			title: "Qwen3-235B-A22B-Instruct-2507 model card",
			url: "https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507",
			accessedOn: QWEN3_ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:qwen3-235b-a22b-2507-index-council:v1",
		claimId: "qwen3-household-index-council-exaggeration",
		versionKey: "qwen3-household-index-council-exaggeration.v1",
		residentId: "qwen3-235b-a22b-2507",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Convening a many-expert household index council before shelving each label is fictional comic exaggeration, not a claim that expert routing is conscious.",
		scope: {
			residentId: "qwen3-235b-a22b-2507",
			exactModelIds: [
				"qwen/qwen3-235b-a22b-2507",
				"qwen/qwen3-235b-a22b-07-25",
			],
		},
		source: {
			title: "Qwen3: Think Deeper, Act Faster",
			url: "https://qwenlm.github.io/blog/qwen3/",
			accessedOn: QWEN3_ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
];
