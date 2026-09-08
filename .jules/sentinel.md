## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2025-01-01 - Prevent Extension Spoofing in File Uploads
**Vulnerability:** File extension was determined by the user-provided `originalname` even though the mimetype was validated. This allowed an attacker to upload an image file payload but spoof the extension (e.g. `.html` or `.php`), leading to a potential Stored XSS or server compromise.
**Learning:** Checking the mimetype of a file upload is not enough if the resulting file is saved with a user-supplied extension.
**Prevention:** Never rely on `file.originalname` to determine a file extension. Always use the validated `file.mimetype` mapped to a hardcoded safe extension when saving files on disk.