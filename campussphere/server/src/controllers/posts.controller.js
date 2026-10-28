import { postsService } from '../services/posts.service.js';

export function listPosts(req, res, next) {
  try {
    const posts = postsService.getAllPosts(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar postingan feed kampus.',
      data: { posts },
    });
  } catch (err) {
    next(err);
  }
}

export function getPostDetail(req, res, next) {
  try {
    const post = postsService.getPostById(req.params.postId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail postingan.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function createPostHandler(req, res, next) {
  try {
    const post = postsService.createPost(req.user.id, req.body || {});
    res.status(201).json({
      success: true,
      message: 'Postingan baru berhasil dipublikasikan ke Feed ITI.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function updatePostHandler(req, res, next) {
  try {
    const post = postsService.updatePost(
      req.params.postId,
      req.user.id,
      req.body || {}
    );
    res.status(200).json({
      success: true,
      message: 'Postingan berhasil diperbarui.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function deletePostHandler(req, res, next) {
  try {
    const result = postsService.deletePost(req.params.postId, req.user);
    res.status(200).json({
      success: true,
      message: 'Postingan berhasil dihapus.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export function likePostHandler(req, res, next) {
  try {
    const post = postsService.likePost(req.params.postId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Berhasil menyukai postingan.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function unlikePostHandler(req, res, next) {
  try {
    const post = postsService.unlikePost(req.params.postId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Batal menyukai postingan.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function listPostCommentsHandler(req, res, next) {
  try {
    const comments = postsService.getComments(req.params.postId);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar komentar.',
      data: { comments },
    });
  } catch (err) {
    next(err);
  }
}

export function addPostCommentHandler(req, res, next) {
  try {
    const post = postsService.addComment(
      req.params.postId,
      req.user.id,
      req.body || {}
    );
    res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan.',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

export function deleteCommentHandler(req, res, next) {
  try {
    const result = postsService.deleteComment(req.params.commentId, req.user);
    res.status(200).json({
      success: true,
      message: 'Komentar berhasil dihapus.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
