---
description: Comprehensive visual testing with Playwright
allowed-tools: mcp__playwright__*, Read, Grep, Glob, Bash(npm:*, bun:*)
requires-mcp: playwright
---

Perform comprehensive visual testing of UI components and pages using Playwright.

## Prerequisites Check

```
!`command -v playwright >/dev/null 2>&1 && echo "✅ Playwright installed" || echo "❌ Playwright not installed - run: npx playwright install"`
```

## Test Plan

### 1. **Component Inventory**
   - Find all interactive components (buttons, forms, modals)
   - Identify key user flows (login, checkout, navigation)

### 2. **Visual Testing**
   For each component/page:
   - ✅ Initial render state
   - ✅ Hover states (buttons, links, interactive elements)
   - ✅ Focus states (keyboard navigation)
   - ✅ Loading states (async operations)
   - ✅ Error states (validation, network errors)
   - ✅ Empty states (no data)
   - ✅ Responsive breakpoints (mobile, tablet, desktop)

### 3. **Interaction Testing**
   - Form submission (valid and invalid)
   - Button clicks and navigation
   - Modal open/close
   - Dropdown selections
   - File uploads

### 4. **Accessibility Check**
   - Tab order is logical
   - Focus indicators are visible
   - ARIA labels present
   - Color contrast meets WCAG 2.1 AA

## Execution Steps

1. **Start dev server** (if not running):
   ```bash
   bun run dev
   ```

2. **Navigate to application** using Playwright

3. **For each test scenario**:
   - Take snapshot of initial state
   - Perform interaction
   - Verify expected changes
   - Screenshot any issues

4. **Generate report** with screenshots and findings

## Output Format

```markdown
### Visual Test Report

**Test Date:** 2026-01-20
**URL:** http://localhost:3000
**Viewport:** 1920x1080

#### ✅ Passed (15/18)
- Login form renders correctly
- Button hover states working
- Navigation responsive on mobile
...

#### ❌ Failed (3/18)
1. **Submit button missing focus indicator**
   - Location: /login
   - Issue: No visible focus ring when tabbing
   - Screenshot: login-focus-missing.png

2. **Modal overlay too transparent**
   - Location: /dashboard > Settings
   - Issue: Contrast ratio 2.1:1 (needs 3:1 minimum)
   - Screenshot: modal-contrast.png

3. **Form error messages not announced**
   - Location: /register
   - Issue: Missing aria-live region for errors
   - Screenshot: form-error-a11y.png

#### 📋 Recommendations
- Add focus-visible CSS to all interactive elements
- Increase modal overlay opacity to 0.7
- Wrap error messages in <div role="alert">
```

## Success Criteria

- All critical user flows work correctly
- Interactive elements have visible focus states
- No layout shifts or visual regressions
- Color contrast meets WCAG AA standards
- Keyboard navigation works throughout
