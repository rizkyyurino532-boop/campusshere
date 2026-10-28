import { moderationService } from '../services/moderation.service.js';

export function createReportHandler(req, res, next) {
  try {
    const report = moderationService.createReport(req.user.id, req.body || {});
    res.status(201).json({
      success: true,
      message:
        'Laporan Anda telah diterima oleh Tim Moderasi & Kemahasiswaan ITI.',
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

export function getAdminReportsHandler(_req, res, next) {
  try {
    const data = moderationService.getAdminDashboardData();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data dasbor moderasi Admin.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export function resolveReportHandler(req, res, next) {
  try {
    const report = moderationService.resolveReport(
      req.params.reportId,
      req.user.id,
      req.body || {}
    );
    res.status(200).json({
      success: true,
      message: `Laporan berhasil diperbarui menjadi ${report.status}.`,
      data: { report },
    });
  } catch (err) {
    next(err);
  }
}

export function updateUserVerificationHandler(req, res, next) {
  try {
    const user = moderationService.updateUserVerification(
      req.params.userId,
      req.user.id,
      req.body || {}
    );
    res.status(200).json({
      success: true,
      message: `Status verifikasi ${user.fullName} diperbarui menjadi ${user.verificationStatus}.`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}
