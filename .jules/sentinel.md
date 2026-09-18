## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Node.js Path Traversal & LFI in Path Resolution
**Vulnerability:** The `resolveImagePath` function in `issue.service.ts` allowed path traversal (e.g. `/uploads/../../../etc/passwd`) when using `path.join()`, and explicitly permitted Local File Inclusion (LFI) by accepting any absolute path.
**Learning:** `path.resolve()` with inputs starting with a slash will overwrite the base directory (treating it as absolute). Therefore, user inputs starting with `/` must be prepended with `.` when resolved against a base directory. Additionally, resolving the path without verifying its boundaries allows attackers to reach arbitrary files on the file system.
**Prevention:** To prevent traversal, always resolve user input securely by combining the absolute base directory with a relative user path (`path.resolve(baseDir, '.' + userInput)` if user input starts with `/`), and explicitly enforce that the resulting path remains within the intended directory using `!resolvedPath.startsWith(baseDir + path.sep)`. Reject raw absolute paths from users.
