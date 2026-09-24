## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-05-24 - Path Traversal in IssueService Image Path Resolver
**Vulnerability:** The `resolveImagePath` method in `IssueService` allowed local file inclusion and path traversal. Absolute paths were allowed blindly, and relative uploads paths like `/uploads/../../etc/passwd` would resolve outside the intended directory because they were naively joined.
**Learning:** `path.join` does not stop relative traversal characters like `..` from escaping the intended root directory, and simply checking `path.isAbsolute` does not guarantee safety. When resolving user input to local files, you need strong path boundaries.
**Prevention:** To safely resolve user paths, use `path.resolve(baseDir, userInput)`. If the user input starts with `/`, prepend `.` to it so `path.resolve` treats it as relative. Finally, enforce a strict boundary check: `if (!resolvedPath.startsWith(baseDir + path.sep))`.
