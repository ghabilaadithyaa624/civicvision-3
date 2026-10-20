## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-20 - Privilege Escalation via Missing Authorization Checks
**Vulnerability:** A route modifying user roles lacked role-based access control, allowing authenticated users to escalate their privileges.
**Learning:** Endpoints mapped under an entity namespace (e.g., `/auth`) handling sensitive changes must enforce strict authorization checks alongside basic authentication.
**Prevention:** Always mount strict authorization middleware (e.g., `requireRole('ADMIN')`) immediately after basic authentication on endpoints modifying sensitive data.
