---
description: Run tests for the current project
allowed-tools: Bash, Read, Glob
---

Detect project type and run appropriate tests.

## Project Detection

**Package files present:**
```
!`ls package.json pyproject.toml requirements.txt Cargo.toml 2>/dev/null || echo "No standard package files found"`
```

## Instructions

1. **Detect project type** from package files:
   - `package.json` + bun.lockb → `bun test`
   - `package.json` + yarn.lock → `yarn test`
   - `package.json` + package-lock.json → `npm test`
   - `pyproject.toml` or `pytest.ini` → `pytest`
   - `requirements.txt` → `pytest`
   - `Cargo.toml` → `cargo test`

2. **Run the tests** with appropriate flags:
   - For failures: show detailed output
   - For Python: `-v` for verbose
   - For JS/TS: consider running typecheck first

3. **Report results**:
   - Total tests run
   - Passed/Failed counts
   - List of failing tests with brief reason

4. **If tests fail**, suggest fixes based on error messages

## Common Test Commands Reference

```bash
# Python
pytest                    # All tests
pytest -x                 # Stop on first failure
pytest -v                 # Verbose
pytest path/to/test.py    # Specific file

# Bun/Node
bun test                  # All tests
bun test --watch          # Watch mode
bun test path/to/test.ts  # Specific file

# Type checking (run before tests)
bun run typecheck         # TypeScript
mypy .                    # Python
```
