import { dataStore, enrichPost } from '../data/store.js';
import { HttpError } from '../utils/httpError.js';

export const postsService = {
  getAllPosts(currentUserId = null) {
    return dataStore.findAllPosts(currentUserId);
  },

  getPostById(postId, currentUserId = null) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(
        404,
        'POST_NOT_FOUND',
        'Postingan yang Anda cari tidak ditemukan.'
      );
    }
    return enrichPost(post, currentUserId);
  },

  createPost(authorId, { content, imageUrl = null } = {}) {
    const cleanContent = String(content || '').trim();
    const cleanImage = imageUrl ? String(imageUrl).trim() : null;

    if (!cleanContent || cleanContent.length > 1000) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Isi teks postingan wajib diisi (maksimal 1000 karakter).'
      );
    }

    if (cleanImage && !/^https?:\/\/.+/i.test(cleanImage)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'URL gambar postingan harus diawali dengan http:// atau https://.'
      );
    }

    const created = dataStore.insertPost({
      authorId,
      content: cleanContent,
      imageUrl: cleanImage,
    });

    return enrichPost(created, authorId);
  },

  updatePost(postId, currentUserId, { content } = {}) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(
        404,
        'POST_NOT_FOUND',
        'Postingan yang ingin diedit tidak ditemukan.'
      );
    }

    // Pemeriksaan Kepemilikan (Ownership Check): Hanya penulis asli yang boleh mengedit
    if (post.authorId !== currentUserId) {
      throw new HttpError(
        403,
        'FORBIDDEN_NOT_OWNER',
        'Akses ditolak: Anda hanya diperbolehkan mengedit postingan milik Anda sendiri.'
      );
    }

    const cleanContent = String(content || '').trim();
    if (!cleanContent || cleanContent.length > 1000) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Isi teks postingan wajib diisi (maksimal 1000 karakter).'
      );
    }

    const updated = dataStore.updatePost(postId, { content: cleanContent });
    return enrichPost(updated, currentUserId);
  },

  deletePost(postId, currentUser) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(
        404,
        'POST_NOT_FOUND',
        'Postingan yang ingin dihapus tidak ditemukan.'
      );
    }

    // Pemeriksaan Kepemilikan atau Otorisasi Admin
    const isOwner = post.authorId === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new HttpError(
        403,
        'FORBIDDEN_NOT_OWNER',
        'Akses ditolak: Anda tidak memiliki izin untuk menghapus postingan anggota lain.'
      );
    }

    dataStore.deletePost(postId);
    return { deletedPostId: postId };
  },

  likePost(postId, userId) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(404, 'POST_NOT_FOUND', 'Postingan tidak ditemukan.');
    }
    dataStore.addLike(postId, userId);
    return enrichPost(post, userId);
  },

  unlikePost(postId, userId) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(404, 'POST_NOT_FOUND', 'Postingan tidak ditemukan.');
    }
    dataStore.removeLike(postId, userId);
    return enrichPost(post, userId);
  },

  getComments(postId) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(404, 'POST_NOT_FOUND', 'Postingan tidak ditemukan.');
    }
    return dataStore.findCommentsByPostId(postId);
  },

  addComment(postId, authorId, { content } = {}) {
    const post = dataStore.findPostById(postId);
    if (!post) {
      throw new HttpError(404, 'POST_NOT_FOUND', 'Postingan tidak ditemukan.');
    }

    const cleanContent = String(content || '').trim();
    if (!cleanContent || cleanContent.length > 500) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Komentar wajib diisi (maksimal 500 karakter).'
      );
    }

    dataStore.insertComment({
      postId,
      authorId,
      content: cleanContent,
    });

    return enrichPost(post, authorId);
  },

  deleteComment(commentId, currentUser) {
    const comment = dataStore.findCommentById(commentId);
    if (!comment) {
      throw new HttpError(
        404,
        'COMMENT_NOT_FOUND',
        'Komentar yang ingin dihapus tidak ditemukan.'
      );
    }

    const post = dataStore.findPostById(comment.postId);
    const isCommentOwner = comment.authorId === currentUser.id;
    const isPostOwner = post && post.authorId === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      throw new HttpError(
        403,
        'FORBIDDEN_NOT_OWNER',
        'Akses ditolak: Anda tidak berhak menghapus komentar ini.'
      );
    }

    dataStore.deleteComment(commentId);
    return {
      deletedCommentId: commentId,
      postId: comment.postId,
      post: post ? enrichPost(post, currentUser.id) : null,
    };
  },
};
