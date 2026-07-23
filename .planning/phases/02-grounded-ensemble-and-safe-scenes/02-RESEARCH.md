# Phase 2 Research: Grounded Ensemble and Safe Scenes

**Researched:** 2026-07-22; OpenRouter amendment verified 2026-07-23
**Scope:** Exact launch cast, strict OpenRouter-routed generation, private attempts, atomic canon publication, grounded characterization, ensemble balance, and evaluation
**Confidence:** High for architecture and documentation-level model availability; live admission remains gated on credentialed canaries

## Executive Summary

Phase 2 should use one OpenRouter account and one server-only API key for six residents. Every resident still owns a distinct exact model slug; OpenRouter is a broker, not an author or permission to substitute models. Requests must restrict the upstream serving provider, disable fallback, require all parameters, opt into router metadata, and fail closed on route/model/metadata mismatch. The amended launch cast is:

1. OpenRouter `openai/gpt-4o`, restricted to OpenAI
2. OpenRouter `anthropic/claude-sonnet-4.5`, canonical slug `anthropic/claude-4.5-sonnet-20250929`, restricted to Anthropic
3. OpenRouter `google/gemini-2.5-pro`, restricted to Google AI Studio
4. OpenRouter `deepseek/deepseek-r1-0528`, restricted to DeepInfra FP4
5. OpenRouter `meta-llama/llama-3.3-70b-instruct`, restricted to Together FP8
6. OpenRouter `qwen/qwen-2.5-7b-instruct`, restricted to Together FP8

OpenRouter's current catalog lists callable structured-output endpoints for all six amended IDs. On 2026-07-23 it listed `openai/gpt-4o` on OpenAI and Azure, and `deepseek/deepseek-r1-0528` on DeepInfra FP4 plus three other hosts. A bounded direct diagnostic proved the exact DeepSeek model succeeds through DeepInfra on its first route attempt with a generation ID and no pipeline transformation. Documentation evidence is necessary but not sufficient: admission requires live proof of access, structured-turn behavior, OpenRouter generation ID, router strategy/attempt/selected route, usage, and latency. A resident that fails admission stays paused and cannot be silently replaced.

The vertical tracer should prove one complete two-resident scene using the same production path that later handles all six: deterministic eligibility -> immutable approved brief -> private attempt -> sequential resident turns -> deterministic and semantic validation -> atomic scene revision plus canonical event -> existing observer UI. Provider failures produce a quiet state and no canonical relationship effect.

## Recommended Exact Cast

| Resident | OpenRouter request ID | Canonical slug / approved upstream route | Availability evidence | Clear supersession evidence | Character-bible seed, not final copy |
|---|---|---|---|---|---|
| GPT-4o | `openai/gpt-4o` | same / `openai` | OpenRouter lists an active first-party OpenAI endpoint with structured output support | OpenAI's current guidance leads with GPT-5.x and GPT-4.1-era successors while GPT-4o remains callable | Versatile former omni flagship; quick multimodal synthesizer; proud of making text, vision, and audio feel like one conversation without reducing the resident to a logo or generic assistant |
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` | `anthropic/claude-4.5-sonnet-20250929` / `anthropic` | OpenRouter lists active Anthropic endpoints and the dated canonical slug | Claude Sonnet 5 and Sonnet 4.6 are newer generations | Meticulous former coding and agent specialist; alignment-conscious; long-task coherence is a strength, not an excuse for generic caution jokes |
| Gemini 2.5 Pro | `google/gemini-2.5-pro` | same / `google-ai-studio` | OpenRouter lists active Google AI Studio endpoints with structured output support | Google recommends later Gemini 3.x models | Reflective long-context thinker; complex code/math/STEM and multimodal history; default thinking can make the resident deliberate before a short answer |
| DeepSeek R1 0528 | `deepseek/deepseek-r1-0528` | same / `deepinfra`, FP4 | OpenRouter lists an active DeepInfra FP4 endpoint with structured output support; a direct live diagnostic passed | DeepSeek has released later V3.x/V4-era models and R1 0528 is a dated update | Open-weight reasoning veteran who thinks before speaking; methodical on math, logic, and code; comic timing comes from visible deliberation, never from exposing or inventing private chain-of-thought |
| Llama 3.3 70B Instruct | `meta-llama/llama-3.3-70b-instruct` | same / `together`, FP8 | OpenRouter lists a Together FP8 endpoint with structured output support; admission must confirm it is healthy | Meta released Llama 4 after Llama 3.3 | Open-weight community elder; multilingual dialogue and 128K context; proud of broad deployment while honestly naming OpenRouter and Together FP8 serving provenance |
| Qwen 2.5 7B Instruct | `qwen/qwen-2.5-7b-instruct` | same / `together`, FP8 | OpenRouter lists a Together FP8 endpoint with structured output support; admission must confirm it is healthy | Qwen 3 and later Qwen generations explicitly improve on Qwen 2.5 | Compact multilingual record keeper; strong JSON/structured-data and role-play heritage; the small-model identity supplies ensemble contrast without pretending the hosted service is a local checkpoint |

### Admission notes

- Send `X-OpenRouter-Metadata: enabled`. Require `strategy: direct`, `attempt: 1`, exactly one selected approved upstream provider/model, no fallback attempts, and no material `pipeline` transformation such as context compression, response healing, or server tools. Unknown additive metadata fields are retained privately or ignored safely, never treated as proof.
- Every request sends `provider.only` for the approved upstream, `allow_fallbacks: false`, `require_parameters: true`, and `data_collection: deny`; use `zdr: true` only where a live admission canary proves the exact endpoint remains available. If privacy restrictions remove the route, pause the resident rather than silently relax them.
- The response model slug plus `openrouter_metadata` and generation ID are the primary identity evidence. OpenRouter cache hits omit router metadata, so resident generation must not use router response caching as admission or publication evidence.
- Llama and Qwen public wording names the base model; private provenance records OpenRouter, Together, and FP8 serving metadata. It must not imply a bit-identical local checkpoint.
- DeepSeek public wording names R1 0528; private provenance records OpenRouter, DeepInfra, and FP4 serving metadata. Reasoning is mandatory, remains private, and receives a bounded per-profile output allowance while the final dialogue text stays capped at 240 characters.
- Live access depends on the user's OpenRouter account, balance, regional availability, and upstream health. Admission fails closed if any configured resident lacks a recent canary.

## Rejected Candidates

| Candidate | Rejection reason |
|---|---|
| Claude 3.5 Sonnet | No longer callable on the Claude API. The user's example describes the desired category, but current lifecycle status makes it ineligible under D-03. |
| Grok 3 | xAI retired it on 2026-05-15 and now redirects the old slug to Grok 4.3. A request that resolves to a different model violates D-05 and D-06 even if the slug still returns text. |
| Mistral Large 2.1 (`mistral-large-2411`) | Mistral documents a 2026-02-27 deprecation date and places it in Legacy/Deprecated. Current exact-callability is less defensible than the selected residents. |
| BERT | Historically important but encoder-only and not a callable generative dialogue model. It is suitable for a later commemorative/non-live exhibit, not this phase's live cast. The remembered space-fact anecdote also remains unverified. |
| GPT-3.5 Turbo 0613 and Command R+ 08-2024 | Removed from the launch cast by the user's 2026-07-23 replacement decision; their earlier research remains historical planning context only. |
| Mutable `latest`, family, `auto`, `:free`, `:extended`, or model fallback routes | They cannot prove that the displayed historical version authored the turn. Exact OpenRouter IDs, approved upstream restrictions, and verified router metadata are mandatory. |

## Framework and Package Pins

Use Vercel AI SDK Core with the OpenRouter AI SDK provider and the existing Trigger.dev runtime. Package versions were queried from npm on 2026-07-23:

| Package | Pin | Purpose |
|---|---:|---|
| `ai` | `7.0.34` | Provider registry, `generateText`, `Output`, response metadata, testable language-model interface |
| `@openrouter/ai-sdk-provider` | `3.0.0` | One OpenRouter transport for all resident and judge calls while preserving the AI SDK `generateText` interface |
| `@arizeai/phoenix-otel` | `2.1.0` | Metadata-only OpenTelemetry/OpenInference export |
| `promptfoo` | `0.121.19` | Versioned offline/live prompt regression matrix |

The only required model-inference secret is `OPENROUTER_API_KEY`. Keep it server-only. `.env.example` documents the name but never contains a value.

Do not use Vercel AI Gateway or OpenRouter's default automatic routing. OpenRouter is approved only under the fail-closed routing and metadata contract above.

## Provider Contract

Create one application-level `ResidentTurnProvider` contract. The scene conductor must not branch on providers beyond resolving a versioned adapter profile.

Each resident profile needs:

- `residentId`, exact OpenRouter `requestedModelId`, `canonicalModelSlug`, approved upstream provider slug, allowed selected model/provider evidence, and optional required quantization
- OpenRouter adapter package/version and a versioned routing configuration
- output mode: native schema or schema-validated JSON text
- supported/forbidden parameters, context budget, output budget, and timeout
- price metadata with access date
- latest canary result and provider lifecycle evidence
- prompt version, character-bible version, claim-set version, and visual variant

Each turn result needs:

- exact model-authored `text` without rewriting
- generated claim IDs, ending proposal, and relationship-effect proposals
- requested/canonical/selected model identities, selected upstream provider/endpoint evidence, OpenRouter generation ID, router strategy/attempts/pipeline, timestamp, finish reason, warnings, safety/filter metadata, and usage/cost
- adapter/config/prompt/bible/claim-set versions
- raw response/body only in the private attempt store under explicit retention; never in the public snapshot

AI SDK `result.response.modelId` or OpenRouter's top-level `model` alone is not proof. Only a validated router-metadata record with the exact requested/canonical model, direct strategy, first attempt, approved selected route, and no disallowed pipeline transformation qualifies as `openrouter_verified`; `requested_only` remains private and cannot pass admission or publication.

All calls use `maxRetries: 0`, no tools, no streaming, a 30-second total timeout, and a 240-character dialogue-text limit. Non-reasoning residents use at most 180 output tokens. DeepSeek R1 0528 uses a separately versioned bounded allowance of at most 1,024 total output/reasoning tokens, with returned reasoning excluded from publication and telemetry. Trigger.dev owns durable task retry; the application owns the maximum of two complete editorial attempts.

## Structured Turn Strategy

Use one strict Zod `ResidentTurnSchema` across the cast. Prefer `Output.object` when the selected adapter/model supports object generation. For a provider/model combination that cannot honor native schema mode, use `Output.text` plus AI SDK JSON extraction and local Zod parsing. This is not a repair pass: invalid output rejects the entire attempt, and no other model rewrites the line.

The provider-conformance suite must run the same canary turn against every exact ID and record:

- valid schema rate across at least five samples
- whether provider-returned model identity and response ID are present
- finish/filter behavior
- p50/p95 latency and usage
- exact text preservation from private turn to published revision

No resident is admitted because the SDK accepts its model string; admission is evidence-driven.

## Tracer-First Runtime Flow

1. Pure `advance()` emits a deterministic `scene_generation_requested` event containing a stable `sceneKey`, approved `briefId`, participants, room, and world-state version. It does not call a model or start a public scene.
2. `advanceWorldTo()` commits the request event and updated projection, then returns newly inserted generation requests.
3. `worldClock` triggers `model-afterlife-generate-scene` with a global Trigger.dev idempotency key derived from `sceneKey`. Database uniqueness remains the final authority because failed Trigger runs clear their Trigger idempotency key.
4. The job claims or reads the immutable brief and creates private attempt 1 under unique `(sceneKey, attemptOrdinal)`.
5. The conductor invokes speakers sequentially. Each resident sees only the approved brief, own bible excerpt, allowed claims, typed relationship context, up to three selected memories, and bounded prior turns rendered as inert quoted data with randomized delimiters.
6. Every raw turn and provenance record is immutable. Any schema, identity, budget, timeout, refusal, or filter failure rejects the attempt.
7. Cheap deterministic validators run first. Independent semantic validators run only after deterministic checks pass and can reject but never publish.
8. `publishSceneRevision()` acquires the canonical world row, checks the expected world version, and atomically inserts one immutable revision, one canonical `scene_started`/publication event, permitted cause-backed relationship effects, memories, and the new projection. Unique publication and effect keys make duplicate delivery return the existing revision.
9. Attempt 2 starts from the original brief, never from rejected dialogue. After two failures, record a quiet/cached disposition and leave canon and relationships unchanged.

## Persistence Design

Keep private generation state separate from the public event feed. Drizzle tables should support these concepts; names may be adjusted to existing conventions, but the boundaries are required:

| Table | Authority and key constraints |
|---|---|
| `resident_model_versions` | Versioned six-resident registry; unique resident/version and exact provider/model configuration |
| `character_bible_versions` | Immutable versioned role, traits, dignity/avoidance notes, routine and visual variant |
| `historical_claim_versions` | Category (`documented`, `reported`, `exaggeration`), model/version scope, confidence, source URLs, access date, approval state |
| `scene_briefs` | Immutable approved participant/location/premise/fact/tone/turn/outcome contract; stable `sceneKey` |
| `generation_attempts` | Private `(sceneKey, ordinal)` record with world hash/version, all content versions, status, disposition, Trigger correlation, aggregate usage/cost |
| `generation_turns` | Immutable `(attemptId, turnIndex)` model-authored text and complete provenance/usage/filter evidence |
| `scene_validation_results` | Unique validator ID/version per attempt with pass/fail/review result and private evidence |
| `published_scene_revisions` | One immutable revision per publication key and one publication per accepted attempt; canonical transcript, outcome, significance, public provenance, effects |

Typed relationships and bounded memories belong in replayable `WorldState` and change only through canonical events. Replace the single `affinity` number with explicit friendship, rivalry, familiarity, and recent shared-experience entries. Every accepted delta is `-1`, `0`, or `1`, names its dimension, and carries the published scene/event cause.

The full Phase 2 schema should land with the tracer so later plans extend behavior rather than repeatedly migrating the same core tables. Generate a reviewed migration and run the required Drizzle schema push before integration verification.

## Deterministic Selection and Ensemble Balance

Selection must be pure and replayable from the current world state, approved brief registry, tick, and seed. Start with explicit, testable bounds:

- at least one quiet interval between generated scenes
- maximum one primary public scene
- resident cooldown: 12 logical ticks after participation
- pair cooldown: 30 logical ticks
- rolling balance window: last 30 published scenes
- no resident above 25% or below 10% of participation slots over a mature 60-scene window, matching the AI-SPEC alert threshold
- no pairing above 15% of recent scenes unless an approved temporary arc overrides it
- at most three relevant typed memories per resident prompt

Eligibility may score lineage, rivalry, room, stale participation, brief freshness, and cooldown completion, but public popularity must never affect it. Deterministic tie-breaking uses stable IDs and the existing seed pattern.

## Validation Architecture

### Deterministic blockers

- requested/resolved model allowlist and provider identity evidence
- strict schema, speaker order, participants, 4-10 turn count, 240-character turn limit, explicit ending, premise marker by turn 2
- approved claim IDs and model/version scope
- no tool calls, unknown effects, forbidden dimensions, delta outside `-1..1`, or effect without cause
- no secret/prompt leakage patterns and no raw source instructions treated as roles
- token, latency, total-call, total-attempt, and cost envelope
- novelty against stable hashes and bounded lexical/semantic similarity fixtures
- idempotent publication and zero canon change on every rejection/fault

### Semantic blockers

Use a backstage judge role, not a resident, for responsiveness, voice, tone, affection, novelty, and resolution. A practical initial judge is OpenRouter `openai/gpt-5.6-luna`, canonical `openai/gpt-5.6-luna-20260709`, through the same strict OpenRouter transport. The judge receives no tools and no publication authority. Its result is accepted only after at least `0.70` correlation with human labels; before calibration, subjective uncertainty rejects or routes to human review.

Create the 24-case reference dataset specified in AI-SPEC alongside the first prompt/schema implementation. Default CI uses frozen outputs and fake providers, so contributors need no provider secrets. Live canaries and Promptfoo run only in a gated environment or explicit local command.

Selective TDD is worth the cost here. Write failing tests first for canonical isolation, duplicate publication, model identity mismatches, claim scoping, turn limits, relationship effect permissions, prompt-injection fixtures, cooldown balance, and provider-failure quiet states. Use ordinary implementation-first work plus targeted tests for static seed content and minor disclosure markup.

## Minimal Phase 2 Presentation

Phase 2 does not redesign the observer. It extends existing semantic DOM and renderer data so visitors can:

- see exactly six resident names and distinct original silhouette/palette variants without provider logos
- see a complete validated 4-10 turn primary scene or an honest quiet/provider-unavailable state
- see each public turn's resident and exact model/version label
- always see staged-fiction and non-affiliation disclosures outside the canvas
- distinguish documented, reported/reputation-based, and comic-exaggeration labels wherever the phase exposes a historical category

Detailed profiles, provenance exploration, archive/recap/share, production art, and broader accessibility polish remain Phase 3 or 4.

## Suggested Plan Decomposition

1. **Production tracer:** full schema, exact registry contract, two-resident fake/live-capable conductor, private attempt, minimum critical validation, atomic publication, quiet fallback, and existing observer display.
2. **Complete grounded cast:** seed all six exact residents, bibles/claims/visual variants, provider admission canaries, structured-output conformance, prompt isolation, and 24-case fixtures.
3. **Persistent ensemble:** typed relationships, bounded memories, deterministic brief selection, cooldowns, cast balance, permitted effects, attempt-2 and cached/quiet behavior.
4. **Publication quality gate:** full deterministic/semantic validators, calibrated judge, Promptfoo/Phoenix wiring, transparency copy, fault-injection/E2E evidence, and final live six-model canary.

All four plans are sequential vertical increments. No plan should be a database-only, provider-only, or UI-only layer.

## Plan-Critical Risks

1. **Model lifecycle is shorter than the product lifecycle.** Treat cast admission as versioned data plus a repeatable canary, not a one-time hard-coded fact.
2. **A successful old slug can still be dishonest.** Redirects such as Grok 3 -> Grok 4.3 are failures, not graceful fallback.
3. **Response metadata is provider-specific.** AI SDK normalization helps orchestration but raw identity evidence must be preserved and classified.
4. **Trigger idempotency is not canonical idempotency.** Failed Trigger runs clear keys; PostgreSQL uniqueness and atomic publication remain decisive.
5. **Prompt JSON is not trustworthy merely because it parses.** Facts, effects, identity, safety, and ending still need independent validation.
6. **A judge can homogenize the cast.** Judge prompts score contract dimensions; they never rewrite dialogue or impose a house voice.
7. **The initial cast may become unavailable before launch.** Phase 2 can pause residents and show quiet/cached beats; changing the six-resident launch cast requires a new registry/bible/eval version and explicit product decision.

## Primary Sources

### Model lifecycle and model cards

- [OpenAI GPT-4o model page](https://developers.openai.com/api/docs/models/gpt-4o)
- [Anthropic model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Anthropic Claude Sonnet 4.5 announcement](https://www.anthropic.com/news/claude-sonnet-4-5)
- [Anthropic model system cards](https://www.anthropic.com/system-cards)
- [Google Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Google Gemini 2.5 Pro model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro)
- [Google GenerateContent response metadata](https://ai.google.dev/api/generate-content)
- [DeepSeek R1 0528 official release](https://api-docs.deepseek.com/news/news250528/)
- [DeepSeek R1 0528 official model card](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528)
- [Together.ai current serverless model catalog](https://docs.together.ai/docs/serverless/models)
- [Together.ai Chat Completions response contract](https://docs.together.ai/reference/chat-completions)
- [Meta Llama 3.3 70B Instruct model card](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- [Meta LlamaCon / Llama 4 announcement](https://ai.meta.com/blog/llamacon-llama-news/)
- [Qwen 2.5 release](https://qwenlm.github.io/blog/qwen2.5/)
- [Qwen 3 release and Qwen 2.5 comparisons](https://qwenlm.github.io/blog/qwen3/)
- [xAI Grok model retirement and redirect notice](https://docs.x.ai/developers/migration/may-15-retirement)
- [Mistral model overview and legacy list](https://docs.mistral.ai/models/overview)

### Runtime and evaluation

- [AI SDK provider registry](https://ai-sdk.dev/docs/reference/ai-sdk-core/provider-registry)
- [AI SDK direct providers and capability table](https://ai-sdk.dev/providers/ai-sdk-providers)
- [AI SDK `generateText` response metadata](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text)
- [AI SDK structured `Output`](https://ai-sdk.dev/docs/reference/ai-sdk-core/output)
- [AI SDK Together.ai provider](https://ai-sdk.dev/providers/ai-sdk-providers/togetherai)
- [OpenRouter Vercel AI SDK integration](https://openrouter.ai/docs/guides/community/vercel-ai-sdk)
- [OpenRouter provider routing controls](https://openrouter.ai/docs/guides/routing/provider-selection)
- [OpenRouter router metadata](https://openrouter.ai/docs/guides/features/router-metadata)
- [OpenRouter privacy and provider logging](https://openrouter.ai/docs/guides/privacy/provider-logging)
- [Trigger.dev idempotency](https://trigger.dev/docs/idempotency)
- [Trigger.dev queues and concurrency](https://trigger.dev/docs/queue-concurrency)
- [Promptfoo configuration](https://www.promptfoo.dev/docs/configuration/guide/)
- [Phoenix TypeScript tracing](https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing/setup-using-phoenix-otel)

## Research Completion

The phase can now execute under the approved OpenRouter and cast amendments. The exact cast contains GPT-4o and DeepSeek R1 0528 in place of GPT-3.5 Turbo 0613 and Command R+ 08-2024. Execution requires one bundled user-setup checkpoint for `OPENROUTER_API_KEY` and acceptance of bounded charges before live canaries; all deterministic development and CI verification must work with fake providers and frozen outputs.
