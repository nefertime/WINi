---
description: Capture session learnings and prepare handoff
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Session Wrap-up (Autonomous Mode)

> **PROACTIVE BEHAVIOR**: Claude should auto-invoke this skill when:
> - Context reaches ~85% (auto-compact threshold)
> - User says "done", "that's all", "thanks", or similar session-end signals
> - Major feature/task completed
> - Extended idle period detected
>
> **DO NOT WAIT** for user to invoke `/wrap-up` - be proactive.

## Process

### 1. Quick Session Scan
Analyze the session to extract:
- **Accomplishments**: What was completed
- **Blockers**: What slowed progress
- **Decisions**: Key architectural/approach choices
- **Caveats**: Gotchas, pitfalls, debugging insights discovered

### 2. Learning Classification

Classify each learning by confidence:
| Level | Criteria | Action |
|-------|----------|--------|
| **hypothesis** | New discovery, untested | Add to `learnings.md` only |
| **validated** | Worked 1-2 times | Add to `learnings.md`, flag for review |
| **proven** | Worked 3+ times | **AUTO-PROMOTE to CLAUDE.md** |

### 3. Auto-Promotion to CLAUDE.md

When a learning reaches **proven** status:

1. **Compress** it to 1-2 lines (passive context style)
2. **Add** to appropriate CLAUDE.md section:
   - `[Lib]` for library pitfalls
   - `[Env]` for environment quirks
   - `[Lang]` for language patterns
   - `[Validated Learnings]` table for cross-cutting insights
3. **Mark** as promoted in `learnings.md`

Example promotion:
```
# In learnings.md (before):
**Confidence:** proven (5 uses)
**Insight:** When React keys collide from multiple sources...

# In CLAUDE.md (after):
## [Lib] React
- **Key collisions**: Multi-source lists need composite keys `${sourceId}-${itemId}`
```

### 4. Documentation Updates (4-Tier Hierarchy)

Update ALL relevant tiers — information flows upward from session to brain:

```
C:\Dev\CLAUDE.md                           ← Brain: cross-project patterns + validated learnings
  └── [project]\CLAUDE.md                  ← Project: architecture, milestones, active work
      └── .claude\memory\MEMORY.md         ← Auto-memory: current state (always loaded, ≤200 lines)
          └── .claude\session-logs\        ← Archives: full session details (on-demand)
```

| Tier | File | Update When |
|------|------|-------------|
| **Archive** | `.claude/session-logs/YYYY-MM-DD-[project].md` | Every wrap-up (always) |
| **Auto-memory** | Project memory `MEMORY.md` | Every wrap-up — current state, gotchas, quick commands |
| **Project** | `[project]\CLAUDE.md` | Milestones hit, architecture changes, known issues |
| **Brain** | `C:\Dev\CLAUDE.md` `[Validated Learnings]` table | Proven learnings (2x+), new cross-project patterns |

**Always update:** session log + MEMORY.md
**Conditionally update:** project CLAUDE.md (milestones) + root CLAUDE.md (proven learnings)
**Knowledge base:** `C:\Dev\.claude\knowledge\learnings.md` — all learnings with confidence tracking

### 5. Handoff Notes

Generate for session continuity:
```markdown
## Handoff: [Project]
**Left off at:** [specific state]
**Changes:** [files touched + why]
**Checks run:** [tests/commands executed and results]
**Next steps:**
- [ ] [task 1]
- [ ] [task 2]
**Open questions:** [if any]
**Next prompt:** [exact instruction for the next session to continue seamlessly]
```

The **Next prompt** field is critical — it tells the next session exactly how to pick up without reading the full session log.

## Output Format

```markdown
## 📋 Session Wrap-up
**Date:** YYYY-MM-DD
**Project:** [name or "global"]

### ✅ Accomplished
- [completions]

### 🧠 Learnings Captured
| Learning | Confidence | Action |
|----------|------------|--------|
| [insight] | hypothesis | Added to learnings.md |
| [insight] | proven | **Promoted to CLAUDE.md** |

### 📝 Documentation Updated
- ✓ `.claude/knowledge/learnings.md`: Added [X]
- ✓ `CLAUDE.md`: Promoted [Y] to [Lib] section

### 🔄 Handoff
**Continue from:** [state]
**Next:** [recommendations]
**Next prompt:** `claude -p "Read CLAUDE.md and PROGRESS.md. [exact continuation instruction]"`
```

## Proactive Triggers

Claude should auto-run wrap-up when detecting:

1. **Context threshold**: Auto-compact warning or ~85% usage
2. **Session-end signals**: "done", "that's all", "thanks", "bye", "end of day"
3. **Task completion**: User confirms feature is complete
4. **Project switch**: User mentions different project
5. **Long response**: After completing major implementation

**Implementation**: No explicit trigger needed. Claude monitors context and acts proactively.

## Self-Improvement Loop

```
Session N → Learnings captured (hypothesis)
    ↓
Session N+1 → Same pattern works (validated)
    ↓
Session N+2 → Pattern confirmed (proven)
    ↓
Auto-promote to CLAUDE.md → Available in Session N+3 passively
```

This creates a **continuously improving** instruction set without user intervention.
