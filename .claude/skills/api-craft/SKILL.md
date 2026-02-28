---
name: api-craft
description: Build production-grade APIs with consistent patterns. Use when creating or modifying API routes, endpoints, REST handlers, FastAPI paths, or Next.js API routes. Covers request validation, error shapes, response consistency, and API security.
allowed-tools: Read, Edit, Write, Grep, Glob
---

# API Craft

Production-grade API design and implementation patterns. Auto-activates when working on API routes, endpoints, and backend services.

## Request Validation

### Always Validate at the Boundary
- **TypeScript (Next.js)**: Use Zod schemas for request body/params parsing
- **Python (FastAPI)**: Use Pydantic models for request bodies
- Parse and validate BEFORE any business logic
- Return 400 with specific field errors, not generic "Bad Request"

### Validation Patterns

**Next.js API Route:**
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const RequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  // Use parsed.data — fully typed
}
```

**FastAPI:**
```python
from pydantic import BaseModel, EmailStr

class CreateUserRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr

@app.post("/users")
async def create_user(req: CreateUserRequest):
    # req is already validated and typed
    pass
```

## Consistent Error Responses

### Standard Error Shape
Every API error MUST follow the same structure:

```typescript
type ApiError = {
  error: string;          // Human-readable message
  code?: string;          // Machine-readable code (e.g., "VALIDATION_FAILED")
  details?: unknown;      // Field errors, context
};
```

### HTTP Status Codes — Use Correctly
| Code | When |
|------|------|
| 200 | Success with body |
| 201 | Resource created |
| 204 | Success, no body (deletes) |
| 400 | Validation failure, bad input |
| 401 | Not authenticated (missing/invalid token) |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, version mismatch) |
| 422 | Semantically invalid (parseable but wrong) |
| 429 | Rate limited |
| 500 | Unexpected server error (never expose internals) |

### Never Expose Internals on 500
```typescript
// BAD — leaks stack trace
return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });

// GOOD — log internally, return safe response
console.error(`[${requestId}]`, error);
return NextResponse.json(
  { error: 'Internal server error', code: 'INTERNAL_ERROR' },
  { status: 500 }
);
```

## Response Consistency

### Envelope Pattern (Optional, but Pick One and Stick With It)
```typescript
// Option A: Direct response (simpler, preferred for small APIs)
return NextResponse.json({ id: "1", name: "..." });

// Option B: Envelope (better for paginated/complex APIs)
return NextResponse.json({ data: [...], meta: { total: 100, page: 1 } });
```

### List Responses Always Include
- Array of items (even if empty — never null)
- Total count or has-more flag for pagination
- Consistent field casing (camelCase for JS, snake_case for Python)

## API Security Checklist

### Per-Request
- [ ] Validate all inputs server-side (never trust client)
- [ ] Check authentication (who is this?)
- [ ] Check authorization (can they do this?)
- [ ] Rate limit sensitive endpoints
- [ ] Set appropriate CORS headers

### Per-Endpoint
- [ ] No sensitive data in URL params (use body for secrets)
- [ ] Parameterized queries (never string concatenation for DB)
- [ ] File uploads: validate type, limit size, scan content
- [ ] Pagination: enforce max page size to prevent data dumps

### Response Headers
```typescript
// Essential security headers
headers.set('X-Content-Type-Options', 'nosniff');
headers.set('X-Frame-Options', 'DENY');
headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

## API Design Patterns

### Idempotency
- GET, PUT, DELETE should be idempotent (same request → same result)
- POST is not idempotent — use idempotency keys for critical operations

### Async for Heavy Operations
If processing takes >5 seconds:
```typescript
// Return 202 Accepted with status URL
return NextResponse.json(
  { status: 'processing', statusUrl: `/api/jobs/${jobId}` },
  { status: 202 }
);
```

### Versioning
- URL prefix: `/api/v1/users` (simplest, recommended for most projects)
- Only version when breaking changes are unavoidable
- Don't pre-version — start without, add when needed

## Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| Validation in route handler body | Extract to schema (Zod/Pydantic) |
| Different error shapes per endpoint | Single ApiError type |
| 200 for everything + error flag | Use proper HTTP status codes |
| Sensitive data in URL | Move to request body or headers |
| Missing auth check | Auth middleware/decorator |
| Returning null for empty lists | Return empty array `[]` |
| Exposing internal IDs | Use UUIDs or slugs |
| No rate limiting on auth endpoints | Add rate limiting |
