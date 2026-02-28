---
name: test-driven-development
description: Enforce RED-GREEN-REFACTOR test-driven development. Use when starting a new feature, implementing a function, fixing a bug, or when the user asks to add functionality. Write failing test first, then minimal implementation, then refactor.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# Test-Driven Development

> Source: [obra/superpowers](https://github.com/obra/superpowers) — adapted for auto-triggering

"If you didn't watch the test fail, you don't know if it tests the right thing."

## When to Apply

**Always apply to:** New features, bug fixes, refactoring, behavior changes.
**Skip only with explicit approval:** Throwaway prototypes, config files, generated code.

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

Any code written before tests must be deleted completely — not kept as reference, not adapted.

## Red-Green-Refactor Cycle

### RED: Write One Failing Test
- Single behavior per test
- Descriptive name clarifying what's tested
- Real code preferred over mocks

```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };
  const result = await retryOperation(operation);
  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```

### Verify RED
Run tests. Confirm:
- Test **fails** (not errors)
- Failure message matches expectation
- Failure indicates missing feature, not syntax error

If test passes immediately — you're testing existing behavior. Fix the test.

### GREEN: Minimal Implementation
Write the **simplest code** that makes the test pass. Nothing more.

```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try { return await fn(); }
    catch (e) { if (i === 2) throw e; }
  }
  throw new Error('unreachable');
}
```

Never add features beyond what tests require.

### Verify GREEN
Run tests. Confirm:
- Target test passes
- All other tests still pass
- Clean output

### REFACTOR: Clean Up
After green only:
- Eliminate duplication
- Improve naming
- Extract helpers

Don't introduce new behavior during refactor.

## Bug Fix Flow

1. Write a test that reproduces the bug (RED)
2. Watch it fail for the expected reason
3. Fix the bug (GREEN)
4. Verify all tests pass

"Never fix bugs without a test."

## Common Excuses — Don't Fall For These

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks; tests take 30 seconds |
| "I'll test after" | Tests passing immediately prove nothing |
| "Need to explore first" | Explore, then discard and start TDD fresh |
| "Test hard = skip test" | Hard-to-test code = hard-to-use code. Simplify the design. |
| "TDD will slow me down" | TDD is faster than debugging production issues |
| "Keep as reference" | You'll adapt it. That's testing-after. |

## Red Flags — Stop and Restart

If you catch yourself:
- Writing code before tests
- Tests passing immediately
- Unable to explain why a test should fail
- Rationalizing "just this once"

**Delete the code. Start over with a failing test.**

## Verification Checklist

- [ ] Every new function has test coverage
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] No errors or warnings in output
- [ ] Tests use real code (mocks only when unavoidable)
- [ ] Edge cases and error conditions covered
