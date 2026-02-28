---
name: auto-wrap-up
description: Capture session learnings and handoff notes. Use when context reaches ~85%, user signals session end ("done", "thanks", "bye"), or a major feature is completed.
user-invocable: false
allowed-tools: Read, Write, Edit, Glob
---

# Auto Wrap-up

Proactively capture session state before context is lost.

## Trigger Conditions
- Context usage approaching auto-compact threshold (~85%)
- User signals: "done", "that's all", "thanks", "bye", "end of day"
- Major feature or task completed
- Project switch detected

## Process
1. Scan session for accomplishments, blockers, decisions, caveats
2. Classify learnings: hypothesis → validated → proven
3. Auto-promote proven learnings to CLAUDE.md
4. Write session log to `.claude/session-logs/YYYY-MM-DD-[project].md`
5. Update PROGRESS.md if it exists
6. Generate handoff with **Next prompt** field

## Handoff Format
```markdown
## Handoff: [Project]
**Left off at:** [specific state]
**Changes:** [files touched + why]
**Checks run:** [tests/commands and results]
**Next steps:**
- [ ] [task 1]
- [ ] [task 2]
**Open questions:** [if any]
**Next prompt:** [exact continuation instruction for next session]
```
