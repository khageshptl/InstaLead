import { NextResponse } from "next/server";

interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowEntry>();

function pruneExpired(now: number) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  pruneExpired(now);

  const windowMs = config.windowSeconds * 1000;
  const windowStart =
    Math.floor(now / windowMs) * windowMs;
  const bucketKey = `${config.key}:${windowStart}`;

  const entry = buckets.get(bucketKey) ?? {
    count: 0,
    resetAt: windowStart + windowMs,
  };

  entry.count += 1;
  buckets.set(bucketKey, entry);

  const remaining = Math.max(0, config.limit - entry.count);

  return {
    allowed: entry.count <= config.limit,
    remaining,
    resetAt: entry.resetAt,
  };
}

export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}

export function withRateLimit(
  identifier: string,
  limit: number,
  windowSeconds = 60
) {
  return checkRateLimit({
    key: identifier,
    limit,
    windowSeconds,
  });
}
