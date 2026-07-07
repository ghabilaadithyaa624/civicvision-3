import { apiClient } from "@/services/apiClient";
import type { ApiSuccessResponse, AuthResult, AppUser, UserRole } from "@civicvision/shared-types";

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  adminSecret?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthResult>>(
    "/auth/register",
    payload,
  );
  return data.data as AuthResult;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthResult>>("/auth/login", payload);
  return data.data as AuthResult;
}

export async function fetchCurrentUserRequest(): Promise<AppUser> {
  const { data } = await apiClient.get<ApiSuccessResponse<{ user: AppUser }>>("/auth/me");
  return (data.data as { user: AppUser }).user;
}
