import { Injectable } from "@nestjs/common";

interface RouteStats {
  count: number;
  errorCount: number;
  totalDurationMs: number;
  lastStatusCode: number;
}

interface RecordRequestParams {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}

@Injectable()
export class RequestMetricsService {
  private readonly startedAt = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private readonly statusBuckets = {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0
  };
  private readonly routes = new Map<string, RouteStats>();

  recordRequest({ method, path, statusCode, durationMs }: RecordRequestParams) {
    this.totalRequests += 1;
    this.totalDurationMs += durationMs;

    if (statusCode >= 400) {
      this.totalErrors += 1;
    }

    const statusFamily = this.getStatusFamily(statusCode);
    this.statusBuckets[statusFamily] += 1;

    const normalizedPath = this.normalizePath(path);
    const routeKey = `${method.toUpperCase()} ${normalizedPath}`;
    const current = this.routes.get(routeKey);

    if (current) {
      current.count += 1;
      current.totalDurationMs += durationMs;
      current.lastStatusCode = statusCode;
      if (statusCode >= 400) {
        current.errorCount += 1;
      }
      return;
    }

    if (this.routes.size >= 3_000) {
      return;
    }

    this.routes.set(routeKey, {
      count: 1,
      errorCount: statusCode >= 400 ? 1 : 0,
      totalDurationMs: durationMs,
      lastStatusCode: statusCode
    });
  }

  getSnapshot() {
    const topRoutes = [...this.routes.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([route, stats]) => ({
        route,
        requests: stats.count,
        errors: stats.errorCount,
        avgDurationMs: Number((stats.totalDurationMs / Math.max(stats.count, 1)).toFixed(2)),
        lastStatusCode: stats.lastStatusCode
      }));

    return {
      startedAt: new Date(this.startedAt).toISOString(),
      totals: {
        requests: this.totalRequests,
        errors: this.totalErrors,
        avgDurationMs: Number((this.totalDurationMs / Math.max(this.totalRequests, 1)).toFixed(2))
      },
      statusBuckets: this.statusBuckets,
      topRoutes
    };
  }

  private getStatusFamily(statusCode: number): "2xx" | "3xx" | "4xx" | "5xx" {
    if (statusCode >= 500) {
      return "5xx";
    }

    if (statusCode >= 400) {
      return "4xx";
    }

    if (statusCode >= 300) {
      return "3xx";
    }

    return "2xx";
  }

  private normalizePath(path: string) {
    return path
      .split("?")[0]
      .replace(/\/\d+/g, "/:id")
      .replace(/\/[a-f0-9]{8}-[a-f0-9-]{27,}/gi, "/:id")
      .replace(/\/[a-z0-9]{20,}/gi, "/:id");
  }
}
