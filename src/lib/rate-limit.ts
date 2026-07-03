interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimitByKey(
  key: string,
  limit: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
  windowMs: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
): RateLimitResult {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}

/**
 * Rate limit by IP address from a request object.
 * Extracts IP from headers (x-forwarded-for, x-real-ip) or falls back to 'unknown'.
 */
export function rateLimitByIp(
  request: Request,
  limit?: number,
  windowMs?: number
): RateLimitResult {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  return rateLimitByKey(`ip:${ip}`, limit, windowMs)
}

/**
 * Rate limit by email for auth endpoints.
 */
export function rateLimitByEmail(
  email: string,
  limit?: number,
  windowMs?: number
): RateLimitResult {
  return rateLimitByKey(`email:${email.toLowerCase().trim()}`, limit, windowMs)
}

/**
 * Rate limit with seconds-based window.
 * Convenience wrapper for the AI query route and other server-side use.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSec: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const result = rateLimitByKey(key, maxRequests, windowSec * 1000)
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetIn: Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000)),
  }
}
