import bcrypt from 'bcryptjs';
import { dataStore } from './store.js';

/**
 * Mengisi data awal pengembangan (Seed Data) ke dalam In-Memory Store
 * saat server pertama kali dijalankan.
 * Seluruh akun sampel menggunakan password: KampusITI2026! (Disimpan sebagai hash bcrypt)
 */
export function seedInitialData() {
  if (dataStore.raw.users.length > 0) {
    return;
  }

  const defaultPasswordHash = bcrypt.hashSync('KampusITI2026!', 10);
  const demoVerifyCodeHash = bcrypt.hashSync('123456', 8);

  // 1. Buat 4 Akun Sampel Sivitas Akademika ITI (@iti.ac.id)
  const user1 = dataStore.insertUser({
    id: 'user-1',
    username: 'nadia_putri',
    email: 'nadia.putri@iti.ac.id',
    passwordHash: defaultPasswordHash,
    fullName: 'Nadia Putri Pratama',
    academicRole: 'STUDENT',
    department: 'Teknik Informatika',
    batchYear: 2023,
    bio: 'Mahasiswa Informatika ITI • Antusias Web Development & AI • Pengurus Himpunan Mahasiswa.',
    role: 'MEMBER',
    verificationStatus: 'VERIFIED',
  });

  const user2 = dataStore.insertUser({
    id: 'user-2',
    username: 'dr_hendrawan',
    email: 'hendrawan@iti.ac.id',
    passwordHash: defaultPasswordHash,
    fullName: 'Dr. Ir. Hendrawan Saputra, M.T.',
    academicRole: 'LECTURER',
    department: 'Teknik Elektro',
    batchYear: null,
    bio: 'Dosen Sistem Tertanam & IoT di Institut Teknologi Indonesia. Terbuka untuk diskusi riset mahasiswa.',
    role: 'MEMBER',
    verificationStatus: 'VERIFIED',
  });

  const user3 = dataStore.insertUser({
    id: 'user-3',
    username: 'admin_kampus',
    email: 'kemahasiswaan@iti.ac.id',
    passwordHash: defaultPasswordHash,
    fullName: 'Tim Moderasi & Kemahasiswaan ITI',
    academicRole: 'STAFF',
    department: 'Direktorat Kemahasiswaan',
    batchYear: null,
    bio: 'Akun resmi pengelola komunitas dan moderasi CampusSphere Institut Teknologi Indonesia (@iti.ac.id).',
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
  });

  const user4 = dataStore.insertUser({
    id: 'user-4',
    username: 'rizky_ramadhan',
    email: 'rizky.ramadhan@iti.ac.id',
    passwordHash: defaultPasswordHash,
    fullName: 'Rizky Ramadhan',
    academicRole: 'STUDENT',
    department: 'Teknik Industri',
    batchYear: 2024,
    bio: 'Mahasiswa baru Teknik Industri ITI 2024. Suka fotografi kampus dan diskusi bisnis.',
    role: 'MEMBER',
    verificationStatus: 'PENDING',
    verificationCodeHash: demoVerifyCodeHash,
    verificationExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });

  // 2. Buat Hubungan Follow Awal
  dataStore.addFollow(user1.id, user2.id);
  dataStore.addFollow(user1.id, user3.id);
  dataStore.addFollow(user2.id, user1.id);

  // 3. Buat Postingan Awal di Feed Kampus
  const post1 = dataStore.insertPost({
    authorId: user2.id,
    content:
      'Selamat pagi rekan-rekan mahasiswa ITI! Laboratorium IoT & Robotika membuka pendaftaran asisten riset semester ini. Silakan tulis pertanyaan di kolom komentar jika tertarik bergabung.',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
  });

  const post2 = dataStore.insertPost({
    authorId: user1.id,
    content:
      'Suasana diskusi kelompok proyek rekayasa perangkat lunak sore ini di perpustakaan pusat ITI. Semangat menjelang pekan presentasi!',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
  });

  // 4. Tambahkan Like & Komentar Awal
  dataStore.addLike(post1.id, user1.id);
  dataStore.addLike(post1.id, user3.id);
  dataStore.addLike(post2.id, user2.id);

  dataStore.insertComment({
    postId: post1.id,
    authorId: user1.id,
    content:
      'Selamat pagi Pak Hendrawan, apakah mahasiswa lintas jurusan dari Teknik Informatika diperbolehkan mendaftar?',
  });

  // 5. Tambahkan 1 Contoh Laporan Moderasi
  dataStore.insertReport({
    reporterId: user1.id,
    targetType: 'POST',
    targetId: post2.id,
    reason: 'SPAM',
    notes: 'Laporan contoh awal untuk pengujian dasbor moderasi Admin.',
  });

  console.log(
    `🌱 [SEED]: In-Memory Store terisi dengan ${dataStore.raw.users.length} akun @iti.ac.id (Password sampel: KampusITI2026!) dan ${dataStore.raw.posts.length} postingan.`
  );
  console.log(
    `🔑 [DEV INFO]: Akun PENDING (rizky.ramadhan@iti.ac.id) dapat diverifikasi dengan kode: 123456`
  );
}
