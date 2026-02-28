---
description: Security-focused code review of current branch
allowed-tools: Bash(git:*), Read, Glob, Grep, Task
---

Perform a security-focused review of the changes on this branch.

## Context

**Files Modified:**
```
!`git diff --name-only origin/HEAD... 2>/dev/null || git diff --name-only HEAD~5`
```

**Diff Content:**
```
!`git diff --merge-base origin/HEAD 2>/dev/null || git diff HEAD~5`
```

## Security Review Focus Areas

### Input Validation
- SQL injection via unsanitized input
- Command injection in subprocess calls
- Path traversal in file operations
- XSS in web applications
- NoSQL injection

### Authentication & Authorization
- Authentication bypass logic
- Privilege escalation paths
- Session management flaws
- JWT vulnerabilities
- Missing authorization checks

### Secrets & Crypto
- Hardcoded API keys, passwords, tokens
- Weak cryptographic implementations
- Improper key storage

### Data Exposure
- Sensitive data in logs
- PII handling violations
- API endpoint data leakage

## Output Requirements

For each finding provide:
- **File:Line** - Location
- **Severity** - HIGH/MEDIUM/LOW
- **Category** - e.g., sql_injection, xss, auth_bypass
- **Description** - What the vulnerability is
- **Exploit Scenario** - How it could be exploited
- **Recommendation** - How to fix it

Only report HIGH confidence findings (>80% confident of exploitability).
