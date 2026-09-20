## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-09-20 - Fix Path Traversal in Node.js File Resolver
**Vulnerability:** A local file inclusion (LFI) and path traversal vulnerability existed in the issue service where user-provided image paths (like `/uploads/../../../../etc/passwd`) were resolved using `path.join` and arbitrary absolute paths were allowed, allowing attackers to read any file on the system.
**Learning:** `path.join` and unchecked absolute path strings can allow attackers to escape intended directories. `path.resolve` treats inputs starting with a slash `/` as absolute paths and overwrites the base directory, making it unsafe for raw user input.
**Prevention:** To prevent LFI/Path Traversal in Node.js file resolvers, prepend a dot to user input if it starts with a slash (e.g., `path.resolve(baseDir, '.' + userInput)`), and always enforce strict boundary checks using `if (!resolvedPath.startsWith(baseDir + path.sep))`.
