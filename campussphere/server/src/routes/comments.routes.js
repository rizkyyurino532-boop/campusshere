import { Router } from 'express';
import { deleteCommentHandler } from '../controllers/posts.controller.js';
import {
  requireAuth,
  requireCsrf,
  requireVerified,
} from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireVerified);

// DELETE /api/comments/:commentId
router.delete('/:commentId', requireCsrf, deleteCommentHandler);

export default router;
