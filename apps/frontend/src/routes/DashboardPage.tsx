import { useEffect, useRef } from "react";
import { LayoutDashboard, Plus, List, TrendingUp, Compass, Sparkles, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useCurrentUserQuery } from "@/modules/auth/hooks/useAuth.hooks";
import { useIssuesQuery } from "@/modules/issues/hooks/useIssues.hooks";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";

const CATEGORY_LABELS: Record<string, string> = {
  POTHOLE: "Pothole",
  GARBAGE: "Garbage",
  STREETLIGHT: "Streetlight",
  WATER_LEAKAGE: "Water Leakage",
  DAMAGED_SIGNAGE: "Damaged Signage",
  OTHER: "Other",
};

export function DashboardPage() {
  const storedUser = useAppSelector((state) => state.auth.user);
  const { data: freshUser, isLoading: isUserLoading } = useCurrentUserQuery(Boolean(storedUser));
  const user = freshUser ?? storedUser;

  // If citizen, only query their own issues. If agent/admin, query all issues.
  const isCitizen = user?.role === "CITIZEN";
  const { data: issues, isLoading: isIssuesLoading } = useIssuesQuery(
    isCitizen && user ? { reportedById: user.id } : undefined
  );

  const totalCount = issues?.length ?? 0;
  const pendingCount = issues?.filter((i) => i.status === "PENDING").length ?? 0;
  const progressCount = issues?.filter((i) => i.status === "IN_PROGRESS").length ?? 0;
  const resolvedCount = issues?.filter((i) => i.status === "RESOLVED").length ?? 0;

  const recentIssues = issues?.slice(0, 3) ?? [];

  // Canvas radar scanner ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const drawRadar = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radial HUD Coordinate ticks
      ctx.strokeStyle = "rgba(14, 165, 233, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Axis cross lines with outer tick accents
      ctx.strokeStyle = "rgba(14, 165, 233, 0.2)";
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy);
      ctx.lineTo(cx + 110, cy);
      ctx.moveTo(cx, cy - 110);
      ctx.lineTo(cx, cy + 110);
      ctx.stroke();

      // Sweeper Scan Line
      const sweepAngle = time % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      // Sweep sector (trailing arc)
      ctx.arc(cx, cy, 100, sweepAngle, sweepAngle + 0.35);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 100);
      sweepGrad.addColorStop(0, "rgba(6, 182, 212, 0.25)");
      sweepGrad.addColorStop(1, "rgba(59, 130, 246, 0.01)");
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Scanning sweeping pointer line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle + 0.35) * 100, cy + Math.sin(sweepAngle + 0.35) * 100);
      ctx.stroke();

      // Glow indicators for issue points
      if (issues && issues.length > 0) {
        issues.forEach((issue, idx) => {
          const angle = (issue.latitude * 60 + idx) % (Math.PI * 2);
          const distance = 30 + (idx * 12) % 65;
          const pinX = cx + Math.cos(angle) * distance;
          const pinY = cy + Math.sin(angle) * distance;

          const baseColor = issue.status === "RESOLVED" ? "#10b981" : issue.status === "IN_PROGRESS" ? "#3b82f6" : "#eab308";
          
          // Draw pulsing outer beacon ring
          const beaconPulse = 1.5 + Math.abs(Math.sin(time * 3 + idx)) * 2;
          ctx.strokeStyle = baseColor + "33";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pinX, pinY, beaconPulse * 2.5, 0, Math.PI * 2);
          ctx.stroke();

          // Target locking square brackets if close to scanner pointer
          const angleDiff = Math.abs(sweepAngle - angle);
          if (angleDiff < 0.3 || angleDiff > Math.PI * 2 - 0.3) {
            ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
            ctx.lineWidth = 1;
            // Left bracket
            ctx.beginPath();
            ctx.moveTo(pinX - 6, pinY - 4);
            ctx.lineTo(pinX - 6, pinY - 6);
            ctx.lineTo(pinX - 4, pinY - 6);
            ctx.moveTo(pinX - 6, pinY + 4);
            ctx.lineTo(pinX - 6, pinY + 6);
            ctx.lineTo(pinX - 4, pinY + 6);
            // Right bracket
            ctx.moveTo(pinX + 6, pinY - 4);
            ctx.lineTo(pinX + 6, pinY - 6);
            ctx.lineTo(pinX + 4, pinY - 6);
            ctx.moveTo(pinX + 6, pinY + 4);
            ctx.lineTo(pinX + 6, pinY + 6);
            ctx.lineTo(pinX + 4, pinY + 6);
            ctx.stroke();
            
            // Text coordinate sync flag
            ctx.fillStyle = "rgba(6, 182, 212, 0.85)";
            ctx.font = "bold 6px monospace";
            ctx.fillText("LOCK", pinX + 8, pinY - 3);
          }

          // Core pin dot
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(drawRadar);
    };

    drawRadar();
    return () => cancelAnimationFrame(animId);
  }, [issues]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b0f19] via-[#11172a] to-[#0d1020] p-6 sm:p-8 text-white border border-slate-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 backdrop-blur-md">
        {/* Glow backing spot */}
        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[120%] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-60 h-full opacity-20 pointer-events-none">
          <LottieWidget theme="ai-pulse" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold mb-3 shadow-[0_0_12px_rgba(59,130,246,0.1)]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Civic Control Panel Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Welcome back, {user?.fullName || "User"}!</h1>
          <p className="text-xs text-slate-400 mt-1">
            System Account Level: <span className="font-bold text-brand-400 uppercase font-mono tracking-wider">{user?.role}</span>
          </p>
        </div>

        <div className="flex gap-3 relative z-10 shrink-0">
          <Link to="/issues/report">
            <Button className="!bg-gradient-to-r !from-brand-500 !to-cyan-500 hover:!from-brand-650 hover:!to-cyan-600 text-white border-none shadow-[0_4px_15px_rgba(59,130,246,0.25)] flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-95">
              <Plus className="h-4 w-4" /> Report Issue
            </Button>
          </Link>
          <Link to="/issues">
            <Button variant="ghost" className="text-white hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-95">
              <List className="h-4 w-4" /> View Issues
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter-Ready Premium KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reports */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/80 p-5 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-md dark:hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📊 Total Reports</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-500/10">
              <TrendingUp className="h-3 w-3" /> ↑12%
            </span>
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-extrabold text-slate-850 dark:text-white">
              {isIssuesLoading ? "..." : totalCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">+5 reported this week</p>
          </div>
          {/* Glowing Sparkline visual */}
          <div className="h-10 mt-3 relative overflow-hidden -mx-5 -mb-5 opacity-40 hover:opacity-75 transition-opacity duration-300 pointer-events-none">
            <svg className="w-full h-full text-indigo-500 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="total-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 25 Q15 15, 30 20 T60 5 T90 10 L100 8 L100 30 L0 30 Z" fill="url(#total-sparkline-grad)" />
              <path d="M0 25 Q15 15, 30 20 T60 5 T90 10 L100 8" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/80 p-5 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-md dark:hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🟡 Pending Triage</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-extrabold text-slate-850 dark:text-white">
              {isIssuesLoading ? "..." : pendingCount}
            </p>
            <p className="text-[10px] text-amber-500 mt-1 font-semibold">Est. Resolution: 2 Days</p>
          </div>
          {/* Glowing Sparkline visual */}
          <div className="h-10 mt-3 relative overflow-hidden -mx-5 -mb-5 opacity-40 hover:opacity-75 transition-opacity duration-300 pointer-events-none">
            <svg className="w-full h-full text-amber-500 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pending-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 10 Q20 28, 40 12 T80 20 L100 5 L100 30 L0 30 Z" fill="url(#pending-sparkline-grad)" />
              <path d="M0 10 Q20 28, 40 12 T80 20 L100 5" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/80 p-5 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-md dark:hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🔵 In Progress</span>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-extrabold text-slate-850 dark:text-white">
              {isIssuesLoading ? "..." : progressCount}
            </p>
            <p className="text-[10px] text-blue-500 mt-1 font-semibold">Assigned Departments: 5</p>
          </div>
          {/* Glowing Sparkline visual */}
          <div className="h-10 mt-3 relative overflow-hidden -mx-5 -mb-5 opacity-40 hover:opacity-75 transition-opacity duration-300 pointer-events-none">
            <svg className="w-full h-full text-blue-500 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="progress-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 20 Q20 5, 45 18 T75 10 L100 22 L100 30 L0 30 Z" fill="url(#progress-sparkline-grad)" />
              <path d="M0 20 Q20 5, 45 18 T75 10 L100 22" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/80 p-5 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-md dark:hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🟢 Resolved</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-extrabold text-slate-850 dark:text-white">
              {isIssuesLoading ? "..." : resolvedCount}
            </p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold">94% Citizen Satisfaction</p>
          </div>
          {/* Glowing Sparkline visual */}
          <div className="h-10 mt-3 relative overflow-hidden -mx-5 -mb-5 opacity-40 hover:opacity-75 transition-opacity duration-300 pointer-events-none">
            <svg className="w-full h-full text-emerald-500 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="resolved-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 22 Q25 18, 50 8 T85 14 L100 2 L100 30 L0 30 Z" fill="url(#resolved-sparkline-grad)" />
              <path d="M0 22 Q25 18, 50 8 T85 14 L100 2" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns: Recent Reports with custom empty state support */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/85 p-6 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] flex flex-col backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-805 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <LayoutDashboard className="h-4 w-4 text-brand-500" />
            {isCitizen ? "Your Reported Issues" : "Recent Civic Infrastructure Feeds"}
          </h2>

          {isIssuesLoading || isUserLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-450 text-xs">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mb-2" />
              Loading telemetry...
            </div>
          ) : recentIssues.length === 0 ? (
            /* Premium Recruiter-Friendly Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-400 border border-slate-800">
                <Camera className="h-8 w-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white">No active reports.</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Start improving your city today by submitting camera reporting telemetry.
                </p>
              </div>
              <Link to="/issues/report">
                <Button className="!bg-brand-500 hover:!bg-brand-600 text-white text-xs px-5 py-2.5 rounded-xl border-none">
                  Report Issue
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-800/10 rounded px-1 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-bold text-brand-400 uppercase tracking-wide">
                        {CATEGORY_LABELS[issue.category] || issue.category}
                      </span>
                      <span>•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        issue.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : issue.status === "IN_PROGRESS"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : issue.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mini GIS Map Radar View */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f1d]/85 p-5 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] flex flex-col justify-between space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-brand-400 animate-spin-slow" />
              Zone Telemetry
            </h2>
            <Link to="/map" className="text-[10px] text-brand-400 font-bold hover:underline">
              Full Map →
            </Link>
          </div>

          <div className="h-40 rounded-xl bg-slate-100 dark:bg-[#05070e] border border-slate-200 dark:border-slate-800/80 overflow-hidden relative flex items-center justify-center">
            {/* Custom Grid lines corners */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-500/30" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-500/30" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-500/30" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-500/30" />

            <canvas ref={canvasRef} width={200} height={160} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 text-[8px] font-mono text-cyan-400 border border-slate-800 shadow-md">
              📍 SCAN ACTIVE (BEACONS: {issues?.length || 0})
            </div>
          </div>

          <div className="rounded-xl bg-brand-500/5 border border-brand-500/10 p-3.5">
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Node Status</p>
            <p className="text-xs text-slate-805 dark:text-slate-205 font-bold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Normal Operation
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">SLA Dispatch targets fully maintained across node clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

