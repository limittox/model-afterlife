---
quick_id: 260724-fyf
status: in_progress
description: Replace DeepSeek R1 0528 resident with DeepSeek V3.2, preserve paid-call accounting, and verify offline without an OpenRouter canary
---

# Quick Task 260724-fyf: Replace DeepSeek R1 0528 with DeepSeek V3.2

## Goal

Replace the blocked DeepSeek R1 0528 launch resident with the callable-but-superseded DeepSeek V3.2 route while keeping strict routing, historical grounding, and the existing 23/47 paid-call accounting.

## Tasks

1. Update focused registry/provider tests for V3.2, explicit reasoning disablement, a 180-token output bound, and the shared 30-second timeout.
2. Update the provider profile, launch resident, character bible, historical claims, and database/test fixtures.
3. Retire the R1-specific timeout/reasoning experiment and archive its diagnostic record as superseded.
4. Update Phase 2 design/state documentation without rewriting historical call accounting.
5. Run focused tests, typecheck, lint, and one final suite; make no OpenRouter request.

## Must Haves

- The exact route is `deepseek/deepseek-v3.2`, canonicalized as `deepseek/deepseek-v3.2-20251201`, restricted to DeepInfra FP4 with fallback disabled.
- Reasoning is explicitly disabled and the normal 180-token/30-second bounds apply.
- The six-resident registry remains internally consistent and historically sourced.
- `.planning/STATE.md` retains 23/47 consumed calls and says no further provider call is authorized.
- User-owned `next-env.d.ts` and `.codex/` changes remain untouched.
