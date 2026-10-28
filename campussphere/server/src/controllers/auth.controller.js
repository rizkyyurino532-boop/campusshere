import { authService } from '../services/auth.service.js';
import { dataStore } from '../data/store.js';
import { env } from '../utils/env.js';
import { SESSION_COOKIE_NAME } from '../middleware/auth.middleware.js';

function setSessionCookie(res, sessionId) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function registerHandler(req, res, next) {
  try {
    const { user, session } = await authService.register(req.body || {});
    setSessionCookie(res, session.sessionId);

    res.status(201).json({
      success: true,
      message:
        'Pendaftaran berhasil! Kode verifikasi 6 digit telah dikirim (lihat log terminal server lokal).',
      data: {
        user,
        csrfToken: session.csrfToken,
        followedIds: dataStore.findFollowedIdsByUser(user.id),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const { user, session } = await authService.login(req.body || {});
    setSessionCookie(res, session.sessionId);

    res.status(200).json({
      success: true,
      message: 'Berhasil masuk ke CampusSphere.',
      data: {
        user,
        csrfToken: session.csrfToken,
        followedIds: dataStore.findFollowedIdsByUser(user.id),
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(req, res, next) {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
    if (sessionId) {
      dataStore.deleteSession(sessionId);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Sesi Anda telah diakhiri dengan aman.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

export function getMeHandler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Sesi aktif ditemukan.',
    data: {
      user: req.user,
      csrfToken: req.session.csrfToken,
      followedIds: dataStore.findFollowedIdsByUser(req.user.id),
    },
  });
}

export async function verifyEmailHandler(req, res, next) {
  try {
    const user = await authService.verifyEmailCode(
      req.user.id,
      req.body?.code
    );
    res.status(200).json({
      success: true,
      message: 'Email kampus @iti.ac.id Anda berhasil diverifikasi!',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationHandler(req, res, next) {
  try {
    const info = await authService.resendVerificationCode(req.user.id);
    res.status(200).json({
      success: true,
      message: `Kode verifikasi baru telah dibuat untuk ${info.email}. Silakan periksa log terminal backend.`,
      data: info,
    });
  } catch (err) {
    next(err);
  }
}

export function requestManualReviewHandler(req, res, next) {
  try {
    const user = authService.requestManualReview(
      req.user.id,
      req.body?.reason
    );
    res.status(200).json({
      success: true,
      message:
        'Permohonan verifikasi manual telah dikirim ke Tim Moderasi & Kemahasiswaan ITI.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}
