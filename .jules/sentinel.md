## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-29 - Path Traversal Vulnerability in Image Path Resolution

**Vulnerability:** The `resolveImagePath` function in `IssueService` allowed path traversal attacks because it blindly concatenated user-provided URLs using `path.join`, enabling access to arbitrary files if the URL started with `/uploads/` followed by `../`. It also accepted absolute paths directly, which is extremely dangerous.

**Learning:** Checking `imageUrl.startsWith("/uploads/")` is not sufficient to prevent path traversal when the remainder of the path might contain relative traversal sequences (`../`). `path.join` resolves these traverses.

**Prevention:** Always resolve the absolute base directory first, then resolve the requested path, and finally verify that the resolved path is contained within the base directory using `path.relative` (ensuring it doesn't start with `..` and is not absolute). Absolute paths provided by external input should be outright rejected unless explicitly expected and validated against an allowlist.
