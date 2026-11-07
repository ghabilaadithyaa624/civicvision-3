## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-07 - Fix Path Traversal in File Resolution
**Vulnerability:** The `resolveImagePath` method blindly allowed absolute paths or improperly resolved relative paths starting with `/uploads/`, enabling Path Traversal and Local File Inclusion (LFI).
**Learning:** Using `path.isAbsolute` and directly using unverified user inputs inside file system reads completely bypasses intended directory restrictions.
**Prevention:** Never blindly accept absolute paths from user input. When resolving relative paths, explicitly calculate the intended base directory and ensure the final resolved path `startsWith(baseDir + path.sep)` to prevent partial-match bypasses (e.g., `/uploads_attacker`).
