import bcrypt from 'bcryptjs';
import { dataStore, sanitizeUser } from '../data/store.js';
import { HttpError } from '../utils/httpError.js';

export const usersService = {
  searchUsers({ query = '', role = 'ALL' } = {}) {
    const allUsers = dataStore.findAllUsers();
    const q = String(query || '').trim().toLowerCase();

    return allUsers.filter((u) => {
      const matchesRole = !role || role === 'ALL' || u.academicRole === role;
      if (!q) return matchesRole;
      return (
        matchesRole &&
        (u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q))
      );
    });
  },

  getUserProfileByUsername(username, currentUserId = null) {
    const user = dataStore.findUserByUsername(username);
    if (!user) {
      throw new HttpError(
        404,
        'USER_NOT_FOUND',
        `Anggota dengan username @${username} tidak ditemukan.`
      );
    }
    const posts = dataStore.findPostsByAuthorId(user.id, currentUserId);
    return {
      user: sanitizeUser(user),
      posts,
    };
  },

  /**
   * Memperbarui profil diri sendiri (Mencegah Mass Assignment pada role/verificationStatus)
   */
  updateMyProfile(userId, payload = {}) {
    const user = dataStore.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Akun pengguna tidak ditemukan.');
    }

    const cleanName =
      payload.fullName !== undefined
        ? String(payload.fullName).trim()
        : user.fullName;
    const cleanDept =
      payload.department !== undefined
        ? String(payload.department).trim()
        : user.department;
    const cleanBio =
      payload.bio !== undefined ? String(payload.bio).trim() : user.bio;
    const cleanAvatar =
      payload.avatarUrl !== undefined
        ? String(payload.avatarUrl).trim()
        : user.avatarUrl;

    if (cleanName.length < 3 || cleanName.length > 80) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Nama lengkap wajib terdiri dari 3–80 karakter.'
      );
    }

    if (cleanDept.length < 2 || cleanDept.length > 80) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Program studi / departemen wajib diisi.'
      );
    }

    if (cleanBio.length > 250) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Biografi singkat maksimal 250 karakter.'
      );
    }

    if (cleanAvatar && !/^https?:\/\/.+/i.test(cleanAvatar)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'URL foto profil harus diawali dengan http:// atau https://.'
      );
    }

    const batchYear =
      payload.batchYear !== undefined && payload.batchYear !== null && payload.batchYear !== ''
        ? Number(payload.batchYear)
        : null;

    const updated = dataStore.updateUser(userId, {
      fullName: cleanName,
      department: cleanDept,
      batchYear,
      bio: cleanBio,
      avatarUrl: cleanAvatar,
    });

    return sanitizeUser(updated);
  },

  /**
   * Mengubah kata sandi akun sendiri
   */
  async updateMyPassword(userId, { currentPassword, newPassword } = {}) {
    const user = dataStore.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Akun pengguna tidak ditemukan.');
    }

    if (!currentPassword || !newPassword) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Kata sandi saat ini dan kata sandi baru wajib diisi.'
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(
        401,
        'INVALID_CURRENT_PASSWORD',
        'Kata sandi saat ini yang Anda masukkan tidak sesuai.'
      );
    }

    if (String(newPassword).length < 8) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Kata sandi baru wajib terdiri dari minimal 8 karakter.'
      );
    }

    const newPasswordHash = await bcrypt.hash(String(newPassword), 10);
    dataStore.updateUser(userId, { passwordHash: newPasswordHash });
    return true;
  },

  /**
   * Mengikuti anggota kampus lain (Idempoten)
   */
  followUser(followerId, targetUserId) {
    if (followerId === targetUserId) {
      throw new HttpError(
        400,
        'CANNOT_FOLLOW_SELF',
        'Anda tidak dapat mengikuti akun Anda sendiri.'
      );
    }

    const target = dataStore.findUserById(targetUserId);
    if (!target) {
      throw new HttpError(
        404,
        'USER_NOT_FOUND',
        'Anggota yang ingin diikuti tidak ditemukan.'
      );
    }

    dataStore.addFollow(followerId, targetUserId);
    return {
      targetUser: sanitizeUser(target),
      followedIds: dataStore.findFollowedIdsByUser(followerId),
    };
  },

  /**
   * Berhenti mengikuti anggota kampus lain
   */
  unfollowUser(followerId, targetUserId) {
    const target = dataStore.findUserById(targetUserId);
    if (!target) {
      throw new HttpError(
        404,
        'USER_NOT_FOUND',
        'Anggota tidak ditemukan.'
      );
    }

    dataStore.removeFollow(followerId, targetUserId);
    return {
      targetUser: sanitizeUser(target),
      followedIds: dataStore.findFollowedIdsByUser(followerId),
    };
  },
};
