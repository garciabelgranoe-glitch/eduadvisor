import { HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { RATE_LIMIT_KEY, SKIP_RATE_LIMIT_KEY, type RateLimitConfig } from "./rate-limit.decorator";
import { RateLimitGuard } from "./rate-limit.guard";
import { RateLimitService } from "./rate-limit.service";

interface MockRequest {
  method: string;
  originalUrl?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: {
    remoteAddress?: string;
  };
}

function createContext(request: MockRequest, response: { setHeader: jest.Mock }) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response
    })
  } as unknown as ExecutionContext;
}

describe("RateLimitGuard", () => {
  const consume = jest.fn();
  const rateLimitService = { consume } as unknown as RateLimitService;
  const getAllAndOverride = jest.fn();
  const reflector = { getAllAndOverride } as unknown as Reflector;
  const guard = new RateLimitGuard(reflector, rateLimitService);

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    delete process.env.RATE_LIMIT_WINDOW_MS;
  });

  it("skips rate limit when SkipRateLimit metadata is present", async () => {
    getAllAndOverride.mockImplementation((metadataKey: string) => {
      if (metadataKey === SKIP_RATE_LIMIT_KEY) {
        return true;
      }
      return undefined;
    });

    const response = { setHeader: jest.fn() };
    const context = createContext(
      {
        method: "GET",
        originalUrl: "/v1/health",
        headers: {}
      },
      response
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(consume).not.toHaveBeenCalled();
    expect(response.setHeader).not.toHaveBeenCalled();
  });

  it("applies configured limits and sets response headers", async () => {
    const config: RateLimitConfig = { limit: 10, windowMs: 15_000 };
    getAllAndOverride.mockImplementation((metadataKey: string) => {
      if (metadataKey === SKIP_RATE_LIMIT_KEY) {
        return false;
      }
      if (metadataKey === RATE_LIMIT_KEY) {
        return config;
      }
      return undefined;
    });
    consume.mockResolvedValue({
      allowed: true,
      remaining: 7,
      retryAfterSeconds: 0,
      resetAt: 1_700_000_000_000
    });

    const response = { setHeader: jest.fn() };
    const context = createContext(
      {
        method: "GET",
        originalUrl: "/v1/schools?city=mendoza",
        headers: {
          "x-forwarded-for": "203.0.113.60, 10.0.0.1"
        }
      },
      response
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(consume).toHaveBeenCalledWith("203.0.113.60:GET:/v1/schools", config);
    expect(response.setHeader).toHaveBeenCalledWith("x-ratelimit-limit", "10");
    expect(response.setHeader).toHaveBeenCalledWith("x-ratelimit-remaining", "7");
    expect(response.setHeader).toHaveBeenCalledWith("x-ratelimit-reset", "2023-11-14T22:13:20.000Z");
  });

  it("throws 429 and sets retry-after when limit is exceeded", async () => {
    getAllAndOverride.mockImplementation((metadataKey: string) => {
      if (metadataKey === SKIP_RATE_LIMIT_KEY) {
        return false;
      }
      if (metadataKey === RATE_LIMIT_KEY) {
        return { limit: 2, windowMs: 1000 } satisfies RateLimitConfig;
      }
      return undefined;
    });
    consume.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 42,
      resetAt: 1_700_000_100_000
    });

    const response = { setHeader: jest.fn() };
    const context = createContext(
      {
        method: "POST",
        url: "/v1/reviews",
        headers: {},
        ip: "198.51.100.44"
      },
      response
    );

    await expect(guard.canActivate(context)).rejects.toEqual(expect.any(HttpException));

    try {
      await guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const exception = error as HttpException;
      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }

    expect(response.setHeader).toHaveBeenCalledWith("retry-after", "42");
  });

  it("uses default config and socket address when no metadata is provided", async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = "77";
    process.env.RATE_LIMIT_WINDOW_MS = "120000";

    getAllAndOverride.mockReturnValue(undefined);
    consume.mockResolvedValue({
      allowed: true,
      remaining: 76,
      retryAfterSeconds: 0,
      resetAt: Date.now() + 120000
    });

    const response = { setHeader: jest.fn() };
    const context = createContext(
      {
        method: "PATCH",
        url: "/v1/leads/status?foo=bar",
        headers: {},
        socket: {
          remoteAddress: "192.0.2.9"
        }
      },
      response
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(consume).toHaveBeenCalledWith("192.0.2.9:PATCH:/v1/leads/status", { limit: 77, windowMs: 120000 });
  });
});
