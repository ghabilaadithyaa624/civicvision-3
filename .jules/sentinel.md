## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-24 - Path Traversal (LFI) in File Resolvers
**Vulnerability:** A `resolveImagePath` function accepted absolute paths (bypassing the intended directory) and used `path.join` on relative paths without directory boundary checks, allowing arbitrary file read (`/etc/passwd`).
**Learning:** Using `path.isAbsolute` to return a path verbatim enables an attacker to supply absolute paths instead of expected local filenames. Additionally, `path.join` with user input doesn't prevent `../` attacks on its own.
**Prevention:** Always normalize the user-provided path and explicitly resolve it against the intended base directory using `path.resolve()`. Then, enforce a strict boundary check (e.g., `if (!resolvedPath.startsWith(baseDir + path.sep))`) to ensure the final path hasn't escaped the base directory.
