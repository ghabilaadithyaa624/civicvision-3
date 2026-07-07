import { apiClient } from "@/services/apiClient";
import type { ApiSuccessResponse, AppUser, UserRole } from "@civicvision/shared-types";

export async function getAllUsersRequest(): Promise<AppUser[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<{ users: AppUser[] }>>("/admin/users");
  return data.data!.users;
}

export async function updateUserRoleRequest(id: string, role: UserRole): Promise<AppUser> {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ user: AppUser }>>(
    `/admin/users/${id}/role`,
    { role }
  );
  return data.data!.user;
}

export async function toggleUserActiveRequest(id: string, isActive: boolean): Promise<AppUser> {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ user: AppUser }>>(
    `/admin/users/${id}/toggle-active`,
    { isActive }
  );
  return data.data!.user;
}
