import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  BillingCheckoutSessionStatus,
  BillingInvoiceStatus,
  BillingProvider,
  BillingWebhookEventStatus,
  Prisma,
  SchoolProfileStatus,
  SubscriptionStatus
} from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { ListBillingInvoicesDto } from "./dto/list-billing-invoices.dto";
import { ListBillingWebhookEventsDto } from "./dto/list-billing-webhook-events.dto";
import { SimulateBillingEventDto } from "./dto/simulate-billing-event.dto";

const PREMIUM_ACTIVE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIAL
]);

const SUPPORTED_WEBHOOK_EVENTS = new Set<string>([
  "checkout.session.completed",
  "checkout.session.expired",
  "invoice.paid",
  "invoice.payment_failed",
  "subscription.canceled",
  "customer.subscription.deleted",
  "subscription.renewed"
]);
const BILLING_WEBHOOK_MAX_AGE_SECONDS_DEFAULT = 300;
const BILLING_WEBHOOK_REPLAY_TTL_SECONDS_DEFAULT = 600;

type BillingProcessingResult = {
  duplicate: boolean;
  processed: boolean;
  ignored: boolean;
  status: BillingWebhookEventStatus;
  eventId: string;
  provider: BillingProvider;
  externalEventId: string;
  schoolId: string | null;
  subscriptionId: string | null;
  invoiceId: string | null;
  checkoutSessionId: string | null;
  message: string;
};

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService
  ) {}

  async getOverview() {
    const now = new Date();
    const paidSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [schools, paidAggregate, paidCount, checkoutOpen, webhookGroups, invoiceGroups, pastDueCount] =
      await Promise.all([
        this.prisma.school.findMany({
          select: {
            id: true,
            subscriptions: {
              orderBy: {
                startsAt: "desc"
              },
              take: 1,
              select: {
                status: true,
                endsAt: true,
                priceMonthly: true
              }
            }
          }
        }),
        this.prisma.billingInvoice.aggregate({
          where: {
            status: BillingInvoiceStatus.PAID,
            paidAt: {
              gte: paidSince
            }
          },
          _sum: {
            amountTotal: true
          }
        }),
        this.prisma.billingInvoice.count({
          where: {
            status: BillingInvoiceStatus.PAID,
            paidAt: {
              gte: paidSince
            }
          }
        }),
        this.prisma.billingCheckoutSession.count({
          where: {
            status: BillingCheckoutSessionStatus.OPEN,
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }]
          }
        }),
        this.prisma.billingWebhookEvent.groupBy({
          by: ["status"],
          _count: {
            _all: true
          }
        }),
        this.prisma.billingInvoice.groupBy({
          by: ["status"],
          _count: {
            _all: true
          }
        }),
        this.prisma.schoolSubscription.count({
          where: {
            status: SubscriptionStatus.PAST_DUE
          }
        })
      ]);

    const latestBySchool = schools
      .map((school) => school.subscriptions[0] ?? null)
      .filter((subscription): subscription is NonNullable<typeof subscription> => Boolean(subscription));
    const activeSubscriptions = latestBySchool.filter((subscription) => {
      if (!PREMIUM_ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        return false;
      }

      if (!subscription.endsAt) {
        return true;
      }

      return subscription.endsAt.getTime() >= now.getTime();
    });
    const mrr = activeSubscriptions.reduce((sum, subscription) => sum + (subscription.priceMonthly ?? 0), 0);

    const webhookByStatus = {
      RECEIVED: 0,
      PROCESSED: 0,
      FAILED: 0,
      DUPLICATE: 0,
      IGNORED: 0
    };
    for (const row of webhookGroups) {
      webhookByStatus[row.status] = row._count._all;
    }

    const invoicesByStatus = {
      DRAFT: 0,
      OPEN: 0,
      PAID: 0,
      VOID: 0,
      UNCOLLECTIBLE: 0
    };
    for (const row of invoiceGroups) {
      invoicesByStatus[row.status] = row._count._all;
    }

    return {
      generatedAt: now.toISOString(),
      kpis: {
        activeSubscriptions: activeSubscriptions.length,
        pastDueSubscriptions: pastDueCount,
        mrr,
        invoicesPaid30d: paidCount,
        revenuePaid30d: paidAggregate._sum.amountTotal ?? 0,
        checkoutSessionsOpen: checkoutOpen
      },
      invoices: {
        byStatus: invoicesByStatus
      },
      webhooks: {
        byStatus: webhookByStatus
      }
    };
  }

  async listInvoices(query: ListBillingInvoicesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const where = {
      schoolId: query.schoolId,
      provider: query.provider,
      status: query.status
    };

    const [items, total] = await Promise.all([
      this.prisma.billingInvoice.findMany({
        where,
        orderBy: {
          issuedAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      this.prisma.billingInvoice.count({ where })
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        school: item.school,
        provider: item.provider,
        status: item.status,
        currency: item.currency,
        amountSubtotal: item.amountSubtotal,
        amountTax: item.amountTax,
        amountTotal: item.amountTotal,
        issuedAt: item.issuedAt,
        dueAt: item.dueAt,
        paidAt: item.paidAt,
        externalInvoiceId: item.externalInvoiceId,
        hostedInvoiceUrl: item.hostedInvoiceUrl
      })),
      meta: this.buildMeta(total, page, limit)
    };
  }

  async listWebhookEvents(query: ListBillingWebhookEventsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const where = {
      provider: query.provider,
      status: query.status,
      schoolId: query.schoolId
    };

    const [items, total] = await Promise.all([
      this.prisma.billingWebhookEvent.findMany({
        where,
        orderBy: {
          receivedAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      this.prisma.billingWebhookEvent.count({ where })
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        provider: item.provider,
        externalEventId: item.externalEventId,
        eventType: item.eventType,
        status: item.status,
        signatureValid: item.signatureValid,
        school: item.school,
        errorMessage: item.errorMessage,
        processedAt: item.processedAt,
        receivedAt: item.receivedAt
      })),
      meta: this.buildMeta(total, page, limit)
    };
  }

  async getCheckoutSession(sessionId: string) {
    const session = await this.prisma.billingCheckoutSession.findUnique({
      where: {
        id: sessionId
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException("Checkout session not found");
    }

    return {
      id: session.id,
      school: session.school,
      provider: session.provider,
      status: session.status,
      planCode: session.planCode,
      amountMonthly: session.amountMonthly,
      currency: session.currency,
      intervalMonths: session.intervalMonths,
      checkoutUrl: session.checkoutUrl,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt
    };
  }

  async createCheckoutSession(payload: CreateCheckoutSessionDto) {
    const school = await this.prisma.school.findUnique({
      where: {
        id: payload.schoolId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        subscriptions: {
          orderBy: {
            startsAt: "desc"
          },
          take: 1,
          select: {
            planCode: true,
            priceMonthly: true,
            currency: true
          }
        }
      }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    const latestSubscription = school.subscriptions[0] ?? null;
    const now = new Date();
    const provider = payload.provider ?? BillingProvider.MANUAL;
    const planCode = payload.planCode?.trim() || latestSubscription?.planCode || "premium";
    const amountMonthly = payload.amountMonthly ?? latestSubscription?.priceMonthly ?? 99000;
    const currency = (payload.currency ?? latestSubscription?.currency ?? "ARS").toUpperCase();
    const intervalMonths = payload.intervalMonths ?? 1;
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    await this.prisma.schoolBillingCustomer.upsert({
      where: {
        schoolId_provider: {
          schoolId: school.id,
          provider
        }
      },
      update: {
        email: school.email
      },
      create: {
        schoolId: school.id,
        provider,
        externalCustomerId: `${provider.toLowerCase()}_${school.id}`,
        email: school.email
      }
    });

    const created = await this.prisma.billingCheckoutSession.create({
      data: {
        schoolId: school.id,
        provider,
        status: BillingCheckoutSessionStatus.OPEN,
        planCode,
        amountMonthly,
        currency,
        intervalMonths,
        externalSessionId: `${provider.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        checkoutUrl: "about:blank",
        successUrl: payload.successUrl,
        cancelUrl: payload.cancelUrl,
        expiresAt,
        metadata: this.serializePayload({
          trialDays: payload.trialDays ?? 0
        })
      }
    });

    const checkoutUrl = this.buildCheckoutUrl(created.id);
    const session = await this.prisma.billingCheckoutSession.update({
      where: {
        id: created.id
      },
      data: {
        checkoutUrl
      }
    });

    return {
      id: session.id,
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug
      },
      provider: session.provider,
      status: session.status,
      planCode: session.planCode,
      amountMonthly: session.amountMonthly,
      currency: session.currency,
      intervalMonths: session.intervalMonths,
      checkoutUrl: session.checkoutUrl,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt
    };
  }

  async simulateEvent(payload: SimulateBillingEventDto) {
    const provider = payload.provider ?? BillingProvider.MANUAL;
    const externalEventId =
      payload.externalEventId?.trim() || `sim_${payload.eventType}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const eventPayload = {
      id: externalEventId,
      type: payload.eventType,
      data: {
        object: {
          schoolId: payload.schoolId,
          checkoutSessionId: payload.checkoutSessionId ?? null,
          planCode: payload.planCode ?? "premium",
          amountMonthly: payload.amountMonthly ?? 99000,
          amountTotal: payload.amountTotal ?? payload.amountMonthly ?? 99000,
          currency: (payload.currency ?? "ARS").toUpperCase(),
          durationMonths: payload.durationMonths ?? 1,
          trialDays: payload.trialDays ?? 0
        }
      },
      metadata: {
        source: "simulation"
      }
    };

    return this.processIncomingEvent({
      provider,
      externalEventId,
      eventType: payload.eventType,
      payload: eventPayload,
      signatureValid: true
    });
  }

  async processWebhook(provider: BillingProvider, payload: unknown, signatureHeader: string | undefined) {
    const externalEventId = this.pickFirstString(payload, ["id", "eventId"]);
    const eventType = this.pickFirstString(payload, ["type", "eventType"]);

    if (!externalEventId || !eventType) {
      throw new BadRequestException("Webhook payload requires id and type");
    }

    const verification = await this.verifyWebhookSignature({
      provider,
      payload,
      signatureHeader
    });
    const result = await this.processIncomingEvent({
      provider,
      externalEventId,
      eventType,
      payload,
      signatureValid: verification.valid
    });

    if (!verification.valid) {
      throw new UnauthorizedException(verification.reason);
    }

    return result;
  }

  private async processIncomingEvent(input: {
    provider: BillingProvider;
    externalEventId: string;
    eventType: string;
    payload: unknown;
    signatureValid: boolean;
  }): Promise<BillingProcessingResult> {
    const schoolId = await this.resolveSchoolIdFromPayload(input.payload);
    const existing = await this.prisma.billingWebhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider: input.provider,
          externalEventId: input.externalEventId
        }
      },
      select: {
        id: true,
        status: true,
        processedAt: true,
        schoolId: true
      }
    });

    if (existing) {
      return {
        duplicate: true,
        processed: false,
        ignored: false,
        status: BillingWebhookEventStatus.DUPLICATE,
        eventId: existing.id,
        provider: input.provider,
        externalEventId: input.externalEventId,
        schoolId: existing.schoolId,
        subscriptionId: null,
        invoiceId: null,
        checkoutSessionId: null,
        message: "Webhook event already processed"
      };
    }

    const event = await this.prisma.billingWebhookEvent.create({
      data: {
        provider: input.provider,
        externalEventId: input.externalEventId,
        eventType: input.eventType,
        signatureValid: input.signatureValid,
        status: BillingWebhookEventStatus.RECEIVED,
        schoolId,
        payload: this.serializePayload(input.payload)
      }
    });

    if (!input.signatureValid) {
      await this.prisma.billingWebhookEvent.update({
        where: {
          id: event.id
        },
        data: {
          status: BillingWebhookEventStatus.FAILED,
          errorMessage: "Invalid webhook signature",
          processedAt: new Date()
        }
      });

      return {
        duplicate: false,
        processed: false,
        ignored: false,
        status: BillingWebhookEventStatus.FAILED,
        eventId: event.id,
        provider: input.provider,
        externalEventId: input.externalEventId,
        schoolId,
        subscriptionId: null,
        invoiceId: null,
        checkoutSessionId: null,
        message: "Invalid signature"
      };
    }

    if (!SUPPORTED_WEBHOOK_EVENTS.has(input.eventType)) {
      await this.prisma.billingWebhookEvent.update({
        where: {
          id: event.id
        },
        data: {
          status: BillingWebhookEventStatus.IGNORED,
          errorMessage: "Unsupported billing event type",
          processedAt: new Date()
        }
      });

      return {
        duplicate: false,
        processed: false,
        ignored: true,
        status: BillingWebhookEventStatus.IGNORED,
        eventId: event.id,
        provider: input.provider,
        externalEventId: input.externalEventId,
        schoolId,
        subscriptionId: null,
        invoiceId: null,
        checkoutSessionId: null,
        message: "Unsupported event ignored"
      };
    }

    try {
      const handled = await this.dispatchEvent({
        provider: input.provider,
        externalEventId: input.externalEventId,
        eventType: input.eventType,
        payload: input.payload
      });

      await this.prisma.billingWebhookEvent.update({
        where: {
          id: event.id
        },
        data: {
          status: handled.ignored ? BillingWebhookEventStatus.IGNORED : BillingWebhookEventStatus.PROCESSED,
          schoolId: handled.schoolId ?? schoolId,
          processedAt: new Date(),
          errorMessage: handled.ignored ? handled.message : null
        }
      });

      return {
        duplicate: false,
        processed: !handled.ignored,
        ignored: handled.ignored,
        status: handled.ignored ? BillingWebhookEventStatus.IGNORED : BillingWebhookEventStatus.PROCESSED,
        eventId: event.id,
        provider: input.provider,
        externalEventId: input.externalEventId,
        schoolId: handled.schoolId ?? schoolId,
        subscriptionId: handled.subscriptionId,
        invoiceId: handled.invoiceId,
        checkoutSessionId: handled.checkoutSessionId,
        message: handled.message
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unhandled billing event processing error";
      await this.prisma.billingWebhookEvent.update({
        where: {
          id: event.id
        },
        data: {
          status: BillingWebhookEventStatus.FAILED,
          processedAt: new Date(),
          errorMessage: message
        }
      });
      throw error;
    }
  }

  private async dispatchEvent(input: {
    provider: BillingProvider;
    externalEventId: string;
    eventType: string;
    payload: unknown;
  }) {
    if (input.eventType === "checkout.session.completed") {
      return this.handleCheckoutCompleted(input);
    }

    if (input.eventType === "checkout.session.expired") {
      return this.handleCheckoutExpired(input);
    }

    if (input.eventType === "invoice.paid") {
      return this.handleInvoicePaid(input);
    }

    if (input.eventType === "invoice.payment_failed") {
      return this.handleInvoicePaymentFailed(input);
    }

    if (input.eventType === "subscription.canceled" || input.eventType === "customer.subscription.deleted") {
      return this.handleSubscriptionCanceled(input);
    }

    if (input.eventType === "subscription.renewed") {
      return this.handleSubscriptionRenewed(input);
    }

    return {
      ignored: true,
      schoolId: null,
      subscriptionId: null,
      invoiceId: null,
      checkoutSessionId: null,
      message: "Event ignored"
    };
  }

  private async handleCheckoutCompleted(input: {
    provider: BillingProvider;
    externalEventId: string;
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const checkoutSessionRef = this.pickFirstString(object, ["checkoutSessionId", "sessionId", "id"]);
    const checkoutSession = checkoutSessionRef
      ? await this.prisma.billingCheckoutSession.findFirst({
          where: {
            OR: [{ id: checkoutSessionRef }, { externalSessionId: checkoutSessionRef }]
          },
          select: {
            id: true,
            schoolId: true,
            planCode: true,
            amountMonthly: true,
            currency: true,
            intervalMonths: true
          }
        })
      : null;

    const schoolId = (await this.resolveSchoolIdFromPayload(input.payload)) ?? checkoutSession?.schoolId ?? null;
    if (!schoolId) {
      throw new BadRequestException("Webhook event does not contain school reference");
    }

    const planCode = this.pickFirstString(object, ["planCode"]) ?? checkoutSession?.planCode ?? "premium";
    const amountMonthly = this.pickFirstInt(object, ["amountMonthly"]) ?? checkoutSession?.amountMonthly ?? 99000;
    const currency = (this.pickFirstString(object, ["currency"]) ?? checkoutSession?.currency ?? "ARS").toUpperCase();
    const durationMonths = this.pickFirstInt(object, ["durationMonths"]) ?? checkoutSession?.intervalMonths ?? 1;
    const trialDays = this.pickFirstInt(object, ["trialDays"]) ?? 0;

    const subscription = await this.createSubscriptionSnapshot({
      schoolId,
      status: trialDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
      planCode,
      priceMonthly: amountMonthly,
      currency,
      provider: input.provider,
      sourceEventId: input.externalEventId,
      durationMonths,
      trialDays
    });

    if (checkoutSession) {
      await this.prisma.billingCheckoutSession.update({
        where: {
          id: checkoutSession.id
        },
        data: {
          status: BillingCheckoutSessionStatus.COMPLETED,
          completedAt: new Date(),
          subscriptionId: subscription.id
        }
      });
    }

    return {
      ignored: false,
      schoolId,
      subscriptionId: subscription.id,
      invoiceId: null,
      checkoutSessionId: checkoutSession?.id ?? null,
      message: "Checkout completed and subscription activated"
    };
  }

  private async handleCheckoutExpired(input: {
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const checkoutSessionRef = this.pickFirstString(object, ["checkoutSessionId", "sessionId", "id"]);
    if (!checkoutSessionRef) {
      return {
        ignored: true,
        schoolId: await this.resolveSchoolIdFromPayload(input.payload),
        subscriptionId: null,
        invoiceId: null,
        checkoutSessionId: null,
        message: "Checkout expiration ignored (missing session)"
      };
    }

    const checkoutSession = await this.prisma.billingCheckoutSession.findFirst({
      where: {
        OR: [{ id: checkoutSessionRef }, { externalSessionId: checkoutSessionRef }]
      },
      select: {
        id: true,
        schoolId: true
      }
    });

    if (!checkoutSession) {
      return {
        ignored: true,
        schoolId: await this.resolveSchoolIdFromPayload(input.payload),
        subscriptionId: null,
        invoiceId: null,
        checkoutSessionId: null,
        message: "Checkout expiration ignored (session not found)"
      };
    }

    await this.prisma.billingCheckoutSession.update({
      where: {
        id: checkoutSession.id
      },
      data: {
        status: BillingCheckoutSessionStatus.EXPIRED
      }
    });

    return {
      ignored: false,
      schoolId: checkoutSession.schoolId,
      subscriptionId: null,
      invoiceId: null,
      checkoutSessionId: checkoutSession.id,
      message: "Checkout session marked as expired"
    };
  }

  private async handleInvoicePaid(input: {
    provider: BillingProvider;
    externalEventId: string;
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const schoolId = await this.resolveSchoolIdFromPayload(input.payload);
    if (!schoolId) {
      throw new BadRequestException("Invoice event does not contain school reference");
    }

    const planCode = this.pickFirstString(object, ["planCode"]) ?? "premium";
    const currency = (this.pickFirstString(object, ["currency"]) ?? "ARS").toUpperCase();
    const amountTotal = this.pickFirstInt(object, ["amountTotal"]) ?? 99000;
    const amountMonthly = this.pickFirstInt(object, ["amountMonthly"]) ?? amountTotal;
    const durationMonths = this.pickFirstInt(object, ["durationMonths"]) ?? 1;
    const externalInvoiceId = this.pickFirstString(object, ["invoiceId", "externalInvoiceId"]);

    const subscription = await this.createSubscriptionSnapshot({
      schoolId,
      status: SubscriptionStatus.ACTIVE,
      planCode,
      priceMonthly: amountMonthly,
      currency,
      provider: input.provider,
      sourceExternalId: externalInvoiceId,
      sourceEventId: input.externalEventId,
      durationMonths
    });

    const invoice = await this.prisma.billingInvoice.create({
      data: {
        schoolId,
        subscriptionId: subscription.id,
        provider: input.provider,
        status: BillingInvoiceStatus.PAID,
        externalInvoiceId,
        externalEventId: input.externalEventId,
        amountSubtotal: amountTotal,
        amountTax: 0,
        amountTotal,
        currency,
        issuedAt: new Date(),
        paidAt: new Date(),
        rawPayload: this.serializePayload(input.payload)
      },
      select: {
        id: true
      }
    });

    return {
      ignored: false,
      schoolId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      checkoutSessionId: null,
      message: "Invoice paid processed"
    };
  }

  private async handleInvoicePaymentFailed(input: {
    provider: BillingProvider;
    externalEventId: string;
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const schoolId = await this.resolveSchoolIdFromPayload(input.payload);
    if (!schoolId) {
      throw new BadRequestException("Invoice event does not contain school reference");
    }

    const planCode = this.pickFirstString(object, ["planCode"]) ?? "premium";
    const currency = (this.pickFirstString(object, ["currency"]) ?? "ARS").toUpperCase();
    const amountTotal = this.pickFirstInt(object, ["amountTotal"]) ?? 99000;
    const amountMonthly = this.pickFirstInt(object, ["amountMonthly"]) ?? amountTotal;
    const durationMonths = this.pickFirstInt(object, ["durationMonths"]) ?? 1;
    const externalInvoiceId = this.pickFirstString(object, ["invoiceId", "externalInvoiceId"]);

    const subscription = await this.createSubscriptionSnapshot({
      schoolId,
      status: SubscriptionStatus.PAST_DUE,
      planCode,
      priceMonthly: amountMonthly,
      currency,
      provider: input.provider,
      sourceExternalId: externalInvoiceId,
      sourceEventId: input.externalEventId,
      durationMonths
    });

    const invoice = await this.prisma.billingInvoice.create({
      data: {
        schoolId,
        subscriptionId: subscription.id,
        provider: input.provider,
        status: BillingInvoiceStatus.OPEN,
        externalInvoiceId,
        externalEventId: input.externalEventId,
        amountSubtotal: amountTotal,
        amountTax: 0,
        amountTotal,
        currency,
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rawPayload: this.serializePayload(input.payload)
      },
      select: {
        id: true
      }
    });

    return {
      ignored: false,
      schoolId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      checkoutSessionId: null,
      message: "Invoice payment failed processed"
    };
  }

  private async handleSubscriptionCanceled(input: {
    provider: BillingProvider;
    externalEventId: string;
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const schoolId = await this.resolveSchoolIdFromPayload(input.payload);
    if (!schoolId) {
      throw new BadRequestException("Subscription event does not contain school reference");
    }

    const planCode = this.pickFirstString(object, ["planCode"]) ?? "premium";
    const currency = (this.pickFirstString(object, ["currency"]) ?? "ARS").toUpperCase();

    const subscription = await this.createSubscriptionSnapshot({
      schoolId,
      status: SubscriptionStatus.CANCELED,
      planCode,
      priceMonthly: this.pickFirstInt(object, ["amountMonthly"]) ?? 0,
      currency,
      provider: input.provider,
      sourceEventId: input.externalEventId,
      endsAt: new Date()
    });

    return {
      ignored: false,
      schoolId,
      subscriptionId: subscription.id,
      invoiceId: null,
      checkoutSessionId: null,
      message: "Subscription canceled and downgraded"
    };
  }

  private async handleSubscriptionRenewed(input: {
    provider: BillingProvider;
    externalEventId: string;
    payload: unknown;
  }) {
    const object = this.extractDataObject(input.payload);
    const schoolId = await this.resolveSchoolIdFromPayload(input.payload);
    if (!schoolId) {
      throw new BadRequestException("Subscription event does not contain school reference");
    }

    const planCode = this.pickFirstString(object, ["planCode"]) ?? "premium";
    const currency = (this.pickFirstString(object, ["currency"]) ?? "ARS").toUpperCase();
    const amountMonthly = this.pickFirstInt(object, ["amountMonthly"]) ?? 99000;
    const durationMonths = this.pickFirstInt(object, ["durationMonths"]) ?? 1;

    const subscription = await this.createSubscriptionSnapshot({
      schoolId,
      status: SubscriptionStatus.ACTIVE,
      planCode,
      priceMonthly: amountMonthly,
      currency,
      provider: input.provider,
      sourceEventId: input.externalEventId,
      durationMonths
    });

    return {
      ignored: false,
      schoolId,
      subscriptionId: subscription.id,
      invoiceId: null,
      checkoutSessionId: null,
      message: "Subscription renewed"
    };
  }

  private async createSubscriptionSnapshot(input: {
    schoolId: string;
    status: SubscriptionStatus;
    planCode: string;
    priceMonthly: number;
    currency: string;
    provider: BillingProvider;
    sourceExternalId?: string | null;
    sourceEventId?: string | null;
    durationMonths?: number;
    trialDays?: number;
    endsAt?: Date;
  }) {
    const school = await this.prisma.school.findUnique({
      where: {
        id: input.schoolId
      },
      select: {
        id: true,
        profileStatus: true
      }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    const now = new Date();
    const durationMonths = Math.max(1, input.durationMonths ?? 1);
    const endsAt = input.endsAt ?? this.addMonths(now, durationMonths);
    const trialEndsAt =
      input.status === SubscriptionStatus.TRIAL
        ? new Date(now.getTime() + Math.max(0, input.trialDays ?? 7) * 24 * 60 * 60 * 1000)
        : null;

    const subscription = await this.prisma.schoolSubscription.create({
      data: {
        schoolId: school.id,
        status: input.status,
        planCode: input.planCode,
        priceMonthly: input.priceMonthly,
        currency: input.currency,
        provider: input.provider,
        sourceExternalId: input.sourceExternalId ?? null,
        sourceEventId: input.sourceEventId ?? null,
        startsAt: now,
        endsAt,
        trialEndsAt
      },
      select: {
        id: true,
        status: true,
        endsAt: true
      }
    });

    const shouldBePremium = PREMIUM_ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);
    await this.prisma.school.update({
      where: {
        id: school.id
      },
      data: shouldBePremium
        ? {
            profileStatus: SchoolProfileStatus.PREMIUM,
            premiumSince: now,
            premiumUntil: subscription.endsAt
          }
        : {
            profileStatus:
              school.profileStatus === SchoolProfileStatus.PREMIUM ? SchoolProfileStatus.VERIFIED : school.profileStatus,
            premiumSince: null,
            premiumUntil: null
          }
    });

    await this.cache.invalidateMany(["schools:list", "schools:search", "schools:detail", "search", "rankings"]);

    return subscription;
  }

  private async verifyWebhookSignature(input: {
    provider: BillingProvider;
    payload: unknown;
    signatureHeader: string | undefined;
  }): Promise<{ valid: boolean; reason: string }> {
    const providerSecret = process.env[`BILLING_WEBHOOK_SECRET_${input.provider}`]?.trim();
    const fallbackSecret = process.env.BILLING_WEBHOOK_SECRET?.trim();
    const expectedSecret = providerSecret || fallbackSecret;

    if (!expectedSecret) {
      return {
        valid: true,
        reason: "Billing webhook secret not configured. Signature validation bypassed in this environment."
      };
    }

    const header = input.signatureHeader?.trim();
    if (!header) {
      return {
        valid: false,
        reason: "Missing billing webhook signature"
      };
    }

    // Backward compatibility for manual integrations using plain shared-secret header.
    if (!header.includes("t=") && !header.includes("v1=")) {
      return {
        valid: this.safeStringEquals(header, expectedSecret),
        reason: "Invalid billing webhook signature"
      };
    }

    const parsed = this.parseStructuredSignatureHeader(header);
    if (!parsed) {
      return {
        valid: false,
        reason: "Malformed billing webhook signature"
      };
    }

    const maxAgeSeconds = this.parsePositiveInt(
      process.env.BILLING_WEBHOOK_MAX_AGE_SECONDS,
      BILLING_WEBHOOK_MAX_AGE_SECONDS_DEFAULT
    );
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - parsed.timestamp) > maxAgeSeconds) {
      return {
        valid: false,
        reason: "Expired billing webhook signature"
      };
    }

    const canonicalPayload = this.stableStringify(input.payload ?? {});
    const signedContent = `${parsed.timestamp}.${canonicalPayload}`;
    const expectedSignature = createHmac("sha256", expectedSecret).update(signedContent).digest("hex");
    if (!this.safeStringEquals(parsed.signature, expectedSignature)) {
      return {
        valid: false,
        reason: "Invalid billing webhook signature"
      };
    }

    const replayTtlSeconds = this.parsePositiveInt(
      process.env.BILLING_WEBHOOK_REPLAY_TTL_SECONDS,
      Math.max(maxAgeSeconds, BILLING_WEBHOOK_REPLAY_TTL_SECONDS_DEFAULT)
    );
    const replayHash = createHash("sha256")
      .update(`${input.provider}:${parsed.timestamp}:${parsed.signature}`)
      .digest("hex");
    const replayKey = `eduadvisor:billing:webhook:replay:${replayHash}`;
    const accepted = await this.cache.setIfNotExists(replayKey, "1", replayTtlSeconds);
    if (!accepted) {
      return {
        valid: false,
        reason: "Replay detected for billing webhook signature"
      };
    }

    return {
      valid: true,
      reason: "Signature verified"
    };
  }

  private parseStructuredSignatureHeader(value: string): { timestamp: number; signature: string } | null {
    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    const segments = new Map<string, string>();

    for (const part of parts) {
      const [key, ...rest] = part.split("=");
      if (!key || rest.length === 0) {
        continue;
      }
      segments.set(key.trim(), rest.join("=").trim());
    }

    const rawTimestamp = segments.get("t");
    const signature = segments.get("v1");
    if (!rawTimestamp || !signature) {
      return null;
    }

    const timestamp = Number.parseInt(rawTimestamp, 10);
    if (!Number.isFinite(timestamp) || timestamp <= 0 || signature.length < 16) {
      return null;
    }

    return {
      timestamp,
      signature
    };
  }

  private safeStringEquals(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return timingSafeEqual(leftBuffer, rightBuffer);
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

  private parsePositiveInt(raw: string | undefined, fallback: number) {
    const parsed = Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return parsed;
  }

  private async resolveSchoolIdFromPayload(payload: unknown) {
    const object = this.extractDataObject(payload);
    const schoolId = this.pickFirstString(object, ["schoolId"]) ?? this.pickFirstString(payload, ["schoolId"]);
    if (schoolId) {
      return schoolId;
    }

    const metadata = this.pickFirstObject(object, ["metadata"]) ?? this.pickFirstObject(payload, ["metadata"]);
    const schoolSlug = this.pickFirstString(metadata, ["schoolSlug", "school"]);
    if (!schoolSlug) {
      return null;
    }

    const school = await this.prisma.school.findUnique({
      where: {
        slug: schoolSlug
      },
      select: {
        id: true
      }
    });
    return school?.id ?? null;
  }

  private extractDataObject(payload: unknown) {
    const data = this.pickFirstObject(payload, ["data"]);
    if (!data) {
      return payload;
    }

    const object = this.pickFirstObject(data, ["object"]);
    return object ?? payload;
  }

  private pickFirstObject(value: unknown, keys: string[]) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    for (const key of keys) {
      const candidate = record[key];
      if (candidate && typeof candidate === "object") {
        return candidate;
      }
    }

    return null;
  }

  private pickFirstString(value: unknown, keys: string[]) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    for (const key of keys) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  }

  private pickFirstInt(value: unknown, keys: string[]) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    for (const key of keys) {
      const candidate = record[key];
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return Math.trunc(candidate);
      }
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        const parsed = Number(candidate.trim());
        if (Number.isFinite(parsed)) {
          return Math.trunc(parsed);
        }
      }
    }

    return null;
  }

  private buildMeta(total: number, page: number, limit: number) {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total
    };
  }

  private serializePayload(payload: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(payload ?? {})) as Prisma.InputJsonValue;
  }

  private buildCheckoutUrl(sessionId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    return `${baseUrl.replace(/\/$/, "")}/checkout/${sessionId}`;
  }

  private addMonths(value: Date, months: number) {
    const next = new Date(value);
    next.setMonth(next.getMonth() + months);
    return next;
  }
}
