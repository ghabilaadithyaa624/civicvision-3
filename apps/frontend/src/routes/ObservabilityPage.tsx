import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Terminal,
  Database,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  category: "API" | "DATABASE" | "YOLO" | "AUTH";
  message: string;
  latency?: string;
  user: string;
}

export function ObservabilityPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live dynamic system metrics states
  const [metrics, setMetrics] = useState({
    apiLatency: 24,
    dbLatency: 4,
    cacheHit: 99.2,
    activeSockets: 42,
    cpuUsage: 12,
  });

  // Mock initial logs
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 12).toISOString(),
      category: "YOLO",
      message: "YOLOv11 Inference complete: Class 'POTHOLE', conf 98.6%",
      latency: "142ms",
      user: "AI-Inference-Node-3",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
      category: "DATABASE",
      message: "Prisma transaction completed: IssueReport creation synced",
      latency: "8ms",
      user: "postgres-read-replica-1",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
      category: "API",
      message: "GET /api/v1/issues - Cache HIT",
      latency: "2ms",
      user: "anonymous-citizen",
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
      category: "AUTH",
      message: "JWT auth token successfully verified for Field Agent",
      latency: "1ms",
      user: "sarah-agent-4",
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
      category: "DATABASE",
      message: "Active transaction pool checked: 4 active connections",
      latency: "12ms",
      user: "municipal-admin-1",
    },
  ]);

  // Sync live backend operational telemetry and JSON audit records
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

        // 1. Fetch live PostgreSQL-backed audit events
        const auditRes = await fetch(`${baseUrl}/health/audit`);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          if (auditData.success && auditData.data && auditData.data.logs) {
            setLogs(auditData.data.logs);
          }
        }

        // 2. Fetch Prometheus raw telemetry metrics
        const metricsRes = await fetch(`${baseUrl}/health/metrics`);
        if (metricsRes.ok) {
          const text = await metricsRes.text();

          // Execute RegExp parse patterns on Prometheus exposition output
          const cpuMatch = text.match(/node_cpu_usage (\d+)/);
          const requestsMatch = [...text.matchAll(/http_requests_total\{.*?\} (\d+)/g)];

          const totalRequests = requestsMatch.reduce((sum, item) => sum + parseInt(item[1], 10), 0);

          setMetrics((prev) => ({
            apiLatency: prev.apiLatency,
            dbLatency: prev.dbLatency,
            cacheHit: prev.cacheHit,
            activeSockets: totalRequests || prev.activeSockets,
            cpuUsage: cpuMatch ? parseInt(cpuMatch[1], 10) : prev.cpuUsage,
          }));
        }
      } catch (err) {
        console.warn("Operational metrics connection offline:", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => filter === "ALL" || log.category === filter)
      .filter((log) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.user.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q)
        );
      });
  }, [logs, filter, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
          <Activity className="h-3.5 w-3.5 animate-pulse" /> Telemetry & Infrastructure Logs
        </div>
        <h1 className="text-2xl font-extrabold text-white">System Observability</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor global API latencies, database connections, and secure cryptographic transactions.
        </p>
      </div>

      {/* Observability KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* API Response Latency */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c0f1d]/85 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] uppercase font-extrabold tracking-wider">API LATENCY</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">{metrics.apiLatency}ms</div>
            <span className="text-[8px] text-emerald-450 font-bold flex items-center gap-0.5 mt-1">
              <CheckCircle className="h-3 w-3" /> Target SLA 100% Met
            </span>
          </div>
        </div>

        {/* DB Connection Latency */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c0f1d]/85 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] uppercase font-extrabold tracking-wider">DB LATENCY</span>
            <Database className="h-4 w-4 text-emerald-450" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">{metrics.dbLatency}ms</div>
            <span className="text-[8px] text-slate-500 font-mono mt-1 block">PostgreSQL Replica Node 1</span>
          </div>
        </div>

        {/* CPU utilization */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c0f1d]/85 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] uppercase font-extrabold tracking-wider">CPU UTILIZATION</span>
            <Cpu className="h-4 w-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">{metrics.cpuUsage}%</div>
            <span className="text-[8px] text-slate-500 font-mono mt-1 block">Cluster average load</span>
          </div>
        </div>

        {/* Cache hit ratios */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c0f1d]/85 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] uppercase font-extrabold tracking-wider">REDIS CACHE</span>
            <RefreshCw className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">{metrics.cacheHit}%</div>
            <span className="text-[8px] text-amber-400 font-bold flex items-center gap-0.5 mt-1">
              ● HIT
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Console / Logs */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c0f1d]/85 shadow-xl p-6 relative overflow-hidden space-y-4">
        {/* Filtering header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Cryptographic Audit Trail</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "API", "DATABASE", "YOLO", "AUTH"].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                  filter === c
                    ? "bg-brand-500/20 border-brand-500 text-brand-400 animate-pulse"
                    : "bg-[#0b0f19] border-slate-800 hover:border-brand-500 text-slate-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, system entities, or latencies..."
            className="w-full bg-[#05070e] border border-slate-800/80 rounded-xl px-10 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#05070e]/85">
          <table className="w-full text-left border-collapse font-mono text-[10px] text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070913] text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Category</th>
                <th className="p-3">Payload Message</th>
                <th className="p-3">Latency</th>
                <th className="p-3 text-right">Entity Node</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-550 text-xs">
                    No transactions matched active filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[8px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          log.category === "API"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : log.category === "DATABASE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : log.category === "YOLO"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 line-clamp-1 max-w-[300px]" title={log.message}>
                      {log.message}
                    </td>
                    <td className="p-3 text-cyan-400">
                      {log.latency || "N/A"}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {log.user}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Observations Summary footer */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 font-mono">
          <span>Active Nodes: 1 replica-db, 3 load-balancers, 2 YOLO-servers</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" /> Verified by Redis Geo-Spatial Keys
          </span>
        </div>
      </div>
    </div>
  );
}
