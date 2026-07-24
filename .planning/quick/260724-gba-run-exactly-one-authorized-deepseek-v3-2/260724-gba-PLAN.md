---
quick_id: 260724-gba
status: in_progress
description: Run exactly one authorized DeepSeek V3.2 admission generation canary through DeepInfra FP4, preserve strict routing, and stop at 24 of 47 calls
---

# Quick Task 260724-gba: One V3.2 canary

1. Reserve the authorized generation as call 24 of 47 before network initialization.
2. Use the immutable `deepseek/deepseek-v3.2` profile, DeepInfra FP4 only, reasoning disabled, 180 output tokens, 30-second timeout, zero retries, and no fallback.
3. Make no catalog request and invoke exactly one generation.
4. Record only sanitized outcome, provenance, token/cost totals, and latency; never record prompt, response text, key, headers, or raw error.
5. Stop immediately after the one result. Do not run another model, retry, matrix, or second V3.2 sample.
