---
name: swarm-orchestration
description: Guide parallel work decisions — agent teams vs sub-agents vs worktrees. Use when user mentions "parallel", "team", "swarm", "agent team", or when evaluating parallelization strategies.
allowed-tools: Read, Bash, Task
---

# Swarm Orchestration

Opt-in guidance for when and how to use Claude Code Agent Teams (experimental).

## Decision Matrix

Before spawning anything, ask: **"Would 3 sub-agents solve this cheaper?"**

```
Is the work parallelizable?
├── No → Single session
└── Yes
    ├── Do tasks need inter-agent discussion?
    │   ├── No → Do tasks need separate branches?
    │   │   ├── Yes → Git Worktrees
    │   │   └── No → Sub-agents (Task tool)
    │   └── Yes → Agent Teams (this skill)
    └── Is it cost-justified? (Teams cost 3-5x more tokens)
        ├── No → Sub-agents
        └── Yes → Agent Teams
```

| Strategy | When | Cost | Communication |
|----------|------|------|---------------|
| **Sub-agents** (Task tool) | Focused, independent tasks | 1x | None (fire-and-forget) |
| **Git Worktrees** | Separate branches, no shared files | 1x per session | Manual merge |
| **Agent Teams** | Inter-agent discussion needed, shared context | 3-5x | Built-in messaging + shared task list |
| **Single session** | Sequential work, shared state | 1x | N/A |

## Enable Agent Teams

Requires environment variable (already set in global settings):
```
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

**Windows constraint**: Use `in-process` mode only. Split-pane/tmux modes don't work on Windows Terminal. Launch with:
```bash
claude --teammate-mode in-process
```

## Team Composition

- **2-4 teammates** — more causes coordination overhead to exceed benefit
- **Sonnet for workers** — Opus for lead/coordination, Sonnet for execution teammates
- **5-6 tasks per teammate** — enough to stay busy, not so many they lose focus
- **Clear role names** — `frontend-dev`, `api-dev`, `test-writer`, not `agent-1`, `agent-2`

## Context Handoff (Critical)

**Teammates do NOT inherit the lead's conversation history.** Every spawn prompt must be self-contained.

Bad:
```
"Implement the feature we discussed"
```

Good:
```
"You are frontend-dev. Your task: Build a dashboard component at src/components/Dashboard.tsx.

Requirements:
- Display user metrics from /api/metrics endpoint
- Use existing Card component from src/components/ui/Card.tsx
- Follow the project's dark-first design system (oklch colors, see CLAUDE.md)
- Add loading skeletons, not spinners

Files you OWN (only you edit these):
- src/components/Dashboard.tsx (create)
- src/components/DashboardChart.tsx (create)

Files you may READ but not edit:
- src/components/ui/Card.tsx
- src/types/metrics.ts

When done, mark your tasks complete in the task list."
```

## File Ownership

**Assign explicit file ownership per teammate** to prevent merge conflicts and overwrites.

```
Lead:         Coordination only (Delegate mode — Shift+Tab)
frontend-dev: src/components/Dashboard.tsx, src/components/DashboardChart.tsx
api-dev:      src/api/metrics/route.ts, src/lib/metrics.ts
test-writer:  src/__tests__/Dashboard.test.tsx, src/__tests__/metrics.test.ts
```

Rules:
- Each file has exactly ONE owner
- Shared types/interfaces: lead creates first, teammates read-only
- If two teammates need the same file, restructure the split

## Delegate Mode

Switch lead to **Delegate mode** (Shift+Tab) to restrict it to coordination-only:
- Lead manages task list, reviews teammate output, resolves conflicts
- Lead does NOT write code directly
- Prevents lead from duplicating teammate work

## Prompt Templates

### Template 1: Parallel Code Review
```
Spawn 3 teammates to review different aspects of the codebase:

Teammate "security-reviewer":
- Review all files in src/api/ for OWASP top 10 vulnerabilities
- Check authentication, input validation, SQL injection risks
- Report findings as task comments

Teammate "perf-reviewer":
- Review components in src/components/ for React performance issues
- Check for unnecessary re-renders, missing memoization, bundle size
- Report findings as task comments

Teammate "test-reviewer":
- Audit test coverage in src/__tests__/
- Identify untested edge cases and missing integration tests
- Report findings as task comments

I (lead) will synthesize all findings into a single review document.
```

### Template 2: Cross-Layer Feature
```
Feature: [description]

Teammate "api-dev":
- Implement API endpoint at src/api/[route]/route.ts
- Add Pydantic/Zod validation for request/response
- Files owned: src/api/[route]/, src/lib/[module].ts

Teammate "frontend-dev":
- Build UI component at src/components/[Name].tsx
- Connect to API endpoint, handle loading/error states
- Files owned: src/components/[Name]*.tsx

Teammate "test-dev":
- Write tests for both API and UI
- Files owned: src/__tests__/[name]*.test.ts(x)

Shared types (I will create first): src/types/[name].ts
```

## Quality Gates

Monitor teammate progress via the shared task list. Key checkpoints:

1. **Before spawn**: Cost gate — confirm teams are justified over sub-agents
2. **During execution**: Check task list for stuck teammates (no progress in 5+ minutes)
3. **After completion**: Lead reviews all teammate output before marking feature done
4. **Verification**: Run full verification pipeline (typecheck + lint + test) after merging teammate work

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Spawning teams for simple tasks | 3-5x cost for no benefit | Use sub-agents or single session |
| Vague spawn prompts | Teammates hallucinate requirements | Self-contained prompts with files, types, examples |
| No file ownership | Teammates overwrite each other | Assign explicit file ownership per teammate |
| Lead writes code too | Duplicated effort, merge conflicts | Use Delegate mode (Shift+Tab) |
| Too many teammates (5+) | Coordination overhead > parallelism benefit | Cap at 4, prefer 2-3 |
| Shared mutable state | Race conditions in file edits | Lead creates shared interfaces first |
| No cost gate | Burning tokens on parallelizable-but-cheap work | Always ask "Would sub-agents work?" first |
| Skipping verification | Teammates produce code that doesn't integrate | Full typecheck+lint+test after merge |

## Limitations (Experimental)

- Agent teams is an **experimental feature** — behavior may change
- Windows: only `in-process` mode works (no split-pane/tmux)
- Teammates cannot use MCP tools unless explicitly configured
- Task list is shared but conversation history is NOT shared between teammates
- No automatic conflict resolution — lead must manually handle file conflicts
- Token usage scales linearly with teammate count (budget accordingly)
