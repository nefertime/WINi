# Set Terminal Color Profile

Create or update a Windows Terminal profile for the current project with a custom color tint.

## Instructions

Read and follow the skill file at `C:\Dev\.claude\skills\terminal-color\SKILL.md`.

Execute all steps in order:
1. Detect the current project directory and derive a display name
2. Ask the user which color they want (use AskUserQuestion with the preset options from the skill)
3. Generate the color scheme based on their choice
4. Generate a deterministic GUID from the project path (no duplicates on re-run)
5. Read Windows Terminal settings.json, add/update the profile and scheme
6. Confirm to the user with instructions on how to use it
