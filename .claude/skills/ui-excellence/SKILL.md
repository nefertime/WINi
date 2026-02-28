---
name: ui-excellence
description: Elevate UI to production-grade design excellence. Use when building web components, pages, or applications with visual/aesthetic requirements — especially when the user mentions design, beautiful UI, polished interface, aesthetics, or when creating new frontend components. Combines anti-slop enforcement, bold design direction, accessibility, and motion quality.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# UI Excellence

Comprehensive design intelligence skill that auto-activates for frontend/UI work. Prevents AI slop, enforces bold design direction, and ensures production-grade polish.

## Phase 1: Design Direction (Before Coding)

Before writing any UI code, establish these explicitly:

### Aesthetic Commitment
- **Pick a bold direction** — not "clean and modern" but a SPECIFIC flavor: luxury/refined, brutalist/raw, editorial/magazine, organic/natural, retro-futuristic, art deco, soft/pastel, industrial, etc.
- **Define the unforgettable element** — what will someone remember? A dramatic animation? An unexpected layout? A distinctive typography choice?
- **Commit fully** — bold maximalism and refined minimalism both work. The key is intentionality, not intensity.

### Typography Contract
- Choose distinctive fonts — NEVER default to Inter, Roboto, Arial, or system fonts
- Pair a display font with a refined body font
- Define a fluid scale using `clamp()` — no fixed `px` sizes
- Apply `text-balance` for headings, `text-pretty` for body
- Use `tabular-nums` for data displays

### Color System
- Use CSS custom properties in oklch() — never raw hex everywhere
- Dominant color with sharp accents beats timid, evenly-distributed palettes
- Never pure `#000` or `#fff` — always tinted
- One accent color per view maximum
- Use existing theme tokens before introducing new colors

### Motion Contract
- Define easing curves upfront (ease-out for entrance, spring for playful)
- Set duration ranges: 100-200ms micro-interactions, 300-500ms transitions
- GPU-only: `transform`, `opacity`, `filter` — NEVER animate `width`, `height`, `top`, `left`, `margin`, `padding`
- Mandatory reduced-motion media query

## Phase 2: Implementation Rules (During Coding)

### Anti-Slop Enforcement
These rules prevent generic AI-generated aesthetics:

**Layout:**
- Use `h-dvh` not `h-screen`
- Fixed `z-index` scale (no arbitrary values)
- Respect `safe-area-inset` for fixed elements
- `size-*` for square elements instead of `w-*` + `h-*`
- Unexpected layouts welcome: asymmetry, overlap, diagonal flow, grid-breaking

**Components:**
- Use accessible primitives for keyboard/focus (Radix, React Aria, Base UI)
- Never rebuild keyboard or focus behavior by hand
- `aria-label` on all icon-only buttons
- AlertDialog for destructive/irreversible actions
- Structural skeletons for loading states (not spinners)
- Empty states need one clear call-to-action
- Show errors adjacent to the triggering action

**Styling:**
- Never use gradients unless explicitly requested
- Never use purple or multicolor gradients
- No glow effects as primary affordances
- No `will-change` outside active animations
- No large `blur()` or `backdrop-filter` animations
- Express logic through rendering, not `useEffect`

**Typography in Practice:**
- `truncate` or `line-clamp` for dense layouts
- Never modify `letter-spacing` unless requested

### Interaction States
Every interactive element needs ALL of these:
- **Default** — clear affordance
- **Hover** — scale + shadow shift (subtle, not dramatic)
- **Focus** — `:focus-visible` ring (never `:focus`)
- **Active/Pressed** — tactile feedback
- **Disabled** — reduced opacity + `cursor-not-allowed`, never color-only
- **Loading** — skeleton or spinner with `aria-busy`

### Backgrounds & Depth
Create atmosphere, not flat surfaces:
- Gradient meshes, noise textures, geometric patterns
- Layered transparencies, dramatic shadows
- Glassmorphism: `backdrop-filter: blur(12px)` with subtle border
- oklch() shadows for colored depth

## Phase 3: Polish Pass (After Feature Works)

Run these checks after the feature is functional:

### Accessibility Audit (Priority Order)
1. **Accessible names**: Every interactive control has a label
2. **Keyboard access**: All elements Tab-reachable, visible focus indicators
3. **Focus management**: Modals trap focus, return focus on close, Escape closes overlays
4. **Semantics**: Native elements over role workarounds, heading hierarchy, lists use `ul`/`ol`
5. **Forms**: Errors linked via `aria-describedby`, `aria-invalid` on invalid fields
6. **Announcements**: `aria-live` for dynamic content, `aria-expanded` for collapsibles
7. **Contrast**: WCAG AA 4.5:1 for text, 3:1 for large text and UI components

### Motion Performance Audit
1. **Compositor only**: Verify no layout property animations
2. **Measurement**: Measure once, then animate via transform/opacity (FLIP pattern)
3. **Scroll**: Use Scroll/View Timelines or IntersectionObserver, never poll scroll position
4. **Off-screen**: Pause animations when not visible
5. **Blur**: Keep ≤8px, short one-time effects only
6. **Layers**: `will-change` applied temporarily and removed after animation
7. **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables all motion

### Visual QA Checklist
- [ ] Every state accounted for (empty, loading, error, success, partial)
- [ ] Responsive: mobile-first, scales fluid to desktop
- [ ] Dark/light if applicable
- [ ] No console errors or warnings
- [ ] Typography hierarchy clear and consistent
- [ ] Spacing rhythm consistent (use design tokens, not arbitrary values)
- [ ] Interactive elements have cursor feedback
- [ ] Images have appropriate loading strategy (lazy/eager)

## Anti-Patterns to Catch

| AI Slop Pattern | Fix |
|----------------|-----|
| Inter/Roboto/Arial everywhere | Pick distinctive, context-appropriate fonts |
| Purple gradient on white | Use project's color system, dominant + accent |
| Generic card grid layout | Add asymmetry, overlap, unexpected composition |
| Missing hover/focus/disabled states | Implement ALL interaction states |
| `px` font sizes | `clamp()` fluid typography |
| `h-screen` | `h-dvh` |
| Animating `width`/`height` | Use `transform: scale()` or `clip-path` |
| Arbitrary `z-index` (z-[999]) | Fixed scale: 10, 20, 30, 40, 50 |
| Color-only disabled states | Opacity + cursor + aria-disabled |
| Toast-only error feedback | Inline errors adjacent to action |
