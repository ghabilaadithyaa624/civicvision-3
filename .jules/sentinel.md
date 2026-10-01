## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-01 - Privilege Escalation (IDOR) on role update endpoint
**Vulnerability:** The `PATCH /api/v1/auth/role` endpoint in `apps/backend/src/modules/auth/auth.routes.ts` allowed any authenticated user to update roles because it lacked authorization checks, leading to Insecure Direct Object Reference (IDOR) and Privilege Escalation.
**Learning:** Endpoints that modify sensitive properties such as user roles must explicitly enforce strict authorization rules beyond just basic authentication.
**Prevention:** Always mount an authorization middleware (like `requireRole("ADMIN")`) after authentication middleware on any endpoints that change sensitive user data or system configurations.
