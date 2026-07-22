# API Coverage - Phase 2 Strict OpenRouter Dialogue

> Full coverage by default. Opt-outs are explicit, reasoned decisions. Reviewed 2026-07-22; amended for OpenRouter 2026-07-23.

The integrated external surface is OpenRouter chat generation, catalog/endpoint metadata, routing controls, router metadata, and generation/usage identity evidence. OpenRouter brokers calls to approved upstream providers; the project does not integrate unrelated media, agents, storage, training, or search products.

| capability | decision | reason |
|---|---|---|
| OpenRouter exact-ID text generation for `openai/gpt-3.5-turbo-0613` via approved Azure route | INTEGRATE | Replaces the zero-endpoint `0125` record. |
| OpenRouter exact-ID text generation for `anthropic/claude-sonnet-4.5` with dated canonical slug via Anthropic | INTEGRATE | |
| OpenRouter exact-ID text generation for `google/gemini-2.5-pro` via Google AI Studio | INTEGRATE | |
| OpenRouter exact-ID text generation for `cohere/command-r-plus-08-2024` via Cohere | INTEGRATE | |
| OpenRouter exact-ID text generation for `meta-llama/llama-3.3-70b-instruct` via Together FP8 | INTEGRATE | |
| OpenRouter exact-ID text generation for `qwen/qwen-2.5-7b-instruct` via Together FP8 | INTEGRATE | |
| Strict structured turn output with local Zod validation | INTEGRATE | |
| Exact requested/canonical/selected model and selected upstream capture | INTEGRATE | |
| Router strategy, attempt, candidate/selected endpoint, pipeline, generation ID, finish reason, warnings/filter and safety metadata capture | INTEGRATE | |
| Per-turn token/cache/usage and calculated cost capture | INTEGRATE | |
| OpenRouter catalog/endpoint availability and lifecycle admission canaries | INTEGRATE | |
| OpenRouter-routed backstage semantic-judge text generation | INTEGRATE | Uses the same key but remains non-resident and reject-only. |
| `provider.only`, `allow_fallbacks: false`, `require_parameters: true`, and `data_collection: deny` | INTEGRATE | Required on every resident and judge call. |
| `X-OpenRouter-Metadata: enabled` and strict response validation | INTEGRATE | Router metadata is mandatory provenance evidence. |
| OpenRouter default load balancing, model fallbacks, provider fallbacks, and `auto`/`:free`/`:extended` routes | OPT-OUT | Silent substitution or unstable serving provenance would falsely attribute a resident's dialogue. |
| Context compression, response healing, server tools, or other materially altering OpenRouter pipeline stages | OPT-OUT | Published text must be attributable to the designated model without hidden transformation. |
| OpenRouter response caching for resident authorship evidence | OPT-OUT | Cache hits omit router metadata and cannot satisfy publication provenance. |
| Vercel AI Gateway or a second inference gateway | OPT-OUT | One auditable routing layer is the approved boundary. |
| Five direct provider adapters and credentials | OPT-OUT | Superseded by the approved one-key OpenRouter MVP architecture. |
| Streaming text or partial public output | OPT-OUT | Only a complete validated immutable scene may become public. |
| Function calling, application tools, MCP and handoffs | OPT-OUT | Resident models have no execution, scheduling, publication or state-mutation authority. |
| Provider web search, URL context and retrieval tools | OPT-OUT | Historical facts come only from approved local claim records selected before generation. |
| Cohere RAG documents/citations API mode | OPT-OUT | The phase uses the same inert local claim contract for all residents rather than provider-specific retrieval. |
| Provider code execution and computer-use capabilities | OPT-OUT | Dialogue residents are text-only and cannot execute actions. |
| Image input or generation | OPT-OUT | Launch residents and scene briefs are text-only; production art is a separate local presentation concern. |
| Audio input, speech generation and realtime voice | OPT-OUT | Phase 2 publishes text dialogue only. |
| Video input or generation | OPT-OUT | Outside the observer and language-model scope. |
| Embeddings and reranking endpoints | OPT-OUT | Initial novelty/balance checks use bounded deterministic metrics and calibrated judge scores; no vector service is needed. |
| Standalone provider moderation endpoints | OPT-OUT | The phase uses its versioned deterministic safety rules plus calibrated semantic validation so all providers share one publication policy. |
| Fine-tuning and custom-model endpoints | OPT-OUT | Resident authenticity depends on the designated public exact model versions, not custom fine-tunes. |
| Batch generation endpoints | OPT-OUT | Scene order depends on prior resident turns and is conducted sequentially in a durable job. |
| Provider files, assistants, threads, agents or conversation persistence | OPT-OUT | PostgreSQL stores the bounded application-owned brief, transcript and attempt record; providers receive stateless calls. |
| Live provider calls in the default PR test suite | OPT-OUT | Default CI uses frozen outputs and fake providers; live calls are explicit secret-gated canaries/evals to control cost and flakiness. |

## Seal Condition

Every `INTEGRATE` row must have a contract test or live admission/eval check. Every `OPT-OUT` remains forbidden unless this matrix is deliberately revised and the Phase 2 threat/evaluation contracts are rechecked.
