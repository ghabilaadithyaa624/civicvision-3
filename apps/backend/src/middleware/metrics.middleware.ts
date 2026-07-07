import type { Request, Response, NextFunction } from "express";
import { AuditService } from "@services/audit.service";

interface MetricCounter {
  method: string;
  route: string;
  status: number;
  count: number;
  totalDuration: number;
}

// In-memory Prometheus metric accumulators
const apiMetricsMap = new Map<string, MetricCounter>();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to ms
    const durationSec = durationMs / 1000;

    const method = req.method;
    const route = req.route ? req.route.path : req.path;
    const status = res.statusCode;

    const key = `${method}:${route}:${status}`;
    const existing = apiMetricsMap.get(key) || {
      method,
      route,
      status,
      count: 0,
      totalDuration: 0,
    };

    existing.count += 1;
    existing.totalDuration += durationSec;
    apiMetricsMap.set(key, existing);

    // Logging audit logs for critical database operations or warnings
    if (route.startsWith("/api") && !route.includes("/health") && !route.includes("/metrics")) {
      const user = req.user?.email || "anonymous";
      let category: "API" | "DATABASE" | "YOLO" | "AUTH" = "API";
      if (route.includes("/auth")) category = "AUTH";
      else if (method !== "GET") category = "DATABASE";

      void AuditService.log(
        category,
        `${method} ${route} responded with status ${status}`,
        user,
        `${Math.round(durationMs)}ms`
      );
    }
  });

  next();
}

export function generatePrometheusMetrics(): string {
  let output = "";

  // 1. Process CPU & Memory Gauges
  const memoryUsage = process.memoryUsage();
  output += `# HELP node_memory_bytes Node.js heap memory usage in bytes\n`;
  output += `# TYPE node_memory_bytes gauge\n`;
  output += `node_memory_bytes{type="heapTotal"} ${memoryUsage.heapTotal}\n`;
  output += `node_memory_bytes{type="heapUsed"} ${memoryUsage.heapUsed}\n`;
  output += `node_memory_bytes{type="rss"} ${memoryUsage.rss}\n\n`;

  output += `# HELP node_cpu_usage Process CPU average utilization percentage\n`;
  output += `# TYPE node_cpu_usage gauge\n`;
  const cpu = process.cpuUsage();
  const totalCpuTime = (cpu.user + cpu.system) / 1000; // ms
  output += `node_cpu_usage ${Math.min(100, Math.round((totalCpuTime / (process.uptime() * 1000)) * 100))}\n\n`;

  // 2. HTTP Requests count metrics
  output += `# HELP http_requests_total Total number of HTTP requests processed\n`;
  output += `# TYPE http_requests_total counter\n`;
  for (const metric of apiMetricsMap.values()) {
    output += `http_requests_total{method="${metric.method}",route="${metric.route}",status="${metric.status}"} ${metric.count}\n`;
  }
  output += "\n";

  // 3. HTTP Requests latency metrics
  output += `# HELP http_request_duration_seconds Total request handling duration in seconds\n`;
  output += `# TYPE http_request_duration_seconds counter\n`;
  for (const metric of apiMetricsMap.values()) {
    output += `http_request_duration_seconds{method="${metric.method}",route="${metric.route}",status="${metric.status}"} ${metric.totalDuration.toFixed(6)}\n`;
  }

  return output;
}
