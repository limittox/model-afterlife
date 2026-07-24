---
quick_id: 260724-guf
status: in_progress
description: Add deterministic inter-generation pacing to the live admission matrix after reproducible fourth-request HTTP 429s, verify offline, and make no provider calls
---

# Quick Task 260724-guf: Pace live admission generations

1. Add a focused fake-sleeper regression proving live admission can delay between generation calls without delaying before the first call.
2. Keep test/default admission runs unpaced unless an explicit interval is supplied.
3. Configure the credentialed command for a 21-second interval, limiting the runner to at most three generation starts per rolling minute.
4. Preserve breadth-first order, call accounting, strict first-failure behavior, zero retries, and all provider identity rules.
5. Run focused tests, the full suite, typecheck, and lint without invoking OpenRouter.
