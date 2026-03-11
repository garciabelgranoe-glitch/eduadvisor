import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { randomUUID } from "crypto";
import { AuditLogService, normalizeAuditPath, sanitizeFreeText } from "../observability/audit-log.service";
import { RequestMetricsService } from "../observability/request-metrics.service";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  constructor(
    private readonly requestMetricsService: RequestMetricsService,
    private readonly auditLogService: AuditLogService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
      query?: Record<string, unknown>;
      body?: unknown;
    }>();
    const response = http.getResponse<{ statusCode: number; setHeader: (name: string, value: string) => void }>();
    const startedAt = Date.now();

    const requestId = this.getHeaderValue(request.headers, "x-request-id") || randomUUID();
    response.setHeader("x-request-id", requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt;
          const rawPath = request.originalUrl ?? request.url ?? "/";
          const path = normalizeAuditPath(rawPath);
          this.requestMetricsService.recordRequest({
            method: request.method,
            path,
            statusCode: response.statusCode,
            durationMs
          });

          this.logger.log(
            JSON.stringify({
              requestId,
              method: request.method,
              path,
              statusCode: response.statusCode,
              durationMs
            })
          );

          if (this.auditLogService.shouldAudit(request.method, path)) {
            this.auditLogService.recordHttpAudit({
              requestId,
              request: {
                method: request.method,
                path: rawPath,
                headers: request.headers,
                ip: request.ip,
                query: request.query,
                body: request.body
              },
              statusCode: response.statusCode,
              durationMs
            });
          }
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - startedAt;
          const rawPath = request.originalUrl ?? request.url ?? "/";
          const path = normalizeAuditPath(rawPath);
          const message = error instanceof Error ? error.message : String(error);
          this.requestMetricsService.recordRequest({
            method: request.method,
            path,
            statusCode: response.statusCode,
            durationMs
          });

          this.logger.error(
            JSON.stringify({
              requestId,
              method: request.method,
              path,
              statusCode: response.statusCode,
              durationMs,
              error: sanitizeFreeText(message, 200)
            })
          );

          if (this.auditLogService.shouldAudit(request.method, path)) {
            this.auditLogService.recordHttpAudit({
              requestId,
              request: {
                method: request.method,
                path: rawPath,
                headers: request.headers,
                ip: request.ip,
                query: request.query,
                body: request.body
              },
              statusCode: response.statusCode,
              durationMs,
              error: message
            });
          }
        }
      })
    );
  }

  private getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
