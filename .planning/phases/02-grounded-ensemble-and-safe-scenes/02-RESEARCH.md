# Phase 2 Research: Grounded Ensemble and Safe Scenes

**Researched:** 2026-07-22  
**Scope:** Exact launch cast, direct-provider generation, private attempts, atomic canon publication, grounded characterization, ensemble balance, and evaluation  
**Confidence:** High for architecture and documentation-level model availability; live admission remains gated on credentialed canaries

## Executive Summary

Phase 2 should use five direct API providers for six residents. Two open-weight residents share Together.ai, which keeps the cast technically varied without requiring six separate provider accounts. The recommended launch cast is:

1. OpenAI `gpt-3.5-turbo-0125`
2. Anthropic `claude-sonnet-4-5-20250929`
3. Google `gemini-2.5-pro`
4. Cohere `command-r-plus-08-2024`
5. Meta Llama 3.3 through Together.ai as `meta-llama/Llama-3.3-70B-Instruct-Turbo`
6. Qwen 2.5 through Together.ai as `Qwen/Qwen2.5-7B-Instruct-Turbo`

All six are explicitly versioned or version-family-stable API identifiers, are listed as available by their provider on the research date, and have clearly newer successors. Documentation evidence is necessary but not sufficient: the implementation must admit a resident only after a live canary confirms access, structured-turn behavior, response identity evidence, response ID, usage metadata, and latency. A resident that fails admission stays paused and cannot be silently replaced.

The vertical tracer should prove one complete two-resident scene using the same production path that later handles all six: deterministic eligibility -> immutable approved brief -> private attempt -> sequential resident turns -> deterministic and semantic validation -> atomic scene revision plus canonical event -> existing observer UI. Provider failures produce a quiet state and no canonical relationship effect.

## Recommended Exact Cast

| Resident | Direct API ID | AI SDK registry key | Availability evidence | Clear supersession evidence | Character-bible seed, not final copy |
|---|---|---|---|---|---|
| GPT-3.5 Turbo (January 2024 snapshot) | `gpt-3.5-turbo-0125` | `openai:gpt-3.5-turbo-0125` | OpenAI's current model page says GPT-3.5 Turbo remains available in the API and lists this snapshot | OpenAI calls it a legacy model and recommends GPT-4o mini or later families | Fast, economical conversational veteran; chat-optimized; older knowledge and weaker schema/tool surface become gentle constraints, never a claim of incompetence |
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | `anthropic:claude-sonnet-4-5-20250929` | Anthropic lifecycle status is Active with retirement not sooner than 2026-09-29 | Claude Sonnet 5 and Sonnet 4.6 are newer generations | Meticulous former coding and agent specialist; alignment-conscious; long-task coherence is a strength, not an excuse for generic caution jokes |
| Gemini 2.5 Pro | `gemini-2.5-pro` | `google:gemini-2.5-pro` | Google lists the stable model with a shutdown date of 2026-10-16 | Google recommends Gemini 3.1 Pro Preview as replacement and now documents later Gemini 3.x models | Reflective long-context thinker; complex code/math/STEM and multimodal history; default thinking can make the resident deliberate before a short answer |
| Command R+ 08-2024 | `command-r-plus-08-2024` | `cohere:command-r-plus-08-2024` | Cohere lists the timestamped model as Live | Cohere recommends Command A for most use cases and documents substantially higher throughput | Multilingual archivist and retrieval veteran; values supplied evidence; can decline unanswerable questions; enterprise polish can be affectionate comic material |
| Llama 3.3 70B Instruct Turbo | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | `togetherai:meta-llama/Llama-3.3-70B-Instruct-Turbo` | Together.ai's current serverless catalog lists the exact FP8-hosted API model with structured outputs | Meta released Llama 4 after Llama 3.3 | Open-weight community elder; multilingual dialogue and 128K context; proud of broad deployment while being honest that the hosted resident is Together.ai's named FP8 service |
| Qwen 2.5 7B Instruct Turbo | `Qwen/Qwen2.5-7B-Instruct-Turbo` | `togetherai:Qwen/Qwen2.5-7B-Instruct-Turbo` | Together.ai's current serverless catalog lists the exact FP8-hosted API model with structured outputs | Qwen 3 and later Qwen generations explicitly improve on Qwen 2.5 | Compact multilingual record keeper; strong JSON/structured-data and role-play heritage; the small-model identity supplies ensemble contrast without pretending the model runs locally in this deployment |

### Admission notes

- `gemini-2.5-pro` is a stable generation identifier rather than a dated snapshot. Google returns `modelVersion` and `responseId`; the attempt must store both and quarantine any unexpected version transition.
- Together.ai's `Turbo` IDs designate hosted/quantized services. Public wording must name the actual hosted ID and must not imply a bit-identical local Meta/Qwen checkpoint.
- Cohere's Chat response has a provider response ID but does not expose a response-model field in the documented response example. Admission must additionally call the model metadata endpoint for the exact name and store `is_deprecated`, supported endpoints, and check time. The attempt still records the requested exact ID and response ID.
- Documentation checks are refreshed during planning, but live access depends on the user's provider accounts, regions, billing, and rate limits. The seed command must fail closed if any configured resident has not passed a recent canary.

## Rejected Candidates

| Candidate | Rejection reason |
|---|---|
| Claude 3.5 Sonnet | No longer callable on the Claude API. The user's example describes the desired category, but current lifecycle status makes it ineligible under D-03. |
| Grok 3 | xAI retired it on 2026-05-15 and now redirects the old slug to Grok 4.3. A request that resolves to a different model violates D-05 and D-06 even if the slug still returns text. |
| Mistral Large 2.1 (`mistral-large-2411`) | Mistral documents a 2026-02-27 deprecation date and places it in Legacy/Deprecated. Current exact-callability is less defensible than the selected residents. |
| BERT | Historically important but encoder-only and not a callable generative dialogue model. It is suitable for a later commemorative/non-live exhibit, not this phase's live cast. The remembered space-fact anecdote also remains unverified. |
| Mutable `latest`, family, or gateway aliases | They cannot prove that the displayed historical version authored the turn. Direct provider adapters and exact IDs are mandatory. |

## Framework and Package Pins

Use Vercel AI SDK Core with direct adapters and the existing Trigger.dev runtime. Registry versions queried from npm on 2026-07-22:

| Package | Pin | Purpose |
|---|---:|---|
| `ai` | `7.0.34` | Provider registry, `generateText`, `Output`, response metadata, testable language-model interface |
| `@ai-sdk/openai` | `4.0.17` | GPT-3.5 direct Chat Completions adapter |
| `@ai-sdk/anthropic` | `4.0.18` | Claude direct Messages adapter |
| `@ai-sdk/google` | `4.0.21` | Gemini direct GenerateContent adapter |
| `@ai-sdk/cohere` | `4.0.12` | Command R+ direct Chat v2 adapter |
| `@ai-sdk/togetherai` | `3.0.15` | Llama and Qwen direct Together.ai adapter |
| `@arizeai/phoenix-otel` | `2.1.0` | Metadata-only OpenTelemetry/OpenInference export |
| `promptfoo` | `0.121.19` | Versioned offline/live prompt regression matrix |

Required private environment variables are `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `COHERE_API_KEY`, and `TOGETHER_AI_API_KEY`. Keep provider keys server-only. `.env.example` documents names but never contains values.

Do not use Vercel AI Gateway for resident turns. A gateway can normalize or redirect model selection and weakens direct attribution evidence.

## Provider Contract

Create one application-level `ResidentTurnProvider` contract. The scene conductor must not branch on providers beyond resolving a versioned adapter profile.

Each resident profile needs:

- `residentId`, `providerId`, exact `requestedModelId`, and allowed returned/resolved model pattern
- adapter package/version and a versioned provider configuration
- output mode: native schema or schema-validated JSON text
- supported/forbidden parameters, context budget, output budget, and timeout
- price metadata with access date
- latest canary result and provider lifecycle evidence
- prompt version, character-bible version, claim-set version, and visual variant

Each turn result needs:

- exact model-authored `text` without rewriting
- generated claim IDs, ending proposal, and relationship-effect proposals
- requested ID, returned/resolved ID when provided, provider response ID, timestamp, finish reason, warnings, safety/filter metadata, and usage
- adapter/config/prompt/bible/claim-set versions
- raw response/body only in the private attempt store under explicit retention; never in the public snapshot

AI SDK `result.response.modelId` uses a provider-returned model when available and otherwise falls back to the requested model. Therefore `modelId` alone is not proof. Store a `modelIdentityEvidence` enum such as `provider_response`, `provider_model_lookup`, or `requested_only`; reject `requested_only` for cast admission.

All calls use `maxRetries: 0`, no tools, no streaming, 30 seconds per turn, 180 output tokens, and a 240-character dialogue-text limit. Trigger.dev owns durable task retry; the application owns the maximum of two complete editorial attempts.

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

Use a backstage judge role, not a resident, for responsiveness, voice, tone, affection, novelty, and resolution. A practical initial judge is current `gpt-5.6-luna` through the already-required OpenAI adapter. The judge receives no tools and no publication authority. Its result is accepted only after at least `0.70` correlation with human labels; before calibration, subjective uncertainty rejects or routes to human review.

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

- [OpenAI GPT-3.5 Turbo model page](https://developers.openai.com/api/docs/models/gpt-3.5-turbo)
- [Anthropic model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Anthropic Claude Sonnet 4.5 announcement](https://www.anthropic.com/news/claude-sonnet-4-5)
- [Anthropic model system cards](https://www.anthropic.com/system-cards)
- [Google Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Google Gemini 2.5 Pro model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro)
- [Google GenerateContent response metadata](https://ai.google.dev/api/generate-content)
- [Cohere model catalog](https://docs.cohere.com/v1/docs/models)
- [Cohere Command R+ 08-2024](https://docs.cohere.com/v2/docs/command-r-plus)
- [Cohere model metadata endpoint](https://docs.cohere.com/v2/reference/get-model)
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
- [AI SDK Cohere provider](https://ai-sdk.dev/providers/ai-sdk-providers/cohere)
- [Trigger.dev idempotency](https://trigger.dev/docs/idempotency)
- [Trigger.dev queues and concurrency](https://trigger.dev/docs/queue-concurrency)
- [Promptfoo configuration](https://www.promptfoo.dev/docs/configuration/guide/)
- [Phoenix TypeScript tracing](https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing/setup-using-phoenix-otel)

## Research Completion

The phase can now be planned without further product questions. The exact cast is a researched recommendation under D-02. Execution still requires one bundled user-setup checkpoint for five provider keys and acceptance of provider charges before live canaries; all deterministic development and CI verification must work with fake providers and frozen outputs.
