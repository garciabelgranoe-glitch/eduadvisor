import { Global, Module } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { RequestMetricsService } from "./request-metrics.service";

@Global()
@Module({
  providers: [RequestMetricsService, AuditLogService],
  exports: [RequestMetricsService, AuditLogService]
})
export class ObservabilityModule {}
