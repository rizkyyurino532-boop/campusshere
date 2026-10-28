import { HttpError } from '../utils/httpError.js';

/**
 * Middleware Rate Limiting berbasis memori (In-Memory Sliding Window)
 * untuk melindungi endpoint sensitif (login, register, verifikasi) dari serangan brute-force.
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  maxRequests = 15,
  keyPrefix = 'global',
  message = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.',
} = {}) {
  const hits = new Map();

  return function rateLimitMiddleware(req, _res, next) {
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${clientIp}`;
    const now = Date.now();

    const record = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > maxRequests) {
      return next(new HttpError(429, 'TOO_MANY_REQUESTS', message));
    }

    return next();
  };
}
