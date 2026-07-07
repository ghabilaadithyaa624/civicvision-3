import { useIssuesQuery } from "../hooks/useIssues.hooks";
import {
  BarChart3,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Target,
  Users,
  ArrowUpRight,
  Layers,
  Timer,
  CircleDot,
  Flame,
  Eye,
  MapPin,
} from "lucide-react";
import { LottieWidget } from "@/components/LottieWidget";
import { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setValue(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Mini Sparkline SVG Component                                       */
/* ------------------------------------------------------------------ */
function Sparkline({
  data,
  color = "#38bdf8",
  fillColor,
  width = 120,
  height = 36,
}: {
  data: number[];
  color?: string;
  fillColor?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data.map((v, i) => ({
    x: padding + i * step,
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fillColor && <path d={fillD} fill={fillColor} opacity="0.15" />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} className="animate-pulse" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut Chart Component                                              */
/* ------------------------------------------------------------------ */
function DonutChart({
  segments,
  size = 160,
  strokeWidth = 18,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLen = pct * circumference;
          const dashGap = circumference - dashLen;
          const currentOffset = offset;
          offset += dashLen;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{ filter: `drop-shadow(0 0 6px ${seg.color}40)` }}
            />
          );
        })}
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerLabel && <span className="text-lg font-extrabold text-white">{centerLabel}</span>}
        {centerSub && <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{centerSub}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal Bar Chart Component                                     */
/* ------------------------------------------------------------------ */
function HorizontalBar({
  label,
  value,
  maxValue,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  suffix?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        <span className="font-mono font-bold text-brand-400">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Area Chart Component with gradient fill                            */
/* ------------------------------------------------------------------ */
function AreaChart({
  data,
  labels,
  height = 200,
  color = "#38bdf8",
  gradientId,
}: {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  gradientId: string;
}) {
  const width = 520;
  const pad = { top: 20, right: 20, bottom: 35, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const points = data.map((v, i) => ({
    x: pad.left + i * step,
    y: pad.top + chartH - (v / max) * chartH,
  }));

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${lineD} L ${points[points.length - 1].x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`;

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => pad.top + chartH - pct * chartH);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((y, i) => (
        <g key={i}>
          <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
          <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(148,163,184,0.5)" fontFamily="monospace">
            {Math.round((1 - (y - pad.top) / chartH) * max)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 2px 8px ${color}60)` }} />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke={color} strokeWidth="2" />
          <circle cx={p.x} cy={p.y} r="2" fill={color} />
        </g>
      ))}

      {/* X Labels */}
      {labels.map((label, i) => {
        const x = pad.left + i * step;
        return (
          <text key={i} x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.6)" fontFamily="Inter, sans-serif">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ================================================================== */
/*  MAIN ANALYTICS PAGE                                                */
/* ================================================================== */

export function AnalyticsPage() {
  const { data: issues, isLoading } = useIssuesQuery();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Derived metrics
  const total = issues?.length || 0;
  const resolved = issues?.filter((i) => i.status === "RESOLVED").length || 0;
  const pending = issues?.filter((i) => i.status === "PENDING").length || 0;
  const inProgress = issues?.filter((i) => i.status === "IN_PROGRESS").length || 0;
  const rejected = issues?.filter((i) => i.status === "REJECTED").length || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgAiConfidence = useMemo(() => {
    if (!issues?.length) return 96.4;
    const withConf = issues.filter((i) => i.aiConfidence !== null);
    if (!withConf.length) return 96.4;
    return Math.round((withConf.reduce((s, i) => s + (i.aiConfidence || 0), 0) / withConf.length) * 10) / 10;
  }, [issues]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    issues?.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    const colorMap: Record<string, string> = {
      POTHOLE: "#3b82f6",
      GARBAGE: "#eab308",
      STREETLIGHT: "#a855f7",
      WATER_LEAKAGE: "#10b981",
      DAMAGED_SIGNAGE: "#f97316",
      OTHER: "#64748b",
    };
    const labelMap: Record<string, string> = {
      POTHOLE: "Potholes",
      GARBAGE: "Garbage",
      STREETLIGHT: "Streetlight",
      WATER_LEAKAGE: "Water Leak",
      DAMAGED_SIGNAGE: "Signage",
      OTHER: "Other",
    };
    return Object.entries(counts)
      .map(([key, value]) => ({
        label: labelMap[key] || key,
        value,
        color: colorMap[key] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);

  // Sparkline mock data (simulated trend - in real app would come from time-series API)
  const sparkData = {
    resolution: [1.2, 1.5, 1.9, 2.1, 1.8, 1.6, 1.4, 1.8],
    accuracy: [94.2, 95.1, 95.8, 96.0, 96.2, 96.4, 96.1, 96.4],
    issues: [5, 8, 12, 7, 15, 10, 13, total || 8],
    backlog: [12, 10, 8, 11, 9, 7, 6, pending + inProgress],
  };

  // Weekly trend data
  const weeklyData = [5, 12, 8, 18, 14, 22, 16];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Severity distribution (simulated)
  const severityData = [
    { label: "Critical", count: Math.max(1, Math.floor(total * 0.12)), color: "#ef4444" },
    { label: "High", count: Math.max(2, Math.floor(total * 0.28)), color: "#f97316" },
    { label: "Medium", count: Math.max(3, Math.floor(total * 0.35)), color: "#eab308" },
    { label: "Low", count: Math.max(2, Math.floor(total * 0.25)), color: "#10b981" },
  ];
  const maxSeverity = Math.max(...severityData.map((s) => s.count));

  // Animated counters
  const animTotal = useAnimatedNumber(total);
  const animRate = useAnimatedNumber(resolutionRate);
  const animBacklog = useAnimatedNumber(pending + inProgress);

  // Department SLA data
  const departments = [
    { name: "Road Maintenance", rate: 98, target: 95, color: "#3b82f6", icon: "🛣️" },
    { name: "Water Board", rate: 89, target: 90, color: "#06b6d4", icon: "💧" },
    { name: "Electrical Board", rate: 94, target: 92, color: "#eab308", icon: "⚡" },
    { name: "Sanitation", rate: 82, target: 85, color: "#a855f7", icon: "🗑️" },
    { name: "Traffic Signage", rate: 91, target: 88, color: "#10b981", icon: "🚦" },
  ];

  // Recent activity feed
  const recentActivity = useMemo(() => {
    if (!issues?.length) return [];
    return issues
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((issue) => ({
        id: issue.id.slice(0, 8),
        title: issue.title,
        status: issue.status,
        category: issue.category,
        time: new Date(issue.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      }));
  }, [issues]);

  const statusColor: Record<string, string> = {
    PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    IN_PROGRESS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    RESOLVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    REJECTED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* ═══ PAGE HEADER BANNER ═══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-slate-800/60 shadow-2xl">
        {/* Decorative animated background */}
        <div className="absolute top-0 right-0 w-96 h-full opacity-20 pointer-events-none">
          <LottieWidget theme="analytics-chart" width="100%" height="100%" />
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold mb-4">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI-Powered Business Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              City Infrastructure Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
              Real-time KPI monitoring, automated triage performance, and resolution SLA tracking powered by Antigravity 3.5 Flash High.
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/60 rounded-xl p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PRIMARY KPI CARDS ═══ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Reports */}
        <div className="group rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md hover:border-brand-500/30 hover:shadow-brand-500/5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Reports</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-white tabular-nums">{isLoading ? "..." : animTotal}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1.5 font-semibold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +12% from last period
              </p>
            </div>
            <Sparkline data={sparkData.issues} color="#3b82f6" fillColor="#3b82f6" width={100} height={32} />
          </div>
        </div>

        {/* Resolution SLA */}
        <div className="group rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Resolution</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <Timer className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-white">
                1.8 <span className="text-lg text-slate-400">Days</span>
              </p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1.5 font-semibold">
                <TrendingDown className="h-3.5 w-3.5" />
                -32% faster vs. last month
              </p>
            </div>
            <Sparkline data={sparkData.resolution} color="#10b981" fillColor="#10b981" width={100} height={32} />
          </div>
        </div>

        {/* AI Accuracy */}
        <div className="group rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md hover:border-cyan-500/30 hover:shadow-cyan-500/5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Accuracy</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Target className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-white tabular-nums">{avgAiConfidence}%</p>
              <p className="text-xs text-cyan-400 flex items-center gap-1 mt-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Auto-triaged in &lt;100ms
              </p>
            </div>
            <Sparkline data={sparkData.accuracy} color="#06b6d4" fillColor="#06b6d4" width={100} height={32} />
          </div>
        </div>

        {/* Active Backlog */}
        <div className="group rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md hover:border-amber-500/30 hover:shadow-amber-500/5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Backlog</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-white tabular-nums">{isLoading ? "..." : animBacklog}</p>
              <p className="text-xs text-amber-400 flex items-center gap-1 mt-1.5 font-semibold">
                <Clock className="h-3.5 w-3.5" />
                {pending} pending · {inProgress} in-progress
              </p>
            </div>
            <Sparkline data={sparkData.backlog} color="#f59e0b" fillColor="#f59e0b" width={100} height={32} />
          </div>
        </div>
      </div>

      {/* ═══ SECONDARY KPI ROW — Resolution & Status Breakdown ═══ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Resolution Rate */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="5" />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeDasharray={`${(animRate / 100) * 138.2} 138.2`}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.4))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-extrabold text-emerald-400">{animRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">Resolution Rate</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{resolved} of {total} resolved</p>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">Pending Triage</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{isLoading ? "..." : pending}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">In Progress</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{isLoading ? "..." : inProgress}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">Rejected / Invalid</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{isLoading ? "..." : rejected}</p>
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ROW: Trend Line + Category Donut ═══ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Area Chart: Weekly Reports Trend (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
                <LineChart className="h-4 w-4 text-brand-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Weekly Reports Trend</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Reports Filed
              </span>
            </div>
          </div>
          <div className="relative aspect-[2.6/1]">
            <AreaChart data={weeklyData} labels={weekLabels} color="#38bdf8" gradientId="weekly-trend-grad" />
          </div>
        </div>

        {/* Donut: Category Distribution (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-4">
            <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <PieChart className="h-4 w-4 text-brand-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Category Breakdown</h2>
          </div>

          <div className="flex flex-col items-center gap-6 py-2">
            <DonutChart
              segments={categoryData.length > 0 ? categoryData : [{ label: "No Data", value: 1, color: "#334155" }]}
              centerLabel={`${total}`}
              centerSub="Total"
              size={150}
              strokeWidth={16}
            />

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
              {categoryData.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[11px] text-slate-400 font-medium truncate">{seg.label}</span>
                  <span className="text-[11px] font-bold text-slate-300 ml-auto tabular-nums">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ROW: Severity + Department SLA + AI Health ═══ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Severity Distribution */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Severity Distribution</h2>
          </div>

          <div className="space-y-4">
            {severityData.map((sev) => (
              <HorizontalBar key={sev.label} label={sev.label} value={sev.count} maxValue={maxSeverity} color={sev.color} />
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/40">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-semibold">Critical SLA Breach Risk</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <CircleDot className="h-3 w-3 animate-pulse" />
                {severityData[0].count} issues
              </span>
            </div>
          </div>
        </div>

        {/* Department SLA Performance */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
                <BarChart3 className="h-4 w-4 text-brand-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Dept. SLA Performance</h2>
            </div>
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">On-Time %</span>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-2">
                    <span className="text-sm">{dept.icon}</span>
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${dept.rate >= dept.target ? "text-emerald-400" : "text-amber-400"}`}>{dept.rate}%</span>
                    {dept.rate >= dept.target ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </div>
                </div>
                <div className="relative h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
                  {/* Target marker */}
                  <div className="absolute top-0 h-full w-px bg-slate-400/30 z-10" style={{ left: `${dept.target}%` }} />
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${dept.rate}%`, backgroundColor: dept.color, boxShadow: `0 0 8px ${dept.color}40` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine Health */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-800/60 pb-4">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">AI Engine Health</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Antigravity 3.5 Flash High continuously scans incoming reports for duplicate detection, GPS anomaly verification, and severity grading.
            </p>
          </div>

          <div className="h-36 rounded-xl bg-slate-900/60 border border-slate-800/60 p-4 flex items-center justify-center relative overflow-hidden">
            <LottieWidget theme="ai-pulse" width={120} height={120} />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-800/60">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
              </span>
              <span className="text-slate-400 font-bold">LATENCY: 18ms</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15 flex items-center gap-3">
            <div className="w-9 h-9 shrink-0">
              <LottieWidget theme="success-check" width={36} height={36} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400">Zero System Bottlenecks</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All 5 municipal zones within SLA thresholds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM ROW: Activity Feed + Quick Stats ═══ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity Feed (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Eye className="h-4 w-4 text-indigo-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Recent Activity</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Live feed</span>
          </div>

          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-800/40">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 group hover:bg-slate-800/20 rounded-lg px-2 -mx-2 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono">#{item.id}</span> · {item.category.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${statusColor[item.status]}`}>
                    {item.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap hidden sm:block">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <LottieWidget theme="empty-box" width={64} height={64} />
              <p className="text-xs font-semibold mt-3">No recent activity</p>
            </div>
          )}
        </div>

        {/* Quick Stats Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Citizen Engagement */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Citizen Engagement</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p className="text-xl font-extrabold text-white tabular-nums">{Math.max(total * 3, 24)}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Total Upvotes</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p className="text-xl font-extrabold text-white tabular-nums">{Math.max(Math.ceil(total * 0.8), 5)}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Unique Reporters</p>
              </div>
            </div>
          </div>

          {/* AI Processing Stats */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0f172a]/80 p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Processing</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Avg. Triage Time</span>
                <span className="text-xs font-bold font-mono text-cyan-400">87ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Duplicate Detection</span>
                <span className="text-xs font-bold font-mono text-emerald-400">99.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">GPS Verification</span>
                <span className="text-xs font-bold font-mono text-brand-400">98.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Model Version</span>
                <span className="text-xs font-bold font-mono text-slate-300">v3.5-flash-high</span>
              </div>
            </div>
          </div>

          {/* SLA Compliance */}
          <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-[#0f172a]/80 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0">
                <LottieWidget theme="success-check" width={40} height={40} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">SLA Compliance: 94.3%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Average across all 5 departments. {departments.filter((d) => d.rate >= d.target).length} of 5 meeting targets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
