## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-09-28 - Extension Spoofing (Stored XSS) in File Uploads
**Vulnerability:** Multer configuration for file uploads blindly trusted `file.originalname` to determine the file extension to save on disk.
**Learning:** Even if `file.mimetype` is validated in `fileFilter`, a malicious user can upload a file with a safe mimetype (e.g. `image/jpeg`) but with a dangerous extension (e.g. `malicious.html`). If served from the same origin, this can lead to Stored XSS.
**Prevention:** Never trust user-provided filenames or extensions. Explicitly map the validated `file.mimetype` to a hardcoded secure extension (e.g., using a `MIME_TYPE_MAP`).
