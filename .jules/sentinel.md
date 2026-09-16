## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-09-16 - Path Traversal (LFI) via `path.join` and TOCTOU File Operations
**Vulnerability:** The application was vulnerable to Path Traversal and Local File Inclusion (LFI) because `path.join` was used directly with user input (`imageUrl`), allowing absolute paths or `../` to access files outside the intended base directory. Additionally, using synchronous `fs.existsSync` to check file existence before reading it exposed the app to Time-of-Check to Time-of-Use (TOCTOU) race conditions and event loop blocking.
**Learning:** `path.join` does not enforce strict base directory boundaries. Also, `path.resolve` treats inputs starting with a `/` as absolute, meaning it will resolve to the system root, completely bypassing the intended base directory if not handled properly.
**Prevention:** Always use `path.resolve` for file path generation and prepend a `.` to user input if it starts with a `/`. Always enforce a strict boundary check (`resolvedPath.startsWith(baseDir + path.sep)`). Never use synchronous file operations like `fs.existsSync`; use optimistic async functions like `fs.promises.readFile` in a try/catch block.
