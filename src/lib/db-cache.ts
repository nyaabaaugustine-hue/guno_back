// In-memory LRU cache with TTL for database query results
// Provides: caching, rate limiting, query deduplication, timeout protection

interface CacheEntry<T> {
  data: T
  expiresAt: number
  hitCount: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private readonly maxSize: number
  private readonly defaultTTL: number // milliseconds
  private hits = 0
  private misses = 0

  constructor(maxSize = 100, defaultTTLSec = 60) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTLSec * 1000
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return null
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }
    this.hits++
    entry.hitCount++
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.data
  }

  set(key: string, data: T, ttlSec?: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlSec ?? this.defaultTTL / 1000) * 1000,
      hitCount: 0,
    })
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate:
        this.hits + this.misses > 0
          ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%'
          : '0%',
    }
  }
}

// ─── Rate Limiter ───────────────────────────────────────────────
const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSec: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowSec }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
  }
}

// Cleanup stale rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetAt) rateLimitStore.delete(key)
    }
  }, 300_000)
}

// ─── Query Timeout Wrapper ──────────────────────────────────────
export function withQueryTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 10_000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Query timed out')), timeoutMs)
    ),
  ])
}

// ─── Global cache instances ─────────────────────────────────────
export const queryCache = new LRUCache<any>(200, 120) // 200 items, 2min TTL
export const dashboardCache = new LRUCache<any>(50, 30) // 50 items, 30sec TTL
