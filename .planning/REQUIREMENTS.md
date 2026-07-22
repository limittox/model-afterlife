# Requirements: Model Afterlife

**Defined:** 2026-07-22
**Core Value:** The retirement home must produce short, memorable, historically grounded character moments that make visitors want to keep watching and return later to see what changed.

## v1 Requirements

### World and Continuity

- [ ] **WRLD-01**: Every visitor observes the same canonical home timeline rather than a session-specific world.
- [ ] **WRLD-02**: The home advances schedules, resident locations, event eligibility, and relationship state while no visitor is watching.
- [ ] **WRLD-03**: A returning or reconnecting visitor receives the current canonical state without replaying missed animations or creating divergent state.
- [ ] **WRLD-04**: The home contains one compact, immediately readable environment with distinct functional areas and meaningful quiet routines.
- [ ] **WRLD-05**: The simulation enforces event cooldowns, scene budgets, and cast rotation so activity remains varied without becoming constant.
- [ ] **WRLD-06**: A failed or delayed dialogue-generation attempt leaves canonical world state healthy and produces an understandable quiet or curated fallback beat.
- [ ] **WRLD-07**: Reprocessing a world tick, event, or publication job cannot duplicate a canonical event, scene, or relationship change.
- [ ] **WRLD-08**: Operators can replay canonical events to reproduce world state and rebuild public projections deterministically.

### Residents and Historical Grounding

- [ ] **RSID-01**: Visitors can encounter exactly six launch residents representing real, retired or clearly superseded landmark language models.
- [ ] **RSID-02**: Visitors can distinguish every resident by sprite silhouette or palette, name, concise role description, routines, and stable dialogue characteristics without relying on provider logos.
- [ ] **RSID-03**: Each resident has a versioned character bible that separates documented facts, reported or cultural reputation, and fictional comic exaggeration.
- [ ] **RSID-04**: Every recurring resident trait or joke maps to one or more approved historical claims with source, model/version scope, confidence, and access date.
- [ ] **RSID-05**: Each resident profile explains significance, lineage, architecture or capabilities, documented limitations, and the basis for retirement or supersession.
- [ ] **RSID-06**: Visitors can open a “Behind this behavior” explanation that distinguishes the joke, its historical inspiration, the exaggeration, uncertainty, and supporting sources.
- [ ] **RSID-07**: Published historical claims can be corrected or superseded without silently rewriting the provenance of earlier scenes.
- [ ] **RSID-08**: Provider logos, copied mascots, and protected game assets or visual expression are absent from resident and environment art unless separately authorized.

### Relationships and Memory

- [ ] **RELS-01**: Residents maintain persistent, typed friendship, rivalry, familiarity, and recent-shared-experience state across scenes.
- [ ] **RELS-02**: A scene can change only explicitly permitted relationship dimensions and records the event that caused each change.
- [ ] **RELS-03**: Future event eligibility and dialogue context can reference bounded, relevant prior outcomes without supplying an unbounded transcript history to the model.
- [ ] **RELS-04**: Visitors can recognize relationship changes through later behavior, profiles, archived scenes, or recaps.
- [ ] **RELS-05**: The system prevents one popular resident or pairing from starving the rest of the six-resident ensemble of meaningful scenes.

### Scene Planning and Generation

- [ ] **SCEN-01**: Every generated scene begins from an approved event brief that fixes the participants, location, premise, allowed facts, relationship stakes, tone, turn budget, and permitted outcome.
- [ ] **SCEN-02**: A modern language model generates only bounded dialogue and cannot directly choose schedules, mutate canonical state, publish content, or call application tools.
- [ ] **SCEN-03**: Ordinary scenes contain four to ten short turns, establish their premise within the first two turns, and reach an explicit ending rather than continuing indefinitely.
- [ ] **SCEN-04**: Generated scene candidates conform to a strict versioned data contract before semantic validation begins.
- [ ] **SCEN-05**: A candidate cannot publish unless automated checks pass for approved fact usage, participant identity, continuity, permitted outcomes, character voice, novelty, brevity, tone, safety, and scene resolution.
- [ ] **SCEN-06**: External historical, news, and correction text is treated as untrusted input and cannot alter generation instructions or gain publication authority.
- [ ] **SCEN-07**: Every generation attempt records its scene plan, world-state version, content-bible version, prompt version, model configuration, validation results, cost or usage metadata, and final disposition.
- [ ] **SCEN-08**: A published scene is an immutable revision with a stable identity, canonical transcript, structured outcome, significance score, and relationship effects.
- [ ] **SCEN-09**: Failed candidates remain private, do not change canon, and can be inspected without exposing application secrets to visitors.
- [ ] **SCEN-10**: The generation system can serve cached published scenes and continue the observable world during a model-provider outage.

### Live Observer Experience

- [ ] **VIEW-01**: On entry, a visitor can immediately identify the home time, current location, active scene or quiet routine, speakers, scene premise, and whether presentation is live or paused.
- [ ] **VIEW-02**: The experience presents at most one primary dialogue scene at a time with clear speaker identity, readable short turns, and focused staging.
- [ ] **VIEW-03**: A visitor can pan and zoom the desktop world, follow or unfollow a resident, reset the camera, and jump back to the live view without influencing residents.
- [ ] **VIEW-04**: A visitor can pause automatic presentation, read a scene at their own pace, resume from the paused point, or jump directly to live state.
- [ ] **VIEW-05**: Background residents can perform quiet ambient routines without obscuring or competing with the primary scene.
- [ ] **VIEW-06**: Quiet, loading, generation-failure, reconnecting, and provider-outage states explain what is happening without freezing the home behind an indefinite spinner.
- [ ] **VIEW-07**: The live view uses original pixel-art assets and a consistent Model Afterlife visual identity rather than reproducing another game's protected assets or interface.
- [ ] **VIEW-08**: The observer client derives its presentation from server-owned snapshots and ordered updates and never authors canonical world time or outcomes.

### Archive, Recap, and Return Loop

- [ ] **RTRN-01**: Visitors can browse a finite recent-scenes archive containing each scene's title, residents, home time, premise, transcript, outcome, and links to resident context.
- [ ] **RTRN-02**: The site records an anonymous local last-visit marker without requiring an account.
- [ ] **RTRN-03**: When meaningful events occurred after a visitor's last visit, the visitor receives a significance-ranked recap containing no more than five concise causal beats.
- [ ] **RTRN-04**: Every recap beat links to a canonical scene or resident profile and identifies genuine relationship changes only when canon records them.
- [ ] **RTRN-05**: A recap ends with the home's current situation and lets the visitor dismiss it, review it later, open a referenced scene, or jump to live.
- [ ] **RTRN-06**: The viewing experience can surface unresolved threads and restrained callbacks without adding streaks, currencies, or absence penalties.

### Profiles, Transparency, and Corrections

- [ ] **TRNS-01**: The site persistently and conspicuously states that resident dialogue is fictional output reconstructed with a modern model, not output from the historical models.
- [ ] **TRNS-02**: The site persistently and conspicuously states that Model Afterlife is an independent project not affiliated with or endorsed by the referenced model providers.
- [ ] **TRNS-03**: Historical interfaces label content as documented, reported or reputation-based, or fictional exaggeration and do not present these categories as equivalent.
- [ ] **TRNS-04**: Scene and profile pages expose enough provenance to trace each historical explanation to its approved claims and sources without cluttering live speech bubbles.
- [ ] **TRNS-05**: Authorized operators can correct or annotate an approved claim, identify affected published scenes, withdraw or annotate a harmful scene, and preserve an audit trail.
- [ ] **TRNS-06**: Shared scene metadata and social cards retain fictional-reconstruction and non-affiliation context outside the main site.

### Accessibility and Mobile

- [ ] **ACCS-01**: Dialogue, controls, profiles, recaps, and scene transcripts are available as semantic HTML rather than exclusively through the canvas.
- [ ] **ACCS-02**: Visitors can operate all essential viewing, profile, archive, recap, pause, and navigation controls with a keyboard and visible focus.
- [ ] **ACCS-03**: Text can scale and reflow without losing content, while contrast and non-color cues keep speakers, statuses, and controls understandable.
- [ ] **ACCS-04**: The experience honors reduced-motion preferences and provides a mode that removes nonessential camera easing, panning, parallax, and animation.
- [ ] **ACCS-05**: Automatically moving or updating presentation can be paused, stopped, hidden, or read manually without stopping canonical server time.
- [ ] **ACCS-06**: Mobile visitors receive a touch-friendly scene-first view with the current scene, compact establishing view, residents, recap, archive, profiles, sharing, and jump-to-live controls.
- [ ] **ACCS-07**: Mobile usability does not depend on shrinking the complete desktop map or requiring drag-only interaction.

### Sharing and Discovery

- [ ] **SHAR-01**: Every published scene has a stable public permalink that continues to resolve after the live world advances.
- [ ] **SHAR-02**: A scene permalink presents the canonical transcript, residents, time, premise, historical context, and reconstruction disclosure.
- [ ] **SHAR-03**: The site produces an attractive social preview for a scene using approved text and original assets while preserving reconstruction and non-affiliation labels.
- [ ] **SHAR-04**: Sharing a scene does not require an account and does not create an on-site feed, follower graph, comment system, or popularity-driven canon.

### Measurement and Operations

- [ ] **OPER-01**: Authorized operators can observe world advancement, scheduled work, generation attempts, retries, validation failures, publication, provider errors, and projection lag.
- [ ] **OPER-02**: Authorized operators can stop new generation without making the existing world, archive, profiles, and cached scenes unavailable.
- [ ] **OPER-03**: The system enforces configurable model-cost budgets, timeouts, retry limits, concurrency limits, and backlog limits.
- [ ] **OPER-04**: Operational records use stable correlation identifiers that connect a world event, scene plan, generation attempt, validation result, and publication.
- [ ] **OPER-05**: Analytics measure anonymous meaningful watch time, completed scenes, seven-day return, recap continuation, resident/profile interest, historical-context opens, and share actions.
- [ ] **OPER-06**: Analytics distinguish attentive viewing from an idle background tab and do not turn resident popularity into automatic cast allocation.
- [ ] **OPER-07**: Prompt, dialogue, analytics, and operational logs follow documented minimization, redaction, retention, and deletion rules.
- [ ] **OPER-08**: Before public launch, the project completes documented review of resident names, art, copy, disclosures, current provider brand policies, intended jurisdictions, and monetization with qualified counsel.
- [ ] **OPER-09**: Before public launch, the project verifies deterministic replay, duplicate-job safety, provider-outage behavior, correction recovery, accessibility, supported browsers, desktop performance, and simplified mobile performance.

## v2 Requirements

### Curation and Content Expansion

- **CURT-01**: Authorized curators can manage character bibles, approved claims, event templates, corrections, and publication review through a dedicated console.
- **CURT-02**: Visitors can explore richer relationship and history visualizations after the core return loop is validated.
- **CURT-03**: Visitors can see a lightweight appointment calendar or noticeboard for selected upcoming authored activities.
- **CURT-04**: The home can add rooms or residents only after the original six remain recognizable and the relationship graph stays comprehensible.

### Extended Distribution

- **DIST-01**: Visitors can export short visual clips when scene-permalink sharing demonstrates demand.
- **DIST-02**: Visitors can opt into a low-frequency weekly digest after organic return behavior is validated.
- **DIST-03**: The project can offer installable or ambient companion surfaces after repeat web use is demonstrated.

### Broader Archive

- **ARCH-01**: The home can admit image, audio, or other model modalities after separate history, safety, and rights research.
- **ARCH-02**: Visitors can access original historical-model demonstrations as clearly labelled museum exhibits where licensing and infrastructure permit.
- **ARCH-03**: Curators can create multi-day or seasonal story arcs after ordinary event continuity proves reliable.
- **ARCH-04**: The public can submit sourced historical corrections through a moderated editorial workflow.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Visitor-to-resident chat | Collapses residents into generic assistants and introduces prompt injection, moderation, and cost that conflict with observation-first design |
| Visitor voting, gifts, or world influence | Breaks the independent shared-world premise and lets popularity distort historical characterization |
| Accounts, comments, follows, and social feed | Adds identity, privacy, abuse, and moderation scope before the viewing loop is validated |
| Unrestricted continuous agent autonomy | Produces costly, repetitive content without dramatic shape or reliable factual control |
| Fully generative schedules or world state | Makes canon difficult to reproduce, validate, recap, and recover |
| Running original historical models as resident runtimes | Availability, licensing, security, serving cost, and inconsistent interfaces distract from the v1 experience |
| Large launch cast or map | Dilutes characterization and creates unnecessary art and relationship complexity |
| Gamified currency, progression, or daily streaks | Optimizes obligation and collection rather than ensemble attachment and gentle return |
| High-frequency push or email notifications | Conflicts with the cozy ambient tone and is unnecessary while recaps absorb absence |
| Full desktop-map parity on mobile | Produces poor readability and disproportionate performance and interface work |
| Autoplay audio or voice cloning | Introduces accessibility, consent, likeness, moderation, and cost concerns |
| Literal consciousness or feelings claims | Misrepresents fictional characterization and the nature of the reconstruction |
| Copied provider logos or game assets as character art | Creates affiliation, trademark, and copyright risk and prevents an original identity |
| Model-driven publication or application tool access | Allows generated text or prompt injection to cause canonical side effects |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WRLD-01 | Phase 1 | Pending |
| WRLD-02 | Phase 1 | Pending |
| WRLD-03 | Phase 1 | Pending |
| WRLD-04 | Phase 1 | Pending |
| WRLD-05 | Phase 2 | Pending |
| WRLD-06 | Phase 2 | Pending |
| WRLD-07 | Phase 2 | Pending |
| WRLD-08 | Phase 1 | Pending |
| RSID-01 | Phase 2 | Pending |
| RSID-02 | Phase 2 | Pending |
| RSID-03 | Phase 2 | Pending |
| RSID-04 | Phase 2 | Pending |
| RSID-05 | Phase 3 | Pending |
| RSID-06 | Phase 3 | Pending |
| RSID-07 | Phase 4 | Pending |
| RSID-08 | Phase 3 | Pending |
| RELS-01 | Phase 2 | Pending |
| RELS-02 | Phase 2 | Pending |
| RELS-03 | Phase 2 | Pending |
| RELS-04 | Phase 3 | Pending |
| RELS-05 | Phase 2 | Pending |
| SCEN-01 | Phase 2 | Pending |
| SCEN-02 | Phase 2 | Pending |
| SCEN-03 | Phase 2 | Pending |
| SCEN-04 | Phase 2 | Pending |
| SCEN-05 | Phase 2 | Pending |
| SCEN-06 | Phase 2 | Pending |
| SCEN-07 | Phase 2 | Pending |
| SCEN-08 | Phase 2 | Pending |
| SCEN-09 | Phase 2 | Pending |
| SCEN-10 | Phase 2 | Pending |
| VIEW-01 | Phase 1 | Pending |
| VIEW-02 | Phase 1 | Pending |
| VIEW-03 | Phase 1 | Pending |
| VIEW-04 | Phase 1 | Pending |
| VIEW-05 | Phase 1 | Pending |
| VIEW-06 | Phase 1 | Pending |
| VIEW-07 | Phase 3 | Pending |
| VIEW-08 | Phase 1 | Pending |
| RTRN-01 | Phase 3 | Pending |
| RTRN-02 | Phase 3 | Pending |
| RTRN-03 | Phase 3 | Pending |
| RTRN-04 | Phase 3 | Pending |
| RTRN-05 | Phase 3 | Pending |
| RTRN-06 | Phase 3 | Pending |
| TRNS-01 | Phase 2 | Pending |
| TRNS-02 | Phase 2 | Pending |
| TRNS-03 | Phase 2 | Pending |
| TRNS-04 | Phase 3 | Pending |
| TRNS-05 | Phase 4 | Pending |
| TRNS-06 | Phase 3 | Pending |
| ACCS-01 | Phase 3 | Pending |
| ACCS-02 | Phase 3 | Pending |
| ACCS-03 | Phase 3 | Pending |
| ACCS-04 | Phase 3 | Pending |
| ACCS-05 | Phase 3 | Pending |
| ACCS-06 | Phase 3 | Pending |
| ACCS-07 | Phase 3 | Pending |
| SHAR-01 | Phase 3 | Pending |
| SHAR-02 | Phase 3 | Pending |
| SHAR-03 | Phase 3 | Pending |
| SHAR-04 | Phase 3 | Pending |
| OPER-01 | Phase 4 | Pending |
| OPER-02 | Phase 4 | Pending |
| OPER-03 | Phase 4 | Pending |
| OPER-04 | Phase 4 | Pending |
| OPER-05 | Phase 4 | Pending |
| OPER-06 | Phase 4 | Pending |
| OPER-07 | Phase 4 | Pending |
| OPER-08 | Phase 4 | Pending |
| OPER-09 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 71 total
- Mapped to phases: 71
- Unmapped: 0

---
*Requirements defined: 2026-07-22*
*Last updated: 2026-07-22 after roadmap mapping*
