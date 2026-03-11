import { RateLimitService } from "./rate-limit.service";

describe("RateLimitService", () => {
  let service: RateLimitService;
  const config = {
    limit: 2,
    windowMs: 1000
  };
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.REDIS_URL = originalRedisUrl;
    service = new RateLimitService();
    (service as unknown as { redisUrl: string | null }).redisUrl = null;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.REDIS_URL = originalRedisUrl;
  });

  it("allows requests within configured limit", async () => {
    const first = await service.consume("127.0.0.1:GET:/schools", config, 1_000);
    const second = await service.consume("127.0.0.1:GET:/schools", config, 1_100);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit", async () => {
    await service.consume("127.0.0.1:POST:/reviews", config, 2_000);
    await service.consume("127.0.0.1:POST:/reviews", config, 2_100);
    const third = await service.consume("127.0.0.1:POST:/reviews", config, 2_200);

    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets counters when the window expires", async () => {
    await service.consume("127.0.0.1:GET:/search", config, 3_000);
    await service.consume("127.0.0.1:GET:/search", config, 3_100);

    const afterReset = await service.consume("127.0.0.1:GET:/search", config, 4_100);

    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it("falls back to in-memory decisions when Redis is unavailable", async () => {
    (service as unknown as { redisUrl: string | null }).redisUrl = "redis://localhost:6379";
    jest.spyOn(service as unknown as { sendRedisCommand: () => Promise<null> }, "sendRedisCommand").mockResolvedValue(
      null
    );

    const first = await service.consume("127.0.0.1:GET:/rankings", config, 5_000);
    const second = await service.consume("127.0.0.1:GET:/rankings", config, 5_010);
    const third = await service.consume("127.0.0.1:GET:/rankings", config, 5_020);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("uses distributed counters when Redis responds", async () => {
    (service as unknown as { redisUrl: string | null }).redisUrl = "redis://localhost:6379";
    const redisSpy = jest
      .spyOn(service as unknown as { sendRedisCommand: () => Promise<string | number | null> }, "sendRedisCommand")
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce("OK")
      .mockResolvedValueOnce(2);

    const first = await service.consume("203.0.113.20:GET:/search", config, 5_200);
    const second = await service.consume("203.0.113.20:GET:/search", config, 5_300);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(first.resetAt).toBe(6_000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(redisSpy).toHaveBeenCalled();
  });

  it("fails closed in production when REDIS_URL is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.REDIS_URL;
    const strictService = new RateLimitService();
    (strictService as unknown as { redisUrl: string | null }).redisUrl = null;

    await expect(strictService.consume("198.51.100.1:GET:/search", config, 9_000)).rejects.toThrow(
      "REDIS_URL is required for rate limiting in production."
    );
  });

  it("fails closed in production when Redis is unavailable", async () => {
    process.env.NODE_ENV = "production";
    process.env.REDIS_URL = "redis://localhost:6379";
    const strictService = new RateLimitService();
    (strictService as unknown as { redisUrl: string | null }).redisUrl = "redis://localhost:6379";

    jest
      .spyOn(strictService as unknown as { sendRedisCommand: () => Promise<string | number | null> }, "sendRedisCommand")
      .mockImplementation(async () => {
        throw new Error("Redis offline");
      });

    await expect(strictService.consume("198.51.100.2:GET:/search", config, 10_000)).rejects.toThrow("Redis offline");
  });
});
