# Phase 2: Grounded Ensemble and Safe Scenes - Context

**Gathered:** 2026-07-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 replaces the provisional archetypes and authored sample dialogue with exactly six real, clearly superseded language-model residents whose still-available APIs generate their own turns in bounded inter-model scenes. It adds versioned historical grounding, persistent typed relationships and bounded memory, deterministic scene selection, private generation attempts, validation, immutable publication, cast balancing, and honest failure states on top of Phase 1's shared canonical home. Profiles, detailed public provenance exploration, archive/recap/sharing, production art, broad accessibility work, and the operations console remain later-phase work.

</domain>

<decisions>
## Implementation Decisions

### Resident Runtime and Admission
- **D-01:** Each resident is powered by the actual designated model/version through its available API and authors only that resident's dialogue turns. A single current model must not impersonate and write the whole ensemble. This later decision supersedes earlier project wording that assumed all residents would be reconstructed by one modern model. — **Reversibility:** costly — Changing this later would replace the multi-provider turn protocol, provenance model, prompt contracts, and failure handling that define the phase.
- **D-02:** Do not lock the six launch residents during discussion. Phase research must recommend the exact six after checking current API availability, historical significance, clear supersession, version stability, source quality, technical distinctiveness, and ensemble variety.
- **D-03:** A resident is eligible when its exact model/version is clearly superseded but remains callable through a supported API. Models whose APIs are shut down or no longer accessible are ineligible for the live launch cast.
- **D-04:** Claude 3.5 Sonnet is a representative candidate, not a pre-approved cast member. Research must verify the precise model identifier, continued API availability, provider lifecycle status, and suitability before selection.
- **D-05:** Pin exact model identifiers wherever providers permit it and record the requested model identifier plus any returned or resolved version metadata for every attempt. A mutable family alias alone is insufficient evidence that the intended historical version authored a line.
- **D-06:** An unavailable resident API must never be silently replaced by another model. Temporary failure produces a quiet, curated, or cached beat; only dialogue genuinely produced by the designated resident model may be presented as that model participating live.

### Historical Grounding and Characterization
- **D-07:** Every recurring trait is backed by a versioned character bible and claim ledger that separates documented fact, reported or cultural reputation, and fictional comic exaggeration. Each claim records sources, confidence, applicable model/version, and access date.
- **D-08:** A remembered anecdote, including the proposed BERT space-fact example, cannot become a recurring trait until its original evidence is verified. If verified, the documented incident and the fictional recurring exaggeration remain separately labelled.
- **D-09:** Give each resident two or three strong recurring characteristics derived from approved evidence. The prompting may amplify those traits for comedy but should preserve the designated model's own response tendencies rather than forcing every resident into one house style.
- **D-10:** Keep the comedy affectionate: balance limitations with competence and historical significance, preserve each resident's dignity, and rotate comic beats so no resident becomes a single repeated punchline.

### Inter-Model Scene Conduct
- **D-11:** The application supplies an approved event brief fixing participants, location, premise, allowed facts, relationship stakes, tone, turn budget, and permitted outcome. Resident models supply only their own dialogue turns and structured turn metadata.
- **D-12:** Models interact turn by turn using a bounded shared transcript. Each receives only the approved brief, its own character guidance, relevant verified claims, permitted relationship context, and the prior turns required for the scene.
- **D-13:** No resident model may choose schedules, mutate relationships or world state, publish content, call application tools, or issue instructions to another system component. Generated outcomes are proposals until deterministic application code validates and commits them.
- **D-14:** Ordinary scenes contain four to ten short turns, establish the premise within the first two turns, and finish with an explicit ending. The system controls the turn budget; models cannot extend a conversation indefinitely.

### Relationships, Memory, and Ensemble Balance
- **D-15:** Begin with an authored typed relationship graph based on genuine lineage, architectural contrast, and shared history. Track friendship, rivalry, familiarity, and recent shared experiences rather than one unexplained popularity score.
- **D-16:** A scene may propose only small changes to explicitly permitted relationship dimensions. Every accepted change records the published scene or world event that caused it.
- **D-17:** Future scene eligibility and prompts use bounded, relevant memories and structured outcomes, never an unbounded transcript history.
- **D-18:** Favor quality over constant chatter: present one primary scene at a time, make quiet periods at least as prominent as conversations, apply participant and pairing cooldowns, and use a rolling participation window so all six residents receive meaningful scenes.

### Validation, Publication, and Failure
- **D-19:** Treat all generated scenes as private candidates until strict versioned schema validation and semantic checks pass for approved facts, participant identity, continuity, permitted outcomes, character voice, novelty, brevity, tone, safety, and resolution.
- **D-20:** Allow at most two private generation attempts for an eligible scene. If neither passes or a provider is unavailable, publish no generated dialogue and use a curated, cached, or quiet fallback without changing relationships or other canon.
- **D-21:** Publication creates one immutable canonical scene revision containing the transcript, structured outcome, provenance, model/version metadata, and permitted relationship effects. Retries, delayed jobs, and duplicate delivery must remain idempotent.
- **D-22:** External historical material is untrusted content, not an instruction source. Failed candidates remain private and cannot alter canon or leak prompts, credentials, or internal validation details.

### Transparency
- **D-23:** Explain that scenes are fictional, prompted interactions between designated model APIs, not evidence of consciousness, private feelings, autonomous intent, or unprompted communication.
- **D-24:** Persistently identify the project as independent and unaffiliated with the model providers. Public scene data must preserve the exact model/version provenance for each resident's contributions.
- **D-25:** Keep documented facts, reported reputation, and fictional exaggeration visibly distinct wherever Phase 2 exposes historical categories; the live dialogue surface may remain concise while retaining traceable metadata for later profile and provenance views.

### The Agent's Discretion
- Phase research may choose the exact six residents and provider mix within D-02 through D-05. It should prefer a cast with genuinely distinct architectures, eras, capabilities, voices, and comic possibilities rather than selecting six near-identical chat models.
- The planner may choose provider-adapter boundaries, job orchestration, exact bounded context format, validator implementation, numerical cooldowns, cast-balance weights, and concise disclosure placement, provided the locked authorship, provenance, pacing, safety, and canon rules above remain true.
- The planner may determine whether non-dialogue scene planning and semantic validation are fully deterministic, model-assisted, or hybrid. No assisting model gains dialogue authorship, publication authority, application tools, or canonical mutation rights.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Intent and Phase Scope
- `.planning/PROJECT.md` — Defines the observer-only ambient ensemble, shared persistent timeline, historically grounded comedy, and product boundaries. D-01 through D-06 above supersede its earlier single-model reconstruction assumption.
- `.planning/ROADMAP.md` — Defines the Phase 2 goal, mapped requirements, and five success criteria.
- `.planning/REQUIREMENTS.md` — Defines Phase 2 requirements WRLD-05 through WRLD-07, RSID-01 through RSID-04, RELS-01 through RELS-03 and RELS-05, SCEN-01 through SCEN-10, and TRNS-01 through TRNS-03. Its generation and disclosure wording was reconciled with D-01 during AI contract design while retaining the same safety intent.

### Established Experience and Architecture
- `.planning/phases/01-shared-watchable-home/01-CONTEXT.md` — Locks the compact observer experience, one-primary-scene presentation, quiet routines, local-only viewer controls, and honest recovery states that Phase 2 must preserve.
- `.planning/phases/01-shared-watchable-home/01-PATTERNS.md` — Records implementation patterns established while building the canonical event journal, projection, APIs, observer client, and renderer boundary.
- `.planning/phases/01-shared-watchable-home/01-RESEARCH.md` — Provides the architectural and operational research baseline behind Phase 1's deterministic shared-world implementation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/world/domain/types.ts`, `events.ts`, and `replay.ts` provide the pure event-sourced world domain that published scenes and relationship effects can extend.
- `src/db/schema.ts` already stores an immutable world-event journal with unique occurrence keys plus the current public projection; these are the foundation for idempotent publication and replay.
- `src/features/world/server/world-repository.ts` and `advance-world-to.ts` provide the canonical read/commit boundary that generated candidates must remain outside until validation succeeds.
- `src/features/world/contracts/public-world.ts` and the existing observer components already expose one semantic primary scene and quiet states to visitors.

### Established Patterns
- Canon is server-owned, deterministic, replayable, and protected by database uniqueness constraints. Provider calls and non-deterministic candidate generation must not occur inside the pure reducer or gain direct write authority.
- React owns semantic presentation while Phaser is a disposable visual projection. Phase 2 scene provenance and disclosures must remain available outside the canvas.
- Public updates carry committed snapshots in sequence order. Private prompts, attempts, and validation failures require separate storage and must not enter the public update feed.

### Integration Points
- `src/features/world/fixtures/provisional-world.ts` currently supplies four archetypes and authored sample dialogue; Phase 2 replaces these with the researched six-resident registry, versioned character data, and published generated scenes.
- `src/features/world/domain/advance.ts` currently starts a provisional scene directly every ten ticks and mutates a single affinity value every five ticks. It must evolve into deterministic eligibility/planning events plus typed, cause-backed relationship effects, without calling providers from the pure advancement loop.
- `src/db/schema.ts` needs private generation-attempt, prompt/version, claim/bible, model-registry, validation, and immutable scene-revision persistence while preserving the existing event journal as canonical authority.
- `src/features/world/server/to-public-snapshot.ts` and the snapshot/update APIs should expose only validated published revisions and honest quiet/provider states.

</code_context>

<specifics>
## Specific Ideas

- The appeal is that the actual superseded models are interacting with one another, not that a newer narrator is role-playing all of them.
- A scene should feel like a carefully staged meeting between distinct model systems: deterministic production supplies the situation, then each resident answers in turn as itself.
- Claude 3.5 Sonnet illustrates the desired admission category: recognizably superseded, historically interesting, and potentially still callable. It remains subject to exact-version and live-availability research.
- API downtime can become an honest quiet moment in the home, but must not be disguised as dialogue from a resident that did not produce it.

</specifics>

<deferred>
## Deferred Ideas

- Long-term resident succession or replacement after a provider permanently removes an admitted model belongs in a later operational/content-expansion phase. Phase 2 handles temporary unavailability with cached, curated, or quiet fallback behavior.

</deferred>

---

*Phase: 2-Grounded Ensemble and Safe Scenes*
*Context gathered: 2026-07-22*
