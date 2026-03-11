import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Query, UseGuards } from "@nestjs/common";
import { BillingProvider } from "@prisma/client";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { BillingService } from "./billing.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { ListBillingInvoicesDto } from "./dto/list-billing-invoices.dto";
import { ListBillingWebhookEventsDto } from "./dto/list-billing-webhook-events.dto";
import { SimulateBillingEventDto } from "./dto/simulate-billing-event.dto";

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("admin/billing/overview")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async overview() {
    return this.billingService.getOverview();
  }

  @Get("admin/billing/invoices")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async invoices(@Query() query: ListBillingInvoicesDto) {
    return this.billingService.listInvoices(query);
  }

  @Get("admin/billing/webhook-events")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async webhookEvents(@Query() query: ListBillingWebhookEventsDto) {
    return this.billingService.listWebhookEvents(query);
  }

  @Get("admin/billing/checkout-sessions/:sessionId")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async checkoutSession(@Param("sessionId") sessionId: string) {
    return this.billingService.getCheckoutSession(sessionId);
  }

  @Post("admin/billing/checkout-sessions")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async createCheckoutSession(@Body() payload: CreateCheckoutSessionDto) {
    return this.billingService.createCheckoutSession(payload);
  }

  @Post("admin/billing/events/simulate")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async simulateEvent(@Body() payload: SimulateBillingEventDto) {
    return this.billingService.simulateEvent(payload);
  }

  @Post("billing/webhooks/:provider")
  async processWebhook(
    @Param("provider") provider: string,
    @Body() payload: unknown,
    @Headers("x-billing-signature") signature: string | undefined
  ) {
    return this.billingService.processWebhook(this.parseProvider(provider), payload, signature);
  }

  private parseProvider(provider: string): BillingProvider {
    const normalized = provider.trim().toUpperCase();

    if (normalized === BillingProvider.MANUAL) {
      return BillingProvider.MANUAL;
    }

    if (normalized === BillingProvider.STRIPE) {
      return BillingProvider.STRIPE;
    }

    if (normalized === BillingProvider.MERCADO_PAGO || normalized === "MERCADOPAGO") {
      return BillingProvider.MERCADO_PAGO;
    }

    throw new BadRequestException("Unsupported billing provider");
  }
}
