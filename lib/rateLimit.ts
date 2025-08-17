import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private config: RateLimitConfig

  getConfig(): RateLimitConfig {
    return this.config
  }

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return 0
    return Math.max(0, record.resetTime - Date.now())
  }

  cleanup(): void {
    const now = Date.now()
    Array.from(this.requests.entries()).forEach(([key, record]) => {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    })
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests. Please try again later.'
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  message: 'Too many uploads. Please try again later.'
})

// Rate limiting middleware for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter: RateLimiter,
  getIdentifier: (req: NextRequest) => string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const identifier = getIdentifier(req)
    
    if (!rateLimiter.isAllowed(identifier)) {
      const remainingTime = rateLimiter.getRemainingTime(identifier)
      return NextResponse.json(
        { 
          error: rateLimiter.getConfig().message || 'Rate limit exceeded',
          retryAfter: Math.ceil(remainingTime / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(remainingTime / 1000).toString(),
            'X-RateLimit-Limit': rateLimiter.getConfig().maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + remainingTime).toISOString()
          }
        }
      )
    }

    return handler(req)
  }
}

// Clean up expired rate limit records periodically
setInterval(() => {
  authRateLimiter.cleanup()
  apiRateLimiter.cleanup()
  uploadRateLimiter.cleanup()
}, 60 * 1000) // Clean up every minute
