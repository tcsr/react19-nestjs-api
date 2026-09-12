# Authentication & Authorization (NestJS) — Study Notes

Code: `src/auth/` (strategy, guards, controller) · Frontend deep dive:
`react19-topics/docs/architecture/auth.md`

## AuthN vs AuthZ
- **Authentication** = who you are (login → token). **Authorization** = what you may
  do (roles/permissions). Different guards handle each.

## Flow implemented here
1. `POST /auth/login` verifies credentials → **signs a JWT** (identity + role claims,
   15-min expiry) with `JwtService`.
2. Client sends `Authorization: Bearer <token>`.
3. **JwtAuthGuard** (Passport `jwt` strategy) verifies signature + expiry, populates
   `req.user`. 401 if missing/invalid.
4. **RolesGuard** + `@Roles('admin')` reads required roles via `Reflector` and checks
   `req.user.role`. 403 if not allowed.

## JWT essentials
- Self-contained, signed token: `header.payload.signature`. Server verifies the
  signature with a secret (HS256) or public key (RS256) — **no server session
  lookup** (stateless, scales horizontally). Payload is **base64, not encrypted** —
  never put secrets in it.
- **Access token** short-lived (mins) + **refresh token** long-lived to get new
  access tokens. **Refresh rotation** issues a new refresh each time + detects reuse
  (theft).

## Token storage (the classic trap)
- **httpOnly + Secure + SameSite cookie** (preferred) — JS can't read it (XSS-safe);
  SameSite/CSRF token mitigates CSRF.
- **localStorage** — readable by any script → **XSS-exposed**; avoid for tokens.
- Best: access token in memory, refresh token in an httpOnly cookie.

## Passport in NestJS
- `PassportModule.register({ defaultStrategy: 'jwt' })` + a `PassportStrategy(Strategy)`
  subclass whose `validate()` return becomes `req.user`. Guards extend
  `AuthGuard('jwt')`.
- Passwords: hash with a slow KDF (bcrypt/argon2/scrypt) + salt — never plaintext or
  SHA (see node/crypto notes).

## RBAC vs ABAC
- **RBAC** — permissions by role (admin/user) — simple, common (used here). **ABAC**
  — by attributes/policy (owner of resource, department, time) — finer-grained.
- **Server is the source of truth** — client-side role checks are cosmetic UX only.

## Gotchas
- Bare `PassportModule` doesn't provide `AuthModuleOptions` → use `.register()`
  (hit this live).
- Validate token expiry (`ignoreExpiration:false`); rotate/short-live tokens;
  keep the signing secret in env/secret manager.
- OAuth2/OIDC for third-party/social login; Authorization Code + PKCE for SPAs.

## Quick Q
- AuthN vs AuthZ? → who you are vs what you can do.
- Why JWT scales? → stateless, no server session lookup.
- Token storage? → httpOnly Secure SameSite cookie; not localStorage.
- Where to enforce authz? → the server (client checks are cosmetic).
- 401 vs 403? → unauthenticated vs authenticated-but-forbidden.
