## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2024-10-15 - Path Traversal in File Resolvers
**Vulnerability:** A Local File Inclusion (LFI) and path traversal vulnerability was found in the image path resolver due to the use of `path.join` and trusting `path.isAbsolute(imageUrl)` on user-provided input.
**Learning:** `path.join` on inputs starting with `/` does not resolve absolutely, but malicious users can pass `../../` to bypass boundaries. Also, `path.isAbsolute` allows attackers to directly specify absolute paths to sensitive system files like `/etc/passwd`.
**Prevention:** Explicitly resolve user-provided paths against the intended base directory using `path.resolve()`. If the input starts with a slash, prepend a dot (e.g., `path.resolve(baseDir, '.' + userInput)`). Always enforce strict boundary checks using `startsWith(baseDir + path.sep)`. Never trust `path.isAbsolute()` to blindly accept user-provided file paths.
