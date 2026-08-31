import { AuthService } from "../src/services/auth.service";
import { TokenService } from "../src/services/token.service";
import { hashPassword } from "../src/utils/password";
import type { IUserRepository } from "../src/repositories/user.repository";
import type {
  AppUser,
  AppUserWithCredentials,
  CreateUserInput,
  UserRole,
} from "../src/types/user.types";
import { AppError } from "../src/utils/AppError";

/**
 * In-memory fake implementing the same contract as the Prisma-backed
 * UserRepository. This is what makes AuthService testable without a
 * database: the service depends on IUserRepository, not the concrete
 * Prisma implementation (Dependency Inversion).
 */
class FakeUserRepository implements IUserRepository {
  private usersByEmail = new Map<string, AppUserWithCredentials>();
  private nextId = 1;

  async findByEmail(email: string): Promise<AppUserWithCredentials | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async findById(id: string): Promise<AppUser | null> {
    for (const user of this.usersByEmail.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  async create(data: CreateUserInput): Promise<AppUser> {
    const user: AppUserWithCredentials = {
      id: String(this.nextId++),
      email: data.email,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
      role: data.role ?? "CITIZEN",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usersByEmail.set(data.email, user);
    const { passwordHash: _discard, ...appUser } = user;
    return appUser;
  }

  async updateRole(id: string, role: UserRole): Promise<AppUser> {
    for (const user of this.usersByEmail.values()) {
      if (user.id === id) {
        user.role = role;
        user.updatedAt = new Date();
        const { passwordHash: _discard, ...appUser } = user;
        return appUser;
      }
    }
    throw new Error(`No user found with id ${id}`);
  }

  async findAll(): Promise<AppUser[]> {
    return Array.from(this.usersByEmail.values()).map(({ passwordHash: _discard, ...appUser }) => appUser);
  }

  async updateActiveStatus(id: string, isActive: boolean): Promise<AppUser> {
    for (const user of this.usersByEmail.values()) {
      if (user.id === id) {
        user.isActive = isActive;
        user.updatedAt = new Date();
        const { passwordHash: _discard, ...appUser } = user;
        return appUser;
      }
    }
    throw new Error(`No user found with id ${id}`);
  }
}

function buildService(): { service: AuthService; repo: FakeUserRepository } {
  const repo = new FakeUserRepository();
  const service = new AuthService(repo, new TokenService());
  return { service, repo };
}

describe("AuthService.register", () => {
  it("creates a new user and returns tokens", async () => {
    const { service } = buildService();

    const result = await service.register({
      email: "new.user@example.com",
      password: "supersecret123",
      fullName: "New User",
    });

    expect(result.user.email).toBe("new.user@example.com");
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.tokens.accessToken).toEqual(expect.any(String));
    expect(result.tokens.refreshToken).toEqual(expect.any(String));
  });

  it("rejects registration with an already-used email", async () => {
    const { service, repo } = buildService();
    await repo.create({
      email: "taken@example.com",
      fullName: "Existing User",
      passwordHash: await hashPassword("whatever123"),
    });

    await expect(
      service.register({
        email: "taken@example.com",
        password: "supersecret123",
        fullName: "Someone Else",
      }),
    ).rejects.toThrow(AppError);
  });

  describe("ADMIN registration", () => {
    const originalEnv = process.env.ADMIN_SECRET_PASSPHRASE;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.ADMIN_SECRET_PASSPHRASE;
      } else {
        process.env.ADMIN_SECRET_PASSPHRASE = originalEnv;
      }
    });

    it("succeeds when ADMIN_SECRET_PASSPHRASE matches input", async () => {
      process.env.ADMIN_SECRET_PASSPHRASE = "test-secret";
      const { service } = buildService();

      const result = await service.register({
        email: "admin@example.com",
        password: "supersecret123",
        fullName: "Admin User",
        role: "ADMIN",
        adminSecret: "test-secret",
      });

      expect(result.user.role).toBe("ADMIN");
      expect(result.tokens.accessToken).toEqual(expect.any(String));
    });

    it("fails when input.adminSecret is incorrect", async () => {
      process.env.ADMIN_SECRET_PASSPHRASE = "test-secret";
      const { service } = buildService();

      await expect(
        service.register({
          email: "admin2@example.com",
          password: "supersecret123",
          fullName: "Admin User",
          role: "ADMIN",
          adminSecret: "wrong-secret",
        })
      ).rejects.toThrow(AppError);
    });

    it("fails when ADMIN_SECRET_PASSPHRASE is not set in the environment", async () => {
      delete process.env.ADMIN_SECRET_PASSPHRASE;
      const { service } = buildService();

      await expect(
        service.register({
          email: "admin3@example.com",
          password: "supersecret123",
          fullName: "Admin User",
          role: "ADMIN",
          adminSecret: "any-secret",
        })
      ).rejects.toThrow(AppError);
    });
  });
});

describe("AuthService.login", () => {
  it("logs in with correct credentials", async () => {
    const { service, repo } = buildService();
    const passwordHash = await hashPassword("correct-password");
    await repo.create({ email: "user@example.com", fullName: "User", passwordHash });

    const result = await service.login({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(result.user.email).toBe("user@example.com");
    expect(result.tokens.accessToken).toEqual(expect.any(String));
  });

  it("rejects login with an unknown email", async () => {
    const { service } = buildService();

    await expect(
      service.login({ email: "ghost@example.com", password: "irrelevant" }),
    ).rejects.toThrow(AppError);
  });

  it("rejects login with an incorrect password", async () => {
    const { service, repo } = buildService();
    const passwordHash = await hashPassword("correct-password");
    await repo.create({ email: "user2@example.com", fullName: "User Two", passwordHash });

    await expect(
      service.login({ email: "user2@example.com", password: "wrong-password" }),
    ).rejects.toThrow(AppError);
  });
});
