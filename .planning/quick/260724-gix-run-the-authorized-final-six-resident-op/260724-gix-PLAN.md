---
quick_id: 260724-gix
status: in_progress
description: Run the authorized final six-resident OpenRouter admission matrix with 12 catalog checks and at most 30 generations, stopping fail-closed at a cumulative ceiling of 54 calls
---

# Quick Task 260724-gix: Final live admission matrix

1. Conservatively reserve all 30 authorized generation calls, raising the cumulative ceiling from 24/47 to 54/54 before network initialization.
2. Run the standard credential-gated `check:resident-admission` command once with `--live --samples=5`.
3. Permit exactly the command's 12 read-only catalog/endpoint checks and breadth-first generation order.
4. Preserve exact resident models, canonical IDs, approved upstreams/quantizations, strict parameters, zero retries, disabled fallback, and fail-closed first-error behavior.
5. Persist only the command's sanitized admission artifact when all 30 samples pass. Never record prompts, response text, credentials, headers, or raw provider errors.
6. On failure, record the sanitized resident/code and exact generation calls consumed, recalculate cumulative accounting, and stop.
