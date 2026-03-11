import { Injectable } from "@nestjs/common";
import { RequestMetricsService } from "../common/observability/request-metrics.service";
import { PrismaService } from "../prisma/prisma.service";
import { SearchIndexService } from "../modules/search/search-index.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchIndexService: SearchIndexService,
    private readonly requestMetricsService: RequestMetricsService
  ) {}

  getLiveness() {
    return {
      status: "ok",
      service: "eduadvisor-api",
      timestamp: new Date().toISOString()
    };
  }

  async getReadiness() {
    const database = await this.checkDatabase();
    const search = await this.searchIndexService.getHealth();
    const requiredReady = database.available;
    const optionalReady = search.available || search.reason === "MEILISEARCH_HOST is not configured";
    const ready = requiredReady && optionalReady;

    return {
      status: ready ? "ready" : "degraded",
      service: "eduadvisor-api",
      timestamp: new Date().toISOString(),
      dependencies: {
        database,
        search
      }
    };
  }

  getMetrics() {
    const memoryUsage = process.memoryUsage();

    return {
      status: "ok",
      service: "eduadvisor-api",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        memoryMb: {
          rss: this.bytesToMb(memoryUsage.rss),
          heapTotal: this.bytesToMb(memoryUsage.heapTotal),
          heapUsed: this.bytesToMb(memoryUsage.heapUsed),
          external: this.bytesToMb(memoryUsage.external)
        }
      },
      requests: this.requestMetricsService.getSnapshot()
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        available: true
      };
    } catch (error) {
      return {
        available: false,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private bytesToMb(bytes: number) {
    return Number((bytes / (1024 * 1024)).toFixed(2));
  }
}
