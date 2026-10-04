## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-18 - Prevent Local File Inclusion (LFI) in Path Resolvers
**Vulnerability:** Path resolver blindly trusted `path.isAbsolute(userInput)` allowing resolution to anywhere on the system (e.g., `/etc/passwd`), and `path.join` with relative directory traversal without strict boundary checks.
**Learning:** `path.resolve` treats inputs starting with a slash as absolute, overriding the base directory entirely unless pre-processed. Relying on `path.isAbsolute` solely for safe path mapping without bounding the resolution is a critical LFI vector.
**Prevention:** Explicitly bound user-provided paths using `path.resolve` combined with a strictly verified boundary check (e.g., `!resolvedPath.startsWith(baseDir + path.sep)`). For relative paths that might start with `/`, prepend `.` so `path.resolve` treats them relative to the base directory.
