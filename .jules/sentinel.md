## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-18 - Privilege Escalation (IDOR) on Role Update
**Vulnerability:** The role update endpoint required basic authentication but lacked authorization checks, allowing any authenticated user to update their own role (e.g., to ADMIN) or potentially others'.
**Learning:** The role update endpoint in the auth module was missing the `requireRole("ADMIN")` middleware, representing a gap in the authorization layer for sensitive state changes.
**Prevention:** Always mount strict authorization middleware (like `requireRole("ADMIN")`) immediately after basic authentication for endpoints modifying sensitive data such as user roles.
