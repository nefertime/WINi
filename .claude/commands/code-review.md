---
description: Comprehensive code review of current branch changes
allowed-tools: Bash(git:*), Read, Glob, Grep, Task
---

Conduct a thorough code review of the pending changes on the current branch.

## Context

**Git Status:**
```
!`git status`
```

**Files Modified:**
```
!`git diff --name-only origin/HEAD... 2>/dev/null || git diff --name-only HEAD~5`
```

**Commits:**
```
!`git log --no-decorate origin/HEAD... 2>/dev/null || git log --oneline -5`
```

## Review Instructions

Use the **pragmatic-code-review** sub-agent to conduct the review with focus on:

### Critical Issues (Must Fix)
- Security vulnerabilities (injection, auth bypass, data exposure)
- Architectural regressions
- Logic errors and race conditions
- Breaking changes without migration

### High Priority (Should Fix)
- Performance issues (N+1 queries, memory leaks)
- Missing error handling
- Poor test coverage for critical paths
- Maintainability concerns

### Suggestions (Nice to Have)
- Code clarity improvements
- Better naming
- Documentation gaps

### Nitpicks (Optional)
- Style preferences
- Minor optimizations

Output a structured markdown report with findings categorized by priority.
