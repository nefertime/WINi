# WINi — Wine Intelligence

AI-powered sommelier that scans restaurant menus and recommends wine pairings. Snap a photo of a menu, and WINi pairs each dish with the best wines available — complete with tasting notes and pairing reasoning.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **AI**: Anthropic Claude API (vision + text)
- **Auth**: Auth.js v5 + Prisma 6 + SQLite
- **Testing**: Vitest + Playwright

## Getting Started

```bash
cd wini-app
npm install
cp .env.example .env.local   # Add your API keys
npx prisma db push            # Set up database
npm run dev                   # Starts on port 3100
```

## Features

- **Split-screen home** — burgundy (red wines) / cream (white wines) with bottle carousel
- **Menu scanning** — photograph a restaurant menu, AI extracts dishes and wine list
- **Interactive pairings** — tap a dish to see animated connection lines to recommended wines
- **Wine details** — tasting notes, region, grape variety, pairing reasoning
- **Session history** — revisit past pairings (7-day cache)

## Project Structure

```
wini-app/          # Next.js application
├── src/
│   ├── app/       # App Router pages + API routes
│   ├── components/# UI components
│   └── hooks/     # Custom React hooks
├── prisma/        # Database schema
└── public/        # Static assets + processed bottle images
docs/              # Project specification
scripts/           # Bottle image processing pipeline
assets/            # Source images
```

## License

Private — All rights reserved.
