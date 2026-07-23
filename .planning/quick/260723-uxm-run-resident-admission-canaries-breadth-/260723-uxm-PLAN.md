---
phase: quick
plan: 260723-uxm
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/world/generation/run-admission-canaries.ts
  - tests/integration/resident-admission.test.ts
autonomous: true
requirements:
  - QUICK-260723-UXM
must_haves:
  truths:
    - "Admission generation runs breadth-first by sample ordinal and, within each ordinal, in RESIDENT_PROVIDER_PROFILES registry order."
    - "A first-round Gemini failure stops after exactly three mocked generation calls while retaining the sanitized ResidentAdmissionError contract."
    - "A successful admission remains deterministic: 30 mocked generation calls, five sanitized samples per resident, and registry-order resident summaries."
    - "Regression verification never invokes live admission dependencies or requires an OPENROUTER_API_KEY."
  artifacts:
    - path: "tests/integration/resident-admission.test.ts"
      provides: "Regression coverage for ordinal-major call order, early stop cost, and deterministic success output."
    - path: "src/features/world/generation/run-admission-canaries.ts"
      provides: "Serial breadth-first admission scheduler with unchanged validation, aggregation, and sanitized failure behavior."
  key_links:
    - from: "src/features/world/generation/run-admission-canaries.ts"
      to: "src/features/world/generation/provider-registry.ts"
      via: "RESIDENT_PROVIDER_PROFILES supplies both within-round execution order and final summary order."
    - from: "tests/integration/resident-admission.test.ts"
      to: "runAdmissionCanaries"
      via: "Mocked checkCatalog and generateSample dependencies record residentId/ordinal calls without network access."
---

<objective>
Run resident admission canaries breadth-first by sample ordinal so an early resident failure consumes only the current round's preceding generation calls, without changing successful admission content or ordering.

Purpose: Reduce paid canary work before a failure is surfaced while preserving deterministic, reviewable admission summaries.
Output: A regression-locked ordinal-major runner and mocked integration coverage for early failure and the complete 30-call success path.
</objective>

<execution_context>
@D:/code/model-afterlife/.codex/gsd-core/workflows/execute-plan.md
@D:/code/model-afterlife/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@AGENTS.md
@src/features/world/generation/run-admission-canaries.ts
@src/features/world/generation/provider-registry.ts
@tests/integration/resident-admission.test.ts
@package.json

<interfaces>
From src/features/world/generation/run-admission-canaries.ts:
- `runAdmissionCanaries(options: { samples: number; checkedAt?: string }, dependencies: AdmissionDependencies): Promise<AdmissionSummary>`
- `AdmissionDependencies.checkCatalog(profile): Promise<AdmissionCatalogEvidence>`
- `AdmissionDependencies.generateSample(profile, ordinal, catalogEvidence): Promise<RawAdmissionSample>`
- `ResidentAdmissionError` must continue exposing only `residentId`, `approvedUpstream`, and sanitized `code`.

From src/features/world/generation/provider-registry.ts:
- `RESIDENT_PROVIDER_PROFILES` order is `gpt-4o`, `claude-sonnet-4.5`, `gemini-2.5-pro`, `deepseek-r1-0528`, `llama-3.3-70b-instruct`, `qwen-2.5-7b-instruct`.
</interfaces>

<guardrails>
- Use only mocked dependencies in tests; do not run `check:resident-admission` or any `--live` command.
- Modify and stage only the two files in `files_modified`.
- Preserve the user-owned `next-env.d.ts` modification and the untracked `.codex/` tree exactly as found.
- Keep sampling serial. Do not use Promise.all for generation because deterministic order and immediate stop-on-failure are part of the cost-control contract.
</guardrails>
</context>

## Source Coverage Audit

| Source | ID | Feature/Requirement | Task | Status | Notes |
|--------|----|---------------------|------|--------|-------|
| GOAL | — | Breadth-first admission canaries with lower early-failure spend and unchanged deterministic success | 1 | COVERED | Red/green regression and runner restructure are one atomic TDD task. |
| REQ | QUICK-260723-UXM | First-round Gemini fails after three generation calls; success remains 30 calls and five samples per resident | 1 | COVERED | Both failure and success paths use mocks. |
| RESEARCH | — | No research phase | — | EXCLUDED | Quick-mode instruction explicitly skips research. |
| CONTEXT | — | No CONTEXT.md decisions supplied | — | EXCLUDED | Direct task constraints are captured in objective, must-haves, and guardrails. |

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Lock ordinal-major admission scheduling with a red/green regression</name>
  <files>tests/integration/resident-admission.test.ts, src/features/world/generation/run-admission-canaries.ts</files>
  <behavior>
    - Success: mocked generateSample calls are ordered by ordinal 1 through 5, with all six residents in RESIDENT_PROVIDER_PROFILES order inside each ordinal.
    - Early failure: when Gemini's ordinal-1 mocked sample fails validation, generateSample has exactly three calls — GPT-4o ordinal 1, Claude ordinal 1, then Gemini ordinal 1 — and the rejected ResidentAdmissionError retains Gemini's resident, upstream, and sanitized code.
    - Complete result: success performs exactly 30 generation calls, returns sampleCount 30, returns residents in registry order, and retains exactly five sanitized samples per resident with the existing latency, cost, token-policy, and secret-redaction assertions.
  </behavior>
  <action>
First update `tests/integration/resident-admission.test.ts`. Define the expected six-resident registry order in the test and strengthen the successful admission case to assert both `result.residents.map(resident => resident.residentId)` and the complete `(residentId, ordinal)` generateSample call trace. Strengthen the existing Gemini failure case to assert exactly three calls and the three-call ordinal-1 prefix, while retaining its sanitized `ResidentAdmissionError` assertions. Keep `checkCatalog` and `generateSample` mocked.

Run `pnpm exec vitest run tests/integration/resident-admission.test.ts` before editing production code. Record the RED result: the current resident-major loop must fail the new ordering/three-call assertions (it reaches Gemini only after completing five samples for each of the first two residents).

Then restructure only `runAdmissionCanaries` in `src/features/world/generation/run-admission-canaries.ts`. Preserve the exactly-five-samples guard. Prepare each registry profile in order by performing its existing catalog check and storing `{ profile, catalogEvidence, samples: [] }`, preserving the current catalog error wrapping. Generate samples with ordinal as the outer loop and prepared residents as the inner loop; validate each sample immediately and append it to that prepared resident's bucket, preserving classification through `ResidentAdmissionError`. After all five rounds succeed, map the prepared residents in their original registry order into the existing summary shape and retain the current percentile, total-cost, reasoning, adapter, routing-policy, checkedAt, and sampleCount behavior. Do not alter `createLiveAdmissionDependencies`.

Run the targeted integration test green, then run type checking. Stage only `tests/integration/resident-admission.test.ts` and `src/features/world/generation/run-admission-canaries.ts` for the task commit.
  </action>
  <verify>
    <automated>pnpm exec vitest run tests/integration/resident-admission.test.ts &amp;&amp; pnpm typecheck</automated>
  </verify>
  <done>The regression proves ordinal-major registry-order calls, a first-round Gemini validation failure stops after exactly three mocked generation calls with sanitized error data, and the successful mocked path still returns 30 total calls, five samples for each of six residents, and deterministic registry-order summaries.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Admission dependency → runner | Catalog evidence and raw samples are untrusted provider-shaped data and must remain validated before aggregation. |
| Runner → persisted/reviewed summary | Failure details and successful samples cross into reviewable output where secrets and raw provider payloads must stay absent. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260723-UXM-01 | Denial of Service / cost exhaustion | `runAdmissionCanaries` generation loop | medium | mitigate | Execute serial ordinal-major rounds and stop immediately on the first invalid/failing sample; regression asserts the first-round Gemini path consumes three generation calls. |
| T-260723-UXM-02 | Information Disclosure | `ResidentAdmissionError` and admission summary | high | mitigate | Preserve sanitized error classification and existing forbidden-string assertions; tests use provider-shaped mocks and never live credentials. |
| T-260723-UXM-03 | Tampering | Resident/result ordering | medium | mitigate | Derive within-round execution and final summary order from the same immutable registry sequence and assert the complete call trace plus output order. |
</threat_model>

<verification>
1. Confirm the new regression was observed RED before the runner edit and failed specifically on resident-major ordering or the eleven-call Gemini path.
2. Run `pnpm exec vitest run tests/integration/resident-admission.test.ts`; all admission tests pass using mocks only.
3. Run `pnpm typecheck`; the prepared-resident sample buckets and summary assembly remain type-safe.
4. Run `git diff -- next-env.d.ts .codex/` and confirm this task introduced no changes to those user-owned paths.
</verification>

<success_criteria>
- Generation call order is ordinal-major and registry-ordered within every ordinal.
- A first-round Gemini failure results in exactly three mocked generation calls.
- A successful run produces exactly 30 calls, 30 samples, six registry-ordered summaries, and five samples per resident.
- Existing validation, error sanitization, metrics, token-policy fields, and live dependency construction remain intact.
- No network/provider command runs, and no unrelated dirty or untracked files are modified or staged.
</success_criteria>

<output>
Create `.planning/quick/260723-uxm-run-resident-admission-canaries-breadth-/260723-uxm-SUMMARY.md` when done.
</output>
