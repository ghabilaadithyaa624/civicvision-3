## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-25 - Extension Spoofing Stored XSS in File Uploads
**Vulnerability:** Relying on user-provided file extension (`file.originalname`) for uploaded files allowed attackers to spoof extensions (e.g., uploading an HTML file as an image payload with a `.html` extension), leading to Stored XSS when served by `express.static`.
**Learning:** Even with mimetype validation, the file extension determines how the browser handles the file. Trusting `file.originalname` bypasses mimetype checks if the user manipulated the extension.
**Prevention:** Never use `file.originalname` to determine the file extension. Instead, explicitly map the validated `file.mimetype` (from server-side validation) to a hardcoded safe extension.
