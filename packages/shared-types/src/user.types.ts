export type UserRole = "CITIZEN" | "FIELD_AGENT" | "ADMIN";

/**
 * Generic over the timestamp type because `createdAt`/`updatedAt` are
 * genuinely different shapes on either side of the API boundary:
 * - Backend: real `Date` objects (as constructed from Prisma) — use `AppUser<Date>`.
 * - Frontend: ISO date strings, since `res.json()` serializes Dates to
 *   strings over the wire — use the default `AppUser` (TDate = string).
 */
export interface AppUser<TDate = string> {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: TDate;
  updatedAt: TDate;
}
