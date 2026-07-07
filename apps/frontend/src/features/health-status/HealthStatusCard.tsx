import { ServerCog, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useHealthStatus } from "./useHealthStatus";
import { cn } from "@civicvision/shared-ui";

export function HealthStatusCard() {
  const { data, isLoading, isError } = useHealthStatus();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <ServerCog className="h-5 w-5 text-slate-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">Backend API</p>
        <p className="text-xs text-slate-500">
          {isLoading && "Checking status…"}
          {isError && "Unable to reach the backend"}
          {data && `${data.message} · v${data.version} · uptime ${data.uptime}`}
        </p>
      </div>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          isLoading && "text-slate-400",
          isError && "bg-red-50 text-red-500",
          data && "bg-green-50 text-green-600",
        )}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isError && <XCircle className="h-4 w-4" />}
        {data && <CheckCircle2 className="h-4 w-4" />}
      </span>
    </div>
  );
}
