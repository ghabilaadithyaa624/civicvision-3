import type { AppUser } from "./user.types";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** See AppUser's TDate doc comment — same Date-vs-string boundary applies here. */
export interface AuthResult<TDate = string> {
  user: AppUser<TDate>;
  tokens: TokenPair;
}
