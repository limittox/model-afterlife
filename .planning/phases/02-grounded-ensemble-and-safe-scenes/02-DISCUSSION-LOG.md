# Phase 2: Grounded Ensemble and Safe Scenes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves the alternatives considered.

**Date:** 2026-07-22
**Phase:** 2-Grounded Ensemble and Safe Scenes
**Areas discussed:** Launch cast, admission standard and runtime, historical grounding, characterization, relationships, scene conduct, pacing, publication and failure
**Format:** At the user's request, all initial questions were presented in one batch with a recommendation for each. One architecture-changing consequence was then clarified.

---

## Launch Cast

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed proposed cast | Lock BERT, GPT-2, GPT-3, T5, original Codex, and LLaMA 1 before research | |
| Research-selected cast | Choose the exact six after historical, technical, and availability research | ✓ |
| Fictional archetypes | Avoid real model identities | |

**User's choice:** Research-selected cast.
**Notes:** The launch cast must consist of actual model systems that can participate through their APIs, not merely names chosen for historical recognition.

---

## Admission Standard and Resident Runtime

| Option | Description | Selected |
|--------|-------------|----------|
| Superseded and API-accessible | Admit clearly superseded exact versions whose APIs remain callable, and let each model author its resident's turns | ✓ |
| Officially shut down | Restrict admission to discontinued models, even though they cannot participate through their own APIs | |
| Central reconstruction | Let one current model impersonate every historical resident | |

**User's choice:** Actual superseded models should interact with one another through their still-available APIs.
**Notes:** Claude 3.5 Sonnet was supplied as the kind of candidate intended. It is an example pending exact-version availability research. This choice supersedes the earlier project assumption that one modern model reconstructs all residents.

---

## Historical Grounding

| Option | Description | Selected |
|--------|-------------|----------|
| Claim-level three-tier ledger | Separate documented fact, reported reputation, and fictional exaggeration with versioned sources and confidence | ✓ |
| Profile-level citations | Cite only general resident biographies | |
| Informal notes | Keep loose editorial references without claim-level provenance | |

**User's choice:** Approved the recommendation.
**Notes:** The proposed BERT space-fact running joke requires verification of the original incident before use, and the source fact must remain distinct from its comic exaggeration.

---

## Character and Comedy Style

| Option | Description | Selected |
|--------|-------------|----------|
| Affectionate ensemble comedy | Use a few grounded recurring traits while preserving competence, dignity, and joke variety | ✓ |
| Sharp roast | Focus primarily on failures and obsolescence | |
| Museum-dry | Favor education with minimal comedy | |

**User's choice:** Approved the recommendation.
**Notes:** The actual model's response tendencies should remain perceptible beneath its resident characterization.

---

## Relationships and Memory

| Option | Description | Selected |
|--------|-------------|----------|
| Authored graph with bounded change | Seed historically meaningful relationships and permit only explicit, cause-backed changes with bounded memories | ✓ |
| Fixed relationships | Never allow relationships to evolve | |
| Model-controlled relationships | Let generated dialogue freely define relationship state | |

**User's choice:** Approved the recommendation.
**Notes:** The dialogue models may propose outcomes but cannot directly mutate canon.

---

## Inter-Model Scene Conduct

| Option | Description | Selected |
|--------|-------------|----------|
| Approved brief, resident-authored turns | The system fixes the scene boundaries and each designated model writes only its own turns | ✓ |
| Freeform model planning | Let models invent premises, endings, and effects | |
| Authored templates | Use mostly prewritten dialogue with little generation | |

**User's choice:** Approved bounded creative freedom, clarified to require actual model-to-model interaction.
**Notes:** The application conducts the scene turn by turn; resident models receive bounded context and have no tool, publication, scheduling, or canonical write authority.

---

## Scene Rhythm and Ensemble Balance

| Option | Description | Selected |
|--------|-------------|----------|
| Quality-first rhythm | One scene at a time, prominent quiet periods, cooldowns, and rolling cast participation | ✓ |
| Continuously busy | Generate frequent scenes to minimize quiet time | |
| Fixed sparse schedule | Run scenes only at a few authored times | |

**User's choice:** Approved the recommendation.
**Notes:** Cast allocation must not become a popularity contest or repeatedly favor one successful pairing.

---

## Publication and Failure

| Option | Description | Selected |
|--------|-------------|----------|
| Private validation then immutable publication | Permit two attempts, publish only after all checks pass, and otherwise use cached, curated, or quiet fallback | ✓ |
| First structurally valid attempt | Publish without the complete semantic gate | |
| Human approval for every scene | Require manual curation before all publication | |

**User's choice:** Approved the recommendation.
**Notes:** An unavailable resident must not be silently impersonated by a different model. Failed attempts never affect canon.

---

## Runtime Architecture Amendment — 2026-07-23

| Option | Description | Selected |
|--------|-------------|----------|
| Strict OpenRouter | One server-only key, exact model/canonical slugs, approved upstream routes, fallback disabled, and router metadata verified before publication | ✓ |
| Five direct provider APIs | Separate credentials and adapters for OpenAI, Anthropic, Google, Cohere, and Together | |

**User's choice:** “Use Open Router.”
**Notes:** OpenRouter is a broker only; actual designated resident models still author their own turns. Default routing, mutable aliases, provider/model fallback, missing route metadata, and material pipeline transformations fail closed. The intermediate GPT-3.5 `0613` choice recorded here was later superseded by the approved GPT-4o/DeepSeek cast amendment below.

---

## Launch Cast Amendment — 2026-07-23

| Removed | Added | Approved OpenRouter route |
|---------|-------|---------------------------|
| `openai/gpt-3.5-turbo-0613` | `openai/gpt-4o` | OpenAI |
| `cohere/command-r-plus-08-2024` | `deepseek/deepseek-r1-0528` | DeepInfra FP4 |

**User's choice:** Replace both residents explicitly.
**Notes:** OpenRouter currently lists structured-output-capable endpoints for both models. A live diagnostic already proved `deepseek/deepseek-r1-0528` succeeds through DeepInfra with direct first-attempt routing and no pipeline transformation. DeepSeek's mandatory private reasoning receives a distinct bounded token allowance while the public dialogue-text contract remains unchanged.

---

## The Agent's Discretion

- Research may recommend the exact six models and provider mix within the user's superseded-but-callable admission rule.
- Implementation may choose provider adapters, orchestration mechanics, validator internals, and exact cooldown values while preserving model-specific authorship, bounded autonomy, provenance, and deterministic publication authority.
- Exact disclosure placement and wording may be refined while clearly describing prompted fictional interaction, model/version provenance, non-affiliation, and the absence of consciousness claims.

## Deferred Ideas

- A policy for permanently replacing or graduating a resident after its API becomes unavailable is deferred beyond Phase 2.
