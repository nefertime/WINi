---
name: progress-tracker
description: Track multi-session feature progress. Use when starting a multi-session feature, resuming work from a previous session, or when PROGRESS.md exists in the project.
allowed-tools: Read, Write, Edit, Glob
---

# Progress Tracker

Maintain continuity across sessions for features that span multiple conversations.

## When to Activate
- Starting a feature that will take multiple sessions
- Resuming work (PROGRESS.md exists)
- Task status changes (started, blocked, completed)
- Session wrap-up on a multi-session feature

## On Session Start
1. Check for `PROGRESS.md` or `.claude/PROGRESS.md`
2. Read current state: what's done, what's next, what's blocked
3. Verify branch state matches expected progress
4. Resume from documented state

## On Task Change
Update PROGRESS.md with:
```markdown
## [Feature Name]
**Branch:** feature/name
**Status:** in-progress | blocked | completed
**Last updated:** YYYY-MM-DD

### Completed
- [x] Task description

### In Progress
- [ ] Current task

### Blocked
- [ ] Blocked task — reason

### Known Issues
- Issue description

### Next Session
[Exact instruction for continuation]
```

## On Session End
- Update all task statuses
- Note any new blockers or discoveries
- Write the **Next Session** field with specific continuation prompt
