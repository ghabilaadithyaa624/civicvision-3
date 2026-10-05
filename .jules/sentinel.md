## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal in IssueService Image Resolution
**Vulnerability:** The `resolveImagePath` method in `IssueService` was vulnerable to path traversal and Local File Inclusion (LFI). It blindly accepted absolute paths via `path.isAbsolute(imageUrl)` and did not restrict relative paths starting with `/uploads/` from traversing up the directory tree using `..`.
**Learning:** `path.resolve()` interprets paths starting with `/` as absolute roots, completely bypassing any intended base directory constraint. Additionally, basic string prefixes (like `.startsWith("/uploads/")`) provide no protection against directory traversal sequences embedded later in the path string (e.g., `/uploads/../../etc/passwd`).
**Prevention:** Always use `path.resolve()` explicitly prepending a dot (`.`) to user inputs that start with a slash to treat them as relative to the intended base directory. Strictly enforce boundary checks using `.startsWith(baseDir + path.sep)` to ensure the final resolved path does not break out of the intended directory. Finally, maintain a strict allowlist of file extensions (e.g., `.jpg`, `.png`).
