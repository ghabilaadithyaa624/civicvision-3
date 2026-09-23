## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2025-02-27 - Path Traversal (LFI) in file resolver
**Vulnerability:** User-provided file paths were resolved using `path.join` and `path.isAbsolute`, allowing input like `/uploads/../../../../etc/passwd` to traverse outside the intended public directory.
**Learning:** `path.join` does not enforce strict boundaries and allows arbitrary traversal. Additionally, if the input begins with a slash, simply concatenating it or not normalizing it can lead to dangerous resolutions.
**Prevention:** Explicitly resolve user-provided paths against the intended base directory using `path.resolve()`. If the input starts with a slash, prepend a dot to prevent it from being treated as an absolute path. Finally, enforce strict boundary checks using `.startsWith(baseDir + path.sep)`.
