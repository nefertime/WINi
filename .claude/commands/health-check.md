---
description: Comprehensive codebase health assessment with actionable optimization opportunities
allowed-tools: Bash, Read, Glob, Grep, Task, Write, AskUserQuestion
---

# Health Check - Performance & Quality Audit

**Purpose:** Analyze codebase for performance bottlenecks, structural issues, and quality gaps.
**Mode:** READ-ONLY analysis. No changes without explicit user approval.

**Recommended frequency:** Monthly or before major releases

---

## ⚠️ CRITICAL: Safety Rules

1. **READ-ONLY PHASE**: Steps 1-8 are analysis only. NO code changes.
2. **USER APPROVAL REQUIRED**: After analysis, present findings and ASK user what to fix.
3. **VALIDATE BEFORE ACTING**: Any proposed fix must be validated to ensure it won't break code.
4. **ATOMIC CHANGES**: Fix one issue at a time, run `/validate` after each.

---

## Step 0: Setup (First Run Only)

```bash
mkdir -p docs
```

If `docs/HEALTH_CHECK_TEMPLATE.md` or `docs/HEALTH_BASELINE.md` don't exist, create them from templates at end of this file.

---

## Step 1: Project Discovery

**Detect project type and structure:**
```bash
ls package.json pyproject.toml Cargo.toml go.mod 2>/dev/null
```

**Read project CLAUDE.md** for documented performance targets and quality standards.

**Count source files and lines:**
```bash
# For JS/TS
find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l
wc -l src/**/*.ts src/**/*.tsx 2>/dev/null | tail -1

# For Python
find src -name "*.py" 2>/dev/null | wc -l
wc -l src/**/*.py 2>/dev/null | tail -1
```

---

## Step 2: Performance Analysis (PRIORITY)

### 2.1 Bundle Size & Build Performance (Frontend)

```bash
# Measure build time
time npm run build 2>&1

# Bundle size
du -sh .next dist build 2>/dev/null

# Analyze bundle composition (if available)
npx @next/bundle-analyzer 2>/dev/null || echo "Not installed"
```

**Look for:**
- Bundle > 500KB (warning), > 1MB (critical)
- Build time > 30s (investigate)
- Unused code in bundle

### 2.2 Runtime Performance (Frontend)

**Check for performance anti-patterns:**
- Components re-rendering unnecessarily (look for missing `useMemo`, `useCallback`, `React.memo`)
- Large lists without virtualization
- Synchronous operations blocking main thread
- Missing lazy loading for routes/components

Use Grep to find:
```bash
# Find potential re-render issues
grep -r "useState\|useEffect" src --include="*.tsx" | wc -l
grep -r "React.memo\|useMemo\|useCallback" src --include="*.tsx" | wc -l
```

### 2.3 API Response Times (Backend)

```bash
# Check for slow endpoints (if profiling middleware exists)
grep -r "async def\|@app" src/backend --include="*.py" | head -20

# Look for N+1 query patterns
grep -r "for.*in.*:.*await\|for.*in.*:.*\.get\|for.*in.*:.*\.query" src --include="*.py"
```

**Measure cold start:**
```bash
python -c "import time; start=time.time(); import main; print(f'Import: {time.time()-start:.2f}s')" 2>/dev/null
```

### 2.4 Database & I/O Performance

Look for:
- Missing indexes on frequently queried fields
- N+1 query patterns
- Unbounded queries (no LIMIT)
- Synchronous file I/O in async code

### 2.5 Memory Usage Patterns

```bash
# Find potential memory leaks (event listeners not cleaned up)
grep -r "addEventListener\|subscribe\|on\(" src --include="*.ts" --include="*.tsx" | head -20
grep -r "removeEventListener\|unsubscribe\|off\(" src --include="*.ts" --include="*.tsx" | head -20
```

---

## Step 3: Code Quality Analysis

### 3.1 Complexity Hotspots

```bash
# Large files (> 300 lines) - candidates for splitting
wc -l src/**/*.ts src/**/*.tsx src/**/*.py 2>/dev/null | sort -rn | head -15

# Deep nesting (look for 4+ levels of indentation)
grep -rn "^                " src --include="*.ts" --include="*.tsx" | head -10
```

**Cyclomatic complexity:**
```bash
# TypeScript
npx eslint . --rule "complexity: [error, 10]" --format compact 2>/dev/null | head -20

# Python
radon cc src -a -s --min C 2>/dev/null || echo "Install: pip install radon"
```

### 3.2 Code Duplication

Look for:
- Similar function names across files
- Copy-pasted logic blocks
- Repeated utility patterns

```bash
# Find similarly named functions
grep -roh "function \w\+\|const \w\+ = " src --include="*.ts" --include="*.tsx" | sort | uniq -d | head -20
```

### 3.3 Type Safety

```bash
# Find 'any' types (TypeScript)
grep -rn ": any\|as any" src --include="*.ts" --include="*.tsx" | wc -l

# Type errors
npx tsc --noEmit 2>&1 | head -30
```

### 3.4 Error Handling

Look for:
- Empty catch blocks
- Unhandled promise rejections
- Missing error boundaries (React)

```bash
grep -rn "catch.*{}" src --include="*.ts" --include="*.tsx"
grep -rn "\.catch\(\)" src --include="*.ts" --include="*.tsx" | head -10
```

---

## Step 4: Dead Code Detection

### 4.1 Unused Exports

```bash
npx ts-prune 2>/dev/null | head -30 || echo "Install: npm install -D ts-prune"
```

### 4.2 Orphaned Files

List source files and check if they're imported anywhere:
```bash
# Get all source files
find src -name "*.ts" -o -name "*.tsx" | head -30
```

Then use Grep to verify each is imported.

### 4.3 Unused Dependencies

```bash
npx depcheck 2>/dev/null | head -30
```

### 4.4 Python Dead Code

```bash
vulture . --min-confidence 80 2>/dev/null | head -30 || echo "Install: pip install vulture"
ruff check . --select F401,F841 2>/dev/null | head -20
```

---

## Step 5: Dependency Health

### 5.1 Security Vulnerabilities (CRITICAL)

```bash
# Node.js
npm audit 2>/dev/null

# Python
pip-audit 2>/dev/null || safety check 2>/dev/null
```

**Action required:**
- Critical/High: Immediate fix
- Medium: Schedule for next sprint
- Low: Track in backlog

### 5.2 Outdated Packages

```bash
npm outdated 2>/dev/null | head -20
pip list --outdated 2>/dev/null | head -20
```

### 5.3 Dependency Size Impact

```bash
# Check which dependencies are largest
npm ls --all 2>/dev/null | head -50
```

---

## Step 6: Test Coverage & Quality

```bash
# JavaScript/TypeScript
npm run test -- --coverage 2>/dev/null | tail -30

# Python
pytest --cov --cov-report=term-missing 2>/dev/null | tail -30
```

**Quality bar: Target 80%+ coverage on critical paths**

Identify untested critical paths:
- API endpoints
- State management logic
- User-facing features

---

## Step 7: Architecture & Structure Review

Analyze for:
- **Circular dependencies**: Files importing each other
- **God objects**: Files doing too many things
- **Tight coupling**: Components that can't be tested in isolation
- **Missing abstractions**: Repeated patterns that should be utilities

```bash
# Find potential circular imports
npx madge --circular src 2>/dev/null || echo "Install: npm install -D madge"
```

---

## Step 8: Generate Report

Create `docs/HEALTH_CHECK_YYYY-MM.md` with all findings.

**Report structure:**
1. Executive Summary (Overall health: Good/Fair/Needs Attention)
2. Performance Findings (with metrics vs. targets)
3. Quality Issues (prioritized by impact)
4. Security Concerns (if any)
5. Recommended Actions (categorized by effort/impact)

---

## Step 9: User Approval Phase

**STOP HERE AND PRESENT FINDINGS TO USER**

Use AskUserQuestion to ask:

> "Health check complete. I found [X] issues:
> - [N] performance concerns
> - [N] quality issues
> - [N] security vulnerabilities
> - [N] dead code items
>
> Which would you like me to address?"

**Options to present:**
1. Fix security vulnerabilities (Critical)
2. Address performance bottlenecks
3. Remove dead code
4. Refactor complexity hotspots
5. Update outdated dependencies
6. Generate report only (no changes)

---

## Step 10: Safe Remediation (Only After Approval)

For EACH approved fix:

1. **Explain the change** before making it
2. **Make ONE atomic change**
3. **Run `/validate`** to ensure no breakage
4. **If validation fails**: Revert and report the issue
5. **If validation passes**: Proceed to next fix

**Example workflow:**
```
User approves: "Remove dead code"

1. "I'll remove unused export `formatDate` from utils/date.ts"
2. Make the edit
3. Run: npx tsc --noEmit && npm run lint && npm test
4. If pass: "✅ Removed successfully, tests pass"
5. If fail: "❌ Removal caused test failure in X. Reverting."
```

---

## Appendix: Templates

### HEALTH_CHECK_TEMPLATE.md

```markdown
# Health Check Report - [YYYY-MM]

**Project:** [Name]
**Date:** [Date]
**Checked by:** Claude Code

## Executive Summary

**Overall Health:** [🟢 Good / 🟡 Fair / 🔴 Needs Attention]

| Category | Score | Status |
|----------|-------|--------|
| Performance | /5 | |
| Code Quality | /5 | |
| Security | /5 | |
| Test Coverage | /5 | |
| Dependencies | /5 | |

## Performance Findings

### Metrics vs. Targets
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Bundle size | <500KB | | |
| Initial load | <1s | | |
| API p95 | <200ms | | |
| Build time | <30s | | |

### Bottlenecks Identified
1.
2.

## Code Quality Issues

### Complexity Hotspots
| File | Lines | Complexity | Recommendation |
|------|-------|------------|----------------|

### Dead Code
| Item | Location | Safe to Remove? |
|------|----------|-----------------|

## Security

| Severity | Count | Action |
|----------|-------|--------|
| Critical | | Immediate |
| High | | This week |
| Medium | | Next sprint |

## Recommended Actions

### 🔴 Critical (Do Now)
1.

### 🟡 High Priority (This Sprint)
1.

### 🟢 Nice to Have (Backlog)
1.

## Comparison to Baseline

| Metric | Baseline | Current | Δ |
|--------|----------|---------|---|

---
*Next check scheduled: [Date]*
```

### HEALTH_BASELINE.md

```markdown
# Health Baseline - [Project Name]

**Established:** [Date]

## Codebase Size
- Source files:
- Lines of code:
- Components:
- API endpoints:

## Performance Baseline
| Metric | Value | Target |
|--------|-------|--------|
| Bundle size | | <500KB |
| Build time | | <30s |
| Test suite | | <60s |

## Dependencies
- Production:
- Development:

## History
| Date | Health Score | Key Changes |
|------|--------------|-------------|
```
