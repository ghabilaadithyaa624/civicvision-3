import type { UserRole, AppUser as SharedAppUser } from "@civicvision/shared-types";

export type { UserRole };

/**
 * Backend's AppUser is always the `<Date>` variant of the shared type —
 * real Date objects, as constructed from Prisma rows. This alias means
 * every existing backend file that imports `AppUser` keeps working
 * unchanged; only this one file needed to change when shared-types
 * was introduced.
 */
export type AppUser = SharedAppUser<Date>;

/** Internal-only shape that includes the password hash — never returned from an API response. */
export interface AppUserWithCredentials extends AppUser {
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  passwordHash: string;
  role?: UserRole;
}
