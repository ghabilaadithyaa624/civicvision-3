process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? "silent";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-only-jwt-secret-do-not-use-in-prod";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "test-only-jwt-refresh-secret-do-not-use-in-prod";
// Low salt rounds keep the (CPU-bound) hashing fast across the test suite.
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? "4";
