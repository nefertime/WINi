# WINi — Wine Information App

## Project Specification & Claude Code One-Shot Prompt

---

## 1. Brand Identity

### Name & Logo
- **Name**: WINi (Wine Information)
- **Logo typography**: **"WIN"** in Roman/classical serif capitals (Cinzel, Trajan Pro style — think Roman numeral inscriptions carved in stone). **"i"** in a contrasting elegant script or modern thin-weight font (e.g., Cormorant Garamond italic, or a delicate handwritten script like Playfair Display italic) — the lowercase "i" stands for "information" and creates a deliberate visual contrast against the monumental Roman capitals.
- **Spelling convention**: `WINi` — three Roman capitals + one elegant lowercase i
- **The visual effect**: The "WIN" feels carved, ancient, authoritative (like Roman numerals I, II, III). The trailing "i" feels personal, intimate, informational — like a whispered recommendation from a sommelier.
- **The "N" in the center** acts as both a letter and a visual divider between the two halves of the brand (red/white wine)

### Design Mockup
A hand-drawn mockup of the home screen vision is included in the repository: `wine-bottles/Wini_app_vision.png`. This shows the core layout concept: split screen (dark red left, cream/gold right), wine bottle centered at the dividing line, "WINi" text overlaying the top area, and a search bar in the middle. Use this as the primary layout reference — the actual implementation should be a polished, production-quality version of this vision.
| Role | Color | Hex |
|---|---|---|
| Deep Red (left/red wine) | Burgundy / Dark Cabernet | `#5C0A1E` / `#7A1B3D` |
| Warm Cream (right/white wine) | Golden Riesling | `#E8DCC8` / `#F5EDD6` |
| Accent Gold | Label gold | `#C9A84C` |
| Text Dark | Near black | `#1A1A1A` |
| Text Light | Warm white | `#FAF6F0` |
| Background | Deep charcoal | `#0D0D0D` |
| Energy Lines | Wine-red glow | `#9B2335` with opacity variations |
| Bubble Accent | Champagne sparkle | `#F0E68C` / `#FFD70050` |

### Typography
- **Logo "WIN"**: Cinzel (bold weight) — Roman inscription capitals
- **Logo "i"**: Cormorant Garamond Italic or Playfair Display Italic — elegant, flowing, contrasting
- **Headings**: Cormorant Garamond (elegant, wine-label feel)
- **Body**: Lora or EB Garamond (readable, refined)
- **UI Elements**: Jost or Outfit (clean, modern contrast)

---

## 2. Bottle Image Processing

### Source Images (in repository)
The following bottle photos are provided in `wine-bottles/` with their ORIGINAL filenames. Claude Code must rename/map them during processing:

```
wine-bottles/
├── _Pngtree_brown_wine_bottle_illustration_4673479.png   → Golden/olive Chardonnay-style (PNG, black bg)
├── _Pngtree_wine_bottle_5987023.png                      → Dark bottle with silver label (PNG, black bg)
├── mockup-free-kJp843ucZ1I-unsplash.jpg                  → Two bottles side by side: red + gold label (JPG, beige bg)
├── lloyd-kearney-RycZY-SLefE-unsplash.jpg                → Costières de Nîmes red wine, dramatic dark bg (JPG)
├── arshla-jindal-JTPrf0at-6I-unsplash.jpg                → Jacob's Creek Shiraz Cabernet, outdoor bg (JPG)
├── mockup-free-I3vIA3CPU7o-unsplash.jpg                  → Single dark bottle with red/coral label (JPG, beige bg)
```

**Claude Code must handle the renaming** as part of the processing script — map from original filenames to clean names (e.g., `chardonnay`, `silver-reserve`, `costieres-red`, `shiraz-cabernet`, `red-label`, `gold-label`). Do NOT ask the user to rename files.

### Processing Pipeline (MUST be done at build time or in a setup script)
1. **Background removal**: Use Python `rembg` library or PIL-based processing to remove backgrounds from ALL photos, outputting transparent PNGs
2. **Normalize dimensions**: All bottles must be resized/cropped to **identical canvas size** (e.g., 400x800px) with the bottle centered vertically and horizontally
3. **Center-line split**: Each bottle is then split into exact left-half and right-half images at the center pixel column — these halves are what the carousel displays
4. **Categorize**:
   - **Red wine side (left)**: Costières de Nîmes, red-label mockup, Jacob's Creek Shiraz
   - **White wine side (right)**: Brown/golden Chardonnay bottle, gold-label mockup
   - **Both sides**: Silver-label bottle can appear on either side
5. **Output to**: `public/bottles/processed/` with naming convention: `{name}-left.png`, `{name}-right.png`

### Processing Script
```python
# scripts/process_bottles.py
# Uses: pip install rembg Pillow
# Run: python scripts/process_bottles.py

from rembg import remove
from PIL import Image
import os

INPUT_DIR = "wine-bottles"
OUTPUT_DIR = "public/bottles/processed"
TARGET_SIZE = (400, 800)  # width x height

# Map original filenames → clean output names
BOTTLE_MAP = {
    "_Pngtree_brown_wine_bottle_illustration_4673479.png": "chardonnay",
    "_Pngtree_wine_bottle_5987023.png": "silver-reserve",
    "lloyd-kearney-RycZY-SLefE-unsplash.jpg": "costieres-red",
    "arshla-jindal-JTPrf0at-6I-unsplash.jpg": "shiraz-cabernet",
    "mockup-free-I3vIA3CPU7o-unsplash.jpg": "red-label",
    # Special case: mockup-free-kJp843ucZ1I-unsplash.jpg has TWO bottles
    # Must be split into left bottle (red-label-pair) and right bottle (gold-label) first
}

PAIR_IMAGE = "mockup-free-kJp843ucZ1I-unsplash.jpg"  # Contains 2 bottles side by side

def process_bottle(input_path, output_name):
    """Remove background, resize, center, split into halves."""
    img = Image.open(input_path)
    
    # Remove background
    img_nobg = remove(img)
    
    # Fit bottle into target canvas (maintain aspect ratio, center)
    img_nobg.thumbnail((TARGET_SIZE[0] - 40, TARGET_SIZE[1] - 40), Image.LANCZOS)
    canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    offset = ((TARGET_SIZE[0] - img_nobg.width) // 2, (TARGET_SIZE[1] - img_nobg.height) // 2)
    canvas.paste(img_nobg, offset, img_nobg)
    
    # Split into left and right halves
    mid = TARGET_SIZE[0] // 2
    left_half = canvas.crop((0, 0, mid, TARGET_SIZE[1]))
    right_half = canvas.crop((mid, 0, TARGET_SIZE[0], TARGET_SIZE[1]))
    
    left_half.save(f"{OUTPUT_DIR}/{output_name}-left.png")
    right_half.save(f"{OUTPUT_DIR}/{output_name}-right.png")
    canvas.save(f"{OUTPUT_DIR}/{output_name}-full.png")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Process single-bottle images
for filename, clean_name in BOTTLE_MAP.items():
    path = os.path.join(INPUT_DIR, filename)
    if os.path.exists(path):
        process_bottle(path, clean_name)
        print(f"Processed: {filename} → {clean_name}")

# Process the pair image (two bottles side by side — crop each half first)
pair_path = os.path.join(INPUT_DIR, PAIR_IMAGE)
if os.path.exists(pair_path):
    pair_img = Image.open(pair_path)
    mid_x = pair_img.width // 2
    left_bottle = pair_img.crop((0, 0, mid_x, pair_img.height))
    right_bottle = pair_img.crop((mid_x, 0, pair_img.width, pair_img.height))
    left_bottle.save(f"{OUTPUT_DIR}/_temp_red_pair.png")
    right_bottle.save(f"{OUTPUT_DIR}/_temp_gold_pair.png")
    process_bottle(f"{OUTPUT_DIR}/_temp_red_pair.png", "red-label-pair")
    process_bottle(f"{OUTPUT_DIR}/_temp_gold_pair.png", "gold-label")
    os.remove(f"{OUTPUT_DIR}/_temp_red_pair.png")
    os.remove(f"{OUTPUT_DIR}/_temp_gold_pair.png")
    print(f"Processed pair: {PAIR_IMAGE} → red-label-pair, gold-label")
```

**CRITICAL**: The carousel MUST show left-halves on the red side and right-halves on the white side. When one half transitions, the other half stays or transitions independently. The seam at center must be pixel-perfect — this is why all bottles share the same canvas dimensions.

---

## 3. App Architecture

### Tech Stack
```
Frontend:  React Native (Expo) — single codebase for iOS, Android, iPad, desktop (web)
Backend:   FastAPI (Python) — lightweight, async, AI-ready
AI:        Claude API (Anthropic) — menu scanning, wine pairing, image analysis
Database:  Supabase (PostgreSQL + Auth + Storage) or SQLite for MVP
Cache:     Local AsyncStorage for previous searches (7-day TTL)
Image:     expo-camera + expo-image-picker
```

### Alternative (Web-first MVP for rapid prototyping):
```
Frontend:  Next.js 14+ with Tailwind CSS + Framer Motion
Backend:   Next.js API routes → Claude API
Database:  SQLite/Supabase
Deploy:    Vercel (web), Capacitor (mobile wrapper later)
```

**Recommendation for one-shot**: Use **Next.js web app** for the MVP prototype. It can be tested immediately in browser (desktop + mobile responsive), and later wrapped with Capacitor/Expo for native. This lets Claude Code iterate visually in real-time via localhost.

---

## 4. Screen-by-Screen Specification

### 3.1 Home Screen (The Split Screen)

```
┌─────────────────────────────────────┐
│         ╭───────────────────╮       │
│    RED  │                   │ WHITE │
│   WINE  │     WINi          │ WINE  │
│   SIDE  │   [Bottle Half]   │ SIDE  │
│ #5C0A1E │   [Bottle Half]   │#E8DCC8│
│         │                   │       │
│         │  ┌─────────────┐  │       │
│         │  │ Search/Photo│  │       │
│         │  └─────────────┘  │       │
│         │                   │       │
│         ╰───────────────────╯       │
│                                     │
│  [Previous Searches] (if any exist) │
└─────────────────────────────────────┘
```

**Key behaviors:**
- **Split screen**: Left = dark burgundy, Right = warm golden cream
- **Center wine bottle**: Composited from two half-images, perfectly aligned at center seam
- **Bottle carousel**: 
  - Tap left side → red wine bottle halves cycle (Cabernet, Merlot, Syrah, Rosé...)
  - Tap right side → white wine bottle halves cycle (Riesling, Chardonnay, Sauvignon Blanc...)
  - Desktop: hover triggers cycle
  - Transition: smooth crossfade / slide-up
- **All bottle images must be same dimensions**, cropped to exact center line
- **Champagne/Prosecco/Sparkling**: When displayed on right side, subtle bubble particles rise on the cream background
- **Rosé**: Appears on left side (still in red wine family)
- **Search bar**: Centered, overlapping the split. Pill-shaped with subtle frosted glass effect
  - Placeholder text: "What are you eating tonight?" or "Scan your menu..."
  - Camera icon on the left, send arrow on the right
  - Tapping opens the input flow (camera + text)

**Inspiration (Lando Norris site):**
- The split-screen concept with dynamic interaction on hover/tap
- Smooth, cinematic transitions between states
- Content that feels alive and responsive to user input
- Parallax-like depth effects

### 3.2 Input Flow (Camera + Text)

When user taps the search bar:
1. **Camera opens** (or gallery picker)
2. User can take **multiple photos** (food menu pages, wine list pages, single dish)
3. Each photo gets a small thumbnail preview at bottom
4. Optional text input: "I'm having the lamb" or just leave it to AI
5. **Send button** → transitions to scanning state

**Scanning Animation:**
- WINi logo and bottle shrink/slide to top of screen (elegant spring animation)
- A subtle wine-pour animation or scanning line sweeps across
- Text: "Pairing your evening..." or "Reading the menu..."

### 3.3 Results Screen (The Pairing View)

```
┌─────────────────────────────────────┐
│  [WINi logo small]    [← Back]     │
│─────────────────────────────────────│
│                                     │
│   DISHES          │    WINES        │
│                   │                 │
│  ┌─────────┐     │  ┌──────────┐  │
│  │ Dish 1  │─ ─ ─┼──│ Wine A   │  │
│  └─────────┘  ╲  │  └──────────┘  │
│               ╲  │                 │
│  ┌─────────┐  ╲ │  ┌──────────┐  │
│  │ Dish 2  │────┼──│ Wine B   │  │
│  └─────────┘    │╲ └──────────┘  │
│                 │ ╲              │
│  ┌─────────┐   │  ╲┌──────────┐  │
│  │ Dish 3  │───┼───│ Wine C   │  │
│  └─────────┘   │   └──────────┘  │
│                 │   ┌──────────┐  │
│                 │   │ Wine D   │  │
│                 │   └──────────┘  │
│                 │                 │
│         [ Ready? ]                │
└─────────────────────────────────────┘
```

**The Connection Lines (Core Feature):**
- When user **taps a dish**: Animated energy lines flow FROM dish → TO recommended wines
  - Lines are thin, elegant, wine-colored (#9B2335)
  - Animation: flowing particles/dots travel along the line (like energy/current)
  - Think of it like wine flowing through a vine
  - **Hold/long-press**: Lines become slightly thicker, flow intensifies subtly (still elegant, not flashy)
  - Release or tap another dish: previous connections fade, new ones appear
- When user **taps a wine**: Lines flow FROM wine → TO compatible dishes
  - Same animation but direction reversed
  - This is intuitive: "this wine goes with these dishes"
- **Line style**: Bezier curves, not straight lines. Organic, flowing paths.
- **Colors**: Lines could be tinted based on wine type (red lines for red wine, golden for white)

**Wine Popup (on wine button press):**
- Small, non-intrusive card appears beside/below the wine button
- Contains:
  - Wine name & type (e.g., "2019 Château Margaux — Bordeaux Blend")
  - **1-2 sentence pairing reason**: "The tannins complement the lamb's richness while the dark fruit echoes the rosemary glaze"
  - Two small buttons:
    - "More on the pairing" → expands reasoning
    - "About this wine" → opens wine detail overlay
- Popup should NOT overlay other wine buttons (position intelligently)
- Dismiss by tapping elsewhere or tapping the wine button again

**Dish Buttons:**
- Elegant pill/card shape
- Dish name extracted from menu
- Small food category icon (🥩🐟🥗 etc. or abstract)
- Left-aligned column

**Wine Buttons:**
- Elegant pill/card shape
- Wine name + vintage if available
- Small color dot indicating wine type (red/white/rosé/sparkling)
- Right-aligned column
- If wine bottle image found → tiny bottle thumbnail

### 3.4 Wine Detail Overlay

When user taps "About this wine":
- Elegant full-screen or large modal slides up
- Contents:
  - Wine bottle image (if fetchable)
  - Wine name, vintage, winery
  - Region & appellation
  - Grape variety/varieties
  - Tasting notes (AI-generated from knowledge)
  - Brief origin story
  - **[Buy this wine →]** button (future: links to partner webstores)
  - **[Back to pairings]** button

### 3.5 "Ready?" Flow

- **Appears when**: User has selected at least one dish-wine pairing
- **Button**: Elegant, centered below the pairing view
- **On tap**: 
  - Subtle confirmation animation (checkmark, wine glass clink, etc.)
  - Records to database: `{ dishes: [...], wines: [...], pairings: [{dish, wine}], timestamp, location? }`
  - Returns to home screen
- **If user never presses Ready?**: That's fine — search is still cached locally

### 3.6 Previous Searches

- On home screen, if previous searches exist: small "Previous searches" link/button below the search bar
- Tapping reveals a list of past sessions (last 7 days)
- Each entry shows: date, number of dishes/wines, first dish name
- Tapping an entry restores the full pairing view for that session

---

## 5. AI Integration (Claude API)

### System Prompt for Menu Analysis
```
You are WINi, an expert sommelier AI. You analyze food menus and wine lists 
to provide elegant, knowledgeable wine pairing recommendations.

When given photos of a food menu and/or wine list:
1. Extract all dish names and descriptions
2. Extract all wines (name, vintage, grape, region if visible)
3. For each dish, rank the top 3-5 wine pairings from the available list
4. Provide a concise pairing reason (1-2 sentences) for each recommendation
5. Be ready to provide deeper wine knowledge on request

Response format: JSON
{
  "dishes": [
    {"id": "d1", "name": "...", "description": "...", "category": "meat|fish|vegetarian|..."}
  ],
  "wines": [
    {"id": "w1", "name": "...", "type": "red|white|rosé|sparkling", "grape": "...", "region": "...", "vintage": "..."}
  ],
  "pairings": [
    {"dish_id": "d1", "wine_id": "w1", "score": 0.95, "reason": "...", "detailed_reason": "..."}
  ]
}

Tone: Knowledgeable but approachable. Like a trusted sommelier friend, 
not a textbook. Brief and elegant.
```

### API Flow
1. User sends photos → Base64 encode → Send to Claude API with vision
2. Claude extracts menu items and wine list
3. Claude generates pairings with reasons
4. Frontend renders the pairing view
5. On "More info" requests → follow-up Claude API call for deeper wine knowledge

---

## 6. Data Model

```sql
-- Users (future auth)
users: id, created_at, device_id

-- Search sessions
sessions: id, user_id, created_at, location_lat, location_lng, 
          restaurant_name (extracted), status (active|completed)

-- Photos uploaded per session
session_photos: id, session_id, photo_url, photo_type (food_menu|wine_list|dish_photo)

-- Extracted dishes
dishes: id, session_id, name, description, category

-- Extracted wines  
wines: id, session_id, name, type, grape, region, vintage, bottle_image_url

-- AI-generated pairings
pairings: id, session_id, dish_id, wine_id, score, reason, detailed_reason

-- User selections (when "Ready?" is pressed)
selections: id, session_id, dish_id, wine_id, selected_at
```

---

## 7. Design Reference & Inspiration

### Visual DNA
- **Lando Norris site** (landonorris.com): Interactive split-screen, hover effects, cinematic feel
- **Vivino app**: Wine bottle imagery, clean cards (but WINi should be MORE elegant)
- **Aesop website**: Minimalist luxury, warm tones, refined typography
- **Diptyque website**: Dark elegance, serif typography, sensory design
- **Menu/restaurant apps**: Study how high-end restaurant apps present menus

### Animation Principles
- **Ease**: Use `cubic-bezier(0.16, 1, 0.3, 1)` for smooth, luxurious motion
- **Duration**: 300-600ms for transitions, 150-250ms for micro-interactions
- **The energy lines**: Use SVG path animation or Canvas for the flowing particle effect
- **Bottle transitions**: Crossfade with slight vertical slide (like pouring)

### What to AVOID
- Anything that looks like a generic food delivery app
- Bright, saturated colors (this is NOT Vivino's purple)
- Heavy drop shadows or 3D effects
- Cluttered UI — every element must earn its place
- Comic Sans energy — this is Château Margaux energy

---

## 8. Architecture Notes (No rigid file structure — let Claude Code decide)

**DO NOT prescribe a specific file/folder structure.** Claude Code should decide the best architecture based on what it builds. The only hard requirements are:

- Raw bottle images live in `wine-bottles/` at the project root (with their original upload filenames — the processing script handles renaming)
- Processed bottle halves end up somewhere in `public/` so Next.js can serve them
- The bottle processing script (Python) lives in `scripts/`
- Use Next.js App Router conventions for pages and API routes
- Everything else: component organization, hooks, utils, lib structure — Claude Code decides what makes sense

**Parallel Claude Code terminals**: For this one-shot, keep everything in a single terminal. The components are tightly coupled (shared types, state flows between screens, animation coordination) and splitting across terminals would create merge conflicts. In Phase 2, consider spawning a second terminal for isolated tasks like: building a standalone marketing landing page, creating the bottle processing pipeline separately, or building admin/analytics dashboards that don't share state with the main app.

---

## 9. Claude Code One-Shot Prompt

Copy everything below the line and paste it as your Claude Code prompt:

---

```
I need you to build the WINi (Wine Information) app — a premium wine pairing tool. Read the full spec from WINI_PROJECT.md in the repository root.

## FIRST: Process bottle images

Before building the app, process the wine bottle photos in the wine-bottles/ directory. The files have their original upload names — your processing script must map them to clean names:

Original filename → Description → Clean name:
- _Pngtree_brown_wine_bottle_illustration_4673479.png → Golden Chardonnay bottle → "chardonnay"
- _Pngtree_wine_bottle_5987023.png → Dark bottle, silver label → "silver-reserve"  
- mockup-free-kJp843ucZ1I-unsplash.jpg → TWO bottles side by side (red + gold labels) → crop each, "red-label-pair" + "gold-label"
- lloyd-kearney-RycZY-SLefE-unsplash.jpg → Costières de Nîmes red → "costieres-red"
- arshla-jindal-JTPrf0at-6I-unsplash.jpg → Jacob's Creek Shiraz → "shiraz-cabernet"
- mockup-free-I3vIA3CPU7o-unsplash.jpg → Single bottle, red/coral label → "red-label"

Steps:
1. Install rembg and Pillow: pip install rembg Pillow
2. Write a processing script that maps original filenames → clean names, removes backgrounds, normalizes to 400x800px transparent PNGs, splits each into left/right halves
3. The pair mockup has TWO bottles — crop each individually before processing
4. Output processed halves to public/ (you decide the exact path)

Bottle categorization for the carousel:
- RED SIDE (left halves): costieres-de-nimes.jpg, red-label-mockup.jpg, jacobs-creek-shiraz.jpg
- WHITE SIDE (right halves): brown-wine-bottle.png (golden Chardonnay style), gold-label from the pair mockup
- EITHER SIDE: silver-label-bottle.png

## What to build

A Next.js 14+ web app (mobile-first responsive) with these core screens:

### 1. HOME SCREEN — The Split Screen
- Left half: deep burgundy (#5C0A1E), Right half: warm golden cream (#E8DCC8)  
- Center: wine bottle composited from two halves — left half from a red wine bottle, right half from a white wine bottle, perfectly aligned at the center seam
- Bottle carousel: tap/hover left side cycles red wine bottle halves, right side cycles white wine bottle halves
- When champagne/sparkling is shown on right, subtle rising bubble particles on cream side
- Center search bar: frosted glass pill, camera icon + send icon, placeholder "What are you eating tonight?"
- "Previous searches" link if cached sessions exist

### LOGO TYPOGRAPHY — CRITICAL
- **"WIN"** in Cinzel Bold — heavy Roman inscription capitals, like carved stone
- **"i"** in Cormorant Garamond Italic (or Playfair Display Italic) — elegant, flowing, noticeably different from the Roman capitals
- The contrast between the monumental "WIN" and the delicate "i" IS the brand identity
- The "i" should be slightly smaller or baseline-shifted to feel like a whispered addition
- Color: The logo text should work in both light (on dark bg) and dark (on light bg) variants

### DESIGN MOCKUP
There is a hand-drawn mockup in wine-bottles/Wini_app_vision.png — LOOK AT THIS FIRST. It shows the founder's vision: split screen (dark red left, cream/gold right), wine bottle centered on the dividing line, "WINi" text at top, search bar in the middle. Your implementation should be a polished, luxury version of this layout.

### DESIGN INSPIRATION
- landonorris.com: interactive hover effects, cinematic split-screen feel
- Aesop/Diptyque websites: luxury minimalism, warm earth tones, serif typography
- This must look like it was designed by a world-class luxury brand designer, NOT a tech startup

### 2. INPUT FLOW
- Tap search bar → camera/gallery picker opens (use file input on web)
- Take multiple photos (menu pages, wine list, dish)
- Optional text input alongside photos
- Send → scanning animation (logo shrinks to top, "Pairing your evening..." with wine-pour animation)
- Photos sent to /api/analyze endpoint → Claude API with vision analyzes menu + wine list

### 3. PAIRING VIEW — The Core Feature
- WINi logo/bottle small at top
- Left column: extracted dishes as elegant pill buttons
- Right column: extracted wines as elegant pill buttons (with wine type color dot)
- **THE LINES**: When user taps/holds a dish, animated SVG bezier curves connect dish → recommended wines
  - Flowing particles along the lines (like wine/energy flowing through vines)
  - Hold longer = slightly more intense flow (still elegant)
  - Tap a wine button instead → lines flow wine → compatible dishes (reversed direction)
  - Lines are thin, wine-colored (#9B2335), organic bezier curves
- Wine popup: on tap, small card appears with wine name, 1-2 sentence pairing reason
  - "More on pairing" and "About this wine" buttons in popup
- "Ready?" button appears when user has at least one pairing selected
  - Records selections to local storage / API

### 4. WINE DETAIL OVERLAY  
- Slides up from bottom, elegant modal
- Wine name, type, region, grape, tasting notes, origin story (from Claude API)
- "Buy this wine" placeholder button

### 5. PREVIOUS SEARCHES
- Cached locally for 7 days
- List on home screen showing past sessions
- Tap to restore full pairing view

## Technical Requirements

1. **Next.js 14+ App Router** with TypeScript
2. **Tailwind CSS** + custom design tokens in tailwind.config
3. **Framer Motion** for all animations (transitions, bottle carousel, line animations)
4. **SVG + Canvas** for the flowing connection lines with particle effects
5. **Claude API** (use environment variable ANTHROPIC_API_KEY) for:
   - /api/analyze: accepts base64 images + optional text, returns JSON with dishes, wines, pairings
   - /api/wine-info: accepts wine name, returns detailed wine information
6. **LocalStorage** for session caching (7-day TTL)
7. **Mobile-first**: design for 390px width first, scale up to tablet/desktop
8. **Google Fonts**: Cinzel (for WIN), Cormorant Garamond (for the i + headings), Jost (for UI)

## Design System — NON-NEGOTIABLE

- NO generic UI patterns — every element must feel bespoke
- Color palette: burgundy (#5C0A1E, #7A1B3D), cream (#E8DCC8, #F5EDD6), gold accent (#C9A84C), charcoal (#0D0D0D)
- Animations: cubic-bezier(0.16, 1, 0.3, 1), 300-600ms transitions
- Micro-interactions on every button (subtle scale, glow, or color shift)
- The energy/connection lines are THE signature feature — make them beautiful
- Frosted glass effects where appropriate (backdrop-blur)

## Bottle Carousel — CRITICAL DETAILS

- Left side shows LEFT HALVES of red wine bottles, right side shows RIGHT HALVES of white wine bottles
- The two halves meet at the exact center pixel — the seam must be invisible
- All bottle images are 400x800px transparent PNGs after processing
- Each half is therefore 200x800px
- Transition: crossfade with slight vertical slide
- Desktop: hover over a side to trigger carousel advance
- Mobile: tap a side to advance

## API Integration

For the Claude API analyze endpoint, use this system prompt:
"You are WINi, an expert sommelier AI. Analyze the provided menu photos and extract dishes and wines. Generate wine pairing recommendations. Respond ONLY in JSON format: {dishes: [{id, name, description, category}], wines: [{id, name, type, grape, region, vintage}], pairings: [{dish_id, wine_id, score, reason, detailed_reason}]}"

Send images as base64 in the Claude messages API with vision capability.

## One-Shot Execution Plan

1. Process bottle images (background removal, normalize, split)
2. Initialize Next.js project with TypeScript, Tailwind, Framer Motion
3. Set up design system (colors, fonts, tokens in tailwind.config + globals.css)
4. Build the home screen with split-screen, bottle carousel, search bar, bubble effects
5. Build the camera/input flow with photo capture and Claude API integration
6. Build the pairing view with the animated connection lines (this is the hardest part — invest time here)
7. Build wine popup and wine detail overlay
8. Build the "Ready?" flow and local storage caching
9. Build previous searches view
10. Polish all animations and responsive behavior
11. Test on mobile viewport (390px) and desktop

Start the dev server on port 3000 and verify each component visually as you build. 

IMPORTANT: The connection lines animation is the centerpiece. Use an SVG layer with animated paths and small circles/dots that travel along the bezier curves. The particles should have slight randomness in speed and opacity for organic feel. When a dish is held, increase particle count and speed by ~30%.

Build this completely — all screens, all interactions, all API routes. This is a one-shot build.

## Architecture Freedom

You decide the file/folder structure. No prescribed component tree — organize however makes sense for the codebase. The only hard constraints:
- Raw bottles in wine-bottles/, processed output in public/ somewhere
- Processing script in scripts/
- Next.js App Router conventions for pages/API routes
- Everything else is your call

## On Parallel Terminals

Do NOT spawn a second Claude Code terminal for this build. The screens share state, types, and animation systems — parallel work would cause conflicts. Build sequentially in one terminal. If you want to parallelize later (e.g., a separate marketing landing page or admin dashboard), that's Phase 2.
```

---

## 10. Environment Setup

Before running Claude Code, ensure:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Your Claude API key
```

---

## 11. Future Roadmap (Not for MVP)

### Phase 2 — Commercialization
- Partner webstore integrations (affiliate links)
- Wine marketing campaigns & sponsored placements
- Premium tier with unlimited scans
- Restaurant partnerships (pre-loaded menus)

### Phase 3 — Social & Data
- Share pairings with dining group
- Selection data analytics dashboard
- Wine preference learning (ML on user selections)
- Regional wine trend reports (sellable data)

### Phase 4 — Platform
- Restaurant-facing dashboard (upload menus, see pairing analytics)
- Winery advertising platform
- Seasonal campaign manager
- Wine club integrations

---

*Created for Alfred Leppänen — WINi Project*
*Last updated: February 2026*
