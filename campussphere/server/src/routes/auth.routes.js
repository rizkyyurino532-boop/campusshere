import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  getMeHandler,
  verifyEmailHandler,
  resendVerificationHandler,
  requestManualReviewHandler,
} from '../controllers/auth.controller.js';
import { requireAuth, requireCsrf } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  keyPrefix: 'auth',
  message:
    'Terlalu banyak percobaan autentikasi dari alamat IP ini. Silakan tunggu 1 menit.',
});

// POST /api/auth/register
router.post('/register', authRateLimiter, registerHandler);

// POST /api/auth/login
router.post('/login', authRateLimiter, loginHandler);

// POST /api/auth/logout
router.post('/logout', requireAuth, requireCsrf, logoutHandler);

// GET /api/auth/me
router.get('/me', requireAuth, getMeHandler);

// POST /api/auth/verify-email
router.post(
  '/verify-email',
  authRateLimiter,
  requireAuth,
  requireCsrf,
  verifyEmailHandler
);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  authRateLimiter,
  requireAuth,
  requireCsrf,
  resendVerificationHandler
);

// POST /api/auth/request-manual-review
router.post(
  '/request-manual-review',
  requireAuth,
  requireCsrf,
  requestManualReviewHandler
);

export default router;
