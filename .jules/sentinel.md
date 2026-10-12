## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Missing Authorization on Sensitive Endpoint
**Vulnerability:** The `/role` update endpoint lacked authorization checks, allowing any authenticated user to update their own role (Privilege Escalation/IDOR).
**Learning:** Always explicitly protect endpoints that modify sensitive user state (like roles) with authorization middleware, not just basic authentication.
**Prevention:** Ensure `requireRole('ADMIN')` or similar strict authorization middleware is mounted immediately after `authenticate` for privilege-escalation risks.
