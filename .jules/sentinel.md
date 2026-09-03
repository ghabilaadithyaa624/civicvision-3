## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2024-05-24 - [CRITICAL] Prevent File Extension Spoofing in Uploads
**Vulnerability:** The backend file upload controller was using `path.extname(file.originalname)` to determine the saved file extension. Although `multer` checked the `mimetype`, a user could upload a file with an image mimetype but an `.html` extension, leading to XSS if the server hosts it statically.
**Learning:** Never trust the file extension provided by the user (`originalname`). Malicious extensions can bypass file filters that only check `mimetype`.
**Prevention:** Determine the file extension directly from the validated `mimetype` using a controlled mapping (e.g., `image/jpeg` -> `.jpg`).
