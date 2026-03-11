import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "node:net";
import { RateLimitConfig } from "./rate-limit.decorator";

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly windows = new Map<string, RateLimitWindow>();
  private readonly redisUrl = process.env.REDIS_URL?.trim() ?? null;
  private readonly requireDistributedRateLimit = !["development", "test"].includes(process.env.NODE_ENV ?? "development");
  private redisUnavailableLogged = false;
  private requestCounter = 0;

  async consume(key: string, config: RateLimitConfig, now = Date.now()): Promise<RateLimitDecision> {
    if (!this.redisUrl && this.requireDistributedRateLimit) {
      throw new Error("REDIS_URL is required for rate limiting in production.");
    }

    if (this.redisUrl) {
      const distributedDecision = await this.consumeDistributed(key, config, now);
      if (distributedDecision) {
        return distributedDecision;
      }

      if (this.requireDistributedRateLimit) {
        throw new Error("Redis distributed rate limit is unavailable in production.");
      }
    }

    return this.consumeInMemory(key, config, now);
  }

  private consumeInMemory(key: string, config: RateLimitConfig, now: number): RateLimitDecision {
    this.requestCounter += 1;

    if (this.requestCounter % 500 === 0) {
      this.cleanupExpiredWindows(now);
    }

    const existingWindow = this.windows.get(key);
    if (!existingWindow || existingWindow.resetAt <= now) {
      const freshWindow: RateLimitWindow = {
        count: 1,
        resetAt: now + config.windowMs
      };
      this.windows.set(key, freshWindow);
      return {
        allowed: true,
        remaining: Math.max(config.limit - freshWindow.count, 0),
        retryAfterSeconds: 0,
        resetAt: freshWindow.resetAt
      };
    }

    existingWindow.count += 1;
    const allowed = existingWindow.count <= config.limit;

    return {
      allowed,
      remaining: Math.max(config.limit - existingWindow.count, 0),
      retryAfterSeconds: allowed ? 0 : Math.ceil((existingWindow.resetAt - now) / 1000),
      resetAt: existingWindow.resetAt
    };
  }

  private async consumeDistributed(
    key: string,
    config: RateLimitConfig,
    now: number
  ): Promise<RateLimitDecision | null> {
    const bucket = Math.floor(now / config.windowMs);
    const resetAt = (bucket + 1) * config.windowMs;
    const redisKey = `eduadvisor:ratelimit:${key}:${bucket}`;

    const consumed = await this.sendRedisCommand(["INCR", redisKey]);
    if (typeof consumed !== "number" || !Number.isFinite(consumed)) {
      return null;
    }

    if (consumed === 1) {
      await this.sendRedisCommand(["PEXPIRE", redisKey, String(config.windowMs)]);
    }

    const allowed = consumed <= config.limit;
    return {
      allowed,
      remaining: Math.max(config.limit - consumed, 0),
      retryAfterSeconds: allowed ? 0 : Math.ceil((resetAt - now) / 1000),
      resetAt
    };
  }

  private cleanupExpiredWindows(now: number) {
    for (const [key, windowState] of this.windows.entries()) {
      if (windowState.resetAt <= now) {
        this.windows.delete(key);
      }
    }
  }

  private async sendRedisCommand(args: string[]): Promise<string | number | null> {
    try {
      const result = await this.executeRedisCommand(args);
      this.redisUnavailableLogged = false;
      return result;
    } catch (error) {
      if (this.requireDistributedRateLimit) {
        throw error;
      }

      if (!this.redisUnavailableLogged) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Redis unavailable for distributed rate limit, falling back to in-memory: ${message}`);
        this.redisUnavailableLogged = true;
      }
      return null;
    }
  }

  private async executeRedisCommand(args: string[]): Promise<string | number | null> {
    if (!this.redisUrl) {
      throw new Error("REDIS_URL is not configured");
    }

    const parsed = new URL(this.redisUrl);
    const host = parsed.hostname;
    const port = Number(parsed.port || 6379);

    return new Promise<string | number | null>((resolve, reject) => {
      const socket = new Socket();
      let settled = false;
      let buffer = Buffer.alloc(0);

      const finish = (callback: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        callback();
      };

      socket.setTimeout(1_500);

      socket.on("connect", () => {
        socket.write(this.serializeRedisCommand(args));
      });

      socket.on("data", (chunk: Buffer) => {
        buffer = Buffer.concat([buffer, chunk]);

        try {
          const parsedResponse = this.parseRedisResponse(buffer);
          if (!parsedResponse) {
            return;
          }

          finish(() => {
            resolve(parsedResponse.value);
            socket.end();
          });
        } catch (error) {
          finish(() => reject(error));
          socket.destroy();
        }
      });

      socket.on("timeout", () => {
        finish(() => reject(new Error("Redis command timed out")));
        socket.destroy();
      });

      socket.on("error", (error) => {
        finish(() => reject(error));
      });

      socket.on("close", () => {
        if (!settled) {
          finish(() => reject(new Error("Redis socket closed before response")));
        }
      });

      socket.connect(port, host);
    });
  }

  private serializeRedisCommand(args: string[]) {
    const head = `*${args.length}\r\n`;
    const body = args.map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`).join("");
    return `${head}${body}`;
  }

  private parseRedisResponse(buffer: Buffer): { value: string | number | null } | null {
    if (buffer.length === 0) {
      return null;
    }

    const prefix = String.fromCharCode(buffer[0]);
    const lineBreak = buffer.indexOf("\r\n");

    if (lineBreak === -1) {
      return null;
    }

    if (prefix === "+") {
      return {
        value: buffer.toString("utf8", 1, lineBreak)
      };
    }

    if (prefix === ":") {
      const parsed = Number.parseInt(buffer.toString("utf8", 1, lineBreak), 10);
      return {
        value: Number.isFinite(parsed) ? parsed : 0
      };
    }

    if (prefix === "$") {
      const size = Number.parseInt(buffer.toString("utf8", 1, lineBreak), 10);
      if (!Number.isFinite(size)) {
        throw new Error("Invalid Redis bulk string response");
      }

      if (size === -1) {
        return { value: null };
      }

      const payloadStart = lineBreak + 2;
      const payloadEnd = payloadStart + size;
      const requiredLength = payloadEnd + 2;

      if (buffer.length < requiredLength) {
        return null;
      }

      return {
        value: buffer.toString("utf8", payloadStart, payloadEnd)
      };
    }

    if (prefix === "-") {
      throw new Error(buffer.toString("utf8", 1, lineBreak));
    }

    throw new Error("Unsupported Redis response type");
  }
}
