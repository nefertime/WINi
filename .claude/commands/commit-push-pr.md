---
description: Commit all changes, push to remote (if available), and create a PR
allowed-tools: Bash(git:*), Bash(gh:*), Task
---

Analyze changes, run code review, then commit (and push/PR if remote exists).

## Current State

**Git Status:**
```
!`git status`
```

**Remote configured:**
```
!`git remote -v`
```

**Recent commits (for style reference):**
```
!`git log --oneline -5`
```

**Changes to commit:**
```
!`git diff --stat`
```

## Instructions

1. **Analyze the changes** - Understand what was modified and why

2. **Run code review** (auto-review step)
   - Use the Task tool to spawn a review: `Task(subagent_type="general-purpose", prompt="Read C:\Dev\.claude\agents\pragmatic-code-review.md for your review framework. Then review the git diff output below for critical issues, suggestions, and nitpicks. [paste diff]")`
   - If **Critical Issues** are found: STOP and report them to the user
   - If only Suggestions/Nitpicks: proceed (mention them in PR description)

3. **Create a descriptive commit message** following conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `docs:` for documentation
   - `test:` for test changes
   - `chore:` for maintenance

4. **Stage and commit** all relevant changes

5. **Check for remote** - If `git remote -v` returns empty:
   - STOP here after committing
   - Report: "Committed locally. No remote configured - skipping push/PR."

6. **Push to remote** (only if remote exists) with upstream tracking

7. **Create PR** using `gh pr create` with:
   - Clear title matching commit style
   - Summary of changes in body
   - Include any review suggestions as "Known improvements" section
   - Test plan section

If branch already has PR, just commit and push.

## Skip Review Option

If user explicitly says "skip review" or "quick commit", skip step 2 and proceed directly.

## Local-Only Repos

For repos without a remote, this skill will:
- Run code review (unless skipped)
- Stage and commit changes
- Skip push and PR creation
- Report successful local commit
