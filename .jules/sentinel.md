## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-10 - Missing Authorization on Role Update Endpoint
**Vulnerability:** The `/auth/role` endpoint allowed any authenticated user to update their own role (e.g., to ADMIN) without restriction.
**Learning:** Only applying authentication (`authenticate` middleware) to an endpoint that modifies sensitive account properties is insufficient. The endpoint lacked an authorization check (`requireRole`) to verify the user has the authority to make such a change.
**Prevention:** Always mount strict authorization middleware (e.g., `requireRole('ADMIN')`) immediately after basic authentication on endpoints modifying sensitive data (like user roles) to prevent Privilege Escalation.
