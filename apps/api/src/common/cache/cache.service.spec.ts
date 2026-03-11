import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let service: CacheService;
  let redisMock: jest.Mock;

  beforeEach(() => {
    service = new CacheService();
    redisMock = jest.fn().mockResolvedValue(null);
    (service as unknown as { sendRedisCommand: jest.Mock }).sendRedisCommand = redisMock;
  });

  it("reuses cached value when payload has same semantic content", async () => {
    const factory = jest.fn(async () => ({ ok: true }));

    const first = await service.getOrSetJson("search", { b: 2, a: 1 }, 90, factory);
    const second = await service.getOrSetJson("search", { a: 1, b: 2 }, 90, factory);

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("recomputes value after namespace invalidation", async () => {
    const factory = jest
      .fn<Promise<{ run: number }>, []>()
      .mockResolvedValueOnce({ run: 1 })
      .mockResolvedValueOnce({ run: 2 });

    const first = await service.getOrSetJson("insights", { city: "longchamps" }, 90, factory);
    await service.invalidateNamespace("insights");
    const second = await service.getOrSetJson("insights", { city: "longchamps" }, 90, factory);

    expect(first).toEqual({ run: 1 });
    expect(second).toEqual({ run: 2 });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(redisMock).toHaveBeenCalledWith(["INCR", "eduadvisor:cache:namespace:insights:v"]);
  });

  it("setIfNotExists returns true on first write and false on duplicate", async () => {
    redisMock
      .mockResolvedValueOnce(1) // SETNX
      .mockResolvedValueOnce(1) // EXPIRE
      .mockResolvedValueOnce(0); // SETNX duplicate

    const first = await service.setIfNotExists("eduadvisor:test:replay:1", "1", 60);
    const second = await service.setIfNotExists("eduadvisor:test:replay:1", "1", 60);

    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
