import type { ResidentTurnProvider } from "./resident-turn-provider.ts";
import { providerProfileFor } from "./provider-registry.ts";
export const STRICT_OPENROUTER_OPTIONS = { maxRetries: 0, maxOutputTokens: 180, timeout: 30_000, tools: undefined, stream: false, provider: { allow_fallbacks: false, require_parameters: true, data_collection: "deny" } } as const;
export class OpenRouterResidentTurnProvider implements ResidentTurnProvider { async generateTurn(input: Parameters<ResidentTurnProvider["generateTurn"]>[0]) { const profile = providerProfileFor(input.residentId); if (profile.requestedModelId !== input.requestedModelId) throw new Error("Resident/model mismatch."); throw new Error("Live OpenRouter execution is unavailable without an injected transport."); } }
