---
description: Analyze current project and suggest relevant workflows
allowed-tools: Bash, Read, Glob, Grep
auto-invoke: on-directory-change
---

Automatically scan the current project to understand its context and suggest relevant skills/workflows.

## Project Analysis

### 1. Detect Project Type
```bash
# Check for project indicators
[ -f "package.json" ] && echo "Node.js/TypeScript project"
[ -f "pyproject.toml" ] && echo "Python project"
[ -f "Cargo.toml" ] && echo "Rust project"
[ -f "go.mod" ] && echo "Go project"
```

### 2. Identify Framework
```bash
# Node.js frameworks
grep -q "next" package.json 2>/dev/null && echo "Next.js"
grep -q "react" package.json 2>/dev/null && echo "React"
grep -q "vue" package.json 2>/dev/null && echo "Vue"
grep -q "astro" package.json 2>/dev/null && echo "Astro"

# Python frameworks
grep -q "fastapi" pyproject.toml 2>/dev/null && echo "FastAPI"
grep -q "django" pyproject.toml 2>/dev/null && echo "Django"
grep -q "flask" pyproject.toml 2>/dev/null && echo "Flask"
```

### 3. Check for Project-Specific Skills
```bash
ls .claude/commands/*.md 2>/dev/null || echo "No project-specific skills"
```

### 4. Check for MCP Configuration
```bash
cat .mcp.json 2>/dev/null || echo "No MCP configuration"
```

### 5. Check for CI/CD
```bash
ls .github/workflows/*.yml 2>/dev/null || echo "No GitHub Actions"
ls .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI"
ls azure-pipelines.yml 2>/dev/null || echo "No Azure Pipelines"
```

## Output Format

```markdown
### 📊 Project Context

**Type:** [Python/FastAPI | TypeScript/Next.js | etc.]
**Location:** [Current directory]
**Git Branch:** [Current branch if applicable]

**Available Skills:**
- Global: /code-review, /commit-push-pr, /design-review, /security-review, /test, /validate, /api-test, /visual-test
- Project-specific: [List .claude/commands/*.md if they exist]

**Recommended Workflows for this Project:**

Based on the detected project type, here are the most relevant skills:

**For [Framework] Development:**
- `/test` - Run tests after code changes
- `/validate` - Full validation before commit (lint, typecheck, test, build)
- `/[framework-specific]` - [If project has custom skills]

**Before Committing:**
- `/code-review` - Review changes
- `/security-review` - Security check (if handling auth/data)
- `/commit-push-pr` - Commit, push, and create PR

**For UI Work:**
- `/visual-test` - Visual testing with Playwright (requires playwright MCP)
- `/design-review` - UI/UX review

**For API Development:**
- `/api-test` - Test API endpoints

**MCP Servers:**
[List available MCP servers from .mcp.json if present]

**Deep Reference (archive, read on-demand):**

For edge cases beyond what's in CLAUDE.md:
- `C:\Dev\.claude\knowledge\ui-guidelines.md` — Full CSS code examples
- `C:\Dev\.claude\knowledge\library-pitfalls.md` — Extended React Flow/Zustand patterns
- `C:\Dev\.claude\knowledge\learnings.md` — Full learning log with dates/validation

---
*Run /scan-project anytime to refresh this context*
```

## Instructions

1. **Detect project type** by checking for indicator files
2. **Find framework** by inspecting package.json/pyproject.toml
3. **List available skills** (global + project-specific)
4. **Suggest relevant workflows** based on project type
5. **Check MCP availability** and suggest if missing
6. **Note deep reference** modules available in `.claude/knowledge/` for edge cases
7. **Output concise summary** so user knows what's available

## Usage

This skill should be run:
- When Claude first starts working in a new directory
- When user runs `/scan-project` manually
- When user asks "what can you do here?" or "what skills are available?"
