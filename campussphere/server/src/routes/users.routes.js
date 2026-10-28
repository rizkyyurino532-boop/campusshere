import { Router } from 'express';
import {
  searchMembers,
  getMemberByUsername,
  updateMyProfileHandler,
  updateMyPasswordHandler,
  followMemberHandler,
  unfollowMemberHandler,
} from '../controllers/users.controller.js';
import {
  requireAuth,
  requireCsrf,
  requireVerified,
} from '../middleware/auth.middleware.js';

const router = Router();

// Seluruh rute di bawah ini membutuhkan sesi login aktif
router.use(requireAuth);

// PATCH /api/users/me/password (Bisa diakses oleh pengguna login)
router.patch('/me/password', requireCsrf, updateMyPasswordHandler);

// Seluruh rute sosial kampus di bawah ini wajib berstatus VERIFIED (@iti.ac.id)
router.use(requireVerified);

// GET /api/users/search
router.get('/search', searchMembers);

// PATCH /api/users/me
router.patch('/me', requireCsrf, updateMyProfileHandler);

// GET /api/users/:username
router.get('/:username', getMemberByUsername);

// PUT /api/users/:userId/follow
router.put('/:userId/follow', requireCsrf, followMemberHandler);

// DELETE /api/users/:userId/follow
router.delete('/:userId/follow', requireCsrf, unfollowMemberHandler);

export default router;
