interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RequestRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const record = this.requests.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(key: string): number {
    const record = this.requests.get(key);
    return record?.resetTime || Date.now();
  }
}

// Global rate limiters for different operations
export const firestoreRateLimiter = new RateLimiter({ maxRequests: 50, windowMs: 60000 }); // 50 requests per minute
export const commentRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 }); // 10 comments per minute
export const activityRateLimiter = new RateLimiter({ maxRequests: 20, windowMs: 60000 }); // 20 activities per minute

export { RateLimiter };