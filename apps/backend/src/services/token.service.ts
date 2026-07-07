import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { InternalServerError, UnauthorizedError } from "@utils/AppError";
import type { AccessTokenPayload, TokenPair } from "@app-types/jwt.types";
import type { AppUser } from "@app-types/user.types";

export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    // Validated here (construction time) rather than at module load, so
    // a missing secret only breaks auth specifically — not the whole
    // process — while still failing fast with a clear message the
    // moment auth is actually used.
    if (!env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
      throw new InternalServerError(
        "JWT_SECRET and JWT_REFRESH_SECRET must be configured to use authentication",
      );
    }
    this.accessSecret = env.JWT_SECRET;
    this.refreshSecret = env.JWT_REFRESH_SECRET;
  }

  issueTokens(user: Pick<AppUser, "id" | "email" | "role">): TokenPair {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign({ sub: user.id }, this.refreshSecret, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  verifyRefreshToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as { sub: string };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
}
