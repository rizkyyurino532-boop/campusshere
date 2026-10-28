import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { dataStore, sanitizeUser } from '../data/store.js';
import { env } from '../utils/env.js';
import { HttpError } from '../utils/httpError.js';
import { sendVerificationEmailDev } from '../utils/emailDevLogger.js';

const VALID_ACADEMIC_ROLES = ['STUDENT', 'LECTURER', 'STAFF'];

/**
 * Memeriksa apakah email menggunakan domain resmi kampus (@iti.ac.id)
 */
export function isAllowedCampusEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex <= 0) return false;
  const domain = normalized.slice(atIndex + 1);
  return env.ALLOWED_CAMPUS_DOMAINS.includes(domain);
}

export const authService = {
  /**
   * 1. Registrasi Akun Baru
   */
  async register({
    fullName,
    username,
    email,
    password,
    academicRole = 'STUDENT',
    department = 'Teknik Informatika',
    batchYear = null,
  }) {
    const cleanName = String(fullName || '').trim();
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanDept = String(department || '').trim();

    if (cleanName.length < 3 || cleanName.length > 80) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Nama lengkap wajib diisi antara 3 hingga 80 karakter.'
      );
    }

    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Username harus terdiri dari 3–24 karakter (huruf kecil, angka, atau garis bawah).'
      );
    }

    if (!isAllowedCampusEmail(cleanEmail)) {
      const allowedList = env.ALLOWED_CAMPUS_DOMAINS.map((d) => `@${d}`).join(', ');
      throw new HttpError(
        400,
        'INVALID_CAMPUS_EMAIL_DOMAIN',
        `Pendaftaran ditolak: Anda wajib menggunakan email resmi kampus (${allowedList}).`
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Kata sandi (password) wajib terdiri dari minimal 8 karakter.'
      );
    }

    if (!VALID_ACADEMIC_ROLES.includes(academicRole)) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Peran akademik tidak valid (pilih STUDENT, LECTURER, atau STAFF).'
      );
    }

    if (dataStore.findUserByEmail(cleanEmail)) {
      throw new HttpError(
        409,
        'EMAIL_ALREADY_EXISTS',
        'Alamat email kampus tersebut sudah terdaftar.'
      );
    }

    if (dataStore.findUserByUsername(cleanUsername)) {
      throw new HttpError(
        409,
        'USERNAME_ALREADY_EXISTS',
        'Username tersebut sudah digunakan oleh anggota lain.'
      );
    }

    // Hash password dan kode verifikasi 6 digit
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = String(crypto.randomInt(100000, 999999));
    const verificationCodeHash = await bcrypt.hash(verificationCode, 8);
    const verificationExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    // Catatan Keamanan: role selalu 'MEMBER' dan verificationStatus selalu 'PENDING'
    const newUser = dataStore.insertUser({
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      academicRole,
      department: cleanDept || 'Teknik Informatika',
      batchYear:
        academicRole === 'STUDENT' && batchYear ? Number(batchYear) : null,
      bio: `Sivitas akademika ${env.CAMPUS_NAME}.`,
      role: 'MEMBER',
      verificationStatus: 'PENDING',
      verificationCodeHash,
      verificationExpiresAt,
    });

    // Cetak kode verifikasi ke terminal backend lokal
    sendVerificationEmailDev({
      toEmail: newUser.email,
      fullName: newUser.fullName,
      verificationCode,
    });

    const session = dataStore.createSession(newUser.id);
    return {
      user: sanitizeUser(newUser),
      session,
    };
  },

  /**
   * 2. Login Pengguna
   */
  async login({ email, password }) {
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Email kampus dan kata sandi wajib diisi.'
      );
    }

    if (!isAllowedCampusEmail(cleanEmail)) {
      const allowedList = env.ALLOWED_CAMPUS_DOMAINS.map((d) => `@${d}`).join(', ');
      throw new HttpError(
        400,
        'INVALID_CAMPUS_EMAIL_DOMAIN',
        `Hanya alamat email resmi kampus (${allowedList}) yang dapat masuk.`
      );
    }

    const user = dataStore.findUserByEmail(cleanEmail);
    if (!user) {
      throw new HttpError(
        401,
        'INVALID_CREDENTIALS',
        'Email kampus atau kata sandi salah.'
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new HttpError(
        401,
        'INVALID_CREDENTIALS',
        'Email kampus atau kata sandi salah.'
      );
    }

    const session = dataStore.createSession(user.id);
    return {
      user: sanitizeUser(user),
      session,
    };
  },

  /**
   * 3. Verifikasi Kode OTP Email Kampus (6 Digit)
   */
  async verifyEmailCode(userId, code) {
    const user = dataStore.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Akun tidak ditemukan.');
    }

    if (user.verificationStatus === 'VERIFIED') {
      return sanitizeUser(user);
    }

    const cleanCode = String(code || '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new HttpError(
        400,
        'INVALID_VERIFICATION_CODE',
        'Kode verifikasi harus terdiri dari 6 digit angka.'
      );
    }

    if (
      !user.verificationCodeHash ||
      !user.verificationExpiresAt ||
      Date.now() > new Date(user.verificationExpiresAt).getTime()
    ) {
      throw new HttpError(
        400,
        'VERIFICATION_CODE_EXPIRED',
        'Kode verifikasi sudah kedaluwarsa. Silakan klik tombol "Kirim Ulang Kode".'
      );
    }

    const isValidCode = await bcrypt.compare(
      cleanCode,
      user.verificationCodeHash
    );
    if (!isValidCode) {
      throw new HttpError(
        400,
        'INVALID_VERIFICATION_CODE',
        'Kode verifikasi yang Anda masukkan tidak sesuai.'
      );
    }

    const updated = dataStore.updateUser(user.id, {
      verificationStatus: 'VERIFIED',
      verificationCodeHash: null,
      verificationExpiresAt: null,
    });

    return sanitizeUser(updated);
  },

  /**
   * 4. Kirim Ulang Kode Verifikasi Baru
   */
  async resendVerificationCode(userId) {
    const user = dataStore.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Akun tidak ditemukan.');
    }

    if (user.verificationStatus === 'VERIFIED') {
      throw new HttpError(
        400,
        'ALREADY_VERIFIED',
        'Akun Anda sudah terverifikasi.'
      );
    }

    const verificationCode = String(crypto.randomInt(100000, 999999));
    const verificationCodeHash = await bcrypt.hash(verificationCode, 8);
    const verificationExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    dataStore.updateUser(user.id, {
      verificationCodeHash,
      verificationExpiresAt,
    });

    sendVerificationEmailDev({
      toEmail: user.email,
      fullName: user.fullName,
      verificationCode,
    });

    return { email: user.email };
  },

  /**
   * 5. Ajukan Permohonan Verifikasi Manual ke Admin
   */
  requestManualReview(userId, reason) {
    const cleanReason = String(reason || '').trim();
    if (cleanReason.length < 5 || cleanReason.length > 500) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Catatan permohonan verifikasi manual wajib diisi (5–500 karakter).'
      );
    }

    const updated = dataStore.updateUser(userId, {
      manualReviewReason: cleanReason,
    });

    return sanitizeUser(updated);
  },
};
