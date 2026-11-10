## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.
## 2024-11-10 - Path Traversal / LFI Prevention in Node.js

**Vulnerability:** The image path resolution logic allowed path traversal and Local File Inclusion (LFI). Absolute paths were fully trusted due to a `path.isAbsolute` check bypassing the base directory entirely, and relative paths starting with `/uploads/` could still include `../` sequences to escape the directory.
**Learning:** Relying solely on a `startsWith` check on a user-provided string (like `imageUrl`) is insufficient for enforcing directory boundaries, and conditionally returning an unmodified absolute path creates an explicit bypass.
**Prevention:** Always construct the absolute path manually within a strictly defined base directory. Use `path.relative(baseDir, resolvedPath)` to verify that the resulting path does not start with `..` and is not absolute, strictly ensuring the resolved path remains contained within the intended base directory.
