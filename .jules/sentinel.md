## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-09-14 - Authorization Bypass in Role Update
**Vulnerability:** A broken access control vulnerability in the self-serve role update endpoint allowed authenticated users to update their own role, escalating their privileges (e.g. to ADMIN) without proper administrative checks.
**Learning:** The `/role` route under `auth.routes.ts` was secured only with `authenticate`, verifying identity but not authorization (role).
**Prevention:** Always apply the `requireRole` middleware for sensitive operations, particularly endpoints that modify a user's permissions or access level, to enforce proper role-based access control.
