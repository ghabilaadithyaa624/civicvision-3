## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-09-26 - Local File Inclusion via Unsafe Path Resolution
**Vulnerability:** A Local File Inclusion (LFI) vulnerability was found in `resolveImagePath` because it accepted absolute paths directly (e.g. `/etc/passwd`) using `path.isAbsolute(imageUrl)` and resolved relative paths unsafely with `path.join`.
**Learning:** `path.resolve` treats inputs starting with a slash as absolute paths, bypassing the intended base directory. `path.join` does not perform boundary checks, allowing path traversal (`../../../`).
**Prevention:** Always prepend a dot `.` to user inputs starting with a slash before using `path.resolve` against a base directory. Always explicitly verify the final resolved path using strict boundary checks (e.g., `resolvedPath.startsWith(baseDir + path.sep)`).
