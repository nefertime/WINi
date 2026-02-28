---
name: debug-recovery
description: Structured debugging methodology. Use when encountering errors, test failures, or when stuck in a loop of failed fix attempts (3+ retries on same issue).
allowed-tools: Read, Edit, Grep, Glob, Bash
---

# Debug Recovery

Systematic approach when things break or fixes loop.

## When to Activate
- Test failure after code change
- Runtime error or unexpected behavior
- 3+ failed attempts at the same fix (loop detection)
- User reports a bug

## Recovery Sequence
1. **Reproduce** — Get minimal repro case. Exact error message, exact steps.
2. **Isolate** — Narrow to specific file and function. Use git diff to see what changed.
3. **Log** — Add targeted assertions or console output at the boundary.
4. **Targeted fix** — Constrain change scope. One thing at a time.
5. **Verify** — Run the specific failing test, not the full suite.
6. **Rollback if looping** — After 3 failed attempts: `git stash`, step back, reframe the problem entirely.

## Anti-Patterns to Detect
- **Hallucinated APIs**: Verify imports/deps actually exist before using them
- **Model drift**: Re-read the original requirement if fix attempts diverge
- **Big-diff hiding bugs**: If a "fix" touches 5+ files, something is wrong
- **Edge-case blindness**: Test the unhappy path, not just the happy one

## Output
After resolution, briefly note what the root cause was and the fix applied. If it's a reusable insight, flag for learning capture.
