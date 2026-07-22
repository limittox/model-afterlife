# Project Research Summary

**Project:** Model Afterlife  
**Domain:** Persistent observer-only pixel-art sitcom with historically grounded AI characters  
**Researched:** 2026-07-22  
**Confidence:** MEDIUM

## Executive Summary

Model Afterlife should be built as a small persistent television set, not as a game, chatbot, or autonomous-agent network. One server-owned timeline advances deterministically; curated rules decide where residents are, which event occurs, who participates, and what may change. A modern language model is then allowed to write only a short, bounded performance for that frozen scene plan. The browser observes a projection of this shared world and never authors canonical time or state.

The recommended MVP is a TypeScript modular monolith: Next.js and React provide the semantic site shell, Phaser renders a client-only pixel world, PostgreSQL stores canonical events and projections, and Trigger.dev advances the clock and performs durable generation work. Scene output is structured, source-bound, validated, cached, and published idempotently. For public delivery, prefer a bootstrap snapshot plus cursor-based foreground polling in v1; retain ordered event IDs and gap recovery so server-sent events can be added later if measured latency or traffic justifies them.

The main risk is not rendering the map; it is preserving a funny, distinct, trustworthy ensemble over time. Six versioned character bibles must separate documented facts, reported reputation, and fictional exaggeration before dialogue generation begins. Short scene budgets, quiet periods, novelty and voice evaluations, immutable publication records, reconstruction and non-affiliation disclosures, and accessible transcript/recap surfaces are launch requirements. Legal conclusions, the final cast, ideal cadence, model quality, Phaser 4 performance, and mobile presentation still require project-specific validation.

## Key Findings

### Recommended Stack

Use a desktop-first Next.js application with a React-owned semantic interface and a dynamically loaded, client-only Phaser canvas. Keep world logic outside both frameworks in pure TypeScript packages. PostgreSQL should own the ordered world journal, current projections, resident/content versions, scene artifacts, idempotency keys, and generation audit records.

The architecture and stack reports differ on two implementation details. For MVP delivery, choose cursor polling rather than SSE because five-second visible-tab polling is adequate for a passive one-way experience and fits Vercel's request model with less operational risk. For background work, use Trigger.dev rather than building a complete PostgreSQL lease queue; preserve a transactional outbox and database uniqueness guards so Trigger.dev remains a wake-up/execution layer rather than canonical truth.

**Core technologies:**

- **Node.js 24 LTS, pnpm 11, TypeScript 6:** pinned runtime and shared type system; defer TypeScript 7 until framework/tooling compatibility is explicit.
- **Next.js 16.2 and React 19:** application shell, profiles, recaps, accessible controls, route handlers, metadata, and mobile view.
- **Phaser 4.2:** client-only pixel-world rendering, tilemaps, camera, sprites, and interpolation; spike the recent major before committing the full art pipeline.
- **Neon PostgreSQL 18 and Drizzle:** relational canonical state, ordered events, transactions, constraints, typed schema, and reviewed migrations.
- **Trigger.dev 4:** scheduled catch-up and bounded generation/recap tasks with retries and concurrency controls; database records still enforce semantic idempotency.
- **TanStack Query 5:** snapshot and cursor polling while visible, with focus recovery and fresh-snapshot fallback on gaps.
- **OpenAI Responses API, GPT-5.6 Terra baseline, and Zod 4:** replaceable server-side model adapter with structured scene output and shared runtime contracts; lock the model only after project-specific evals.
- **Vitest, fast-check, and Playwright:** pure domain tests, replay/determinism properties, real-browser contract and visual checks.
- **Vercel, Neon, Trigger.dev Cloud, Tiled, and Aseprite:** low-operations hosting plus a source-controlled original asset workflow with immutable exports.

Avoid autonomous-agent frameworks, browser-to-model calls, LLM-authored world state, a Next.js in-memory clock, Vercel Cron as the sole scheduler, Firestore, Redis, assumed Phaser 3 plugin compatibility, production schema `push`, and mutable asset URLs.

### Expected Features

The core viewing loop is: immediately understand the current scene, recognize the residents, optionally inspect why the joke is historically grounded, leave with an unresolved thread, then return to a concise account of what changed. Retention should come from continuity and recoverable absence, not streaks, currencies, or notifications.

**Must have (table stakes):**

- One compact home, six visually and verbally distinct real-model residents, and meaningful quiet routines.
- A single server-owned persistent timeline with deterministic schedules, locations, event cooldowns, relationship rules, and catch-up.
- One legible primary scene at a time: clear premise and speakers, four to ten short turns, decisive endings, focused staging, pause/read mode, and graceful failure states.
- A finite recent-scene archive and a significance-ranked three-to-five-beat “Since your last visit” recap.
- Light observer controls: pan/zoom, follow, reset view, pause presentation, jump to live, profiles, and recent scenes; none may influence canon.
- Source-backed resident profiles and “Behind this behavior” explanations with claim-level provenance and uncertainty.
- Persistent fictional-reconstruction and non-affiliation disclosure without cluttering speech bubbles.
- Semantic HTML transcripts and controls, keyboard access, contrast, scalable text, reduced motion, and non-color cues.
- A simplified mobile, scene-first viewer rather than full map/control parity.
- Private, minimal analytics for scene completion, meaningful watch time, returns, recap continuation, resident/profile interest, and share actions.

**Should have (competitive):**

- Versioned, evidence-grounded character bibles that explicitly map comic exaggerations to approved claims.
- Curated event-driven improvisation with frozen cast, location, facts, stakes, turn budget, and permitted outcome.
- Persistent ensemble relationships and compact episodic memories with bounded, causal changes.
- Stable scene permalinks and reconstruction-labelled social cards.
- Noticeable callbacks, appointment moments, and affectionate obsolescence tone, added only when they improve the return loop.

**Defer (v1.x or v2+):**

- Curator tooling or a CMS until Git-reviewed content becomes an actual bottleneck.
- Rich relationship visualizations, appointment calendars, clip export, weekly digests, new rooms, and more residents until the six-character loop validates.
- Image/audio residents, original historical-model exhibits, seasonal arcs, public correction contributions, and native/ambient companion surfaces.

**Explicit anti-features:** unrestricted autonomy, endless social feeds, visitor chat or influence, accounts/comments/follows, progression currencies, daily streaks, high-frequency notifications, full mobile simulation parity, autoplay audio/voice cloning, and literal-consciousness framing.

### Architecture Approach

Use one TypeScript repository and one versioned application, with stateless web/API routes and Trigger.dev background tasks sharing a PostgreSQL database. Apply event sourcing only to the world slice: immutable world events are canonical, snapshots and public views are rebuildable projections, published scene revisions are immutable prose artifacts, approved content records are versioned historical truth, and job/provider records remain operational evidence. The simulation plans facts and outcomes; generation is a side effect and cannot mutate canon directly.

**Major components:**

1. **Content catalog and compiler** — validates resident bibles, atomic claims, sources, exaggeration rules, relationships, schedules, event templates, disclosures, policies, and asset references into an approved versioned bundle.
2. **Deterministic simulation core** — advances an integer logical clock with seeded randomness, resolves schedules and triggers, emits ordered events, and supports exact replay without wall-clock, network, database, or model dependencies.
3. **World journal and projections** — transactionally stores unique occurrences and snapshots, produces current/public state, archives, recaps, and ordered cursor feeds, and supports gap recovery.
4. **Durable orchestration and outbox** — catches up missing ticks, serializes the single world writer, dispatches Trigger.dev work, and reconciles retries while database keys prevent duplicate canonical effects.
5. **Scene pipeline** — freezes plans and content versions, invokes a replaceable model adapter, stores every attempt, validates structure/continuity/provenance/tone/safety/novelty, quarantines failures, and publishes one immutable revision or curated fallback.
6. **Observer client** — React owns accessible dialogue, profiles, archive, recap, disclosures, and local controls; Phaser owns sprites, tilemap, camera, animation, and interpolation from public contracts.
7. **Asset and operations layer** — validates original art/map manifests, serves content-hashed immutable assets, measures cost and quality, and provides generation kill switches, manual unpublish/correction paths, and replay diagnostics.

**Required patterns:**

- Derive target logical tick from a fixed epoch; wake-ups reconcile missing work rather than assuming exact cron delivery.
- Use stable occurrence, generation, and publication keys plus unique constraints; design for at-least-once execution and single canonical publication.
- Commit scene plans/outbox entries before model calls; never hold a database transaction open across external inference.
- Store compact typed relationship state and scene outcomes rather than feeding unbounded transcript history back to the model.
- Bootstrap clients from a coherent snapshot, apply ordered cursor deltas idempotently, and refresh the snapshot on gaps or schema changes.
- Render generated dialogue as escaped text and keep raw source material, secrets, prompts, failed drafts, and moderation records out of public APIs.

### Critical Pitfalls

1. **Unbounded dialogue becomes interchangeable AI sludge** — use authored triggers, short finite scenes, stable voice anchors, quiet periods, cast rotation, novelty checks, and regression evals.
2. **Fiction is repeated as real model history** — define a retirement taxonomy, scope claims to exact models/versions, cite approved fact IDs, separate reputation from fact, label reconstruction, and support corrections.
3. **Retries create duplicate or contradictory canon** — persist workflow state first, use unique semantic IDs and transactional publication, separate generation from validation/publication, and replay failure cases twice.
4. **The browser becomes world authority** — advance canonical state only on the server; browsers interpolate a snapshot/delta projection and reconcile on focus, reconnect, and background-tab recovery.
5. **The generator gains control through untrusted source text** — curate atomic facts before prompting, separate instructions from data, give the model no tools or publication authority, and validate semantics beyond the JSON schema.
6. **Real names create historical, affiliation, or rights confusion** — make Model Afterlife the dominant brand, avoid provider logos and copied game art, preserve reconstruction/non-affiliation labels on shared surfaces, and require qualified legal review before public launch or monetization.

## Implications for Roadmap

The following is a compact research recommendation for coarse planning, not an approved roadmap. A thin watchable tracer early would reduce the highest uncertainties, but the project has not yet selected a formal vertical-MVP planning strategy.

### Suggested Phase 1: Watchable Canonical Slice

**Rationale:** Prove the product's hardest cross-cutting promise before scaling content or polish: two clients observe the same advancing world and one understandable scene.  
**Delivers:** Repository/toolchain, shared contracts, one Tiled room, placeholder art, a small provisional cast/content sample, deterministic clock and reducer, PostgreSQL journal/projection, Trigger.dev wake-up, snapshot/cursor API, and an accessible React/Phaser viewer using authored dialogue.  
**Addresses:** Live-state orientation, persistent shared state, lightweight controls, semantic dialogue, quiet/error states.  
**Avoids:** Client-authored time, premature art investment, duplicate ticks, framework/domain coupling.  
**Exit evidence:** Deterministic catch-up and replay hashes; duplicate wake-ups produce one occurrence; two browsers converge; background/reconnect recovery works; Phaser 4, desktop performance, and a simple mobile scene view are viable.

### Suggested Phase 2: Grounded Cast and Safe Scene Engine

**Rationale:** Historical credibility and generated-scene governance must exist before increasing dialogue volume.  
**Delivers:** Final six-resident selection, retirement taxonomy, primary-source claim registry, versioned character bibles, event-template library, immutable scene plans, OpenAI/Zod pipeline, layered validators, quarantine/fallback, prompt/model versioning, and resident/scene eval corpus.  
**Addresses:** Distinct identities, curated improvisation, provenance, behind-the-behavior explanations, reconstruction disclosure, bounded relationship changes.  
**Avoids:** Misinformation, prompt injection, persona drift, unrestricted autonomy, direct model mutation, unsafe auto-publication.  
**Exit evidence:** Every recurring trait maps to an approved claim/exaggeration rule; blind voice tests distinguish residents; adversarial and duplicate-job fixtures cannot publish unsupported or duplicate scenes; generation failure leaves the world healthy.

### Suggested Phase 3: Complete Return Loop and Presentation

**Rationale:** Once canonical scenes are trustworthy, invest in the experience that makes them legible, memorable, and worth revisiting.  
**Delivers:** Original compact home and six-resident art, production camera/follow/pause flow, scene staging, profiles, recent archive, deterministic recap selection with optional constrained polish, persistent relationships/callbacks, simplified mobile view, stable permalinks/social cards, and privacy-conscious analytics.  
**Addresses:** “What is happening?”, “Why is this funny?”, and “What changed while I was gone?” across desktop, mobile, keyboard, and reduced-motion paths.  
**Avoids:** Empty-feeling world, long bubbles, off-screen confusion, citation-heavy comedy, inaccessible canvas-only content, mobile desktop-shrinkage, share cards stripped of disclosure.

### Suggested Phase 4: Launch Safety and Operational Hardening

**Rationale:** Persistent public generation and real model identities require evidence that failures are recoverable and representations are defensible.  
**Delivers:** Replay/projection rebuild tooling, cost and backlog budgets, provider timeouts/circuit behavior, operational dashboards, kill switches, correction/unpublish flow, content/asset provenance audit, load and browser tests, disclosure comprehension, analytics review, and legal/brand-policy review.  
**Addresses:** Reliable continuous operation, correction readiness, public transparency, performance, and release criteria.  
**Avoids:** Silent canon corruption, denial-of-wallet exposure, unbounded logs, provider/logo confusion, inaccessible launch, and non-recoverable corrections.

### Phase Ordering Rationale

- Canonical time, content identifiers, and scene records are dependencies of generation, archive, recap, accessibility, mobile, and sharing.
- The first phase should cross the React/Phaser/server/database/task boundaries with authored content so technology risks fail cheaply.
- Factual sourcing and scene safety come before high-volume generation; polished art and the full return loop come after content contracts stabilize.
- Launch hardening is last as a concentration of verification work, but its invariants, accessibility requirements, disclosure rules, and operational hooks must be designed and tested in every earlier phase.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1:** Phaser 4/Tiled integration, Vercel/Trigger.dev/Neon regional behavior, polling cadence/cost, logical clock rate, and missed-event budget need a measured spike.
- **Phase 2:** The exact six-model cast, retirement taxonomy, primary-source bibles, provider retention/idempotency/schema behavior, claim-verification policy, and model quality/cost require dedicated research and evals.
- **Phase 3:** Scene cadence, recap usefulness, mobile map-versus-scene presentation, pixel-art identity, and social-card trademark/disclosure treatment need prototype or usability evidence.
- **Phase 4:** Current provider brand policies and qualified legal review are external release dependencies, not questions code research can settle.

Phases with established patterns that usually do not need a separate generic research pass:

- PostgreSQL unique constraints, reviewed migrations, transactional outbox, logical-clock pure tests, cursor APIs, semantic HTML, `prefers-reduced-motion`, immutable asset URLs, and standard error/observability instrumentation are well documented. Validate their project-specific behavior during execution rather than re-researching the patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Versions and capabilities were checked against current official documentation, but Phaser 4 is a recent major, hosting behavior is deployment-specific, and the dialogue model needs a project eval set. |
| Features | MEDIUM | Recommendations converge across ambient simulations, live viewing, accessibility standards, model cards, and agent-network research; no direct comparator combines this exact product shape. |
| Architecture | MEDIUM-HIGH | Deterministic server authority, selective event history, immutable scene artifacts, idempotent side effects, and a modular monolith strongly fit the approved constraints; delivery and worker implementation details remain empirical. |
| Pitfalls | MEDIUM-HIGH | Failure modes are supported by official platform guidance and agent-simulation evidence, but long-horizon character quality and project-specific legal risk cannot be proven by desk research. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Final cast and retirement semantics:** Select six exact model/version identities only after primary-source coverage, supersession status, recognizable traits, and relationship potential are scored.
- **Historical claim policy:** Define how many and what kinds of sources support documented facts versus cultural reputation, plus correction/supersession behavior for published scenes.
- **Comedy quality:** Build blind voice, novelty, brevity, ending, continuity, factual-grounding, and tone evals before locking prompt, model, or reasoning effort.
- **Cadence and clock:** Prototype how many scenes per day, how world time maps to wall time, how quiet periods feel, and which missed events are collapsed during catch-up.
- **Delivery mechanism:** Start with cursor polling; benchmark observer concurrency, freshness, and database traffic before considering SSE or a hosted realtime layer.
- **Phaser and mobile:** Spike one room, six animated sprites, camera follow, high-DPI scaling, background recovery, low-power performance, and whether mobile benefits from a map thumbnail at all.
- **Legal and brand:** Satire and informational naming are not blanket protections. Validate current provider policies, art, copy, social cards, disclosures, jurisdiction, and monetization with qualified counsel before launch.
- **Operations and privacy:** Set provider retention expectations, cost ceilings, log redaction/retention, analytics definitions, kill switches, and correction/unpublish ownership.

## Sources

Only sources material to cross-report decisions are listed here; the four detailed research files retain the complete bibliography.

### Primary and official (HIGH authority; research confidence classified MEDIUM)

- [Next.js 16.2 release](https://nextjs.org/blog/next-16-2) and [installation requirements](https://nextjs.org/docs/app/getting-started/installation) — application/runtime compatibility.
- [Phaser release archive](https://phaser.io/download/archive), [camera concepts](https://docs.phaser.io/phaser/concepts/cameras), and [tilemap API](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) — recent Phaser 4 renderer and world features.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [advisory locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS), and [`SKIP LOCKED`](https://www.postgresql.org/docs/current/sql-select.html) — idempotency, single-writer coordination, and queue semantics.
- [Trigger.dev task overview](https://trigger.dev/docs/tasks/overview), [scheduled tasks](https://trigger.dev/docs/tasks/scheduled), and [durable execution](https://trigger.dev/docs/how-it-works) — durable scheduled background work.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), and [prompt-injection guidance](https://openai.com/safety/prompt-injections/) — bounded generation contracts and layered safety.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — semantic access and control of continuous motion/updates.
- [MDN timer throttling](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#timeouts_in_inactive_tabs) — why browsers cannot own the persistent clock.
- [Microsoft Azure Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) — selective append-only history, replay, projections, testing, and complexity cautions.
- [Hugging Face model cards](https://huggingface.co/docs/hub/en/model-cards) and [Smithsonian provenance guidance](https://smithsonianprovenance.si.edu/) — structured limitations/lineage and correction-aware provenance.
- [IP Australia infringement overview](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-what-ip-infringement) and [trade mark infringement](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-trade-mark-infringement) — affiliation and rights risk framing; not legal advice.

### Primary research and product-pattern evidence (MEDIUM)

- [Generative Agents](https://research.google/pubs/generative-agents-interactive-simulacra-of-human-behavior/) — memory, planning, and emergent social behavior, used behind curated boundaries.
- [Social Simulacra in the Wild](https://arxiv.org/abs/2603.16128), [MoltNet](https://arxiv.org/abs/2602.13458), and [First Look at Moltbook](https://arxiv.org/abs/2602.10127) — participation inequality, bursty flooding, weak reciprocity, persona drift, and stylistic flattening in agent-native networks.
- [Neko Atsume official guide](https://www.nekoatsume.com/sp/en/about.html), [The Sims 4 Neighborhood Stories](https://www.ea.com/games/the-sims/the-sims-4/news/neighborhood-stories-system), and [Monterey Bay Aquarium live cams](https://www.montereybayaquarium.org/cams-videos/live-cams) — passive return loops, off-screen catch-up, readable habitats, and appointment moments.

---
*Research completed: 2026-07-22*  
*Ready for requirements: yes*  
*Suggested phases are research guidance, not an approved roadmap.*
