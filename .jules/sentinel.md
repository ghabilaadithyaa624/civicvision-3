## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - File Extension Spoofing in Multer Uploads
**Vulnerability:** The application was vulnerable to file extension spoofing because it relied on user-provided data (`file.originalname`) instead of validated server data (`file.mimetype`) when saving uploaded files. If an attacker uploaded a malicious file (e.g., `malicious.html`) but bypassed the `mimetype` check with a spoofed Content-Type (e.g., `image/jpeg`), the file would be saved as `.html`. This could lead to a Stored XSS attack when another user views the file.
**Learning:** Never trust the `file.originalname` when saving an uploaded file to disk. The original filename is entirely controlled by the user and can be manipulated to bypass security checks.
**Prevention:** Instead of using the user-provided filename extension, always map the server-validated `file.mimetype` to a hardcoded, safe extension when saving the file to disk.
