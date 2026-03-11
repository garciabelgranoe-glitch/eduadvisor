import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ADMIN_SCOPES_KEY, AdminScope } from "./admin-scope.decorator";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

describe("AdminApiKeyGuard", () => {
  const previousEnv = { ...process.env };

  const reflectorMock = {
    getAllAndOverride: jest.fn()
  } as unknown as Reflector;

  const createContext = (headers: Record<string, string | undefined>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers
        })
      }),
      getHandler: () => function handler() {},
      getClass: () => class Controller {}
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_API_KEY = "full-key";
    process.env.ADMIN_READ_API_KEY = "read-key";
    process.env.ADMIN_WRITE_API_KEY = "write-key";
  });

  afterAll(() => {
    process.env = previousEnv;
  });

  it("authorizes full-access key for write scope", () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(["write"] as AdminScope[]);
    const guard = new AdminApiKeyGuard(reflectorMock);

    const canActivate = guard.canActivate(createContext({ "x-admin-key": "full-key" }));

    expect(canActivate).toBe(true);
  });

  it("authorizes read-only key for read scope", () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(["read"] as AdminScope[]);
    const guard = new AdminApiKeyGuard(reflectorMock);

    const canActivate = guard.canActivate(createContext({ "x-admin-key": "read-key" }));

    expect(canActivate).toBe(true);
  });

  it("rejects read-only key for write scope", () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(["write"] as AdminScope[]);
    const guard = new AdminApiKeyGuard(reflectorMock);

    expect(() => guard.canActivate(createContext({ "x-admin-key": "read-key" }))).toThrow(ForbiddenException);
  });

  it("rejects invalid key", () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(["read" as AdminScope]);
    const guard = new AdminApiKeyGuard(reflectorMock);

    expect(() => guard.canActivate(createContext({ "x-admin-key": "wrong-key" }))).toThrow(UnauthorizedException);
  });
});
