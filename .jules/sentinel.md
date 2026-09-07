## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2024-09-07 - File Extension Spoofing in Multer Uploads
**Vulnerability:** File uploads were determining the saved file extension by directly reading `path.extname(file.originalname)`. An attacker could upload a valid image file (e.g., passing the mime-type check) but name it `malicious.js` or `shell.php`, leading to the file being saved with an executable extension on the server or executed in the browser context if accessed directly.
**Learning:** `file.originalname` is completely user-controlled and untrusted. Mime-type filtering (`fileFilter`) only validates the file contents as parsed by the server (or content-type header), it does not protect against malicious file extensions being preserved on disk.
**Prevention:** Never use `originalname` for the final extension. Always explicitly map the validated `file.mimetype` to a hardcoded, safe list of extensions when saving files.
