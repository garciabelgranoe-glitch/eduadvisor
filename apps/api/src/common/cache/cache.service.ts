import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Socket } from "node:net";

type RedisResponse = string | number | null;

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

interface NamespaceVersionEntry {
  value: number;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryStore = new Map<string, MemoryEntry>();
  private readonly namespaceVersions = new Map<string, NamespaceVersionEntry>();
  private readonly redisUrl = process.env.REDIS_URL?.trim() || "redis://localhost:6379";
  private redisUnavailableLogged = false;

  async getOrSetJson<T>(
    namespace: string,
    keyPayload: unknown,
    ttlSeconds: number,
    factory: () => Promise<T>
  ): Promise<T> {
    const version = await this.getNamespaceVersion(namespace);
    const cacheKey = this.buildCacheKey(namespace, version, keyPayload);
    const cached = await this.getCachedValue(cacheKey);

    if (cached !== null) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        await this.deleteCacheKey(cacheKey);
      }
    }

    const value = await factory();
    await this.setCachedValue(cacheKey, JSON.stringify(value), ttlSeconds);
    return value;
  }

  async invalidateNamespace(namespace: string) {
    const redisKey = this.getNamespaceRedisKey(namespace);
    const localVersion = this.namespaceVersions.get(namespace)?.value ?? 1;
    let nextVersion = localVersion + 1;

    const redisVersion = await this.sendRedisCommand(["INCR", redisKey]);
    if (typeof redisVersion === "number" && Number.isFinite(redisVersion)) {
      nextVersion = redisVersion;
    }

    this.namespaceVersions.set(namespace, {
      value: nextVersion,
      expiresAt: Date.now() + 60_000
    });
  }

  async invalidateMany(namespaces: string[]) {
    await Promise.all(namespaces.map((namespace) => this.invalidateNamespace(namespace)));
  }

  async setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const ttl = Math.max(1, Math.trunc(ttlSeconds));
    const now = Date.now();
    const local = this.memoryStore.get(key);
    if (local && local.expiresAt > now) {
      return false;
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: now + ttl * 1000
    });

    const setnxResult = await this.sendRedisCommand(["SETNX", key, value]);
    if (typeof setnxResult === "number") {
      if (setnxResult === 1) {
        await this.sendRedisCommand(["EXPIRE", key, String(ttl)]);
        return true;
      }
      return false;
    }

    return true;
  }

  private async getNamespaceVersion(namespace: string) {
    const local = this.namespaceVersions.get(namespace);
    if (local && local.expiresAt > Date.now()) {
      return local.value;
    }

    const redisKey = this.getNamespaceRedisKey(namespace);
    let version = 1;
    const redisValue = await this.sendRedisCommand(["GET", redisKey]);

    if (typeof redisValue === "string" && redisValue.trim().length > 0) {
      const parsed = Number.parseInt(redisValue, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        version = parsed;
      }
    } else {
      await this.sendRedisCommand(["SET", redisKey, "1", "NX"]);
    }

    this.namespaceVersions.set(namespace, {
      value: version,
      expiresAt: Date.now() + 60_000
    });

    return version;
  }

  private getNamespaceRedisKey(namespace: string) {
    return `eduadvisor:cache:namespace:${namespace}:v`;
  }

  private buildCacheKey(namespace: string, version: number, keyPayload: unknown) {
    const signature = createHash("sha1").update(this.stableStringify(keyPayload)).digest("hex");
    return `eduadvisor:cache:${namespace}:v${version}:${signature}`;
  }

  private stableStringify(value: unknown): string {
    if (value === null || value === undefined) {
      return "null";
    }

    if (value instanceof Date) {
      return JSON.stringify(value.toISOString());
    }

    const valueType = typeof value;
    if (valueType === "string" || valueType === "number" || valueType === "boolean") {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(",")}]`;
    }

    if (valueType === "object") {
      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, item]) => `${JSON.stringify(key)}:${this.stableStringify(item)}`);

      return `{${entries.join(",")}}`;
    }

    return JSON.stringify(String(value));
  }

  private async getCachedValue(key: string): Promise<string | null> {
    const memory = this.memoryStore.get(key);
    if (memory && memory.expiresAt > Date.now()) {
      return memory.value;
    }

    if (memory) {
      this.memoryStore.delete(key);
    }

    const redisValue = await this.sendRedisCommand(["GET", key]);
    if (typeof redisValue === "string") {
      this.memoryStore.set(key, {
        value: redisValue,
        expiresAt: Date.now() + 30_000
      });
      return redisValue;
    }

    return null;
  }

  private async setCachedValue(key: string, value: string, ttlSeconds: number) {
    const ttlMs = Math.max(ttlSeconds, 1) * 1000;
    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });

    await this.sendRedisCommand(["SET", key, value, "EX", String(Math.max(ttlSeconds, 1))]);
  }

  private async deleteCacheKey(key: string) {
    this.memoryStore.delete(key);
    await this.sendRedisCommand(["DEL", key]);
  }

  private async sendRedisCommand(args: string[]): Promise<RedisResponse> {
    try {
      const result = await this.executeRedisCommand(args);
      this.redisUnavailableLogged = false;
      return result;
    } catch (error) {
      if (!this.redisUnavailableLogged) {
        this.logger.warn(`Redis unavailable, using in-memory cache fallback: ${this.getErrorMessage(error)}`);
        this.redisUnavailableLogged = true;
      }
      return null;
    }
  }

  private async executeRedisCommand(args: string[]): Promise<RedisResponse> {
    const parsed = new URL(this.redisUrl);
    const host = parsed.hostname;
    const port = Number(parsed.port || 6379);

    return new Promise<RedisResponse>((resolve, reject) => {
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

  private parseRedisResponse(buffer: Buffer): { value: RedisResponse } | null {
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

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
