import crypto from 'node:crypto';

/**
 * ============================================================================
 * DATA ACCESS LAYER (IN-MEMORY STORE — PROTOTIPE PENGEMBANGAN)
 * ============================================================================
 * Catatan Arsitektur:
 * Seluruh data disimpan di dalam memori RAM proses Node.js.
 * - Keuntungan: Cepat, tidak memerlukan instalasi database eksternal untuk belajar.
 * - Keterbatasan: Data akan di-reset ke seed awal setiap kali server di-restart.
 * - Siap Migrasi: Karena fungsi akses data dipisahkan di file ini, kita dapat
 *   menggantinya dengan query PostgreSQL/MongoDB pada Fase 9 tanpa mengubah
 *   kode React atau Controller Express.
 */

const db = {
  users: [],
  sessions: new Map(), // key: sessionId -> { sessionId, userId, csrfToken, expiresAt, createdAt }
  posts: [],
  likes: [], // { id, postId, userId, createdAt }
  comments: [], // { id, postId, authorId, content, createdAt }
  follows: [], // { id, followerId, followingId, createdAt }
  reports: [], // { id, reporterId, targetType, targetId, reason, notes, status, resolvedBy, createdAt, resolvedAt }
  devEmails: [], // Kotak keluar email simulasi lokal untuk kode verifikasi @iti.ac.id
};

export function createId() {
  return crypto.randomUUID();
}

/**
 * Menghapus field sensitif (seperti passwordHash & verificationCodeHash)
 * sebelum objek user dikirimkan ke Frontend.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const followersCount = db.follows.filter(
    (f) => f.followingId === user.id
  ).length;
  const followingCount = db.follows.filter(
    (f) => f.followerId === user.id
  ).length;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    academicRole: user.academicRole,
    department: user.department,
    batchYear: user.batchYear,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    verificationStatus: user.verificationStatus,
    manualReviewReason: user.manualReviewReason || null,
    followersCount,
    followingCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Menggabungkan data post dengan informasi penulis, jumlah like, daftar komentar,
 * dan penanda apakah pengguna saat ini sudah menyukai post tersebut.
 */
export function enrichPost(post, currentUserId = null) {
  if (!post) return null;
  const author = sanitizeUser(
    db.users.find((u) => u.id === post.authorId)
  );
  const postLikes = db.likes.filter((l) => l.postId === post.id);
  const likesUserIds = postLikes.map((l) => l.userId);
  const postComments = db.comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((comment) => ({
      ...comment,
      author: sanitizeUser(db.users.find((u) => u.id === comment.authorId)),
    }));

  return {
    ...post,
    author,
    likesCount: likesUserIds.length,
    likesUserIds,
    isLikedByMe: currentUserId ? likesUserIds.includes(currentUserId) : false,
    commentsCount: postComments.length,
    comments: postComments,
  };
}

export const dataStore = {
  // Raw collections access (hanya untuk seed & repositori internal)
  raw: db,

  // --- USERS REPOSITORY ---
  findAllUsers() {
    return db.users.map(sanitizeUser);
  },

  findUserById(id) {
    return db.users.find((u) => u.id === id) || null;
  },

  findUserByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  findUserByUsername(username) {
    const normalized = String(username || '').trim().toLowerCase();
    return (
      db.users.find((u) => u.username.toLowerCase() === normalized) || null
    );
  },

  insertUser(userData) {
    const now = new Date().toISOString();
    const newUser = {
      id: userData.id || createId(),
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      fullName: userData.fullName,
      academicRole: userData.academicRole || 'STUDENT',
      department: userData.department || 'Teknik Informatika',
      batchYear: userData.batchYear ?? null,
      bio: userData.bio || '',
      avatarUrl: userData.avatarUrl || '',
      role: userData.role || 'MEMBER',
      verificationStatus: userData.verificationStatus || 'PENDING',
      verificationCodeHash: userData.verificationCodeHash || null,
      verificationExpiresAt: userData.verificationExpiresAt || null,
      manualReviewReason: userData.manualReviewReason || null,
      createdAt: userData.createdAt || now,
      updatedAt: now,
    };
    db.users.push(newUser);
    return newUser;
  },

  updateUser(userId, updates) {
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return db.users[idx];
  },

  // --- SESSIONS REPOSITORY ---
  createSession(userId) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const session = {
      sessionId,
      userId,
      csrfToken,
      createdAt: new Date(now).toISOString(),
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 jam
    };
    db.sessions.set(sessionId, session);
    return session;
  },

  getSession(sessionId) {
    if (!sessionId) return null;
    const session = db.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      db.sessions.delete(sessionId);
      return null;
    }
    return session;
  },

  deleteSession(sessionId) {
    if (!sessionId) return;
    db.sessions.delete(sessionId);
  },

  // --- POSTS REPOSITORY ---
  findAllPosts(currentUserId = null) {
    return [...db.posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((post) => enrichPost(post, currentUserId));
  },

  findPostsByAuthorId(authorId, currentUserId = null) {
    return db.posts
      .filter((p) => p.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((post) => enrichPost(post, currentUserId));
  },

  findPostById(postId) {
    return db.posts.find((p) => p.id === postId) || null;
  },

  insertPost({ authorId, content, imageUrl = null }) {
    const now = new Date().toISOString();
    const newPost = {
      id: createId(),
      authorId,
      content,
      imageUrl,
      isEdited: false,
      createdAt: now,
      updatedAt: now,
    };
    db.posts.unshift(newPost);
    return newPost;
  },

  updatePost(postId, { content }) {
    const idx = db.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;
    db.posts[idx] = {
      ...db.posts[idx],
      content,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    };
    return db.posts[idx];
  },

  deletePost(postId) {
    const idx = db.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return false;
    db.posts.splice(idx, 1);
    db.likes = db.likes.filter((l) => l.postId !== postId);
    db.comments = db.comments.filter((c) => c.postId !== postId);
    return true;
  },

  // --- LIKES REPOSITORY ---
  addLike(postId, userId) {
    const existing = db.likes.find(
      (l) => l.postId === postId && l.userId === userId
    );
    if (existing) return existing;
    const like = {
      id: createId(),
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };
    db.likes.push(like);
    return like;
  },

  removeLike(postId, userId) {
    db.likes = db.likes.filter(
      (l) => !(l.postId === postId && l.userId === userId)
    );
  },

  // --- COMMENTS REPOSITORY ---
  findCommentsByPostId(postId) {
    return db.comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((comment) => ({
        ...comment,
        author: sanitizeUser(db.users.find((u) => u.id === comment.authorId)),
      }));
  },

  findCommentById(commentId) {
    return db.comments.find((c) => c.id === commentId) || null;
  },

  insertComment({ postId, authorId, content }) {
    const comment = {
      id: createId(),
      postId,
      authorId,
      content,
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    return comment;
  },

  deleteComment(commentId) {
    const idx = db.comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return false;
    db.comments.splice(idx, 1);
    return true;
  },

  // --- FOLLOWS REPOSITORY ---
  findFollowedIdsByUser(followerId) {
    return db.follows
      .filter((f) => f.followerId === followerId)
      .map((f) => f.followingId);
  },

  addFollow(followerId, followingId) {
    const existing = db.follows.find(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
    if (existing) return existing;
    const follow = {
      id: createId(),
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    };
    db.follows.push(follow);
    return follow;
  },

  removeFollow(followerId, followingId) {
    db.follows = db.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === followingId)
    );
  },

  // --- REPORTS REPOSITORY ---
  findAllReports() {
    return [...db.reports].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  findReportById(reportId) {
    return db.reports.find((r) => r.id === reportId) || null;
  },

  insertReport({ reporterId, targetType, targetId, reason, notes }) {
    const report = {
      id: createId(),
      reporterId,
      targetType,
      targetId,
      reason,
      notes: notes || '',
      status: 'OPEN',
      resolvedBy: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    db.reports.unshift(report);
    return report;
  },

  updateReportStatus(reportId, { status, resolvedBy }) {
    const idx = db.reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return null;
    db.reports[idx] = {
      ...db.reports[idx],
      status,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    };
    return db.reports[idx];
  },
};
