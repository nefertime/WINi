# Terminal Color Profile Skill

## Trigger
User invokes `/set-terminal-color` or asks to set terminal color/profile for a project.

## Goal
Create a Windows Terminal profile for the current project with a custom color tint, so each project has a visually distinct tab that auto-launches Claude Code in the correct directory.

## Workflow

### Step 1: Detect Project Context
- Get current working directory (`pwd`)
- Extract project name from the directory (last folder name)
- Generate a human-friendly display name from the folder name (e.g., `K-ruoka-retail-inventory-pricing-analyses` → `K-Ruoka Pulse`, `my-saas-app` → `My SaaS App`)

### Step 2: Ask User for Color
Use AskUserQuestion to let the user pick a color theme. Offer these presets plus a custom option:

| Label | Background | Description |
|-------|-----------|-------------|
| Ocean Blue | `#0a1a2e` | Dark navy blue tint |
| Forest Green | `#0a2e1a` | Dark forest green tint |
| Royal Purple | `#1a0a2e` | Dark purple tint |
| Ember Red | `#2e0a0a` | Dark warm red tint |
| Amber Gold | `#2e2a0a` | Dark golden tint |
| Teal | `#0a2e2e` | Dark teal/cyan tint |
| Rose | `#2e0a1a` | Dark rose/pink tint |
| Slate | `#1a1a22` | Dark neutral slate |

If user picks "Other", ask for a hex background color.

### Step 3: Generate Color Scheme
From the chosen background hex, generate a full harmonious color scheme. Use the background hue to tint the foreground, cursor, and selection colors. Keep ANSI colors vibrant and readable against the dark background.

**Color generation rules from background hex:**
- `foreground`: Lighten background hue significantly, low saturation (`d6__f0` range)
- `cursorColor`: Saturated version of the dominant hue
- `selectionBackground`: Mid-tone of the dominant hue
- ANSI colors: Keep standard vibrant colors that read well on dark backgrounds
- Adjust `black` to be slightly lighter than background
- Adjust `white` to match foreground

### Step 4: Generate Unique GUID
Generate a deterministic GUID from the project directory path so re-running the skill updates the existing profile rather than creating duplicates. Use a simple hash approach:
```python
import hashlib
h = hashlib.md5(project_path.encode()).hexdigest()
guid = f"{{{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}}}"
```
Or in bash, use `md5sum` / `printf` to format.

### Step 5: Update Windows Terminal Settings
**File location:** `$LOCALAPPDATA/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`

1. Read the current settings.json
2. Check if a profile with the same GUID already exists → update it. Otherwise → add new profile to the list.
3. Check if a scheme with the same name already exists → update it. Otherwise → add to schemes array.

**Profile template:**
```json
{
    "guid": "{generated-guid}",
    "name": "{Display Name}",
    "commandline": "C:\\Program Files\\Git\\bin\\bash.exe --login -i -c 'claude; exec bash'",
    "startingDirectory": "{project-path-with-backslashes}",
    "colorScheme": "{Display Name}",
    "tabTitle": "{Display Name}",
    "suppressApplicationTitle": true,
    "icon": "{contextual-emoji}",
    "hidden": false
}
```

**Icon selection** — pick a contextual emoji based on project name keywords:
- "retail", "store", "shop" → shopping bag or chart
- "api", "backend", "server" → gear or server
- "ui", "frontend", "web" → globe or paintbrush
- "data", "analytics", "analysis" → chart
- "game" → game controller
- default → folder or rocket

### Step 6: Confirm
Tell the user:
- Profile name and color
- How to open it (Windows Terminal dropdown → profile name)
- That Claude Code will auto-launch in the project directory
- That they can re-run `/set-terminal-color` to change the color

## Constraints
- NEVER delete existing profiles or schemes — only add or update
- Always read settings.json before modifying (don't assume structure)
- Use Edit tool for surgical changes, not Write (to preserve formatting)
- Keep the JSON valid — Windows Terminal silently ignores broken settings
- Deduplicate: if profile/scheme name exists, update in place
- The `.bashrc` encoding issue (UTF-16) is a known gotcha — do NOT touch .bashrc in this skill

## Files
- **Modifies**: `$LOCALAPPDATA/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`
- **Must NOT change**: Any project files, .bashrc, Claude Code settings

## Acceptance
- Windows Terminal settings.json has the new profile and color scheme
- Opening the profile tab shows the correct color tint
- Tab title shows the project display name
- Claude Code launches automatically in the correct directory
- Re-running updates existing profile (no duplicates)
