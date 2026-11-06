## Security Practices

* **Avoid Hardcoded Secrets:** Never use fallback secrets in code for administrative functions or sensitive operations.
* **Fail Secure:** If critical configuration (like an admin passphrase environment variable) is missing, the system should fail securely (e.g., disable the feature) rather than falling back to a default that could be exploited.

## 2026-11-06 - Path Traversal in Image Resolution
**Vulnerability:** The `resolveImagePath` function allowed local file inclusion by trusting absolute paths (`path.isAbsolute(imageUrl)`) and blindly resolving relative paths containing `..` (`path.join(... imageUrl)`).
**Learning:** Checking for `/uploads/` as a prefix is insufficient if the path resolution logic subsequently allows `..` components to escape the base directory, or if an attacker provides an absolute path to bypass the relative path check.
**Prevention:** Always resolve both the base directory and the target path fully (`path.resolve`), and rigorously verify that the resolved target path begins with the `baseDir` strictly appended with a directory separator (`path.sep`) to avoid prefix spoofing.
