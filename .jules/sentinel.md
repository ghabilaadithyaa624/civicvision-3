## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2024-05-18 - File Extension Spoofing in Multer Uploads
**Vulnerability:** Relying on `file.originalname` to determine the file extension for uploaded files in Multer. This allows attackers to upload malicious files (e.g., `malicious.html` pretending to be an image) and potentially cause Stored XSS or other issues when served statically if the server guesses the MIME type based on the spoofed extension.
**Learning:** `file.originalname` is user-provided and cannot be trusted, even if `file.mimetype` is validated, as an attacker can provide a valid image MIME type but an arbitrary extension.
**Prevention:** Map the validated `file.mimetype` to a hardcoded safe extension (e.g., `image/jpeg` -> `.jpg`) instead of using `path.extname(file.originalname)`.
