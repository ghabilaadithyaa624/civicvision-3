export type { TokenPair } from "@civicvision/shared-types";

/**
 * The decoded JWT access-token payload. This is backend/JWT-specific
 * (not part of the shared API response contract the way AppUser/
 * TokenPair are), so it's not in shared-types — the frontend never
 * decodes this itself, it only stores the opaque token string.
 */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}
