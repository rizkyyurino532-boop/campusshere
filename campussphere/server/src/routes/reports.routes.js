import { Router } from 'express';
import { createReportHandler } from '../controllers/moderation.controller.js';
import {
  requireAuth,
  requireCsrf,
  requireVerified,
} from '../middleware/auth.middleware.js';

const router = Router();

// Hanya anggota kampus terverifikasi yang dapat mengirim laporan
router.use(requireAuth, requireVerified);

// POST /api/reports
router.post('/', requireCsrf, createReportHandler);

export default router;
