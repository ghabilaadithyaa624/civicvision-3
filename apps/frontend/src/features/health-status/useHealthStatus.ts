import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";

interface HealthPayload {
  success: boolean;
  message: string;
  version: string;
  uptime: string;
  environment: string;
}

async function fetchHealth(): Promise<HealthPayload> {
  const { data } = await apiClient.get<HealthPayload>("/health");
  return data;
}

export function useHealthStatus() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: false,
    refetchInterval: 30_000,
  });
}
