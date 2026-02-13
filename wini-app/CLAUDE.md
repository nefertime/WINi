# WINi — Project Instructions

> Wine Intelligence assistant. AI-powered sommelier that pairs wines with food.

## Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (inline `@theme` in globals.css) + CSS custom properties
- **Animation**: Framer Motion 12 (`motion/react`)
- **Auth**: Auth.js v5 (next-auth@beta) + Prisma 6 + SQLite
- **Testing**: Vitest + jsdom + React Testing Library
- **API**: Next.js API routes + Anthropic SDK (Claude claude-sonnet-4-5-20250929)
- **Port**: `3100` (not default 3000)

## Commands
```
npm run dev          # Dev server (port 3100)
npm run build        # Production build
npm test             # Vitest suite
npm run test:watch   # Watch mode
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma db push   # Push schema changes to SQLite
npx prisma generate  # Regenerate Prisma client after schema changes
```

## Design System — WINi Identity

### Aesthetic Direction: Luxury Wine Editorial
WINi is **luxury/refined** with **editorial** sensibility — like a high-end wine magazine that happens to be interactive. Every visual choice should feel intentional, unhurried, and sophisticated.

### Color Tokens (CSS custom properties in `globals.css`)
```css
--burgundy: #5C0A1E;        /* Dark wine — primary dark */
--burgundy-light: #7A1B3D;  /* Accent variant */
--burgundy-glow: #9B2335;   /* Connection lines, glows */
--cream: #E8DCC8;            /* Warm light — primary light */
--cream-light: #F5EDD6;     /* Light variant */
--cream-lightest: #FAF6F0;  /* Text on dark backgrounds */
--gold: #C9A84C;            /* Primary accent — buttons, selected states */
--charcoal: #0D0D0D;        /* Near-black background */
--text-dark: #1A1A1A;       /* Dark text */
--text-light: #FAF6F0;      /* Light text */
--wine-line: #9B2335;       /* Animated connection lines */
--bubble: #F0E68C;          /* Champagne bubble accent */
```

### Typography
| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Logo "WIN" | **Cinzel** | 700-900 | Roman inscription capitals |
| Logo "i" | **Cormorant Garamond** italic | 300 | Elegant contrast stroke |
| Headings/Body | **Cormorant Garamond** | 300-600 | Editorial elegance |
| UI Text | **Jost** | 300-600 | Clean modern readability |

All loaded via `next/font/google` in `layout.tsx`.

### Animation Easings
```css
--ease-luxury: cubic-bezier(0.16, 1, 0.3, 1);    /* Smooth, unhurried */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful bounce */
```

### Split Layout
The home screen uses a **two-tone split** — burgundy (left/red wines) and cream (right/white wines). This duality is the visual identity. Maintain it in all UI extensions.

## Component Architecture
```
src/components/
├── BottleCarousel.tsx       # Split carousel (left/right halves animate independently)
├── ConnectionLines.tsx      # Canvas Bezier curves + flowing particle dots
├── Logo.tsx                 # Split mode (home) / compact mode (results)
├── SearchBar.tsx            # Center pill — camera + text + send
├── InlinePairingResults.tsx # Two-column: dishes (left) ↔ wines (right) with connection lines
├── WineDetailOverlay.tsx    # Full-screen modal — wine info + tasting notes
├── WinePopup.tsx            # Inline card — pairing reason + detail links
├── ScanningAnimation.tsx    # "Pairing your evening..." loading state
├── BubbleParticles.tsx      # Rising particles (sparkling wine effect)
├── FloatingHints.tsx        # Contextual UI guidance
├── HamburgerMenu.tsx        # Mobile navigation
├── MenuButton.tsx           # Menu toggle
└── PreviousSearches.tsx     # Session history (7-day localStorage cache)
```

## Key Interactions
- **Connection lines**: Canvas-drawn Bezier curves with flowing particle dots. Tap dish → lines to wines. Tap wine → lines to dishes. Bidirectional. Long-press intensifies particles +30%.
- **Bottle carousel**: Left/right halves cycle independently. Crossfade + slide transitions. Auto-detects sparkling for bubble effects.
- **Logo split**: "WI" left (burgundy), "Ni" right (cream) on home. Compact centered "WINi" on results.

## Design Rules for WINi
- **Never break the split duality** — burgundy/cream is the visual identity
- **Fonts are sacred** — Cinzel for logo caps, Cormorant for editorial text, Jost for UI. No substitutes.
- **Gold (#C9A84C) is the accent** — use sparingly for emphasis (CTA buttons, selected states)
- **Logo "i" is burgundy (#5C0A1E)** — matches the burgundy side of the split identity
- **Animations are luxury-paced** — use `--ease-luxury` for most transitions, `--ease-spring` only for playful micro-interactions
- **Canvas connection lines** are the signature interaction — protect their performance and visual quality
- **Mobile-first** (390px) → fluid → desktop. Use `clamp()` for all text sizing.
- **Reduced motion** support is mandatory — already implemented in `globals.css`

## API Shape
Dishes: `{ id, name, description, category: "meat"|"fish"|"vegetarian"|"pasta"|"dessert"|... }`
Wines: `{ id, name, type: "red"|"white"|"rosé"|"sparkling", grape, region, vintage }`
Pairings: `{ dish_id, wine_id, score: 0-1, reason, detailed_reason }`

## Auth Architecture
- **Auth.js v5** with JWT session strategy + PrismaAdapter for user/account storage
- **Providers**: Credentials (bcrypt), Google, Facebook, MicrosoftEntraId (OAuth placeholders)
- **`allowDangerousEmailAccountLinking` REMOVED** — do NOT re-add without email verification flow
- **Database**: SQLite via Prisma 6 (`prisma/dev.db`) — migrates to Postgres by changing provider
- **Prisma 6 required**: Prisma 7 breaks `@auth/prisma-adapter` — DO NOT upgrade until adapter is updated
- **Dual .env files**: `.env` (Prisma CLI) + `.env.local` (Next.js runtime) — both need DATABASE_URL
- **Cookie consent**: `wini_cookie_consent` cookie, 1-year expiry, 3-second delay, GDPR 3-category toggles
- **Security headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (in `next.config.ts`)
- **Storage strategy**: Unauthenticated → localStorage (existing), Authenticated → server API routes
- **`useStorage` hook** (`src/hooks/useStorage.ts`): Auth-aware wrapper — not yet wired to all components
- **Data migration**: Auto-migrates localStorage → server on first login via `/api/auth/migrate`

## Known Issues
- No `tailwind.config.ts` file (using v4 inline `@theme` — valid but non-standard)
- OAuth providers use placeholder credentials — replace in `.env.local` for real OAuth
- Forgot password is placeholder — needs email sending service (SendGrid, Resend, etc.)
- `useStorage` hook created but existing components still import localStorage directly
- No rate limiting on auth endpoints (brute force risk)
- No email format validation in registration endpoint
- User enumeration via distinct 409/400 error responses in registration

## Skills Available
- `/baseline-ui` — Anti-slop polish pass (spacing, typography, states)
- `/fixing-accessibility` — a11y audit (keyboard, ARIA, contrast, focus)
- `/fixing-motion-performance` — Animation performance audit
- `ui-excellence` — Auto-triggers on design/UI work (global skill)
