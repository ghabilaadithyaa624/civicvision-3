## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - File Resolver Path Traversal Vulnerability
**Vulnerability:** Path Traversal and Local File Inclusion via `path.join` combined with `path.isAbsolute` fallback in `resolveImagePath`.
**Learning:** `path.isAbsolute()` is dangerous to rely on for path validation when handling user input. `path.join` with an absolute path can result in traversal. `path.resolve` will treat strings starting with `/` as absolute and overwrite the base directory entirely.
**Prevention:** To prevent LFI and Path Traversal in Node.js file resolvers, explicitly resolve user-provided paths against the intended base directory using `path.resolve()`. Never trust `path.isAbsolute()` to blindly accept user-provided file paths. Because `path.resolve()` treats inputs starting with a slash as absolute, prepend a dot (e.g., `path.resolve(baseDir, '.' + userInput)`). Always enforce strict boundary checks (e.g., `if (!resolvedPath.startsWith(baseDir + path.sep))`).
