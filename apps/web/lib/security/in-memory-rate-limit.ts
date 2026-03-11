interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

interface ConsumeRateLimitInput {
  key: string;
  maxRequests: number;
  windowMs: number;
  blockMs: number;
}

interface ConsumeRateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

const STORE_KEY = "__eduadvisor_web_rate_limit_store__";

function getStore() {
  const scope = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, RateLimitEntry>;
  };

  if (!scope[STORE_KEY]) {
    scope[STORE_KEY] = new Map<string, RateLimitEntry>();
  }

  return scope[STORE_KEY];
}

function cleanupExpiredEntries(store: Map<string, RateLimitEntry>, now: number, windowMs: number) {
  for (const [key, entry] of store.entries()) {
    const stale = now - entry.windowStart > windowMs * 2;
    const unblocked = entry.blockedUntil > 0 && entry.blockedUntil <= now;

    if (stale && (entry.blockedUntil === 0 || unblocked)) {
      store.delete(key);
    }
  }
}

export function consumeRateLimit(input: ConsumeRateLimitInput): ConsumeRateLimitResult {
  const now = Date.now();
  const store = getStore();
  const current = store.get(input.key);

  if (!current) {
    store.set(input.key, {
      count: 1,
      windowStart: now,
      blockedUntil: 0
    });
    return {
      allowed: true,
      retryAfterMs: 0
    };
  }

  if (current.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterMs: current.blockedUntil - now
    };
  }

  if (now - current.windowStart >= input.windowMs) {
    current.count = 1;
    current.windowStart = now;
    current.blockedUntil = 0;
    store.set(input.key, current);
    return {
      allowed: true,
      retryAfterMs: 0
    };
  }

  current.count += 1;
  if (current.count <= input.maxRequests) {
    store.set(input.key, current);
    return {
      allowed: true,
      retryAfterMs: 0
    };
  }

  current.blockedUntil = now + input.blockMs;
  store.set(input.key, current);

  if (store.size > 2048) {
    cleanupExpiredEntries(store, now, input.windowMs);
  }

  return {
    allowed: false,
    retryAfterMs: input.blockMs
  };
}
