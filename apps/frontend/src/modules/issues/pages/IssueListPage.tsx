import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIssuesQuery } from "../hooks/useIssues.hooks";
import { useSaaSSimulator } from "@/hooks/useSaaSSimulator";
import { Plus, Eye, MapPin, Calendar, Tag, Sparkles } from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import type { IssueCategory, IssueStatus, IssueReport } from "@civicvision/shared-types";

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  POTHOLE: "Pothole",
  GARBAGE: "Garbage",
  STREETLIGHT: "Streetlight",
  WATER_LEAKAGE: "Water Leakage",
  DAMAGED_SIGNAGE: "Damaged Signage",
  OTHER: "Other",
};

interface ExtendedIssueReport extends IssueReport {
  isOfflineQueued?: boolean;
  isRealtimeStreaming?: boolean;
}

export function IssueListPage() {
  const { state: saasState, isRealtime } = useSaaSSimulator();

  const [statusFilter, setStatusFilter] = useState<IssueStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "">("");
  const [realtimeIssues, setRealtimeIssues] = useState<ExtendedIssueReport[]>([]);

  const filters = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
  };

  const { data: issues, isLoading, isError } = useIssuesQuery(filters);

  // Simulated Realtime Web Socket pipeline
  useEffect(() => {
    if (!isRealtime) {
      setRealtimeIssues([]);
      return;
    }

    const interval = setInterval(() => {
      const mockIssue: ExtendedIssueReport = {
        id: "rt-" + Math.random().toString(36).substring(2, 9),
        title: "Telemetry Flag: Pothole in Zone " + Math.floor(Math.random() * 6 + 1),
        description: "GIS visual sensor reports high-severity road displacement at active intersection.",
        category: "POTHOLE",
        status: "PENDING",
        latitude: 12.9716 + (Math.random() - 0.5) * 0.04,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.04,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportedById: "system",
        imageUrl: null,
        aiConfidence: 0.96,
        isRealtimeStreaming: true
      };
      setRealtimeIssues((prev) => [mockIssue, ...prev]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isRealtime]);

  const getCombinedList = () => {
    if (saasState === "EMPTY") return [];

    const offlineQueue: ExtendedIssueReport[] = localStorage.getItem("offline_issues_queue")
      ? JSON.parse(localStorage.getItem("offline_issues_queue")!)
      : [];

    const mappedOffline = offlineQueue.map((item: ExtendedIssueReport) => ({
      ...item,
      isOfflineQueued: true
    }));

    let base: ExtendedIssueReport[] = issues ? [...issues] : [];

    if (statusFilter) {
      base = base.filter((i) => i.status === statusFilter);
    }
    if (categoryFilter) {
      base = base.filter((i) => i.category === categoryFilter);
    }

    return [...mappedOffline, ...realtimeIssues, ...base];
  };

  const finalIssues = getCombinedList();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Civic Infrastructure Issues</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, monitor, and resolve civic complaints at city scale.
          </p>
        </div>
        <Link to="/issues/report">
          <Button className="flex items-center gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Filtering Toolbar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
          Filters
        </span>

        <div className="flex flex-col gap-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | "")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-100 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | "")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-100 min-w-[140px]"
          >
            <option value="">All Categories</option>
            <option value="POTHOLE">Potholes</option>
            <option value="GARBAGE">Garbage</option>
            <option value="STREETLIGHT">Streetlights</option>
            <option value="WATER_LEAKAGE">Water Leakages</option>
            <option value="DAMAGED_SIGNAGE">Damaged Signage</option>
            <option value="OTHER">Others</option>
          </select>
        </div>

        {(statusFilter || categoryFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setCategoryFilter("");
            }}
            className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {/* Main Content Area */}
      {saasState === "LOADING" || isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col border border-slate-800/80 rounded-2xl bg-[#0c0f1d]/80 overflow-hidden shadow-2xl h-80 animate-pulse">
              <div className="aspect-video bg-slate-900" />
              <div className="p-5 space-y-4">
                <div className="h-4 bg-slate-900 rounded w-1/3" />
                <div className="h-6 bg-slate-900 rounded" />
                <div className="h-10 bg-slate-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : saasState === "ERROR" || isError ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl text-center max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-455 text-xl mb-4">
            ⚠️
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gateway Timeout Breach</h3>
          <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
            The civic platform failed to capture the database cursor. This occurs during localized node maintenance or server migrations.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-800"
          >
            Troubleshoot Connection
          </button>
        </div>
      ) : finalIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800/80 bg-[#0c0f1d]/40 rounded-2xl text-center p-6 max-w-xl mx-auto">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-brand-400 mb-4 shadow-lg border border-slate-800">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Bulletins</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1.5 mb-6">
            All coordinates in your sector are completely cleared. Use the reporter pipeline to create a new bulletin.
          </p>
          <Link to="/issues/report">
            <Button>Create a Report</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {finalIssues.map((issue) => {
            // Pseudo-priority calculation
            const isHigh = issue.category === "POTHOLE" || issue.category === "WATER_LEAKAGE";
            const isMedium = issue.category === "STREETLIGHT" || issue.category === "DAMAGED_SIGNAGE";
            const priority = isHigh ? "High" : isMedium ? "Medium" : "Low";

            const dept =
              issue.category === "POTHOLE"
                ? "Road Department"
                : issue.category === "WATER_LEAKAGE"
                  ? "Water Board"
                  : issue.category === "STREETLIGHT"
                    ? "Electrical Dept"
                    : issue.category === "GARBAGE"
                      ? "Sanitation Dept"
                      : issue.category === "DAMAGED_SIGNAGE"
                        ? "Traffic Signage Dept"
                        : "Municipal Admin";

            return (
              <div
                key={issue.id}
                className="flex flex-col border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#0c0f1d]/85 overflow-hidden shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] dark:hover:border-indigo-500/20 transition-all duration-300 ease-out"
              >
                {/* Card Image */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {issue.imageUrl ? (
                    <img
                      src={
                        issue.imageUrl.startsWith("http") || issue.imageUrl.startsWith("blob") || issue.imageUrl.startsWith("data")
                          ? issue.imageUrl
                          : `${import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")}${issue.imageUrl}`
                      }
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Tag className="h-8 w-8 mb-1.5 opacity-40 animate-pulse" />
                      No Image Attached
                    </div>
                  )}
                  {/* AI Badge if classified by AI */}
                  {issue.aiConfidence !== null && issue.aiConfidence > 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      AI Auto {Math.round(issue.aiConfidence * 100)}%
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex-1 p-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      📍 {CATEGORY_LABELS[issue.category as IssueCategory]}
                      {issue.isOfflineQueued && (
                        <span className="text-amber-500 animate-pulse text-[8px] font-mono font-extrabold uppercase">
                          ● Local Buffer
                        </span>
                      )}
                      {issue.isRealtimeStreaming && (
                        <span className="text-cyan-400 animate-pulse text-[8px] font-mono font-extrabold uppercase">
                          ● Live Stream
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        issue.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : issue.status === "IN_PROGRESS"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : issue.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-805 dark:text-white text-sm line-clamp-1 mb-0.5" title={issue.title}>
                      {issue.title}
                    </h3>
                    {issue.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    )}
                  </div>

                  {/* Priority & Assigned Department */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 dark:border-slate-800/80 text-[10px]">
                    <div>
                      <span className="block text-slate-400 text-[9px] uppercase font-bold">Priority</span>
                      <span
                        className={`font-bold ${
                          isHigh ? "text-rose-400" : isMedium ? "text-amber-500" : "text-blue-450"
                        }`}
                      >
                        {priority}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px] uppercase font-bold">Assigned</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{dept}</span>
                    </div>
                  </div>

                  {/* Premium SLA Target Progress Bar */}
                  <div className="py-1">
                    <div className="flex justify-between items-center text-[8px] mb-1">
                      <span className="text-slate-400 font-bold uppercase">SLA Resolution Target</span>
                      <span className={`font-mono font-bold ${isHigh ? "text-rose-450" : isMedium ? "text-amber-450" : "text-emerald-400"}`}>
                        {isHigh ? "14 Hours" : isMedium ? "38 Hours" : "5.2 Days"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[2px]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${isHigh ? "from-rose-500 to-amber-500" : isMedium ? "from-amber-500 to-yellow-400" : "from-emerald-500 to-teal-400"} transition-all duration-500`}
                        style={{ width: isHigh ? "60%" : isMedium ? "40%" : "85%" }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 mt-auto flex flex-col gap-1 text-[10px] text-slate-450">
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                      {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="bg-slate-50 dark:bg-[#070913]/50 border-t border-slate-100 dark:border-slate-800/80 px-5 py-3 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500">
                    ID: #{issue.id.slice(0, 8)}
                  </span>
                  <Link to={`/issues/${issue.id}`} className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
