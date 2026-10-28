import { Router } from 'express';
import {
  getAdminReportsHandler,
  resolveReportHandler,
  updateUserVerificationHandler,
} from '../controllers/moderation.controller.js';
import {
  requireAdmin,
  requireAuth,
  requireCsrf,
} from '../middleware/auth.middleware.js';

const router = Router();

// Seluruh endpoint di /api/admin WAJIB memiliki peran ADMIN yang diverifikasi di server!
router.use(requireAuth, requireAdmin);

// GET /api/admin/reports
router.get('/reports', getAdminReportsHandler);

// PATCH /api/admin/reports/:reportId
router.patch('/reports/:reportId', requireCsrf, resolveReportHandler);

// PATCH /api/admin/verifications/:userId
router.patch(
  '/verifications/:userId',
  requireCsrf,
  updateUserVerificationHandler
);

export default router;
