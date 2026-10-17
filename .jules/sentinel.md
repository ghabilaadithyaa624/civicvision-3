## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2023-10-17 - Missing Authorization on Role Update
**Vulnerability:** The PATCH `/role` endpoint allowed any authenticated user to update their role to ADMIN because it missed a `requireRole("ADMIN")` check.
**Learning:** Privilege escalation occurs when authorization middleware is missing on sensitive endpoints that modify user roles.
**Prevention:** Always mount strict authorization middleware (e.g., `requireRole('ADMIN')`) immediately after basic authentication on endpoints modifying sensitive data.
