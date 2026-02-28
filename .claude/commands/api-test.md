---
description: Test API endpoints with detailed validation
allowed-tools: Bash(curl:*, httpie:*), Read, Grep, Glob
---

Test API endpoints to verify functionality, error handling, and response structure.

## Context

**Project Type:**
```
!`[ -f "pyproject.toml" ] && echo "Python/FastAPI" || [ -f "package.json" ] && echo "TypeScript/Node" || echo "Unknown"`
```

**Available Endpoints:**
```
!`grep -r "@app\\.\\(get\\|post\\|put\\|delete\\)" . --include="*.py" 2>/dev/null | head -10 || grep -r "app\\.\\(get\\|post\\)" . --include="*.ts" 2>/dev/null | head -10`
```

## Instructions

1. **Identify Target Endpoints**: If not specified by user, search for route definitions
2. **Determine Base URL**: Check if dev server is running, else ask user
3. **Test Each Endpoint**:
   - Happy path (valid inputs, expected responses)
   - Error cases (validation errors, auth failures)
   - Edge cases (empty data, boundary values)
4. **Validate Responses**:
   - Status codes match expectations
   - Response structure matches schema
   - Error messages are helpful
5. **Generate Report**: Markdown summary with all test results

## Example Usage

```bash
# Test single endpoint
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Test with authentication
curl -X GET http://localhost:8000/api/protected \
  -H "Authorization: Bearer $TOKEN"

# Test error handling
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

## Output Format

```markdown
### API Test Report

**Endpoint:** POST /api/users
- ✅ Happy path: 201 Created
- ✅ Validation error: 422 Unprocessable Entity
- ❌ Auth required: Expected 401, got 500 (see details below)

**Issues Found:**
1. Missing authentication check on protected route
2. Error response doesn't include field-level validation details

**Recommendations:**
- Add auth middleware to protected routes
- Enhance error responses with field-specific messages
```
