import { BillingProvider } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

const SIMULATABLE_EVENTS = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "subscription.canceled",
  "subscription.renewed"
] as const;

export type SimulatableBillingEvent = (typeof SIMULATABLE_EVENTS)[number];

export class SimulateBillingEventDto {
  @IsOptional()
  @IsEnum(BillingProvider)
  provider?: BillingProvider;

  @IsString()
  @IsEnum(SIMULATABLE_EVENTS)
  eventType!: SimulatableBillingEvent;

  @IsString()
  schoolId!: string;

  @IsOptional()
  @IsString()
  checkoutSessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  externalEventId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  planCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMonthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountTotal?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  trialDays?: number;
}

