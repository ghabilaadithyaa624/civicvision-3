## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-10-24 - Path Traversal in File Resolution
**Vulnerability:** Path traversal and absolute path read vulnerability in `IssueService.resolveImagePath`, where user-provided `imageUrl` could contain `..` or be an absolute path (e.g., `/etc/passwd`), allowing the backend to read arbitrary local files.
**Learning:** Checking `startsWith("/uploads/")` is insufficient if the path is subsequently joined and resolved with `path.join()` without verifying the final normalized path. Additionally, allowing `path.isAbsolute()` blindly exposes the entire filesystem.
**Prevention:** Always use `path.resolve` to normalize paths, and strictly verify that the resulting absolute path begins with the intended base directory (e.g., `resolvedPath.startsWith(baseDir + path.sep)`). Do not accept absolute paths from untrusted user input.
