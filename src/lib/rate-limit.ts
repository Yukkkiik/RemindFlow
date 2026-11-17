import { HttpError } from "@/lib/errors";

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window limiter: throws 429 once `key` is hit more than `limit` times within `windowMs`.
 * shortcut: in-memory per server instance, so limits are not shared across serverless
 * instances or restarts; move to Redis/Upstash (or a WAF rule) before public deploy.
 */
export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count++;
  if (bucket.count > limit) {
    throw new HttpError(429, "Terlalu banyak percobaan. Coba lagi dalam beberapa menit.");
  }
}

/**
 * Client IP as set by the hosting proxy. The first X-Forwarded-For entry is client-controlled,
 * so prefer x-real-ip, then the last entry (appended by the nearest proxy).
 * shortcut: assumes exactly one trusted proxy in front; without one the IP is spoofable,
 * so login also has an IP-independent per-email limit.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",");
  return forwarded?.[forwarded.length - 1].trim() || "unknown";
}
