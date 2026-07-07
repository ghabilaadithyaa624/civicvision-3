import { UserRepository, type IUserRepository } from "@repositories/user.repository";
import { TokenService } from "./token.service";
import { hashPassword, comparePassword } from "@utils/password";
import { ConflictError, ForbiddenError, UnauthorizedError } from "@utils/AppError";
import type { AuthResult as SharedAuthResult, UserRole } from "@civicvision/shared-types";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  adminSecret?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Backend always deals in the `<Date>` variant — see types/user.types.ts's AppUser alias. */
export type AuthResult = SharedAuthResult<Date>;

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository = new UserRepository(),
    // TokenService is only constructed lazily by callers of AuthService
    // (see auth.controller.ts) — never at module load — so a missing
    // JWT secret can't crash the whole process at boot.
    private readonly tokenService: TokenService = new TokenService(),
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    if (input.role === "ADMIN") {
      const systemAdminSecret = process.env.ADMIN_SECRET_PASSPHRASE || "CivicVision#Admin$2026!";
      if (!input.adminSecret || input.adminSecret !== systemAdminSecret) {
        throw new ForbiddenError("Invalid admin secret passphrase");
      }
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
    });

    const tokens = this.tokenService.issueTokens(user);
    return { user, tokens };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const userWithCredentials = await this.userRepository.findByEmail(input.email);
    if (!userWithCredentials) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValidPassword = await comparePassword(
      input.password,
      userWithCredentials.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!userWithCredentials.isActive) {
      throw new ForbiddenError("This account has been disabled");
    }

    const { passwordHash: _passwordHash, ...user } = userWithCredentials;
    const tokens = this.tokenService.issueTokens(user);
    return { user, tokens };
  }

  async updateRole(id: string, role: UserRole): Promise<AuthResult> {
    const user = await this.userRepository.updateRole(id, role);
    const tokens = this.tokenService.issueTokens(user);
    return { user, tokens };
  }
}
