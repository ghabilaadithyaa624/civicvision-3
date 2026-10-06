## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-15 - Privilege Escalation in Role Update
**Vulnerability:** Authenticated users could escalate their own privileges because the `/role` endpoint lacked a `requireRole` check.
**Learning:** Endpoints that modify sensitive user data (like roles) must explicitly authorize the user's current role before applying changes.
**Prevention:** Always mount strict authorization middleware (e.g., `requireRole("ADMIN")`) immediately after authentication on administrative routes.
