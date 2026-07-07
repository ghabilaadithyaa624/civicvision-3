import { getPrismaClient } from "@database/index";
import type { AppUser, AppUserWithCredentials, CreateUserInput, UserRole } from "@app-types/user.types";

/**
 * Minimal shape of a `users` row, matching prisma/schema.prisma's User
 * model. Declared locally (rather than importing Prisma's generated
 * model type) so this file type-checks correctly even before
 * `prisma generate` has produced the full generated client types —
 * see database/prisma.client.ts for the full rationale.
 */
interface PrismaUserRow {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toAppUser(row: PrismaUserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAppUserWithCredentials(row: PrismaUserRow): AppUserWithCredentials {
  return { ...toAppUser(row), passwordHash: row.passwordHash };
}

/**
 * Repository contract consumed by the service layer. Depending on this
 * interface (rather than the concrete `UserRepository` class) lets
 * `AuthService` be unit-tested with an in-memory fake — no database,
 * and no dependency on `prisma generate` having run.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<AppUserWithCredentials | null>;
  findById(id: string): Promise<AppUser | null>;
  create(data: CreateUserInput): Promise<AppUser>;
  updateRole(id: string, role: UserRole): Promise<AppUser>;
  findAll(): Promise<AppUser[]>;
  updateActiveStatus(id: string, isActive: boolean): Promise<AppUser>;
}

export class UserRepository implements IUserRepository {
  // Instantiating with no argument defers Prisma client construction
  // to first use via getPrismaClient() — see database/prisma.client.ts.
  constructor(private readonly prisma: ReturnType<typeof getPrismaClient> = getPrismaClient()) {}

  async findByEmail(email: string): Promise<AppUserWithCredentials | null> {
    const row = (await this.prisma.user.findUnique({ where: { email } })) as PrismaUserRow | null;
    return row ? toAppUserWithCredentials(row) : null;
  }

  async findById(id: string): Promise<AppUser | null> {
    const row = (await this.prisma.user.findUnique({ where: { id } })) as PrismaUserRow | null;
    return row ? toAppUser(row) : null;
  }

  async create(data: CreateUserInput): Promise<AppUser> {
    const row = (await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role ?? "CITIZEN",
      },
    })) as PrismaUserRow;
    return toAppUser(row);
  }

  async updateRole(id: string, role: UserRole): Promise<AppUser> {
    const row = (await this.prisma.user.update({
      where: { id },
      data: { role },
    })) as PrismaUserRow;
    return toAppUser(row);
  }

  async findAll(): Promise<AppUser[]> {
    const rows = (await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    })) as PrismaUserRow[];
    return rows.map(toAppUser);
  }

  async updateActiveStatus(id: string, isActive: boolean): Promise<AppUser> {
    const row = (await this.prisma.user.update({
      where: { id },
      data: { isActive },
    })) as PrismaUserRow;
    return toAppUser(row);
  }
}
