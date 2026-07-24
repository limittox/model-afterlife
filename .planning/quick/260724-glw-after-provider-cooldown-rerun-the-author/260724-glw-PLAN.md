---
quick_id: 260724-glw
status: in_progress
description: After provider cooldown rerun the authorized final six-resident OpenRouter admission matrix once, stopping fail-closed at cumulative generation ceiling 58
---

# Quick Task 260724-glw: Cooldown and one final matrix rerun

1. Reserve at most 30 new generations, raising the cumulative ceiling from 28/54 to 58/58.
2. Wait until at least ten minutes have elapsed since the prior DeepSeek HTTP 429.
3. Invoke the standard `check:resident-admission -- --live --samples=5` command exactly once.
4. Allow the command's 12 catalog/endpoint checks and breadth-first generations only.
5. Stop on the first failure with no retry, fallback, substitution, or second rerun.
6. Persist the sanitized admission artifact only if all six residents complete five valid samples.
