# Roadmap: Model Afterlife

## Overview

Model Afterlife reaches v1 through four vertical increments. It first proves that multiple visitors can watch the same server-owned home, then introduces the historically grounded six-resident ensemble and governed dialogue pipeline, completes the accessible return-and-sharing loop, and finally establishes the operational and review evidence required for a safe public launch.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Shared Watchable Home** - Prove one persistent canonical home that multiple visitors can watch, navigate, pause, and rejoin. (completed 2026-07-22)
- [x] **Phase 2: Grounded Ensemble and Safe Scenes** - Introduce six source-grounded residents whose bounded generated scenes and relationships can safely become canon. (completed 2026-07-24)
- [ ] **Phase 3: Return Loop and Inclusive Presentation** - Turn trustworthy scenes into an original, accessible experience worth revisiting, exploring, and sharing.
- [ ] **Phase 4: Safe Public Operation** - Make the complete experience measurable, recoverable, cost-bounded, correctable, and ready for public release review.

## Phase Details

### Phase 1: Shared Watchable Home

**Goal:** Visitors can observe and control the presentation of one compact home whose canonical timeline advances independently of every browser.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** WRLD-01, WRLD-02, WRLD-03, WRLD-04, WRLD-08, VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, VIEW-08
**Success Criteria** (what must be TRUE):

  1. Two visitors opening the home at the same time see the same home time, resident locations, and primary scene, and a returning or reconnecting visitor catches up to that shared state without replaying missed movement.
  2. The compact home makes its functional areas, current location, speakers, premise, live-or-paused state, one primary scene, and background quiet routines immediately understandable.
  3. A desktop visitor can pan, zoom, follow or unfollow a resident, reset the camera, pause and read dialogue, resume, and jump to live without influencing the residents.
  4. Quiet periods, loading, reconnection, and unavailable-scene states remain watchable and explain what is happening instead of leaving an indefinite spinner or frozen home.
  5. Rebuilding from the canonical event history reproduces the same public state, while client-side time or outcome changes never alter canon.

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Establish the audited PostgreSQL-backed observer walking skeleton.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Build deterministic world advancement, journaling, replay, and scheduled catch-up.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Implement the semantic observer, local presentation state, and recovery matrix.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Add the original pixel home, local camera controls, and two-viewer verification.

**UI hint**: yes

### Phase 2: Grounded Ensemble and Safe Scenes

**Goal:** Visitors can follow a distinct six-model ensemble whose short improvised scenes remain historically grounded, finite, varied, and safe to publish.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** WRLD-05, WRLD-06, WRLD-07, RSID-01, RSID-02, RSID-03, RSID-04, RELS-01, RELS-02, RELS-03, RELS-05, SCEN-01, SCEN-02, SCEN-03, SCEN-04, SCEN-05, SCEN-06, SCEN-07, SCEN-08, SCEN-09, SCEN-10, TRNS-01, TRNS-02, TRNS-03
**Success Criteria** (what must be TRUE):

  1. Visitors encounter exactly six real landmark language-model residents and can distinguish each by original silhouette or palette, name, role, routines, and stable voice, with every recurring trait tied to a versioned claim or explicitly labelled exaggeration.
  2. Each improvised scene follows an approved brief, presents its premise within two turns, lasts four to ten short turns, reaches an ending, and publishes only after its structured output, facts, continuity, voice, novelty, tone, safety, and outcome pass validation.
  3. Friendships, rivalries, familiarity, and recent shared experiences persist across scenes; permitted changes have visible causes; and cooldowns, scene budgets, and cast balancing prevent repetitive or dominant pairings.
  4. Failed, delayed, retried, duplicated, or provider-blocked generation cannot corrupt or duplicate canon: visitors receive a quiet, curated, or cached beat, while operators can inspect private attempts and immutable published revisions with their inputs, versions, validation, usage, and effects.
  5. Wherever residents or historical categories appear, visitors can see that dialogue is a staged fictional interaction authored turn-by-turn by the identified resident model APIs, not autonomous communication; the project is not provider-affiliated; and supporting material is labelled as documented fact, reported reputation, or comic exaggeration.

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 02-01-PLAN.md - Prove the private-attempt-to-atomic-publication production tracer and honest observer states.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md - Admit and present the exact six grounded, callable, superseded model residents.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md - Add replayable typed relationships, bounded memory, cast balance, and outage continuity.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-04-PLAN.md - Complete calibrated publication gates, private telemetry, frozen/live evaluation, and final Phase 2 proof.

### Phase 3: Return Loop and Inclusive Presentation

**Goal:** Visitors can understand the ensemble, catch up on meaningful change, and enjoy or share the original experience across desktop, mobile, keyboard, and reduced-motion paths.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** RSID-05, RSID-06, RSID-08, RELS-04, VIEW-07, RTRN-01, RTRN-02, RTRN-03, RTRN-04, RTRN-05, RTRN-06, TRNS-04, TRNS-06, ACCS-01, ACCS-02, ACCS-03, ACCS-04, ACCS-05, ACCS-06, ACCS-07, SHAR-01, SHAR-02, SHAR-03, SHAR-04
**Success Criteria** (what must be TRUE):

  1. The home has a coherent original pixel-art identity, and each resident profile explains significance, lineage, capabilities, limitations, supersession, relationships, and the sourced historical inspiration and uncertainty behind recurring behavior without using unauthorized logos or copied assets.
  2. A returning visitor receives at most five significance-ranked causal beats linking to real scenes or resident changes, can dismiss or revisit the recap and jump to live, and can browse a finite archive while noticing restrained callbacks and unresolved threads without streaks or absence penalties.
  3. All dialogue, controls, profiles, recaps, and transcripts remain available as scalable semantic content with keyboard operation, visible focus, sufficient contrast, non-color cues, reduced motion, and manual control over automatically moving or updating presentation.
  4. A mobile visitor can use a touch-friendly, scene-first presentation with a compact establishing view, residents, recap, archive, profiles, sharing, and jump-to-live controls without depending on a shrunken desktop map or drag-only interaction.
  5. Any published scene can be opened at a stable public page showing its canonical transcript, cast, home time, premise, historical provenance, exact resident-model authorship, and staged-fiction disclosure, then shared without an account through an original social preview that retains AI-authorship and non-affiliation context.

**Plans:** 2/7 plans executed
**Wave 1**

- [x] 03-01-PLAN.md

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02-PLAN.md

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 03-03-PLAN.md

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 03-04-PLAN.md

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 03-05-PLAN.md

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 03-06-PLAN.md

**Wave 7** *(blocked on Wave 6 completion)*

- [ ] 03-07-PLAN.md

**UI hint**: yes

### Phase 4: Safe Public Operation

**Goal:** The complete public experience can run continuously within explicit quality, privacy, cost, recovery, correction, and release-safety boundaries.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** RSID-07, TRNS-05, OPER-01, OPER-02, OPER-03, OPER-04, OPER-05, OPER-06, OPER-07, OPER-08, OPER-09
**Success Criteria** (what must be TRUE):

  1. An authorized operator can trace a world event through scheduling, planning, generation, validation, publication, and projection using stable correlation identifiers, see failures or lag, and stop new generation without taking the existing home, archive, profiles, or cached scenes offline.
  2. Configured cost budgets, timeouts, retry limits, concurrency limits, and backlog limits visibly contain generation demand and prevent an outage or repeated job from becoming unbounded work.
  3. An authorized operator can correct or supersede a historical claim, find every affected scene, annotate or withdraw harmful material, rebuild the affected public state, and retain the earlier provenance and complete audit trail.
  4. Anonymous measurement reports attentive watch time, scene completion, return, recap continuation, profile or historical-context interest, and sharing while excluding idle-tab time, avoiding popularity-driven cast allocation, and obeying documented minimization, redaction, retention, and deletion rules.
  5. Before public release, recorded verification covers deterministic replay, duplicate safety, provider outage, correction recovery, accessibility, supported browsers, desktop and mobile performance, and qualified review of names, art, copy, disclosures, current provider policies, jurisdictions, and monetization.

**Plans:** TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shared Watchable Home | 4/4 | Complete    | 2026-07-22 |
| 2. Grounded Ensemble and Safe Scenes | 4/4 | Complete | 2026-07-24 |
| 3. Return Loop and Inclusive Presentation | 2/7 | In Progress|  |
| 4. Safe Public Operation | 0/TBD | Not started | - |
