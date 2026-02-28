---
description: Suggest relevant MCP servers for current project/task
allowed-tools: Read, Glob, Bash, WebSearch
---

Analyze the current project and task to suggest relevant MCP servers.

## Current Project Analysis

**Project files:**
```
!`ls -la 2>/dev/null | head -20`
```

**Package dependencies (if available):**
```
!`cat package.json 2>/dev/null | head -50 || cat pyproject.toml 2>/dev/null | head -50 || echo "No package file found"`
```

## MCP Server Categories

### Documentation & Knowledge
- **context7** - Library documentation lookup (already installed globally)

### Browser & UI Testing
- **playwright** - Browser automation for visual testing
  - Useful for: React, Next.js, any frontend project
  - Install: `npx @anthropic/mcp add playwright`

### Version Control & Collaboration
- **github** - GitHub issues, PRs, code search
  - Useful for: Any project hosted on GitHub
  - Install: `npx @anthropic/mcp add github`

### Database
- **postgres** - Direct PostgreSQL queries
  - Useful for: Projects with PostgreSQL database
- **sqlite** - SQLite database access
- **mongodb** - MongoDB queries

### Cloud & Infrastructure
- **aws** - AWS service interaction
- **azure** - Azure service interaction

### Communication
- **slack** - Team communication
  - Useful for: Team projects, notifications

### File System & Search
- **filesystem** - Enhanced file operations
- **brave-search** - Web search capabilities

## Instructions

1. Analyze project type from package files
2. Consider the current task context
3. Recommend 2-3 most relevant MCPs not currently installed
4. Explain why each would be useful
5. Provide installation commands

## Output Format

For each recommendation:
```
### [MCP Name]
**Why**: [1-2 sentence explanation of benefit]
**Install**: `[installation command]`
**Configure**: [any configuration needed]
```
