import { Router } from 'express';
import {
  listPosts,
  getPostDetail,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  likePostHandler,
  unlikePostHandler,
  listPostCommentsHandler,
  addPostCommentHandler,
} from '../controllers/posts.controller.js';
import {
  requireAuth,
  requireCsrf,
  requireVerified,
} from '../middleware/auth.middleware.js';

const router = Router();

// Seluruh endpoint feed/postingan wajib login DAN terverifikasi sebagai anggota kampus (@iti.ac.id)
router.use(requireAuth, requireVerified);

// GET /api/posts
router.get('/', listPosts);

// POST /api/posts
router.post('/', requireCsrf, createPostHandler);

// GET /api/posts/:postId
router.get('/:postId', getPostDetail);

// PATCH /api/posts/:postId
router.patch('/:postId', requireCsrf, updatePostHandler);

// DELETE /api/posts/:postId
router.delete('/:postId', requireCsrf, deletePostHandler);

// PUT /api/posts/:postId/like
router.put('/:postId/like', requireCsrf, likePostHandler);

// DELETE /api/posts/:postId/like
router.delete('/:postId/like', requireCsrf, unlikePostHandler);

// GET /api/posts/:postId/comments
router.get('/:postId/comments', listPostCommentsHandler);

// POST /api/posts/:postId/comments
router.post('/:postId/comments', requireCsrf, addPostCommentHandler);

export default router;
