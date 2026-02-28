---
description: UI/UX design review with visual testing
allowed-tools: Bash, Read, Glob, Grep, Task, mcp__playwright__*
---

Conduct a comprehensive design review of front-end changes.

## Context

**Files Modified:**
```
!`git diff --name-only origin/HEAD... 2>/dev/null || git diff --name-only HEAD~5`
```

## Review Process

Use the **design-review** sub-agent to systematically review:

### Phase 1: Interaction Testing
- Execute primary user flows
- Test all interactive states (hover, active, disabled)
- Verify destructive action confirmations
- Assess perceived performance

### Phase 2: Responsiveness
- Desktop (1440px)
- Tablet (768px)
- Mobile (375px)
- No horizontal scrolling or overlap

### Phase 3: Visual Polish
- Layout alignment and spacing consistency
- Typography hierarchy
- Color palette consistency
- Visual hierarchy guides attention

### Phase 4: Accessibility (WCAG 2.1 AA)
- Complete keyboard navigation
- Visible focus states
- Semantic HTML
- Form labels
- Image alt text
- Color contrast (4.5:1 minimum)

### Phase 5: Robustness
- Form validation with invalid inputs
- Content overflow scenarios
- Loading, empty, and error states

## Output Format

Categorize findings:
- **[Blocker]** - Critical failures
- **[High-Priority]** - Fix before merge
- **[Medium-Priority]** - Follow-up improvements
- **[Nit]** - Minor aesthetic details

Include screenshots for visual issues when Playwright is available.
