## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-09-05 - File Upload Extension Spoofing Vulnerability
**Vulnerability:** Relying on `file.originalname` for determining the file extension during file uploads. An attacker can spoof the file extension, uploading an HTML file disguised as an image (e.g., `.html` but with `image/jpeg` MIME type), leading to Stored XSS if the server serves it as `.html`.
**Learning:** Never trust the user-provided filename or extension, as it can be easily manipulated. Only trust the validated MIME type or magic bytes.
**Prevention:** Instead of extracting the extension from the original filename, map the validated `file.mimetype` directly to a safe, hardcoded extension (e.g., `image/jpeg` -> `.jpg`).
