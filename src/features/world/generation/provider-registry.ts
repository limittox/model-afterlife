export type ResidentProviderProfile = { residentId: string; requestedModelId: string; canonicalModelId: string; upstream: string; routingPolicyVersion: string };
export const RESIDENT_PROVIDER_PROFILES: readonly ResidentProviderProfile[] = [
	{ residentId: "former-giant", requestedModelId: "openai/gpt-3.5-turbo-0613", canonicalModelId: "openai/gpt-3.5-turbo-0613", upstream: "azure", routingPolicyVersion: "openrouter-strict-v1" },
	{ residentId: "masked-encoder", requestedModelId: "anthropic/claude-sonnet-4.5", canonicalModelId: "anthropic/claude-sonnet-4.5", upstream: "anthropic", routingPolicyVersion: "openrouter-strict-v1" },
] as const;
export function providerProfileFor(residentId: string): ResidentProviderProfile { const profile = RESIDENT_PROVIDER_PROFILES.find((item) => item.residentId === residentId); if (!profile) throw new Error(`No strict OpenRouter profile for ${residentId}.`); return profile; }
