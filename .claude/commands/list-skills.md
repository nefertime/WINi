---
description: List all available skills and their descriptions
allowed-tools: Bash, Read, Glob
---

List all available skills (commands) from global and project-specific locations.

## Skill Discovery

### 1. Global Skills
```bash
echo "=== Global Skills (C:/Dev/.claude/commands/) ==="
for file in /c/Dev/.claude/commands/*.md; do
  if [ -f "$file" ]; then
    name=$(basename "$file" .md)
    desc=$(grep "^description:" "$file" | cut -d: -f2- | xargs)
    echo "/$name - $desc"
  fi
done
```

### 2. Project-Specific Skills
```bash
echo -e "\n=== Project-Specific Skills (./.claude/commands/) ==="
if [ -d ".claude/commands" ]; then
  for file in .claude/commands/*.md; do
    if [ -f "$file" ]; then
      name=$(basename "$file" .md)
      desc=$(grep "^description:" "$file" | cut -d: -f2- | xargs)
      echo "/$name - $desc"
    fi
  done
else
  echo "No project-specific skills found"
fi
```

### 3. Available Agents
```bash
echo -e "\n=== Available Sub-Agents (C:/Dev/.claude/agents/) ==="
for file in /c/Dev/.claude/agents/*.md; do
  if [ -f "$file" ]; then
    name=$(basename "$file" .md)
    desc=$(grep "^description:" "$file" | cut -d: -f2- | xargs)
    echo "- $name: $desc"
  fi
done
```

## Output Format

```markdown
### 🛠️ Available Skills

**Global Skills:**
- /code-review - Comprehensive code review of current branch changes
- /commit-push-pr - Commit all changes, push to remote, and create a PR
- /design-review - UI/UX design review with visual testing
- /health-check - Comprehensive codebase health assessment with actionable optimization opportunities
- /security-review - Security-focused code review of current branch
- /test - Run tests for the current project
- /validate - Full validation pipeline - lint, typecheck, test, build
- /api-test - Test API endpoints with detailed validation
- /visual-test - Comprehensive visual testing with Playwright
- /list-skills - List all available skills and their descriptions
- /scan-project - Analyze current project and suggest relevant workflows

**Project-Specific Skills:**
[List if .claude/commands/ exists in current project]

**Sub-Agents:**
- pragmatic-code-review: Thorough code reviews balancing quality and velocity
- build-validator: Validate that project builds successfully
- test-runner: Run tests and report results
- code-simplifier: Simplify and clean up code after implementation
- design-review: Comprehensive UI/UX design reviews with Playwright
- verification-agent: Verify Claude's work is complete and correct

---
*Run /scan-project to see which skills are most relevant for this project*
```

## Usage

Run this skill when:
- You want to see all available skills
- You forgot the name of a skill
- You want to know what's available in the current project
