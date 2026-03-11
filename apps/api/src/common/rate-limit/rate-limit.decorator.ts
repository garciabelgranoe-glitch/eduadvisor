import { SetMetadata } from "@nestjs/common";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_KEY = "rateLimitConfig";
export const SKIP_RATE_LIMIT_KEY = "skipRateLimit";

export const RateLimit = (config: RateLimitConfig) => SetMetadata(RATE_LIMIT_KEY, config);
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);
