## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-18 - Fix File Upload Extension Spoofing
**Vulnerability:** Relying on user-provided file.originalname for determining file extension allowed potential extension spoofing, leading to Stored XSS.
**Learning:** File extensions should never be derived from user input in file uploads; they must be securely mapped from validated MIME types.
**Prevention:** Always strictly map validated MIME types to hardcoded safe extensions.
