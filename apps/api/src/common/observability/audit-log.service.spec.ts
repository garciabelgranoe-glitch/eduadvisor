import { AuditLogService, hashForAudit, maskIpAddress, normalizeAuditPath, sanitizeFreeText } from "./audit-log.service";

describe("AuditLogService", () => {
  it("normalizes paths and masks ip addresses", () => {
    expect(normalizeAuditPath("/v1/schools?city=cordoba")).toBe("/v1/schools");
    expect(maskIpAddress("203.0.113.44")).toBe("203.0.***.***");
    expect(maskIpAddress("2001:db8::1")).toContain("****");
  });

  it("redacts emails and phones in free text", () => {
    const sanitized = sanitizeFreeText("error for maria@eduadvisor.test +54 9 261 555 1234");
    expect(sanitized).not.toContain("maria@eduadvisor.test");
    expect(sanitized).not.toContain("261 555 1234");
    expect(sanitized).toContain("[redacted-email]");
    expect(sanitized).toContain("[redacted-phone]");
  });

  it("builds stable short hashes for correlation", () => {
    expect(hashForAudit("abc@example.com")).toHaveLength(16);
    expect(hashForAudit("abc@example.com")).toBe(hashForAudit("abc@example.com"));
  });

  it("marks sensitive paths for auditing", () => {
    const service = new AuditLogService();

    expect(service.shouldAudit("GET", "/v1/admin/schools")).toBe(true);
    expect(service.shouldAudit("POST", "/v1/public-endpoint")).toBe(true);
    expect(service.shouldAudit("GET", "/v1/health")).toBe(false);
  });

  it("logs audit events with pii-safe payloads", () => {
    const service = new AuditLogService();
    const logger = service as unknown as {
      logger: {
        log: (message: string) => void;
      };
    };
    const spy = jest.spyOn(logger.logger, "log").mockImplementation(() => undefined);

    service.recordHttpAudit({
      requestId: "req-123",
      request: {
        method: "POST",
        path: "/v1/auth/session?role=PARENT",
        headers: {
          "x-admin-key": "secret-admin-key"
        },
        ip: "203.0.113.11",
        query: {
          role: "PARENT",
          email: "leak@test.com"
        },
        body: {
          email: "persona@example.com",
          accessCode: "super-secret",
          comment: "mi telefono es +54 9 261 444 2222"
        }
      },
      statusCode: 401,
      durationMs: 32,
      error: "Unauthorized for persona@example.com"
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(spy.mock.calls[0][0]) as Record<string, unknown>;

    expect(payload.eventType).toBe("http_audit");
    expect(payload.result).toBe("failure");
    expect(payload.sourceIp).toBe("203.0.***.***");
    expect(JSON.stringify(payload)).not.toContain("persona@example.com");
    expect(JSON.stringify(payload)).not.toContain("super-secret");
    expect(JSON.stringify(payload)).toContain("email_hash:");
    expect(JSON.stringify(payload)).toContain("[redacted-email]");
  });
});
