## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - File Extension Spoofing in Multer Uploads
**Vulnerability:** The application was using `path.extname(file.originalname)` to determine the file extension of uploaded files when saving them to disk using `multer`.
**Learning:** This is vulnerable to extension spoofing. A malicious user could upload an executable or malicious script (e.g., a `.php` or `.html` file) with a fake mime type that bypasses the `fileFilter`. If the original name had the malicious extension, the file would be saved with that executable extension on the server, potentially leading to Remote Code Execution (RCE) or Stored XSS if the file is served to other users.
**Prevention:** Never rely on user-provided data like `file.originalname` for file extensions or file names. Instead, rely on the explicitly validated `file.mimetype` and map it to a hardcoded, safe extension (e.g., `image/jpeg` -> `.jpg`).
