---
description: Full validation pipeline - lint, typecheck, test, build
allowed-tools: Bash, Read, Glob, Task
---

Run complete validation pipeline before commit/PR.

## Project Detection

**Package files:**
```
!`ls package.json pyproject.toml 2>/dev/null`
```

## Validation Steps

### For TypeScript/JavaScript Projects (package.json)

Run in order, stop on first failure:

1. **Type Check**
   ```bash
   bun run typecheck
   ```

2. **Lint**
   ```bash
   bun run lint
   ```

3. **Tests**
   ```bash
   bun test
   ```

4. **Build** (if build script exists)
   ```bash
   bun run build
   ```

### For Python Projects (pyproject.toml)

Run in order, stop on first failure:

1. **Type Check**
   ```bash
   mypy . --ignore-missing-imports
   ```

2. **Lint**
   ```bash
   ruff check .
   ```

3. **Format Check**
   ```bash
   ruff format --check .
   ```

4. **Tests**
   ```bash
   pytest
   ```

## Output

Report each step:
- [PASS] or [FAIL] status
- For failures: show relevant error output
- Summary at end: "X/Y checks passed"

If all pass: "Ready to commit!"
If any fail: List what needs to be fixed
