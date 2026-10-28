import { dataStore, sanitizeUser } from '../data/store.js';
import { HttpError } from '../utils/httpError.js';

export const SESSION_COOKIE_NAME = 'campussphere_sid';

/**
 * 1. Membaca cookie sesi (jika ada) dan melampirkan req.user serta req.session
 */
export function attachSessionUser(req, _res, next) {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId) {
    req.user = null;
    req.session = null;
    return next();
  }

  const session = dataStore.getSession(sessionId);
  if (!session) {
    req.user = null;
    req.session = null;
    return next();
  }

  const rawUser = dataStore.findUserById(session.userId);
  if (!rawUser) {
    dataStore.deleteSession(sessionId);
    req.user = null;
    req.session = null;
    return next();
  }

  req.user = sanitizeUser(rawUser);
  req.session = session;
  return next();
}

/**
 * 2. Memastikan pengguna sudah login (Memiliki sesi valid)
 */
export function requireAuth(req, _res, next) {
  if (!req.user || !req.session) {
    return next(
      new HttpError(
        401,
        'UNAUTHORIZED',
        'Sesi Anda belum aktif atau telah berakhir. Silakan masuk terlebih dahulu.'
      )
    );
  }
  return next();
}

/**
 * 3. Memastikan semua request pengubah data (POST, PUT, PATCH, DELETE)
 *    yang menggunakan sesi cookie menyertakan header X-CSRF-Token yang sah.
 */
export function requireCsrf(req, _res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  if (!req.session) {
    return next(
      new HttpError(401, 'UNAUTHORIZED', 'Sesi tidak ditemukan untuk validasi CSRF.')
    );
  }

  const tokenFromHeader = req.get('X-CSRF-Token');
  if (!tokenFromHeader || tokenFromHeader !== req.session.csrfToken) {
    return next(
      new HttpError(
        403,
        'INVALID_CSRF_TOKEN',
        'Token keamanan CSRF tidak valid atau tidak disertakan. Silakan muat ulang halaman.'
      )
    );
  }

  return next();
}

/**
 * 4. Memastikan akun pengguna telah diverifikasi sebagai anggota kampus (@iti.ac.id)
 *    Ditegakkan langsung di sisi Backend!
 */
export function requireVerified(req, _res, next) {
  if (!req.user) {
    return next(
      new HttpError(401, 'UNAUTHORIZED', 'Silakan masuk terlebih dahulu.')
    );
  }

  if (req.user.verificationStatus !== 'VERIFIED') {
    return next(
      new HttpError(
        403,
        'CAMPUS_VERIFICATION_REQUIRED',
        'Akses ditolak: Akun email @iti.ac.id Anda belum terverifikasi. Silakan selesaikan verifikasi email terlebih dahulu.'
      )
    );
  }

  return next();
}

/**
 * 5. Memastikan pengguna memiliki peran ADMIN yang terverifikasi
 */
export function requireAdmin(req, _res, next) {
  if (!req.user) {
    return next(
      new HttpError(401, 'UNAUTHORIZED', 'Silakan masuk terlebih dahulu.')
    );
  }

  if (req.user.verificationStatus !== 'VERIFIED' || req.user.role !== 'ADMIN') {
    return next(
      new HttpError(
        403,
        'ADMIN_ONLY',
        'Akses ditolak: Halaman atau tindakan ini hanya diizinkan untuk Moderator/Admin Kampus.'
      )
    );
  }

  return next();
}
