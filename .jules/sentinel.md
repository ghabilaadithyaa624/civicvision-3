## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-25 - Extension Spoofing / Stored XSS via File Uploads
**Vulnerability:** The `multer.diskStorage` configuration was using `path.extname(file.originalname)` to determine the file extension for uploaded images. This allowed an attacker to bypass the `fileFilter` (which only checked `file.mimetype`) by uploading a malicious file (e.g., HTML with an image mimetype) named `exploit.html`. Since the original extension was appended, it could lead to Stored XSS or execution.
**Learning:** Never trust `file.originalname` for file naming or determining the extension, even if the MIME type is validated, as an attacker controls the original filename.
**Prevention:** Explicitly map the validated `file.mimetype` (from `req.file`) to a hardcoded, safe extension when saving the file to disk.
