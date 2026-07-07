import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth.slice";
import {
  loginRequest,
  registerRequest,
  fetchCurrentUserRequest,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth.api";

export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (result) => {
      dispatch(setCredentials(result));
    },
  });
}

export function useRegisterMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
    onSuccess: (result) => {
      dispatch(setCredentials(result));
    },
  });
}

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUserRequest,
    enabled,
    retry: false,
  });
}
