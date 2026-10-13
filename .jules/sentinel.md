## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2025-02-17 - Secure File Resolution
**Vulnerability:** Local File Inclusion (LFI) and Path Traversal due to insecure usage of `path.join` and trusting `path.isAbsolute` in file resolvers.
**Learning:** Using `path.join` with unsanitized input allows traversing directories. Trusting `path.isAbsolute` blindly accepts arbitrary absolute paths (e.g., `/etc/passwd`). `path.resolve` treats inputs starting with a slash as absolute, overwriting the base directory.
**Prevention:** Explicitly resolve user-provided paths against the intended base directory using `path.resolve()`. Prepend a dot (e.g., `path.resolve(baseDir, '.' + userInput)`) if the input starts with a slash. Always enforce strict boundary checks (e.g., `if (!resolvedPath.startsWith(baseDir + path.sep))`).
