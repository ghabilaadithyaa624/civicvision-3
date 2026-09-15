## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal & LFI in File Resolvers
**Vulnerability:** Path Traversal and Local File Inclusion (LFI) vulnerability found in the backend where user-provided file paths were resolved insecurely, allowing arbitrary system files to be read and potentially sent to third-party services.
**Learning:** Accepting absolute paths or simply using `path.join()` without verifying the final absolute location makes the application vulnerable to traversal sequences (e.g., `../../`).
**Prevention:** To prevent Local File Inclusion (LFI) and Path Traversal in Node.js file resolvers, always normalize user-provided paths and explicitly resolve them against the intended base directory using `path.resolve()`. Enforce strict boundary checks (e.g., `if (!resolvedPath.startsWith(baseDir + path.sep))`) to ensure the final path has not escaped the intended base directory.
