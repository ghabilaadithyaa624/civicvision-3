## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-19 - Fix IDOR Privilege Escalation on Role Update
**Vulnerability:** The `PATCH /api/v1/auth/role` endpoint lacked strict authorization checks beyond basic authentication, allowing any authenticated user to arbitrarily escalate their own role.
**Learning:** Always mount strict authorization middleware (e.g., `requireRole`) immediately after basic authentication on endpoints modifying sensitive user attributes.
**Prevention:** Ensure endpoints that modify sensitive data have explicit role-based access control (RBAC) validations applied at the route level.
