# Pitfalls Research

**Domain:** Persistent observer-only pixel-art simulation with constrained LLM-authored character scenes
**Researched:** 2026-07-22
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Unbounded Agent Chatter Becomes Repetitive AI Slop

**What goes wrong:**
Residents talk too often, repeat the same premises, mirror one another's voices, and produce dialogue that is technically coherent but not worth watching. Increasing autonomy creates more content but weakens comic timing, distinct characterization, and narrative consequence.

**Why it happens:**
LLMs optimize the next response, not the long-term entertainment value of an ensemble. Long multi-agent conversations accumulate persona drift, role confusion, echoing, unsupported memories, and weak stopping decisions. Research prototypes show that memory, reflection, and planning improve believability, but these mechanisms do not replace editorial structure or stability tests.

**How to avoid:**
- Let deterministic simulation code choose schedules, participants, event triggers, and state changes.
- Generate only bounded scenes with a premise, dramatic beat, maximum turn count, and explicit ending condition.
- Re-inject immutable character anchors on every generation rather than relying on accumulated conversation history.
- Store compact, typed relationship facts and scene outcomes; do not feed an ever-growing transcript back into the model.
- Enforce novelty checks against recent premises, punchlines, locations, and participant combinations.
- Maintain a regression set that scores voice distinction, factual grounding, brevity, repetition, and scene resolution.

**Warning signs:**
- Residents become interchangeable when names are removed.
- More than one scene in a short window uses the same joke category.
- Conversations need manual truncation or contain exchanges with no state change.
- Recaps cannot identify why a scene mattered.
- Relationship state changes without a recorded causal event.

**Phase to address:**
Simulation and narrative-engine foundation, before the polished world client.

---

### Pitfall 2: Fictional Exaggeration Is Mistaken for Historical Fact

**What goes wrong:**
A joke attributes a failure, quote, capability, retirement date, benchmark result, or opinion to a real model without adequate support. Visitors repeat the claim as fact, companies see the portrayal as misleading, and the educational layer loses credibility.

**Why it happens:**
The product intentionally blends real history with fiction. LLMs generate plausible specifics, secondary sources repeat folklore, model names sometimes refer to families rather than precise releases, and “retired” can mean API shutdown, research supersession, unavailable checkpoint, or mere loss of attention.

**How to avoid:**
- Define an explicit retirement taxonomy and label each resident's status.
- Build character bibles from atomic facts with stable IDs, exact model/version scope, source URLs, confidence, and approved comic extrapolations.
- Require generated scenes to cite the fact IDs they used; reject unapproved factual claims.
- Render a visible “fictional reconstruction” label and a separate “behind this behavior” panel.
- Provide a corrections channel, version factual records, and retain provenance for published scenes.
- Treat remembered anecdotes as research leads, never as canon.

**Warning signs:**
- A character-bible sentence lacks a source or mixes fact and joke in one field.
- Dialogue contains dates, benchmark numbers, quotations, or autobiographical claims not present in approved facts.
- The same model family is discussed as if all checkpoints behaved identically.
- Sources point only to summaries, social posts, or generated text when primary material exists.

**Phase to address:**
Resident-content system and first-cast research, before dialogue generation.

---

### Pitfall 3: Retryable Jobs Create Duplicate or Contradictory Canon

**What goes wrong:**
A scheduled event or failed model call runs twice. Duplicate scenes are published, a relationship changes twice, two incompatible outcomes become canonical, or visitors receive inconsistent recaps.

**Why it happens:**
Production queues commonly provide at-least-once delivery. Timeouts can occur after a provider completes work but before the application records success. A naive “generate then update everything” job has multiple side effects with no durable idempotency boundary.

**How to avoid:**
- Assign every world tick, event, generation attempt, candidate scene, and publication a stable unique ID.
- Make database transitions conditional and idempotent; use unique constraints for event occurrence and published scene identity.
- Separate generation from validation and publication. Only publication mutates canonical world state.
- Record a world-state version used by generation and reject or regenerate candidates based on stale state.
- Use an outbox pattern for downstream notifications and recap updates.
- Instrument scheduled, retry, duplicate-warning, terminal-error, and publication events.

**Warning signs:**
- A job performs a model call and several database writes without a persisted workflow record.
- Retrying a failed job changes the result instead of resuming or safely producing a new candidate.
- Scene publication and relationship updates occur in separate uncoordinated transactions.
- Operators cannot answer which prompt, state version, and model produced a published scene.

**Phase to address:**
Persistence and event-pipeline foundation.

---

### Pitfall 4: The Browser Becomes the Authority for World Time

**What goes wrong:**
Different visitors see different resident positions or schedules, returning from a background tab causes fast-forward glitches, a sleeping mobile tab misses events, and local clocks produce inconsistent timelines.

**Why it happens:**
Browser timers are delayed and aggressively throttled in inactive tabs; mobile browsers may unload pages entirely. Rendering loops are suitable for presentation but not for advancing a shared persistent simulation.

**How to avoid:**
- Keep canonical time, world state, and completed events server-side.
- Send snapshots plus ordered deltas; let clients interpolate presentation without authoring canon.
- Reconcile on load, reconnect, and `visibilitychange` rather than replaying every missed animation.
- Define deterministic catch-up rules from the last processed world tick.
- Make the scene archive and recap usable even when realtime delivery is unavailable.

**Warning signs:**
- Resident schedules depend on `setInterval` running continuously in a visitor tab.
- Refreshing changes canonical resident locations.
- A reconnect requires guessing which events the client missed.
- World timestamps use visitor-local time without a canonical timezone and server timestamp.

**Phase to address:**
Simulation-state and client-synchronization foundation.

---

### Pitfall 5: Real Model Names Create Affiliation or IP Confusion

**What goes wrong:**
Visitors believe the site is endorsed by a model provider, a copied logo or visual identity creates source confusion, or satire is presented commercially in a way that exceeds the project's risk tolerance.

**Why it happens:**
Using names informationally is different from using another party's mark as the source brand, but the legal analysis is contextual and jurisdiction-specific. Satire is not a universal immunity, copied assets may raise copyright concerns, and monetization can change the practical risk profile.

**How to avoid:**
- Make Model Afterlife the dominant, independent brand.
- Refer to resident names in text for identification; do not copy provider logos, mascots, website styling, or game assets into resident designs.
- Display clear non-affiliation and fictional-reconstruction disclosures near the experience, not only in legal boilerplate.
- Keep citations and correction records for factual commentary.
- Review names, character art, marketing language, and monetization with qualified counsel before public launch.
- Track each provider's current brand-use policies as a release gate.

**Warning signs:**
- A resident sprite is primarily a provider logo with limbs.
- Marketing copy implies an original model is running or speaking.
- The disclaimer is hidden while names and marks dominate the landing page.
- Merchandise or sponsorship is added without a renewed legal review.

**Phase to address:**
Brand, resident-art, and launch-readiness phases. This research is general risk guidance, not legal advice.

---

### Pitfall 6: Untrusted Historical or News Text Controls Generation

**What goes wrong:**
A source document, submitted correction, scraped article, or event feed contains instructions that alter the generator's behavior, leak internal context, bypass character constraints, or cause unsafe output.

**Why it happens:**
Prompt injection can be embedded in any text later placed into an LLM context. Treating research excerpts as trusted instructions collapses the boundary between facts and control logic. Schema-valid output can still be unsafe or factually wrong.

**How to avoid:**
- Keep trusted system rules, approved structured facts, and untrusted source text in separate channels and data types.
- Never place raw external pages in production prompts; curate facts first.
- Use strict structured outputs for scene candidates, but separately validate policy, fact IDs, participant permissions, length, and state consistency.
- Give the generation model no database, network, or publication tools.
- Quarantine failed candidates and log validation reasons without exposing secret prompts.
- Moderate both generated dialogue and any visitor-visible sourced text.

**Warning signs:**
- Production prompts concatenate arbitrary scraped text.
- Passing a JSON schema is treated as proof that content is safe or true.
- The generator can publish directly.
- Validation rules exist only as natural-language prompt instructions.

**Phase to address:**
AI generation contract and safety pipeline.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store resident personality as one prose prompt | Fast character prototype | No provenance, weak diffing, facts and satire blur together | Throwaway offline experiments only |
| Feed full scene history into every call | Apparent continuity | Cost growth, stale contradictions, persona drift, prompt-injection surface | Never in production |
| Let model output mutate state directly | Fewer pipeline stages | Invalid state, duplicate effects, no audit trail | Never |
| Generate scenes synchronously on page request | Simple demo | Latency spikes, failures visible to visitors, duplicate work, cost abuse | Local prototype only |
| Use browser local storage as world state | No backend required | No shared canon, easy tampering, poor recovery | Non-persistent visual mockup only |
| Publish every schema-valid scene | High content volume | Bland or unsafe output reaches users | Never |
| Hard-code provider-specific model behavior throughout the app | Fast first integration | Difficult model upgrades and eval comparisons | Only behind a narrow adapter |
| Use copied logos as resident sprites | Immediate recognition | Brand confusion and IP risk | Never without permission |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Model API | Retrying without an application idempotency record | Persist a generation attempt and deduplicate candidate publication |
| Structured output | Assuming schema adherence means factual or safe content | Run deterministic factual, policy, continuity, and length validators |
| Scheduler or queue | Assuming exactly-once delivery | Design for at-least-once delivery with stable IDs and unique constraints |
| Realtime channel | Treating connection presence as canonical simulation progress | Stream snapshots/deltas from server-owned state and support polling fallback |
| Historical sources | Sending raw pages to the scene generator | Curate atomic approved facts first and treat sources as untrusted |
| Analytics | Recording dialogue or prompts without a retention policy | Minimize content logs, separate operational metrics, and define deletion rules |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Continuous per-resident inference | Unpredictable spend and lots of unwatchable dialogue | Generate only for selected events and cache published scenes | Immediately at public traffic or six always-active residents |
| Per-client simulation | Divergent worlds and repeated compute | One canonical server timeline, client-side interpolation only | More than one concurrent visitor |
| Full-world snapshot on every tick | High bandwidth and client churn | Versioned snapshots plus compact ordered deltas | As scene archive and resident state grow |
| Unbounded memory retrieval | Rising token cost and unrelated facts steering scenes | Typed current state, compact episodic summaries, explicit retrieval limits | After days of scenes |
| Recomputing recaps on every request | Slow return visits and repeated model costs | Derive and cache recaps when canonical scenes publish | Once daily active visitors grow |
| Rendering everything at device-pixel resolution | Poor laptop and mobile performance | Fixed logical resolution, sprite batching, culling, and measured scale modes | High-DPI displays and low-power mobile devices |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing model credentials in the web client | Credential theft and unbounded spend | Server-only provider adapter and secret management |
| Giving the generator tools or publication authority | Prompt injection can create side effects | Tool-free generation plus deterministic approval service |
| Rendering generated dialogue as HTML | Cross-site scripting | Treat dialogue as text and escape at render boundaries |
| Accepting correction submissions directly into prompts | Stored prompt injection and misinformation | Moderated intake, source verification, atomic fact approval |
| Public generation endpoints without quotas | Denial of wallet and content abuse | Internal jobs, authentication, rate limits, budgets, and kill switches |
| Logging full prompts indiscriminately | Disclosure of proprietary prompts or sensitive inputs | Redacted structured audit records and explicit retention limits |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Long speech bubbles | Visitors stop watching and the home feels like a chat transcript | Short turns, progressive reveal, pause, and scene transcript on demand |
| Events happen off-screen with no cue | The world feels empty or confusing | Camera-safe staging, subtle event indicators, follow mode, and recaps |
| Too much history exposition | Comedy stalls | Keep facts optional behind “why this behavior?” affordances |
| No quiet periods | Constant motion becomes exhausting and cheapens important scenes | Deliberate ambient beats and event pacing |
| Camera motion ignores accessibility | Vestibular discomfort | Reduced-motion mode, manual camera control, and no forced sweeping pans |
| Color-only relationship or status cues | Inaccessible state | Pair color with icons, labels, and profile text |
| Mobile tries to reproduce the full desktop map | Tiny unreadable UI and poor performance | Simplified follow/scene view with compact navigation |
| “Live” wording overpromises | Visitors expect continuous inference or true historical models | Describe a persistent simulated timeline and fictional reconstruction plainly |

## “Looks Done But Isn't” Checklist

- [ ] **Persistent timeline:** Refresh, reconnect, background-tab recovery, clock skew, and missed-event catch-up produce the same canonical state.
- [ ] **Idempotent generation:** Replaying every job and webhook cannot duplicate publication or relationship changes.
- [ ] **Resident fidelity:** Blind voice tests distinguish residents, and every historical claim maps to an approved fact ID.
- [ ] **Scene quality:** Regression evals cover repetition, brevity, endings, continuity, safety, and factual grounding.
- [ ] **Transparency:** Every relevant surface makes reconstruction and non-affiliation understandable without opening terms of service.
- [ ] **Accessibility:** Keyboard navigation, text alternatives, readable transcripts, contrast, reduced motion, and pause controls are verified.
- [ ] **Operational control:** Spend caps, provider timeouts, queues, dead-letter recovery, manual unpublish, and generation kill switches work.
- [ ] **Corrections:** A sourced correction can update facts, identify affected scenes, and produce an auditable resolution.
- [ ] **Mobile simplification:** The mobile view remains usable without rendering or controlling the full desktop experience.
- [ ] **Legal readiness:** Model names, art, copy, sources, disclaimers, brand policies, and monetization have received appropriate review.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Repetitive or drifting cast | MEDIUM | Pause generation, preserve canon, strengthen anchors/evals, regenerate only unpublished candidates |
| False historical claim published | MEDIUM | Unpublish or annotate scene, correct fact record, find all dependent scenes, publish correction, rerun evals |
| Duplicate or contradictory scenes | HIGH | Stop publisher, reconcile event IDs and state versions, select canonical outcome, rebuild projections and recaps |
| Provider outage or cost spike | LOW if designed well | Serve cached world and scenes, suspend generation, queue bounded future work, switch adapter after evals |
| Prompt-injection incident | HIGH | Disable affected source path, rotate secrets if exposed, inspect audit logs, invalidate derived facts/scenes, add regression case |
| IP or affiliation complaint | MEDIUM/HIGH | Remove disputed art/copy, preserve records, seek counsel, strengthen disclosure or rename resident presentation as advised |
| Accessibility failure | MEDIUM | Provide immediate static transcript/follow fallback, then remediate motion, controls, contrast, and screen-reader semantics |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Client-authored world time | Simulation-state foundation | Deterministic catch-up and multi-client convergence tests |
| Duplicate canonical effects | Event pipeline | Replay every job twice with no duplicate publication or state mutation |
| Historical misinformation | Resident-content system | Source and fact-ID audit across all character traits and scene claims |
| Prompt injection and unsafe output | AI generation contract | Adversarial source corpus, deterministic validators, and no direct publication capability |
| Persona drift and repetitive dialogue | Narrative engine | Blind voice tests, novelty metrics, bounded-scene and termination evals |
| Empty or confusing spectator experience | Observer client | First-session usability tests and missed-event recap comprehension |
| Brand and affiliation confusion | Launch readiness | Disclosure comprehension test and qualified legal/brand-policy review |
| Inaccessible continuous animation | Observer client | Keyboard, screen-reader, contrast, pause, and reduced-motion verification |

## Sources

### Primary and official sources

- [Generative Agents: Interactive Simulacra of Human Behavior](https://research.google/pubs/generative-agents-interactive-simulacra-of-human-behavior/) — memory, reflection, planning, and emergent behavior architecture (ACM UIST 2023).
- [SPASM: Stable Persona-driven Agent Simulation for Multi-turn Dialogue Generation](https://arxiv.org/abs/2604.09212) — documented persona drift, role confusion, echoing, and explicit termination design (preprint; treat as emerging evidence).
- [Cloudflare Queues delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/) — at-least-once delivery and idempotency guidance.
- [Cloudflare Agents observability](https://developers.cloudflare.com/agents/runtime/operations/observability/) — schedule, retry, duplicate, error, and lifecycle events.
- [OpenAI: Understanding prompt injections](https://openai.com/safety/prompt-injections/) — layered prompt-injection defenses.
- [OpenAI API reference: Structured Outputs](https://developers.openai.com/api/reference/) — strict JSON Schema output support; schemas do not replace semantic validation.
- [MDN: `setTimeout()` in inactive tabs](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#timeouts_in_inactive_tabs) — browser timer throttling.
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — motion accessibility guidance.
- [Australian eSafety Commissioner: Generative AI position statement](https://www.esafety.gov.au/industry/tech-trends-and-challenges/generative-ai) — safety by design, transparency, and accountability.
- [IP Australia: What is IP infringement?](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-what-ip-infringement) — informational trademark mention, source confusion, copyright, parody, and satire overview.
- [IP Australia: Trade mark infringement](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-trade-mark-infringement) — use as a badge of origin and likelihood-of-confusion framing.
- [ACCC: Recent developments in artificial intelligence](https://www.accc.gov.au/system/files/recent-developments-in-artifical-intelligence.pdf) — misleading AI claims and synthetic-content consumer risks.
- [USPTO TMEP: Parody marks](https://tmep.uspto.gov/RDMS/TMEP/print?href=TMEP-1200d1e5036.html&version=current) — parody can reduce confusion but is not automatically a defense.

### Confidence note

The operational and browser findings are based on current official documentation. Agent-simulation stability is an active research area with limited long-horizon production evidence, so those recommendations remain MEDIUM confidence and require project-specific evaluation. IP and regulatory notes identify release risks rather than provide legal conclusions; qualified advice is required before launch.

---
*Pitfalls research for: Model Afterlife*
*Researched: 2026-07-22*
