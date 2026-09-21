## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal (LFI) in Node path.join/resolve
**Vulnerability:** The application allowed file reads outside the intended public/uploads directory by passing absolute paths or paths with directory traversal payloads to `path.join()` or resolving absolute paths bypassing the base dir in `path.resolve()`.
**Learning:** Node's `path.resolve()` and `path.join()` do not enforce directory boundaries. Further, `path.resolve()` treats inputs starting with a slash as absolute paths, completely overwriting the preceding base directory arguments.
**Prevention:** Always prepend a `.` to user input starting with `/` before calling `path.resolve(baseDir, input)` to force relative resolution, and strictly verify `resolvedPath.startsWith(baseDir + path.sep)` to enforce the boundary.
