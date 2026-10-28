/**
 * DATA SAMPEL PENGEMBANGAN (PHASE 3 UI FOUNDATION)
 * Catatan: Seluruh data di file ini diberi label secara eksplisit sebagai data sampel
 * untuk menguji antarmuka di Fase 3 sebelum dihubungkan ke REST API Backend pada Fase 4-7.
 */

export const SAMPLE_USERS = [
  {
    id: 'user-1',
    username: 'nadia_putri',
    email: 'nadia.putri@iti.ac.id',
    fullName: 'Nadia Putri Pratama',
    academicRole: 'STUDENT',
    department: 'Teknik Informatika',
    batchYear: 2023,
    bio: 'Mahasiswa Informatika ITI • Antusias Web Development & AI • Pengurus Himpunan Mahasiswa.',
    avatarUrl: '',
    role: 'MEMBER',
    verificationStatus: 'VERIFIED',
    followersCount: 48,
    followingCount: 32,
  },
  {
    id: 'user-2',
    username: 'dr_hendrawan',
    email: 'hendrawan@iti.ac.id',
    fullName: 'Dr. Ir. Hendrawan Saputra, M.T.',
    academicRole: 'LECTURER',
    department: 'Teknik Elektro',
    batchYear: null,
    bio: 'Dosen Sistem Tertanam & IoT di Institut Teknologi Indonesia. Terbuka untuk diskusi riset mahasiswa.',
    avatarUrl: '',
    role: 'MEMBER',
    verificationStatus: 'VERIFIED',
    followersCount: 215,
    followingCount: 19,
  },
  {
    id: 'user-3',
    username: 'admin_kampus',
    email: 'kemahasiswaan@iti.ac.id',
    fullName: 'Tim Moderasi & Kemahasiswaan ITI',
    academicRole: 'STAFF',
    department: 'Direktorat Kemahasiswaan',
    batchYear: null,
    bio: 'Akun resmi pengelola komunitas dan moderasi CampusSphere Institut Teknologi Indonesia (@iti.ac.id).',
    avatarUrl: '',
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
    followersCount: 512,
    followingCount: 12,
  },
  {
    id: 'user-4',
    username: 'rizky_ramadhan',
    email: 'rizky.ramadhan@iti.ac.id',
    fullName: 'Rizky Ramadhan',
    academicRole: 'STUDENT',
    department: 'Teknik Industri',
    batchYear: 2024,
    bio: 'Mahasiswa baru Teknik Industri ITI 2024. Suka fotografi kampus dan diskusi bisnis.',
    avatarUrl: '',
    role: 'MEMBER',
    verificationStatus: 'PENDING',
    followersCount: 4,
    followingCount: 10,
  },
];

export const SAMPLE_POSTS = [
  {
    id: 'post-101',
    authorId: 'user-2',
    content:
      '[CONTOH DATA SAMPEL FASE 3] Selamat pagi rekan-rekan mahasiswa ITI! Laboratorium IoT & Robotika membuka pendaftaran asisten riset semester ini. Silakan tulis pertanyaan di kolom komentar jika tertarik bergabung.',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
    isEdited: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    likesUserIds: ['user-1', 'user-3'],
    comments: [
      {
        id: 'comment-201',
        postId: 'post-101',
        authorId: 'user-1',
        content:
          'Selamat pagi Pak Hendrawan, apakah mahasiswa lintas jurusan dari Teknik Informatika diperbolehkan mendaftar?',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-102',
    authorId: 'user-1',
    content:
      '[CONTOH DATA SAMPEL FASE 3] Suasana diskusi kelompok proyek rekayasa perangkat lunak sore ini di perpustakaan pusat ITI. Semangat menjelang pekan presentasi!',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    isEdited: false,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    likesUserIds: ['user-2'],
    comments: [],
  },
];

export const SAMPLE_REPORTS = [
  {
    id: 'report-301',
    reporterId: 'user-1',
    targetType: 'POST',
    targetId: 'post-102',
    reason: 'SPAM',
    notes: 'Contoh laporan simulasi di Fase 3 untuk menguji tabel moderasi Admin.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];
