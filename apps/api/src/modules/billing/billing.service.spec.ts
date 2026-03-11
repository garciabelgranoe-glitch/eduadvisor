import { createHmac } from "node:crypto";
import {
  BillingCheckoutSessionStatus,
  BillingInvoiceStatus,
  BillingProvider,
  BillingWebhookEventStatus
} from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { BillingService } from "./billing.service";

function stableStringify(value: unknown): string {
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
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (valueType === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(String(value));
}

function buildSignedWebhookHeader(secret: string, payload: unknown, timestamp = Math.floor(Date.now() / 1000)) {
  const canonicalPayload = stableStringify(payload);
  const signature = createHmac("sha256", secret).update(`${timestamp}.${canonicalPayload}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

describe("BillingService", () => {
  const prismaMock = {
    school: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    schoolSubscription: {
      create: jest.fn(),
      count: jest.fn()
    },
    schoolBillingCustomer: {
      upsert: jest.fn()
    },
    billingCheckoutSession: {
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn()
    },
    billingWebhookEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn()
    },
    billingInvoice: {
      create: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn()
    }
  } as unknown as PrismaService;

  const cacheMock = {
    invalidateMany: jest.fn(),
    setIfNotExists: jest.fn()
  } as unknown as CacheService;

  let service: BillingService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    delete process.env.BILLING_WEBHOOK_SECRET;
    (cacheMock.setIfNotExists as jest.Mock).mockResolvedValue(true);
    service = new BillingService(prismaMock, cacheMock);
  });

  it("creates checkout session with provider-agnostic defaults", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      name: "North Hills College",
      slug: "north-hills-college",
      email: "admisiones@northhills.example",
      subscriptions: [
        {
          planCode: "premium",
          priceMonthly: 99000,
          currency: "ARS"
        }
      ]
    });
    (prismaMock.schoolBillingCustomer.upsert as jest.Mock).mockResolvedValue({
      id: "customer-1"
    });
    (prismaMock.billingCheckoutSession.create as jest.Mock).mockResolvedValue({
      id: "chk_1",
      provider: BillingProvider.MANUAL,
      status: BillingCheckoutSessionStatus.OPEN,
      planCode: "premium",
      amountMonthly: 99000,
      currency: "ARS",
      intervalMonths: 1,
      expiresAt: new Date("2026-03-06T20:00:00.000Z"),
      createdAt: new Date("2026-03-06T19:30:00.000Z")
    });
    (prismaMock.billingCheckoutSession.update as jest.Mock).mockResolvedValue({
      id: "chk_1",
      provider: BillingProvider.MANUAL,
      status: BillingCheckoutSessionStatus.OPEN,
      planCode: "premium",
      amountMonthly: 99000,
      currency: "ARS",
      intervalMonths: 1,
      checkoutUrl: "http://localhost:3000/checkout/chk_1",
      expiresAt: new Date("2026-03-06T20:00:00.000Z"),
      createdAt: new Date("2026-03-06T19:30:00.000Z")
    });

    const result = await service.createCheckoutSession({
      schoolId: "school-1"
    });

    expect(prismaMock.schoolBillingCustomer.upsert).toHaveBeenCalled();
    expect(prismaMock.billingCheckoutSession.create).toHaveBeenCalled();
    expect(result.checkoutUrl).toContain("/checkout/chk_1");
    expect(result.provider).toBe(BillingProvider.MANUAL);
  });

  it("processes paid invoice event and promotes school subscription", async () => {
    (prismaMock.billingWebhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.billingWebhookEvent.create as jest.Mock).mockResolvedValue({
      id: "evt-db-1"
    });
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      profileStatus: "VERIFIED"
    });
    (prismaMock.schoolSubscription.create as jest.Mock).mockResolvedValue({
      id: "sub-1",
      status: "ACTIVE",
      endsAt: new Date("2026-04-06T00:00:00.000Z")
    });
    (prismaMock.school.update as jest.Mock).mockResolvedValue({
      id: "school-1"
    });
    (prismaMock.billingInvoice.create as jest.Mock).mockResolvedValue({
      id: "inv-1"
    });
    (prismaMock.billingWebhookEvent.update as jest.Mock).mockResolvedValue({
      id: "evt-db-1",
      status: BillingWebhookEventStatus.PROCESSED
    });

    const result = await service.simulateEvent({
      provider: BillingProvider.MANUAL,
      eventType: "invoice.paid",
      schoolId: "school-1",
      amountMonthly: 110000,
      amountTotal: 110000
    });

    expect(prismaMock.schoolSubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          schoolId: "school-1",
          status: "ACTIVE"
        })
      })
    );
    expect(prismaMock.billingInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          schoolId: "school-1",
          status: BillingInvoiceStatus.PAID
        })
      })
    );
    expect(cacheMock.invalidateMany).toHaveBeenCalled();
    expect(result.processed).toBe(true);
  });

  it("rejects webhook with invalid signature and stores failed event", async () => {
    process.env.BILLING_WEBHOOK_SECRET = "top-secret";
    (prismaMock.billingWebhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.billingWebhookEvent.create as jest.Mock).mockResolvedValue({
      id: "evt-db-2"
    });
    (prismaMock.billingWebhookEvent.update as jest.Mock).mockResolvedValue({
      id: "evt-db-2",
      status: BillingWebhookEventStatus.FAILED
    });

    await expect(
      service.processWebhook(
        BillingProvider.MANUAL,
        {
          id: "evt_2",
          type: "invoice.paid",
          data: {
            object: {
              schoolId: "school-1",
              amountTotal: 120000
            }
          }
        },
        "wrong-signature"
      )
    ).rejects.toThrow("Invalid billing webhook signature");

    expect(prismaMock.billingWebhookEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: BillingWebhookEventStatus.FAILED
        })
      })
    );
  });

  it("accepts webhook with structured signature and supported freshness window", async () => {
    process.env.BILLING_WEBHOOK_SECRET = "top-secret";
    const payload = {
      id: "evt_3",
      type: "unknown.event",
      data: {
        object: {
          schoolId: "school-1"
        }
      }
    };
    const signatureHeader = buildSignedWebhookHeader(process.env.BILLING_WEBHOOK_SECRET, payload);

    (prismaMock.billingWebhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.billingWebhookEvent.create as jest.Mock).mockResolvedValue({
      id: "evt-db-3"
    });
    (prismaMock.billingWebhookEvent.update as jest.Mock).mockResolvedValue({
      id: "evt-db-3",
      status: BillingWebhookEventStatus.IGNORED
    });

    const result = await service.processWebhook(BillingProvider.MANUAL, payload, signatureHeader);

    expect(cacheMock.setIfNotExists).toHaveBeenCalled();
    expect(result.ignored).toBe(true);
    expect(result.status).toBe(BillingWebhookEventStatus.IGNORED);
  });

  it("rejects replayed structured webhook signatures", async () => {
    process.env.BILLING_WEBHOOK_SECRET = "top-secret";
    (cacheMock.setIfNotExists as jest.Mock).mockResolvedValue(false);

    const payload = {
      id: "evt_4",
      type: "invoice.paid",
      data: {
        object: {
          schoolId: "school-1",
          amountTotal: 120000
        }
      }
    };
    const signatureHeader = buildSignedWebhookHeader(process.env.BILLING_WEBHOOK_SECRET, payload);

    (prismaMock.billingWebhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.billingWebhookEvent.create as jest.Mock).mockResolvedValue({
      id: "evt-db-4"
    });
    (prismaMock.billingWebhookEvent.update as jest.Mock).mockResolvedValue({
      id: "evt-db-4",
      status: BillingWebhookEventStatus.FAILED
    });

    await expect(service.processWebhook(BillingProvider.MANUAL, payload, signatureHeader)).rejects.toThrow(
      "Replay detected for billing webhook signature"
    );

    expect(prismaMock.billingWebhookEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: BillingWebhookEventStatus.FAILED
        })
      })
    );
  });
});
