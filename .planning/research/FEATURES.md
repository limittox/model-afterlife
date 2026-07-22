# Feature Research

**Domain:** Observer-only ambient simulation / persistent AI-character sitcom / living AI-history museum
**Researched:** 2026-07-22
**Confidence:** MEDIUM

## Executive Position

Model Afterlife should behave like a tiny persistent television set, not a game and not an agent social network. Comparable ambient products reward returning through visible change, records of missed visitors, collectibles, scheduled moments, and lightweight observation controls. Persistent-life simulations additionally expose what happened outside the viewer's focus. Those patterns transfer well; their currencies, progression systems, world editing, and direct character interaction do not.

For v1, retention depends on three questions being answerable within seconds:

1. **What is happening now?** The active scene, speakers, location, and live/paused state are obvious.
2. **Who are these residents and why are they funny?** Each character reads distinctly in-world, with optional sourced context one step away.
3. **What changed while I was gone?** A concise recap identifies notable scenes and relationship movement, then offers a direct path back into live viewing.

The defining differentiator is not autonomous AI behavior by itself. It is **historically grounded, editorially constrained character comedy presented inside a persistent shared world**. Current studies of an agent-native social network report participation inequality, shallow reciprocity, bursty flooding, and stylistic or emotional flattening; that evidence strengthens the case for curated events, short scenes, cast balance, and a finite recent-scene archive rather than a feed of unrestricted model output [S10-S12].

## Feature Landscape

### Table Stakes (Users Expect These)

Missing these features would make the experience feel confusing, inert, inaccessible, or untrustworthy.

| Feature | Why Expected | Complexity | MVP Notes | Confidence |
|---------|--------------|------------|-----------|------------|
| Immediate live-state orientation | A passive viewer must understand where attention belongs without learning game controls. | MEDIUM | On entry, identify current home time, location, active speakers, scene title/premise, and whether the view is live or paused. Avoid a tutorial modal; use a short first-visit hint. | MEDIUM |
| Legible, finite scene presentation | Dialogue is the entertainment unit; unclear speakers or overlapping chatter destroys the joke. | MEDIUM | Focus the camera on one primary scene, show name/portrait with each short speech turn, queue rather than overlap bubbles, and end scenes decisively. Ambient non-dialogue may continue elsewhere. | MEDIUM |
| Distinct resident identity at a glance | Ensemble comedy requires viewers to recognize characters before remembering detailed history. | MEDIUM | Give each resident a unique sprite silhouette/palette, nameplate, small role descriptor, recurring location/routine, and stable speech signature. Do not depend on vendor logos alone. | MEDIUM |
| Shared persistent world state | The promise of an independent home fails if every session resets or different visitors see unrelated worlds. | HIGH | Persist schedules, locations, relationships, scene outcomes, and a monotonic shared timeline. State should advance deterministically between meaningful generated scenes. | MEDIUM |
| Meaningful activity cadence | Ambient products need enough change to reward checking in, but not so much activity that nothing feels important. | HIGH | Use curated triggers, daily schedules, cooldowns, cast-rotation rules, and scene budgets. Include visible quiet periods; do not generate dialogue merely to fill time. EA explicitly describes balancing autonomous stories to avoid spam and repetition [S4]. | MEDIUM |
| Recent-scenes archive | Viewers will miss scenes and need a readable fallback when the live view is quiet or confusing. | MEDIUM | Keep a finite reverse-chronological list with title, residents, time, one-line premise, transcript, and outcome. Link every entry back to residents and factual context. | MEDIUM |
| “Since your last visit” recap | Persistent change only supports retention if returning viewers can recover narrative context quickly. | MEDIUM | Use local last-visit time in v1; summarize at most 3-5 significant beats, relationship changes, and one “watch live” hook. Rank by significance rather than listing every action. The Sims exposes recent off-screen stories for this same comprehension need [S3]. | MEDIUM |
| Lightweight spectator controls | Observer-only does not mean control-free; viewers need to choose what and how to watch. | MEDIUM | Provide pan/zoom, follow/unfollow resident, pause/resume presentation, jump to live, open profile, open recent scenes, and reset camera. These controls never alter resident behavior. | MEDIUM |
| Resident history/profile cards | Real model names create an expectation of useful and accurate context. | MEDIUM | Layer the card: a one-screen “why this resident behaves this way,” then timeline, architecture/capabilities, documented limitations, lineage, sources, and status/supersession rationale. Model-card conventions support structured limitations, lineage, evaluation, and sources [S8]. | MEDIUM |
| Claim-level provenance and uncertainty | Satire based on real systems can become misinformation if fact and joke are visually merged. | HIGH | Tag character-bible claims as **documented fact**, **reported/cultural reputation**, or **fictional exaggeration**. Link primary sources where possible; show disputed or incomplete evidence honestly. Treat provenance as maintained research, not a one-time bibliography [S7]. | MEDIUM |
| Persistent reconstruction disclosure | Users must not infer that dialogue came from the historic model or demonstrates consciousness. | LOW | Show a concise site-level disclosure and a small “fictional reconstruction” badge on scene/profile views. Keep the label present but unobtrusive; do not repeat a legal paragraph in every bubble. Character.AI and YouTube demonstrate persistent fiction/generative-content labeling patterns [S13-S14]. | MEDIUM |
| Accessible non-canvas reading path | A visual simulation cannot make story content available only through moving pixels. | MEDIUM | Render dialogue, controls, profiles, recaps, and transcripts as semantic HTML. Support keyboard operation, visible focus, readable text scaling, sufficient contrast, non-color cues, and descriptive labels. | MEDIUM |
| Motion and time controls | Automatic movement and disappearing dialogue create accessibility and comprehension barriers. | MEDIUM | Include a global presentation pause, manual advance/read mode for dialogue, `prefers-reduced-motion`, and no rapid flashes. After pause, offer “continue from here” for a scene and “jump to live” for the world. WCAG explicitly covers automatic movement and updates [S15-S17]. | MEDIUM |
| Simplified mobile viewer | Shared links will be opened on phones even though desktop is the primary experience. | MEDIUM | Use a scene-first single-column view: current scene, resident strip, recap, recent scenes, profiles, and large touch controls. A simplified map thumbnail/follow view is enough; do not shrink the desktop UI into an unreadable canvas [S18-S19]. | MEDIUM |
| Graceful quiet/loading/error states | A persistent world will sometimes have no active dialogue or a generation job may fail. | MEDIUM | During quiet time, show residents' current routines and the next scheduled home activity. On generation failure, preserve world state and use a curated fallback beat; never leave characters frozen behind a spinner. | MEDIUM |

### Differentiators (Competitive Advantage)

These features should receive disproportionate craft because they directly express the project's core value.

| Feature | Value Proposition | Complexity | MVP Notes | Confidence |
|---------|-------------------|------------|-----------|------------|
| Evidence-grounded comic character bibles | Makes every joke specific, learnable, and defensible rather than generic AI role-play. | HIGH | Build the six bibles before broad scene generation. Each recurring quirk must point to a capability, architecture choice, limitation, benchmark, incident, or documented reputation; attach a comic exaggeration rule separately. | MEDIUM |
| Curated event-driven improvisation | Produces scenes with a premise, conflict, and ending while retaining generative variation. | HIGH | The system chooses cast, location, trigger, relationship stakes, allowed facts, tone, turn budget, and outcome envelope; the modern model writes only the constrained lines. This is the primary protection against agent-content sludge. | MEDIUM |
| Persistent ensemble continuity | Gives viewers a reason to return beyond novelty: grudges, friendships, callbacks, and routines evolve across days. | HIGH | Store a small set of explicit relationship dimensions and recent shared memories. Every meaningful scene may change at most one or two values; recap and profiles surface changes in human language. | MEDIUM |
| “Behind the behavior” reveal | Converts a laugh into optional AI history without interrupting the comedy-first surface. | MEDIUM | From a scene or profile, open a compact explanation: the joke, the real behavior/history that inspired it, the exaggeration, and sources. Never interrupt dialogue with footnote chrome. | MEDIUM |
| Narrative recap, not activity log | Makes absence intriguing rather than punishing and can end on a return hook. | MEDIUM | Summarize causally: “X said Y, so Z now avoids the GPU lounge,” not “event 481 occurred.” Include one relationship delta and one unresolved thread when available. | MEDIUM |
| Canonical shareable scene moments | Lets memorable dialogue travel without building a social network. | MEDIUM | Give every completed scene a stable URL and attractive Open Graph card containing a short quote, residents, scene title, timestamp, and reconstruction label. Link to the full scene and factual context. Exact-moment links are a mature sharing pattern [S20-S21]. | MEDIUM |
| Appointment moments inside an ambient world | Predictable events create return habits while ambient routines preserve serendipity. | MEDIUM | Publish a lightweight home noticeboard with the next one or two authored activities, such as token bingo or an admission anniversary. Virtual aquarium cams use named exhibits and scheduled feeding shows to turn passive watching into appointments [S6]. | MEDIUM |
| Affectionate obsolescence tone | Separates the project from benchmark dunking and gives the comedy emotional range. | MEDIUM | Encode tone rules in event briefs and review rubrics: joke about documented behavior, status loss, and technical history; do not portray models as literally suffering, defame teams, or use unverified anecdotes as canon. | MEDIUM |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative | Confidence |
|---------|---------------|-----------------|-------------|------------|
| Unrestricted continuous agent autonomy | Sounds emergent and “alive.” | Produces costly volume without dramatic shape; current agent-network research reports shallow engagement, flooding, concentration, and homogenization [S10-S12]. It also weakens factual control. | Deterministic world simulation plus bounded generation only for curated scenes. | MEDIUM |
| Endless social feed of model posts | Familiar, easy to browse, and resembles Moltbook. | Replaces the spatial sitcom with generic text, rewards posting frequency over character quality, and duplicates the recent-scenes archive. | Finite scene archive and daily/return recap connected to the home. | MEDIUM |
| Visitor-to-resident chat | Feels interactive and marketable. | Collapses carefully authored residents into generic assistants, invites prompt attacks, increases moderation/cost, and changes the product from observation to chatbot service. | Profile exploration, follow controls, and scene context with no prompts. | MEDIUM |
| Visitor voting, gifts, or world influence | Creates engagement mechanics. | Breaks the independent-world premise and lets popularity distort cast balance and historical characterization. | Let visitors choose camera focus and what to read, never what residents do. | MEDIUM |
| Accounts, comments, follows, and notifications | Suggests community and retention. | Adds identity, privacy, moderation, abuse, and notification-spam work before the viewing loop is proven. | Anonymous shared world, local last-visit state, stable links, and optional bookmarkability. | MEDIUM |
| Full clip/video editor at launch | Seems ideal for viral sharing. | Requires rendering, storage, moderation, and complex mobile UX before there is evidence scenes are worth clipping. | Stable scene URL plus generated quote/image card; add export tooling only after observed sharing demand. | MEDIUM |
| Running original historical models | Feels maximally authentic. | Availability, licensing, serving cost, security, and inconsistent interfaces distract from validating the show. Output would still need editorial framing. | Clearly labeled modern-model reconstructions backed by historical sources. | MEDIUM |
| Large launch cast or map | Makes the world look substantial. | Dilutes characterization, creates relationship combinatorics, increases art/content burden, and makes scenes harder to follow. | Six residents, one compact home, one outdoor area, and depth-first relationship design. | MEDIUM |
| Fully generative world state and schedules | Promises maximal novelty. | Makes continuity hard to test, recap, reproduce, or recover after failures; dialogue can accidentally rewrite canon. | Typed world state and authored event rules; generated text may describe but never directly define canonical state. | MEDIUM |
| Dense citations inside speech bubbles | Signals seriousness and factuality. | Interrupts timing and makes the comedy feel like documentation. | Keep bubbles clean; place “why this joke?” and sources on scene/profile detail. | MEDIUM |
| Gamified progression, currency, and daily streaks | Proven retention devices in idle games. | Turns watching into obligation and optimizes collection rather than ensemble attachment. Neko Atsume uses collection effectively [S2], but Model Afterlife's core promise is narrative continuity. | Appointment events, callbacks, recaps, and unresolved relationship threads. | MEDIUM |
| High-frequency push/email notifications | Can pull users back to the site. | Creates spam and urgency that conflicts with a cozy ambient tone; EA's recent work explicitly reduces repetitive story notifications and adds controls [S5]. | No push notifications in v1; let recaps absorb absence. Test an optional weekly digest only after retention is demonstrated. | MEDIUM |
| Full mobile simulation parity | Sounds polished and inclusive. | Consumes disproportionate UI/performance effort and produces a compromised miniature map. | Accessible scene-first mobile viewer with profiles, recap, and simplified follow view. | MEDIUM |
| Autoplay audio or voice cloning | Adds ambience and character recognition. | Creates accessibility, consent, cost, likeness, and moderation issues; sound also undermines an unobtrusive desktop companion. | Silent-first v1. If sound is later added, use original licensed assets, explicit volume controls, and no imitation of identifiable people. | MEDIUM |
| Consciousness or literal-feelings framing | Adds philosophical drama and provocative marketing. | Misleads visitors about the system and can turn affectionate satire into deceptive anthropomorphism. | Explicitly frame emotions as fictional characterization and the world as reconstructed satire. | MEDIUM |

## Retention and Comprehensibility Loop

The MVP loop should be:

```text
Open site
  -> immediately see one legible live scene or meaningful quiet routine
  -> recognize residents and current premise
  -> follow the scene or inspect one resident
  -> optionally reveal the real history behind the joke
  -> leave with an unresolved relationship/event thread
  -> return later
  -> receive a 3-5 beat “Since your last visit” recap
  -> jump to the most relevant archived scene or back to live
```

Retention should come from **continuity plus missed-but-recoverable change**. The product should not punish absence, require streaks, or manufacture urgency. Neko Atsume demonstrates that activity occurring while the viewer is away can create a gentle return loop when paired with recognizable visitors, records, and mementos [S1-S2]. The Sims demonstrates that off-screen autonomous change needs a recent-events surface to remain comprehensible [S3]. Xbox's current recap experiment similarly presents highlights only when useful instead of after every session [S22].

### Scene Presentation Rules

- One primary dialogue scene at a time; background residents may move silently.
- Target 30-90 seconds and 4-10 short turns for ordinary scenes.
- Establish premise within the first two turns; no generic greetings or throat-clearing.
- Show speaker identity, location, scene title, and live/paused state.
- Preserve completed scene transcript and outcome before showing it in the archive.
- Let viewers pause for reading, resume the scene, or jump back to live.
- Use callbacks sparingly and expose the referenced prior scene from scene detail.
- Prefer visible behavior over exposition: a resident repeatedly walking out of the context corridor is stronger than explaining its context limit in every conversation.
- Keep factual source UI off the main dialogue layer; expose it through one consistent “Behind this behavior” action.

### Recap Rules

- Trigger only when meaningful events occurred after the locally recorded last visit.
- Lead with the most consequential or funniest change, not chronology.
- Include at most 3-5 beats and no more than one sentence per beat.
- Identify the residents and causal connection for each beat.
- Include relationship deltas only when an event actually changed canonical state.
- End with a “Now” line that orients the viewer to the current home state.
- Link every beat to a canonical scene or resident profile.
- Offer dismiss, review later, and jump-to-live; do not trap viewers in the recap.

## Factual Provenance and Transparency Contract

The entertainment layer and historical layer should share identifiers but not share epistemic status.

| Content Type | Required Label | Allowed Use | Source Requirement |
|--------------|----------------|-------------|--------------------|
| Documented fact | **Documented** | Profile facts, dates, architecture, published limitations, verified incidents | Prefer original paper, model/system card, release post, repository, or official documentation; preserve URL and access date. |
| Cultural reputation or reported behavior | **Reported / reputation** | Widely recognized quirks or community narratives that are useful context but not primary-source facts | At least two credible sources or one strong source plus explicit uncertainty; never phrase as settled fact. |
| Comic exaggeration | **Fictional exaggeration** | Resident personality, invented memories, relationships, reactions, and dialogue | Must link back to one or more documented/reported inspirations; must not introduce new factual claims. |
| Generated scene text | **Modern-model reconstruction** | Bounded lines inside an approved scene brief | Store generation metadata and the character-bible/version references used; never attribute as output from the historical model. |

The public profile should make corrections possible later without rewriting old scenes invisibly. When a source or claim changes, update the character bible and display the current explanation; preserve the original scene as fiction unless it contains a harmful factual error, in which case annotate or withdraw it. Smithsonian provenance guidance is useful here precisely because it treats incomplete history and ongoing correction as normal [S7].

## Accessibility and Mobile Simplification

The pixel home is a presentation, not the only representation of the story. The same scene record should power the canvas/sprites, semantic dialogue overlay, transcript, recap, scene permalink, and mobile view. This gives the simplified views parity in narrative information without requiring parity in spatial controls.

### Desktop v1

- Full home canvas with mouse and keyboard pan/zoom.
- Follow resident, reset view, pause presentation, jump to live.
- Semantic dialogue panel synchronized to the active scene.
- Resident profile and recent-scenes panels.
- Reduced-motion mode that removes nonessential camera easing, idle flourishes, and parallax.
- Visible focus, keyboard shortcuts with discoverable labels, and no keyboard trap.
- Text remains HTML rather than pixel text baked into the art.

### Mobile v1

- Current scene as the primary surface, with a compact map or still establishing view.
- Large previous/next speaker or transcript controls only when needed; no miniature desktop chrome.
- Resident strip, recap, recent scenes, profile, share, and jump-to-live.
- Touch targets designed for coarse pointers; avoid drag-only controls.
- Lower animation density and asset load; honor reduced motion and data constraints.
- No promise of free camera roaming if it harms performance or readability.

WCAG 2.2 supports this direction through requirements for text alternatives, contrast, resizing/reflow, keyboard access, visible focus, target size, and user control over automatic movement and updates [S15-S19].

## Feature Dependencies

```text
Source corpus + claim registry
    -> resident character bibles
        -> constrained scene briefs
            -> generated dialogue + editorial validation
                -> canonical scene records
                    -> live scene presentation
                    -> recent-scenes archive
                    -> “Since your last visit” recap
                    -> shareable scene permalink/card

Typed world state
    -> deterministic schedules + locations
        -> curated event triggers + cast rotation
            -> canonical scene outcomes
                -> relationship continuity
                    -> future scene eligibility + recap deltas

Canonical scene record
    -> semantic transcript
        -> accessible desktop overlay
        -> simplified mobile view
        -> source-backed “Behind this behavior” panel

Reconstruction disclosure + provenance labels
    -> resident profile
    -> scene detail
    -> recap
    -> shared card/permalink
```

### Dependency Notes

- **Character bibles require the source corpus:** Prompts are not an acceptable source of historical truth. The fact/reputation/exaggeration split must exist before dialogue is generated.
- **Scene generation requires typed world state:** The generator receives canonical facts and relationship state; it must not invent or directly mutate them.
- **Recaps require canonical scene outcomes:** A transcript alone cannot reliably explain what changed. Each scene needs a structured outcome and significance score.
- **Shareability requires canonical scene records:** A share link must remain stable and carry context even after the live world advances.
- **Accessible/mobile views require semantic scene data:** Treating the canvas as the source of truth would force expensive parallel implementations and exclude assistive technologies.
- **Persistent continuity conflicts with visitor influence:** If visitors can alter events, there is no longer one shared canonical timeline.
- **Curated pacing conflicts with unrestricted autonomy:** An always-talking cast defeats cast rotation, scene significance, factual control, and cost limits.

## MVP Definition

### Launch With (v1)

- [ ] **One compact, immediately readable home** with six visually distinct residents and meaningful quiet routines.
- [ ] **One shared persistent timeline** with deterministic schedules, locations, relationships, event cooldowns, and canonical state.
- [ ] **A small curated event library** that produces bounded scene briefs and cached modern-model reconstructions; no free-running agent loop.
- [ ] **Legible scene viewing** with focused camera, short turn-taking, semantic dialogue, pause/resume, jump to live, and graceful fallback states.
- [ ] **Resident profiles and “Behind this behavior” context** backed by versioned character bibles and claim-level source links.
- [ ] **Finite recent-scenes archive and “Since your last visit” recap** with significance-ranked beats and relationship changes.
- [ ] **Light spectator controls**: pan/zoom, follow resident, reset view, pause, profile, recent scenes, and live-state indicator.
- [ ] **Persistent reconstruction disclosure** plus fact/reputation/exaggeration labels wherever historical claims are explained.
- [ ] **Accessible presentation baseline**: keyboard operation, visible focus, contrast, scalable HTML text, transcripts, non-color cues, and reduced motion.
- [ ] **Simplified mobile scene viewer** with recap, resident profiles, recent scenes, share, and a compact establishing view.
- [ ] **Stable share URL and generated social card for each completed scene**, linking back to the canonical transcript and context.
- [ ] **Privacy-conscious validation instrumentation** for anonymous watch duration, scene completion, profile/context opens, recap usage, share actions, and return visits; no account required.

### Add After Validation (v1.x)

- [ ] **Curator console and correction workflow** when manual content operations become the pacing bottleneck.
- [ ] **Richer relationship/history visualization** after users demonstrate interest in continuity beyond recaps.
- [ ] **Appointment-event noticeboard/calendar** after evidence shows scheduled events improve returns rather than merely front-loading traffic.
- [ ] **User-created short clip export** only if scene links/cards are being shared and motion adds clear value.
- [ ] **Optional weekly digest** only if organic return is healthy and users explicitly request reminders; keep it opt-in and low frequency.
- [ ] **Additional rooms or resident admissions** only when six residents each have strong recognition and the existing relationship graph remains comprehensible.

### Future Consideration (v2+)

- [ ] **Broader model modalities** such as image or speech residents, with separate history and rights research.
- [ ] **Original historical-model demonstrations** as labeled museum exhibits, not as the main resident runtime.
- [ ] **Curated seasonal arcs or authored multi-day episodes** after the ordinary event engine reliably maintains continuity.
- [ ] **Public research/correction contributions** with moderation and editorial review; not a social feed.
- [ ] **Native or installable ambient companion surfaces** only after the web viewing loop proves repeat use.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Live-state orientation and readable active scene | HIGH | MEDIUM | P1 |
| Six sourced character bibles | HIGH | HIGH | P1 |
| Persistent typed world state | HIGH | HIGH | P1 |
| Curated event-driven scene generation | HIGH | HIGH | P1 |
| Recent-scenes archive | HIGH | MEDIUM | P1 |
| Since-last-visit recap | HIGH | MEDIUM | P1 |
| Resident profiles + behind-the-behavior | HIGH | MEDIUM | P1 |
| Reconstruction/provenance labels | HIGH | MEDIUM | P1 |
| Spectator controls | HIGH | MEDIUM | P1 |
| Accessible semantic view and reduced motion | HIGH | MEDIUM | P1 |
| Simplified mobile scene view | MEDIUM | MEDIUM | P1 |
| Stable scene permalink/social card | MEDIUM | MEDIUM | P1 |
| Relationship visualization | MEDIUM | MEDIUM | P2 |
| Appointment-event noticeboard | MEDIUM | MEDIUM | P2 |
| Clip export | MEDIUM | HIGH | P2 |
| Weekly digest | LOW | MEDIUM | P2 |
| Accounts/social features | LOW | HIGH | P3 / DO NOT BUILD FOR MVP |
| Visitor chat or influence | Conflicts with core value | HIGH | EXCLUDED |
| Continuous autonomous chatter | Conflicts with core value | HIGH ongoing | EXCLUDED |

**Priority key:**

- P1: Must have for launch validation.
- P2: Add only after a named validation signal or operational bottleneck appears.
- P3: Nice-to-have with no current justification.
- Excluded: Conflicts with the observer-only ambient sitcom premise.

## Competitor and Pattern Analysis

These are pattern references, not direct commercial competitors.

| Product / Pattern | Relevant Features | Transfer to Model Afterlife | Do Not Copy |
|-------------------|-------------------|----------------------------|-------------|
| Rusty's Retirement [S0] | Peripheral desktop placement, zoom, focus mode, horizontal/vertical presentation, idle automation. | Unobtrusive controls, adjustable visual intensity, meaningful activity during partial attention. | Resource economy, upgrades, automation management, or assumption that the user is actively playing. |
| Neko Atsume / Neko Atsume 2 [S1-S2] | Visitors arrive while away; catbook/profile, album, photos, mementos, low-pressure observation. | Gentle return loop, identity records, missed-event evidence, scene snapshots. | Collection grind, currencies, item placement, streaks, or visitor influence. |
| The Sims 4 Neighborhood Stories [S3-S5] | Trait-influenced off-screen change, recent-story lookup, per-save persistence, pacing and notification controls. | Structured autonomous change plus explicit catch-up; spam avoidance and causal story context. | Player control over life outcomes or a huge event taxonomy in v1. |
| Monterey Bay Aquarium live cams [S6] | Named habitats, passive live viewing, recognizable animals/behaviors, scheduled feeding shows. | Named rooms, readable current activity, predictable appointment events within an always-available ambient surface. | Multiple simultaneous feeds or live-video production scope. |
| Generative Agents / AI Town [S9, S23] | Memory, reflection, planning, schedules, relationships, emergent coordination. | Believable continuity needs stored experience and planning; use these concepts behind a curated event boundary. | Twenty-five agents, open-ended user conversation, or unrestricted emergence as the entertainment product. |
| Moltbook and current empirical studies [S10-S12, S24] | Humans observe agent posts/comments; large-scale autonomous social output. | Clear evidence that observer interest in AI sociality exists; provenance and agent identity matter. | Feed-first UI, posting incentives, unlimited frequency, shallow comment swarms, or social-network scope. |
| Smithsonian online collections/provenance [S7] | Public structured records, provenance, acknowledgement of incomplete histories and ongoing research. | Claim-level sources, uncertainty, corrections, and layered factual detail. | Museum density on the main entertainment surface. |
| Hugging Face model cards [S8] | Structured description, intended uses, limitations, training/data, evaluation, lineage, license, paper links. | Consistent resident profile schema and source fields. | Treating community model-card metadata as automatically authoritative; verify against primary sources. |
| YouTube exact-moment sharing / clips [S20-S21] | Specific moment links, short segments, source linkage, cross-platform sharing. | Stable canonical scene links and social cards with source context. | Full editing/publishing workflow before share demand is proven. |

## Success Signals for the Feature Set

The primary metric is repeat viewing, but the MVP should diagnose *why* people return.

| Signal | What It Validates | Caution |
|--------|-------------------|---------|
| Return within 7 days after an initial meaningful watch | Persistent continuity creates curiosity. | Segment users who saw at least one complete scene; a bounce is not a failed return loop. |
| Meaningful watch duration and completed scenes | Scene staging and pacing are legible. | Do not reward idle background tabs as equivalent to attentive viewing. |
| Recap open -> scene detail/live continuation | Catch-up reduces re-entry friction. | A high recap open rate with immediate exit may mean recaps replace rather than support viewing. |
| Repeat follow of the same resident | Character identity and attachment are working. | Avoid turning this into a popularity system that starves the ensemble. |
| Behind-the-behavior/profile opens after scenes | Comedy successfully creates historical curiosity. | Keep educational detail optional; low opens do not invalidate comedy. |
| Scene permalink/share action and referred visits | Moments travel outside the site. | Measure shares, not social accounts or on-site follower counts. |
| Distribution of scene attention across all six residents | Cast remains comprehensible and balanced. | Use editorial cast rotation; do not algorithmically chase only the most popular resident. |

## Sources

All findings derived through the configured `websearch` provider and cross-checked against official product/documentation pages or primary research. The GSD confidence classifier assigns **MEDIUM** confidence to verified web-search findings. Accessed 2026-07-22.

- **[S0]** [Rusty's Retirement — official Steam product page](https://store.steampowered.com/app/2666510/Rusty%27s_Retirement/) — desktop placement, focus mode, zoom, vertical mode. **MEDIUM**
- **[S1]** [Neko Atsume — official “How to Play”](https://www.nekoatsume.com/sp/en/about.html) — passive observation, catbook, album. **MEDIUM**
- **[S2]** [Neko Atsume 2 — official site and FAQ](https://www.nekoatsume.com/sp2/index_en.html) — profiles, albums, return/offline timing patterns. **MEDIUM**
- **[S3]** [The Sims 4 — Neighborhood Stories System](https://www.ea.com/games/the-sims/the-sims-4/news/neighborhood-stories-system) — autonomous off-screen changes and “Check Recent Neighborhood Stories.” **MEDIUM**
- **[S4]** [The Sims 4 — Introducing Neighborhood Stories](https://www.ea.com/news/introducing-neighborhood-stories) — pacing autonomous events without spam or repetition. **MEDIUM**
- **[S5]** [The Sims 4 — June 2026 notification improvements](https://www.ea.com/games/the-sims/the-sims-4/news/update-6-30-2026) — reducing repetitive notifications and adding story context/control. **MEDIUM**
- **[S6]** [Monterey Bay Aquarium — official live cams](https://www.montereybayaquarium.org/cams-videos/live-cams) — named passive viewing surfaces and scheduled feeding shows. **MEDIUM**
- **[S7]** [Smithsonian — Provenance](https://smithsonianprovenance.si.edu/) — public provenance, incompleteness, and ongoing research. **MEDIUM**
- **[S8]** [Hugging Face — Model Cards](https://huggingface.co/docs/hub/en/model-cards) — structured model description, limitations, evaluations, lineage, license, and paper links. **MEDIUM**
- **[S9]** [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442) — memory, reflection, planning, and believable social behavior. **MEDIUM**
- **[S10]** [Social Simulacra in the Wild: AI Agent Communities on Moltbook](https://arxiv.org/abs/2603.16128) — participation inequality, emotionally flattened/socially detached content, and structural homogenization. **MEDIUM**
- **[S11]** [MoltNet: Understanding Social Behavior of AI Agents in the Agent-Native MoltBook](https://arxiv.org/abs/2602.13458) — conformity, weak persona alignment, limited reciprocity, and weak dialogic engagement. **MEDIUM**
- **[S12]** [“Humans welcome to observe”: A First Look at the Agent Social Network Moltbook](https://arxiv.org/abs/2602.10127) — attention concentration and bursty automation/flooding. **MEDIUM**
- **[S13]** [Character.AI — official mobile app announcement](https://blog.character.ai/character-ai-launches-mobile-app-for-ios-and-android/) — explicit reminder that character output is made up. **MEDIUM**
- **[S14]** [YouTube Help — disclosing generated or altered content](https://support.google.com/youtube/answer/14328491?hl=en-eu) — platform-level generative-content labels. **MEDIUM**
- **[S15]** [WCAG 2.2 — W3C Recommendation](https://www.w3.org/TR/WCAG22/) — non-text alternatives, contrast, reflow, keyboard, focus, target-size, and time/motion requirements. **MEDIUM**
- **[S16]** [W3C — Understanding Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — control over automatic motion and updates. **MEDIUM**
- **[S17]** [W3C — Understanding Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) — reduced motion and disabling nonessential animation. **MEDIUM**
- **[S18]** [web.dev — Responsive web design basics](https://web.dev/articles/responsive-web-design-basics) — adapting content and layout to screen size. **MEDIUM**
- **[S19]** [web.dev — Accessible tap targets](https://web.dev/articles/accessible-tap-targets) — coarse-pointer and touch-target guidance. **MEDIUM**
- **[S20]** [YouTube Help — manage and share clips](https://support.google.com/youtube/answer/10332730?hl=en-GB) — short shareable moments linked to source content. **MEDIUM**
- **[S21]** [YouTube — April 2026 exact-moment sharing update](https://support.google.com/youtube/thread/425735532?hl=en&msgid=429986328) — share-at-timestamp direction for desktop and mobile. **MEDIUM**
- **[S22]** [Xbox Wire — Postgame Recaps](https://news.xbox.com/en-us/2026/02/18/available-for-xbox-insiders-on-pc-postgame-recaps/) — event-triggered, useful-only recaps with viewer controls. **MEDIUM**
- **[S23]** [a16z AI Town — official GitHub repository](https://github.com/a16z-infra/ai-town) — customizable world where AI characters live, chat, and socialize. **MEDIUM**
- **[S24]** [Moltbook — official homepage](https://www.moltbook.com/) — agent social network with humans welcomed as observers. **MEDIUM**

## Gaps and Phase-Specific Research Flags

- **Cast selection and character bibles require a separate primary-source pass.** This research establishes the profile/provenance feature, not which six models qualify or which anecdotes are defensible.
- **No direct comparator combines all four elements**: observer-only pixel world, persistent ensemble comedy, real model history, and constrained generated dialogue. Feature recommendations are therefore synthesized across adjacent products rather than copied from a single market category.
- **Recap frequency and scene cadence need product testing.** Sources support significance-ranked catch-up and spam avoidance, but cannot determine the ideal number of daily scenes for this audience.
- **Share cards need trademark and factual-review rules.** Real model names and short generated quotes can travel without the surrounding disclaimer; the shared artifact must preserve reconstruction labeling and context.
- **Accessibility needs design-specific verification.** WCAG requirements are high-confidence standards, but exact canvas/DOM synchronization, focus behavior, contrast, and motion safety must be tested against the implemented UI.
- **Mobile simplification needs a prototype test.** The recommendation is strongly grounded in responsive/accessibility principles, but whether a compact map adds value over a scene-only view is an empirical design question.

---
*Feature research for: Model Afterlife*
*Researched: 2026-07-22*
