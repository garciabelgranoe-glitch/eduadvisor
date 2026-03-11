import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RATE_LIMIT_KEY, RateLimitConfig, SKIP_RATE_LIMIT_KEY } from "./rate-limit.decorator";
import { RateLimitService } from "./rate-limit.service";

interface GuardRequest {
  method: string;
  url?: string;
  originalUrl?: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: {
    remoteAddress?: string;
  };
}

interface GuardResponse {
  setHeader?: (name: string, value: string) => void;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipRateLimit =
      this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]) ??
      false;
    if (skipRateLimit) {
      return true;
    }

    const request = context.switchToHttp().getRequest<GuardRequest>();
    const response = context.switchToHttp().getResponse<GuardResponse>();
    const config =
      this.reflector.getAllAndOverride<RateLimitConfig>(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]) ??
      this.getDefaultConfig();

    const path = this.getPath(request);
    const ip = this.getIpAddress(request);
    const key = `${ip}:${request.method}:${path}`;
    const decision = await this.rateLimitService.consume(key, config);

    response.setHeader?.("x-ratelimit-limit", String(config.limit));
    response.setHeader?.("x-ratelimit-remaining", String(decision.remaining));
    response.setHeader?.("x-ratelimit-reset", new Date(decision.resetAt).toISOString());

    if (!decision.allowed) {
      response.setHeader?.("retry-after", String(decision.retryAfterSeconds));
      throw new HttpException("Too many requests", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private getDefaultConfig(): RateLimitConfig {
    const limit = this.parsePositiveInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 120);
    const windowMs = this.parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
    return { limit, windowMs };
  }

  private parsePositiveInteger(raw: string | undefined, fallback: number) {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return fallback;
    }
    return parsed;
  }

  private getPath(request: GuardRequest) {
    const fullPath = request.originalUrl ?? request.url ?? "/";
    const [path] = fullPath.split("?");
    return path || "/";
  }

  private getIpAddress(request: GuardRequest) {
    const forwardedFor = request.headers["x-forwarded-for"];
    const forwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    if (forwarded) {
      const [firstIp] = forwarded.split(",");
      if (firstIp?.trim()) {
        return firstIp.trim();
      }
    }

    if (request.ip) {
      return request.ip;
    }

    return request.socket?.remoteAddress ?? "unknown";
  }
}
