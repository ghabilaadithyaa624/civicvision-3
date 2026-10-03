## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-24 - [CRITICAL] Prevent LFI and Path Traversal in File Resolution
**Vulnerability:** A Local File Inclusion (LFI) and path traversal vulnerability existed in the backend image resolution logic where `path.join` was used with unsanitized user inputs, and `path.isAbsolute` was used to blindly accept arbitrary absolute paths. This allowed attackers to resolve and read arbitrary files on the system (e.g. `../../../../etc/passwd` or `/etc/passwd`).
**Learning:** `path.join` will traverse up if given `../` segments, and `path.isAbsolute` is only a format check, not a security boundary.
**Prevention:** Always use `path.resolve` to calculate an absolute base directory, and resolve user inputs against it securely by prepending a dot (e.g., `path.resolve(baseDir, '.' + userInput)`) if the input might start with a slash (which resets resolution). Enforce a strict boundary check (`resolvedPath.startsWith(baseDir + path.sep)`) to guarantee the resulting path never escapes the intended root directory. Do not rely on `path.isAbsolute` to accept user paths.
