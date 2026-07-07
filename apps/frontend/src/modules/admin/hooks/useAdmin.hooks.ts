import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsersRequest,
  updateUserRoleRequest,
  toggleUserActiveRequest,
} from "../api/admin.api";
import type { UserRole } from "@civicvision/shared-types";

export function useAllUsersQuery() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAllUsersRequest,
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRoleRequest(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useToggleUserActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleUserActiveRequest(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
