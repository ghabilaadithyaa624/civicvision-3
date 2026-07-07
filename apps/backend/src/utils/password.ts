import bcrypt from "bcryptjs";
import { env } from "@config/env";

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}
