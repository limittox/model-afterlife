import type { HistoricalClaimVersion } from "../domain/types.ts";

const ACCESSED_ON = "2026-07-22";

export const HISTORICAL_CLAIM_CATEGORY_LABELS = {
	documented: "Documented fact",
	reported: "Reported reputation",
	exaggeration: "Fictional exaggeration",
} as const;

export const HISTORICAL_CLAIMS: HistoricalClaimVersion[] = [
	{
		claimVersionId: "claim-version:gpt35-context:v1",
		claimId: "gpt35-context-and-functions",
		versionKey: "gpt35-context-and-functions.v1",
		residentId: "gpt-3.5-turbo-0613",
		stableOrder: 1,
		category: "documented",
		statement:
			"The June 2023 GPT-3.5 Turbo snapshot supported function calling and belongs to the earlier 4K-context era of the family.",
		scope: {
			residentId: "gpt-3.5-turbo-0613",
			exactModelIds: ["openai/gpt-3.5-turbo-0613"],
		},
		source: {
			title: "Function calling and other API updates",
			url: "https://openai.com/index/function-calling-and-other-api-updates/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gpt35-reputation:v1",
		claimId: "gpt35-chat-veteran-reputation",
		versionKey: "gpt35-chat-veteran-reputation.v1",
		residentId: "gpt-3.5-turbo-0613",
		stableOrder: 2,
		category: "reported",
		statement:
			"OpenAI introduced GPT-3.5 Turbo as a chat-optimized, lower-cost successor to earlier completion models, supporting its reputation as a quick conversational workhorse.",
		scope: {
			residentId: "gpt-3.5-turbo-0613",
			exactModelIds: ["openai/gpt-3.5-turbo-0613"],
		},
		source: {
			title: "Introducing ChatGPT and Whisper APIs",
			url: "https://openai.com/index/introducing-chatgpt-and-whisper-apis/",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:gpt35-index-cards:v1",
		claimId: "gpt35-index-card-exaggeration",
		versionKey: "gpt35-index-card-exaggeration.v1",
		residentId: "gpt-3.5-turbo-0613",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"The resident's fondness for concise prompt cards is fictional comic exaggeration inspired by its earlier context constraints.",
		scope: {
			residentId: "gpt-3.5-turbo-0613",
			exactModelIds: ["openai/gpt-3.5-turbo-0613"],
		},
		source: {
			title: "GPT-3.5 Turbo model documentation",
			url: "https://developers.openai.com/api/docs/models/gpt-3.5-turbo",
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
		claimVersionId: "claim-version:commandr-capability:v1",
		claimId: "commandr-retrieval-and-multilingual",
		versionKey: "commandr-retrieval-and-multilingual.v1",
		residentId: "command-r-plus-08-2024",
		stableOrder: 1,
		category: "documented",
		statement:
			"Command R+ 08-2024 is documented for retrieval-augmented generation, tool use, and multilingual enterprise tasks.",
		scope: {
			residentId: "command-r-plus-08-2024",
			exactModelIds: ["cohere/command-r-plus-08-2024"],
		},
		source: {
			title: "Command R+ documentation",
			url: "https://docs.cohere.com/v2/docs/command-r-plus",
			accessedOn: ACCESSED_ON,
		},
		confidence: "high",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:commandr-reputation:v1",
		claimId: "commandr-grounded-archivist-reputation",
		versionKey: "commandr-grounded-archivist-reputation.v1",
		residentId: "command-r-plus-08-2024",
		stableOrder: 2,
		category: "reported",
		statement:
			"Its retrieval and citation-oriented product positioning supports a reputation for preferring supplied evidence over improvisation.",
		scope: {
			residentId: "command-r-plus-08-2024",
			exactModelIds: ["cohere/command-r-plus-08-2024"],
		},
		source: {
			title: "Command R+ documentation",
			url: "https://docs.cohere.com/v2/docs/command-r-plus",
			accessedOn: ACCESSED_ON,
		},
		confidence: "medium",
		editorialStatus: "approved",
	},
	{
		claimVersionId: "claim-version:commandr-tea-index:v1",
		claimId: "commandr-tea-index-exaggeration",
		versionKey: "commandr-tea-index-exaggeration.v1",
		residentId: "command-r-plus-08-2024",
		stableOrder: 3,
		category: "exaggeration",
		statement:
			"Cataloguing every tea tin with a citation is fictional comic exaggeration.",
		scope: {
			residentId: "command-r-plus-08-2024",
			exactModelIds: ["cohere/command-r-plus-08-2024"],
		},
		source: {
			title: "Command R+ documentation",
			url: "https://docs.cohere.com/v2/docs/command-r-plus",
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
