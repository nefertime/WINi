---
name: owasp-security
description: OWASP security best practices and vulnerability prevention. Use when writing authentication, authorization, handling user input, file uploads, API keys, environment variables, cryptography, session management, or when the user asks for security review.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# OWASP Security

> Source: [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp) — adapted and trimmed for TS/Python focus

## OWASP Top 10:2025

| # | Vulnerability | Prevention |
|---|--------------|-----------|
| A01 | Broken Access Control | Deny by default, enforce server-side, verify ownership |
| A02 | Security Misconfiguration | Harden configs, disable unnecessary defaults |
| A03 | Supply Chain Failures | Lock dependency versions, verify integrity, audit |
| A04 | Cryptographic Failures | TLS 1.2+, AES-256-GCM, Argon2/bcrypt for passwords |
| A05 | Injection | Parameterized queries, input validation, safe APIs |
| A06 | Insecure Design | Threat modeling, rate limiting, embedded security controls |
| A07 | Auth Failures | MFA, breached password checking, secure sessions |
| A08 | Integrity Failures | Package signing, SRI for CDN, safe deserialization |
| A09 | Logging Failures | Log security events, structured format, alerting |
| A10 | Exception Handling | Fail-closed, hide internals, log with context |

## Security Code Review Checklist

### Input Handling
- Server-side validation of ALL user inputs (never trust client)
- Parameterized queries mandatory (not string concatenation)
- Input length limits enforced
- Allowlist validation preferred over denylist

### Authentication & Sessions
- Passwords hashed with Argon2/bcrypt (MD5/SHA1 prohibited)
- Session tokens minimum 128 bits entropy
- Sessions invalidated on logout
- MFA for sensitive operations

### Access Control
- Authorization check on EVERY request
- Deny by default policy
- Privilege escalation paths reviewed
- Non-manipulable object references

### Data Protection
- Sensitive data encrypted at rest
- TLS for all transit
- No sensitive data in URLs or logs
- Secrets in environment/vault (never hardcoded)

### Error Handling
- Stack traces hidden from users
- Fail-closed on errors (deny, not allow)
- All exceptions logged with context
- Consistent error responses prevent enumeration

## TypeScript/JavaScript Patterns

### Prototype Pollution
```typescript
// UNSAFE — prototype pollution
Object.assign(target, userInput)
// SAFE — null prototype
Object.assign(Object.create(null), validated)
```

### XSS Prevention
```typescript
// UNSAFE
element.innerHTML = userInput;
// SAFE
element.textContent = userInput;
// In React: JSX auto-escapes. NEVER use dangerouslySetInnerHTML with user input.
```

### Watch For
`eval()`, `innerHTML`, `document.write()`, `__proto__`, `Function()` constructor, `new URL(userInput)` without validation

## Python Patterns

### Injection Prevention
```python
# UNSAFE — SQL injection
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
# SAFE — parameterized
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# UNSAFE — command injection
os.system(f"convert {filename} output.png")
# SAFE — no shell
subprocess.run(["convert", filename, "output.png"], shell=False)
```

### Deserialization
```python
# UNSAFE — pickle RCE
pickle.loads(user_data)
# SAFE — use JSON
json.loads(user_data)
```

### Watch For
`pickle`, `eval()`, `exec()`, `os.system()`, `subprocess` with `shell=True`, `yaml.load()` without SafeLoader

## Secure Patterns

### Password Storage
```python
# UNSAFE
hashlib.md5(password.encode()).hexdigest()
# SAFE
from argon2 import PasswordHasher
PasswordHasher().hash(password)
```

### Access Control
```python
# UNSAFE — missing authorization
@app.route('/api/user/<user_id>')
def get_user(user_id):
    return db.get_user(user_id)

# SAFE — authorization enforced
@app.route('/api/user/<user_id>')
@login_required
def get_user(user_id):
    if current_user.id != user_id and not current_user.is_admin:
        abort(403)
    return db.get_user(user_id)
```

### Error Handling
```python
# UNSAFE — exposes internals
@app.errorhandler(Exception)
def handle_error(e):
    return str(e), 500

# SAFE — fail-closed
@app.errorhandler(Exception)
def handle_error(e):
    error_id = uuid.uuid4()
    logger.exception(f"Error {error_id}: {e}")
    return {"error": "An error occurred", "id": str(error_id)}, 500
```

## Agentic AI Security (OWASP 2026)

Relevant when building AI-powered features (like WINi's API routes):

| Risk | Threat | Mitigation |
|------|--------|-----------|
| ASI01 | Goal Hijacking | Input sanitization, goal boundaries |
| ASI02 | Tool Misuse | Least privilege, I/O validation |
| ASI03 | Privilege Abuse | Short-lived scoped tokens |
| ASI05 | Code Execution | Isolated execution, human approval |
| ASI06 | Memory Poisoning | Content validation, trust segmentation |

## Quick Check — Every PR

- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] User input validated server-side
- [ ] Auth checked on every endpoint
- [ ] Queries parameterized (no string concat)
- [ ] Error responses don't leak internals
- [ ] Dependencies pinned and audited
- [ ] Sensitive data not logged
- [ ] File uploads validated (type, size)
- [ ] CORS configured correctly
- [ ] Rate limiting on auth endpoints
