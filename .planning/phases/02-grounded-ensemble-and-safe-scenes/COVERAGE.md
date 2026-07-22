# API Coverage - Phase 2 Multi-Provider Dialogue

> Full coverage by default. Opt-outs are explicit, reasoned decisions. Reviewed 2026-07-22.

The integrated external surface is the language-model and model-metadata surface of the direct OpenAI, Anthropic, Google Generative AI, Cohere, and Together.ai adapters. The project does not integrate each provider's unrelated media, agent, storage, training, or search products.

| capability | decision | reason |
|---|---|---|
| OpenAI exact-ID text generation for `gpt-3.5-turbo-0125` | INTEGRATE | |
| Anthropic exact-ID text generation for `claude-sonnet-4-5-20250929` | INTEGRATE | |
| Google exact-ID text generation for `gemini-2.5-pro` | INTEGRATE | |
| Cohere exact-ID text generation for `command-r-plus-08-2024` | INTEGRATE | |
| Together.ai exact-ID text generation for `meta-llama/Llama-3.3-70B-Instruct-Turbo` | INTEGRATE | |
| Together.ai exact-ID text generation for `Qwen/Qwen2.5-7B-Instruct-Turbo` | INTEGRATE | |
| Strict structured turn output with local Zod validation | INTEGRATE | |
| Requested and provider-returned/resolved model identity capture | INTEGRATE | |
| Provider response ID, finish reason, warnings/filter and safety metadata capture | INTEGRATE | |
| Per-turn token/cache/usage and calculated cost capture | INTEGRATE | |
| Exact-model availability and lifecycle admission canaries | INTEGRATE | |
| OpenAI backstage semantic-judge text generation | INTEGRATE | |
| Direct provider adapters | INTEGRATE | |
| Vercel AI Gateway routing | OPT-OUT | A gateway weakens direct provider identity evidence and can obscure model resolution. |
| Provider or cross-provider fallback models | OPT-OUT | Silent substitution would falsely attribute dialogue to a resident that did not author it. |
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
