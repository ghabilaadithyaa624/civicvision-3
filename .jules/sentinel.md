## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-03-20 - Fix Privilege Escalation in Auth Routes
**Vulnerability:** The `/api/v1/auth/role` endpoint in `apps/backend/src/modules/auth/auth.routes.ts` lacked authorization controls (`requireRole`), allowing any authenticated user to elevate their own privileges (IDOR/Privilege Escalation).
**Learning:** Endpoints that modify sensitive data (like roles) need strict authorization middleware (e.g., `requireRole("ADMIN")`) applied immediately after basic authentication to prevent privilege escalation.
**Prevention:** Always mount role-checking middleware on endpoints that update user roles or permissions.
