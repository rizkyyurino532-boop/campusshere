import { dataStore, sanitizeUser } from '../data/store.js';
import { HttpError } from '../utils/httpError.js';

const VALID_TARGET_TYPES = ['POST', 'COMMENT'];
const VALID_REASONS = [
  'SPAM',
  'HARASSMENT',
  'MISINFORMATION',
  'INAPPROPRIATE',
  'OTHER',
];
const VALID_REPORT_STATUSES = ['RESOLVED', 'DISMISSED'];
const VALID_VERIFICATION_STATUSES = ['VERIFIED', 'REJECTED', 'PENDING'];

export const moderationService = {
  /**
   * 1. Membuat laporan pelanggaran konten (oleh Verified Member)
   */
  createReport(
    reporterId,
    { targetType = 'POST', targetId, reason = 'SPAM', notes = '' } = {}
  ) {
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Tipe target laporan harus berupa POST atau COMMENT.'
      );
    }

    if (!VALID_REASONS.includes(reason)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Alasan pelaporan tidak valid.'
      );
    }

    if (!targetId) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'ID konten yang dilaporkan wajib disertakan.'
      );
    }

    if (targetType === 'POST') {
      const targetPost = dataStore.findPostById(targetId);
      if (!targetPost) {
        throw new HttpError(
          404,
          'POST_NOT_FOUND',
          'Postingan yang ingin dilaporkan tidak ditemukan.'
        );
      }
      if (targetPost.authorId === reporterId) {
        throw new HttpError(
          400,
          'CANNOT_REPORT_OWN_CONTENT',
          'Anda tidak dapat melaporkan postingan milik Anda sendiri.'
        );
      }
    } else {
      const targetComment = dataStore.findCommentById(targetId);
      if (!targetComment) {
        throw new HttpError(
          404,
          'COMMENT_NOT_FOUND',
          'Komentar yang ingin dilaporkan tidak ditemukan.'
        );
      }
      if (targetComment.authorId === reporterId) {
        throw new HttpError(
          400,
          'CANNOT_REPORT_OWN_CONTENT',
          'Anda tidak dapat melaporkan komentar milik Anda sendiri.'
        );
      }
    }

    const cleanNotes = String(notes || '').trim();
    if (cleanNotes.length > 500) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Catatan laporan maksimal 500 karakter.'
      );
    }

    return dataStore.insertReport({
      reporterId,
      targetType,
      targetId,
      reason,
      notes: cleanNotes,
    });
  },

  /**
   * 2. Mengambil daftar laporan dan daftar akun yang menunggu verifikasi (Khusus ADMIN)
   */
  getAdminDashboardData() {
    const reports = dataStore.findAllReports().map((report) => {
      const reporter = sanitizeUser(dataStore.findUserById(report.reporterId));
      let targetPreview = null;

      if (report.targetType === 'POST') {
        const post = dataStore.findPostById(report.targetId);
        if (post) {
          targetPreview = {
            id: post.id,
            content: post.content,
            authorId: post.authorId,
          };
        }
      } else {
        const comment = dataStore.findCommentById(report.targetId);
        if (comment) {
          targetPreview = {
            id: comment.id,
            content: comment.content,
            authorId: comment.authorId,
          };
        }
      }

      return {
        ...report,
        reporter,
        targetPreview,
      };
    });

    const allUsers = dataStore.findAllUsers();
    const pendingUsers = allUsers.filter(
      (u) => u.verificationStatus !== 'VERIFIED'
    );

    return {
      reports,
      pendingUsers,
    };
  },

  /**
   * 3. Menindaklanjuti laporan moderasi (Khusus ADMIN)
   */
  resolveReport(
    reportId,
    adminUserId,
    { status = 'RESOLVED', removeTarget = false } = {}
  ) {
    const report = dataStore.findReportById(reportId);
    if (!report) {
      throw new HttpError(
        404,
        'REPORT_NOT_FOUND',
        'Data laporan tidak ditemukan.'
      );
    }

    if (!VALID_REPORT_STATUSES.includes(status)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Status penyelesaian laporan harus RESOLVED atau DISMISSED.'
      );
    }

    if (removeTarget) {
      if (report.targetType === 'POST') {
        dataStore.deletePost(report.targetId);
      } else if (report.targetType === 'COMMENT') {
        dataStore.deleteComment(report.targetId);
      }
    }

    const updated = dataStore.updateReportStatus(reportId, {
      status,
      resolvedBy: adminUserId,
    });

    return updated;
  },

  /**
   * 4. Menyetujui atau menolak verifikasi keanggotaan kampus (Khusus ADMIN)
   */
  updateUserVerification(targetUserId, _adminUserId, { status } = {}) {
    if (!VALID_VERIFICATION_STATUSES.includes(status)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Status verifikasi harus VERIFIED, REJECTED, atau PENDING.'
      );
    }

    const user = dataStore.findUserById(targetUserId);
    if (!user) {
      throw new HttpError(
        404,
        'USER_NOT_FOUND',
        'Akun anggota tidak ditemukan.'
      );
    }

    const updated = dataStore.updateUser(targetUserId, {
      verificationStatus: status,
      ...(status === 'VERIFIED'
        ? { verificationCodeHash: null, verificationExpiresAt: null }
        : {}),
    });

    return sanitizeUser(updated);
  },
};
