export type ResidentProviderProfile = {
	residentId: string;
	requestedModelId: string;
	canonicalModelId: string;
	approvedUpstream: string;
	selectedUpstreamName: string;
	requiredQuantization?: "fp4" | "fp8";
	maxOutputTokens: 180 | 1024;
	reasoning?: Readonly<
		| { max_tokens: 128; exclude: true }
		| { enabled: false; effort: "none"; exclude: true }
	>;
	adapterVersion: "@openrouter/ai-sdk-provider@3.0.0";
	routingPolicyVersion: "strict-openrouter-v1";
};

export const RESIDENT_PROVIDER_PROFILES = [
	{
		residentId: "gpt-4o",
		requestedModelId: "openai/gpt-4o",
		canonicalModelId: "openai/gpt-4o",
		approvedUpstream: "openai",
		selectedUpstreamName: "OpenAI",
		maxOutputTokens: 180,
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
	{
		residentId: "claude-sonnet-4.5",
		requestedModelId: "anthropic/claude-sonnet-4.5",
		canonicalModelId: "anthropic/claude-4.5-sonnet-20250929",
		approvedUpstream: "anthropic",
		selectedUpstreamName: "Anthropic",
		maxOutputTokens: 180,
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
	{
		residentId: "gemini-2.5-pro",
		requestedModelId: "google/gemini-2.5-pro",
		canonicalModelId: "google/gemini-2.5-pro",
		approvedUpstream: "google-ai-studio",
		selectedUpstreamName: "Google AI Studio",
		maxOutputTokens: 1024,
		reasoning: { max_tokens: 128, exclude: true },
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
	{
		residentId: "deepseek-v3.2",
		requestedModelId: "deepseek/deepseek-v3.2",
		canonicalModelId: "deepseek/deepseek-v3.2-20251201",
		approvedUpstream: "deepinfra/fp4",
		selectedUpstreamName: "DeepInfra",
		requiredQuantization: "fp4",
		maxOutputTokens: 180,
		reasoning: { enabled: false, effort: "none", exclude: true },
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
	{
		residentId: "llama-3.3-70b-instruct",
		requestedModelId: "meta-llama/llama-3.3-70b-instruct",
		canonicalModelId: "meta-llama/llama-3.3-70b-instruct",
		approvedUpstream: "together",
		selectedUpstreamName: "Together",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
	{
		residentId: "qwen3-235b-a22b-2507",
		requestedModelId: "qwen/qwen3-235b-a22b-2507",
		canonicalModelId: "qwen/qwen3-235b-a22b-07-25",
		approvedUpstream: "deepinfra/fp8",
		selectedUpstreamName: "DeepInfra",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
	},
] as const satisfies readonly ResidentProviderProfile[];

export function providerProfileFor(residentId: string): ResidentProviderProfile {
	const profile = RESIDENT_PROVIDER_PROFILES.find(
		(candidate) => candidate.residentId === residentId,
	);
	if (!profile) {
		throw new RangeError(`No approved resident provider profile for ${residentId}.`);
	}
	return profile;
}
