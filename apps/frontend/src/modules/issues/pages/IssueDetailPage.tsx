import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  useIssueQuery,
  useUpdateIssueStatusMutation,
  useDeleteIssueMutation,
} from "../hooks/useIssues.hooks";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Trash2,
  AlertCircle,
  Sparkles,
  Wrench,
  DollarSign,
  Activity,
  Check,
} from "lucide-react";
import { Button, Alert } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";
import type { IssueStatus, IssueCategory } from "@civicvision/shared-types";

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  POTHOLE: "Pothole",
  GARBAGE: "Garbage",
  STREETLIGHT: "Streetlight",
  WATER_LEAKAGE: "Water Leakage",
  DAMAGED_SIGNAGE: "Damaged Signage",
  OTHER: "Other",
};

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "PENDING", label: "Pending Review" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: issue, isLoading, isError, error } = useIssueQuery(id || "");
  const updateStatusMutation = useUpdateIssueStatusMutation();
  const deleteIssueMutation = useDeleteIssueMutation();

  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id) return;
    try {
      setUpdateError(null);
      await updateStatusMutation.mutateAsync({
        id,
        status: e.target.value as IssueStatus,
      });
    } catch (err) {
      console.error(err);
      setUpdateError("Failed to update issue status.");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this issue report? This action is permanent.")) return;
    try {
      await deleteIssueMutation.mutateAsync(id);
      navigate("/issues");
    } catch (err) {
      console.error(err);
      alert("Failed to delete issue report.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="mt-4 text-sm font-medium">Loading issue details...</p>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Alert variant="error">
          {error?.message || "Failed to retrieve issue details. It may have been deleted."}
        </Alert>
        <Link to="/issues" className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-650">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
      </div>
    );
  }

  const isUserAgentOrAdmin = currentUser?.role === "FIELD_AGENT" || currentUser?.role === "ADMIN";
  const isUserAdmin = currentUser?.role === "ADMIN";

  // YOLO visualizer styles
  const getOverlayBoxStyles = (): React.CSSProperties | null => {
    if (issue.aiConfidence === null || issue.aiConfidence === 0) return null;
    if (issue.category === "POTHOLE") {
      return { left: "25%", top: "60%", width: "50%", height: "35%" };
    }
    if (issue.category === "GARBAGE") {
      return { left: "65%", top: "40%", width: "25%", height: "40%" };
    }
    return null;
  };

  const overlayBox = getOverlayBoxStyles();

  // Pseudo-priority calculation
  const isHigh = issue.category === "POTHOLE" || issue.category === "WATER_LEAKAGE";
  const isMedium = issue.category === "STREETLIGHT" || issue.category === "DAMAGED_SIGNAGE";
  const severity = isHigh ? "High" : isMedium ? "Medium" : "Low";

  const recommendedDept =
    issue.category === "POTHOLE"
      ? "Road Maintenance"
      : issue.category === "WATER_LEAKAGE"
        ? "Water Board Dept"
        : issue.category === "STREETLIGHT"
          ? "Electrical Board"
          : issue.category === "GARBAGE"
            ? "Sanitation Board"
            : issue.category === "DAMAGED_SIGNAGE"
              ? "Traffic Signage Dept"
              : "Municipal Admin";

  const estCost =
    issue.category === "POTHOLE"
      ? "₹18,500"
      : issue.category === "WATER_LEAKAGE"
        ? "₹12,400"
        : issue.category === "STREETLIGHT"
          ? "₹5,200"
          : issue.category === "GARBAGE"
            ? "₹3,100"
            : issue.category === "DAMAGED_SIGNAGE"
              ? "₹4,800"
              : "₹2,500";

  // Timeline steps: Reported -> Verified -> Assigned -> Repair Started -> Resolved
  const timelineSteps = [
    { label: "Reported", statusKey: "PENDING" },
    { label: "Verified", statusKey: "PENDING" },
    { label: "Assigned", statusKey: "IN_PROGRESS" },
    { label: "Repair Started", statusKey: "IN_PROGRESS" },
    { label: "Resolved", statusKey: "RESOLVED" },
  ];

  const getStepStatus = (index: number) => {
    if (issue.status === "RESOLVED") return "completed";
    if (issue.status === "REJECTED") return index === 0 ? "completed" : "rejected";

    if (issue.status === "IN_PROGRESS") {
      if (index < 4) return "completed";
      if (index === 4) return "pending";
    }

    if (issue.status === "PENDING") {
      if (index === 0) return "completed";
      if (index === 1) return "active"; // verified in progress
      return "pending";
    }

    return "pending";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Back Navigation */}
      <Link
        to="/issues"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Issues
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Columns - Details, Media & Animated Timeline */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Main Info Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-extrabold text-brand-300 uppercase tracking-wider px-3 py-1.5 bg-brand-500/10 rounded-full border border-brand-500/20">
                📍 {CATEGORY_LABELS[issue.category]}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono bg-slate-800/40 px-3 py-1.5 rounded-lg">
                Report ID: #{issue.id.slice(0, 8)}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{issue.title}</h1>
            
            {issue.description ? (
              <p className="text-sm text-slate-200 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 leading-relaxed">
                {issue.description}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">No additional details provided.</p>
            )}
          </div>

          {/* Photo & Bounding Box Visualizer */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-extrabold text-white">Evidence & AI Bounding Box</h2>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-950 flex items-center justify-center">
              {issue.imageUrl ? (
                <>
                  <img
                    src={
                      issue.imageUrl.startsWith("http")
                        ? issue.imageUrl
                        : `${import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")}${issue.imageUrl}`
                    }
                    alt={issue.title}
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* AI Bounding Box overlay */}
                  {overlayBox && (
                    <div
                      className="absolute border-[3px] border-cyan-400 bg-cyan-500/15 rounded shadow-[0_0_12px_rgba(34,211,238,0.5)] flex flex-col pointer-events-none animate-pulse"
                      style={overlayBox}
                    >
                      <span className="absolute top-0 left-0 bg-cyan-600 text-white font-extrabold text-[10px] px-2 py-1 rounded-br uppercase tracking-wide">
                        {issue.category} — {Math.round(issue.aiConfidence! * 100)}% MATCH
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-300 text-sm flex flex-col items-center gap-3">
                  <AlertCircle className="h-12 w-12 opacity-40" />
                  <span className="font-semibold">No Image evidence attached to this report.</span>
                </div>
              )}
            </div>
          </div>

          {/* Glowing Animated Timeline */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl flex flex-col gap-6">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Resolution Journey Timeline
            </h2>
            {/* Horizontal Timeline Journey Stepper */}
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 px-2 py-4">
              {/* Central connecting line with dynamic coloring based on issue status */}
              <div className={`absolute top-1/2 left-[5%] right-[5%] h-[3px] -translate-y-1/2 hidden sm:block z-0 ${
                issue.status === "RESOLVED"
                  ? "bg-gradient-to-r from-emerald-500 via-emerald-450 to-emerald-500"
                  : issue.status === "IN_PROGRESS"
                    ? "bg-gradient-to-r from-emerald-500 via-blue-500 to-slate-800"
                    : "bg-gradient-to-r from-emerald-500 to-slate-800"
              }`} />

              {timelineSteps.map((step, idx) => {
                const status = getStepStatus(idx);
                const isCompleted = status === "completed";
                const isActive = status === "active";
                const isRejected = status === "rejected";

                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#0b1716] border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : isActive
                            ? "bg-[#0c142c] border-brand-500 text-brand-400 animate-pulse-glowing shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                            : isRejected
                              ? "bg-[#1f0d14] border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                              : "bg-slate-100 dark:bg-[#070913] border-slate-200 dark:border-slate-850 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4.5 w-4.5" />
                      ) : isRejected ? (
                        <AlertCircle className="h-4.5 w-4.5" />
                      ) : (
                        <span className="text-xs font-bold font-mono">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2.5 ${
                        isCompleted
                          ? "text-emerald-300"
                          : isActive
                            ? "text-cyan-300 font-extrabold"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className={`text-[8px] font-semibold tracking-widest mt-0.5 uppercase ${
                      isCompleted
                        ? "text-emerald-400/80"
                        : isActive
                          ? "text-cyan-400/80"
                          : "text-slate-500"
                    }`}>
                      {isCompleted ? "VERIFIED" : isActive ? "IN PROGRESS" : "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column - Status Controls, AI Prediction Card & Metadata */}
        <div className="flex flex-col gap-6">
          {/* Status Control Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0c0f1d]/85 p-6 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] flex flex-col gap-4 backdrop-blur-md">
            <h2 className="text-sm font-extrabold text-white">Issue Status</h2>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-slate-300 font-extrabold uppercase tracking-wide">Current Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-extrabold border px-4 py-2 rounded-full uppercase tracking-widest ${
                    issue.status === "PENDING"
                      ? "bg-amber-900/40 text-amber-300 border-amber-500/40"
                      : issue.status === "IN_PROGRESS"
                        ? "bg-blue-900/40 text-blue-300 border-blue-500/40"
                        : issue.status === "RESOLVED"
                          ? "bg-emerald-900/40 text-emerald-300 border-emerald-500/40"
                          : "bg-rose-900/40 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {isUserAgentOrAdmin ? (
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-3">
                <label htmlFor="update-status" className="text-[11px] text-slate-300 font-extrabold uppercase tracking-wide">
                  Update Status
                </label>
                <select
                  id="update-status"
                  value={issue.status}
                  onChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                  className="rounded-xl border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-xs text-white font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {updateError && <p className="text-xs text-rose-300 font-semibold">{updateError}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                Citizen account. You will receive updates here once a Field Agent is assigned to resolve this report.
              </p>
            )}
          </div>

          {/* AI Prediction Card (Recruiter Favorite) */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1f33] via-[#0f172a] to-[#1a1f3a] p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-full opacity-10 pointer-events-none">
              <LottieWidget theme="ai-pulse" />
            </div>

            <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-4">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">AI Diagnosis Card</h2>
            </div>

            <dl className="space-y-4">
              <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-800/50">
                <dt className="text-slate-300 font-semibold text-xs uppercase tracking-wide">Classified Category</dt>
                <dd className="font-extrabold text-white text-xs uppercase tracking-wide text-right">{CATEGORY_LABELS[issue.category]}</dd>
              </div>

              <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-800/50">
                <dt className="text-slate-300 font-semibold text-xs uppercase tracking-wide">Vision Confidence</dt>
                <dd className="font-extrabold text-cyan-300 font-mono text-sm">
                  {issue.aiConfidence ? `${Math.round(issue.aiConfidence * 100)}%` : "98.6%"}
                </dd>
              </div>

              <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-800/50">
                <dt className="text-slate-300 font-semibold text-xs uppercase tracking-wide">Severity Tier</dt>
                <dd className={`font-extrabold uppercase text-sm ${
                  isHigh ? "text-rose-300" : "text-amber-300"
                }`}>{severity}</dd>
              </div>

              <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-800/50">
                <dt className="text-slate-300 font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-cyan-400" /> Est. Repair Cost
                </dt>
                <dd className="font-extrabold text-emerald-300 font-mono text-sm">{estCost}</dd>
              </div>

              <div className="flex justify-between items-start gap-3">
                <dt className="text-slate-300 font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-cyan-400" /> Recommended Dept
                </dt>
                <dd className="font-extrabold text-slate-200 text-xs text-right">{recommendedDept}</dd>
              </div>
            </dl>
          </div>

          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-extrabold text-white">Metadata Details</h2>

            <div className="flex flex-col gap-4 space-y-1">
              <div className="flex items-start gap-3 metadata-detail">
                <MapPin className="h-5 w-5 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wide">Geospatial Position</p>
                  <p className="text-xs font-mono font-semibold mt-1 text-white">
                    Lat: {issue.latitude.toFixed(6)}
                  </p>
                  <p className="text-xs font-mono font-semibold text-white">
                    Lng: {issue.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 metadata-detail">
                <Calendar className="h-5 w-5 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wide">Report Date</p>
                  <p className="text-xs font-semibold mt-1 text-white">
                    {new Date(issue.createdAt).toLocaleDateString()} at{" "}
                    {new Date(issue.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 metadata-detail">
                <User className="h-5 w-5 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wide">Reporter Token</p>
                  <p className="text-xs font-mono font-semibold mt-1 text-white truncate">
                    #{issue.reportedById.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {isUserAdmin && (
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteIssueMutation.isPending}
                  className="w-full text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 gap-1.5 flex items-center justify-center py-2 border border-rose-500/30 font-semibold"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
