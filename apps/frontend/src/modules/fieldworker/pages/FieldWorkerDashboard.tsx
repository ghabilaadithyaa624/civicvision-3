import { useState } from "react";
import {
  useIssuesQuery,
  useUpdateIssueStatusMutation,
} from "@/modules/issues/hooks/useIssues.hooks";
import {
  Hammer,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import { useAppSelector } from "@/store/hooks";

export function FieldWorkerDashboard() {
  const { data: issues, isLoading, refetch } = useIssuesQuery();
  const updateStatusMutation = useUpdateIssueStatusMutation();
  const user = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"available" | "my-tasks" | "completed">("available");

  // Filter issues
  const pendingIssues = issues?.filter((i) => i.status === "PENDING") || [];
  const inProgressIssues = issues?.filter((i) => i.status === "IN_PROGRESS") || [];
  const resolvedIssues = issues?.filter((i) => i.status === "RESOLVED") || [];

  // Filter based on active tab
  let displayedIssues = [];
  if (filterTab === "available") {
    displayedIssues = pendingIssues;
  } else if (filterTab === "my-tasks") {
    displayedIssues = inProgressIssues;
  } else {
    displayedIssues = resolvedIssues;
  }

  // Search filter
  displayedIssues = displayedIssues.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickUpTask = (issueId: string) => {
    updateStatusMutation.mutate({ id: issueId, status: "IN_PROGRESS" });
  };

  const handleCompleteTask = (issueId: string) => {
    updateStatusMutation.mutate({ id: issueId, status: "RESOLVED" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950/20 to-slate-900 p-8 border border-slate-800/60 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-350 text-xs font-bold mb-4">
              <Hammer className="h-3.5 w-3.5" />
              <span>Field Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Welcome back, {user?.fullName}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg">
              View and claim open repair jobs, update coordinates progress, and resolve municipal service requests.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-bold text-slate-350 hover:text-white bg-[#0f172a] border border-slate-850 hover:border-slate-700 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Jobs
          </button>
        </div>
      </div>

      {/* METRIC ROW */}
      <div className="grid gap-4 grid-cols-3">
        {/* Available Jobs */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unassigned Jobs</p>
            <p className="text-2xl font-extrabold text-white">{isLoading ? "..." : pendingIssues.length}</p>
          </div>
        </div>

        {/* Claimed Tasks */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Tasks</p>
            <p className="text-2xl font-extrabold text-white">{isLoading ? "..." : inProgressIssues.length}</p>
          </div>
        </div>

        {/* Resolved Jobs */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Jobs</p>
            <p className="text-2xl font-extrabold text-white">{isLoading ? "..." : resolvedIssues.length}</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/30 border border-slate-850 rounded-2xl p-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "available" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Available Jobs ({pendingIssues.length})
          </button>
          <button
            onClick={() => setFilterTab("my-tasks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "my-tasks" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active Tasks ({inProgressIssues.length})
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "completed" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Resolved Jobs ({resolvedIssues.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05070e] border border-slate-800 focus:border-brand-500 focus:ring-brand-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-650 outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
        </div>
      </div>

      {/* JOBS GRID */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-semibold">
          Fetching operational data feed...
        </div>
      ) : displayedIssues.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Image Header */}
              {issue.imageUrl ? (
                <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300">
                    SLA Active
                  </div>
                </div>
              ) : (
                <div className="h-28 w-full bg-slate-950 flex flex-col items-center justify-center text-slate-600 border-b border-slate-850">
                  <MapPin className="h-8 w-8 text-slate-700" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-2">No photo attachment</span>
                </div>
              )}

              {/* Body info */}
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {issue.category.replace("_", " ")}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">{issue.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {issue.description || "No operational instructions provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-850/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-400" />
                    {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:text-brand-350 flex items-center gap-1 font-bold"
                  >
                    GIS Node <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-950/50 border-t border-slate-850 flex gap-2">
                {issue.status === "PENDING" && (
                  <Button
                    onClick={() => handlePickUpTask(issue.id)}
                    className="w-full bg-gradient-to-r from-brand-500 to-sky-600 text-white font-bold border-none shadow-md shadow-brand-500/20 text-xs py-2 rounded-xl"
                  >
                    Claim & Start Job
                  </Button>
                )}
                {issue.status === "IN_PROGRESS" && (
                  <Button
                    onClick={() => handleCompleteTask(issue.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold border-none shadow-md shadow-emerald-500/20 text-xs py-2 rounded-xl"
                  >
                    Mark as Resolved
                  </Button>
                )}
                {issue.status === "RESOLVED" && (
                  <div className="w-full text-center py-2 text-xs font-bold text-emerald-450 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Finished Operations
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0f172a]/40 border border-slate-850/60 rounded-3xl text-slate-500">
          No operational jobs matching criteria.
        </div>
      )}
    </div>
  );
}
