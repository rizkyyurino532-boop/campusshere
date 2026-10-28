import { dataStore } from '../data/store.js';

/**
 * Mencetak simulasi email verifikasi ke Terminal Backend untuk pengembangan lokal.
 * Catatan Keamanan:
 * - Kode verifikasi TIDAK PERNAH dikirim di dalam body JSON API registrasi/login.
 * - Pengguna harus melihat terminal server lokal (layaknya membuka kotak masuk email @iti.ac.id)
 *   dan mengetikkan kode 6 digit tersebut di halaman /verify-email.
 */
export function sendVerificationEmailDev({ toEmail, fullName, verificationCode }) {
  const timestamp = new Date().toISOString();

  dataStore.raw.devEmails.unshift({
    toEmail,
    fullName,
    subject: 'Kode Verifikasi Akun CampusSphere (@iti.ac.id)',
    verificationCode,
    sentAt: timestamp,
  });

  console.log('\n============================================================');
  console.log('📨 [SIMULASI EMAIL INSTITUSI LOKAL — CAMPUSSPHERE]');
  console.log(`Waktu    : ${timestamp}`);
  console.log(`Kepada   : ${fullName} <${toEmail}>`);
  console.log('Subjek   : Kode Verifikasi Keanggotaan CampusSphere ITI');
  console.log(`KODE OTP : ${verificationCode} (Berlaku selama 15 menit)`);
  console.log('============================================================\n');
}
