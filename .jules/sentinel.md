## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal (LFI) in Node.js File Resolvers
**Vulnerability:** The backend AI image resolution allowed path traversal due to using `path.join` with unsanitized absolute or pseudo-absolute inputs (e.g. `/uploads/../../../../etc/passwd`).
**Learning:** `path.resolve` treats inputs starting with `/` as absolute paths overriding the base directory, making naïve `path.resolve` insufficient.
**Prevention:** Explicitly sanitize inputs that might start with a slash by prepending `.` before passing to `path.resolve()`, AND always perform a strict bounds check via `if (!resolvedPath.startsWith(baseDir + path.sep))`.
