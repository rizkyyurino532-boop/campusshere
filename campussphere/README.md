# 🎓 CampusSphere — Jejaring Sosial Kampus (@iti.ac.id)

**CampusSphere** adalah prototipe aplikasi jejaring sosial internal untuk sivitas akademika **Institut Teknologi Indonesia (`@iti.ac.id`)**, dibangun menggunakan **React + Vite** di sisi Frontend dan **Node.js + Express** di sisi Backend.

> **⚠️ Peringatan Penting: Prototipe Pengembangan vs. Aplikasi Produksi**
> Aplikasi ini saat ini menggunakan **Penyimpanan In-Memory (*In-Memory Data Store*)** di RAM server untuk keperluan pembelajaran arsitektur perangkat lunak.
> * **Konsekuensi:** Seluruh akun baru, postingan, komentar, dan laporan yang dibuat selama pengujian akan **kembali ke data awal (*seed data*) setiap kali server backend dimatikan atau di-restart**.
> * **Bukan Siap Produksi (*Not Production-Ready*):** Jangan gunakan penyimpanan *in-memory* untuk produksi nyata. Lihat panduan migrasi database dan kesiapan produksi pada bagian **Fase 9** di bawah.

---

## 🏗️ Arsitektur & Teknologi

* **Frontend (`client/`):** React 18, Vite, React Router v6, CSS3 Murni (*Dark Charcoal Design System*), Fetch API.
* **Backend (`server/`):** Node.js (ES Modules), Express.js, REST API JSON, `bcryptjs` (Password & OTP Hashing), `cookie-parser` (`HttpOnly` Session Cookie + CSRF Token), `cors` (Strict Origin).

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### 1. Menjalankan Server Backend (`http://localhost:4000`)

Buka terminal pertama:

```powershell
cd campussphere/server
npm install
npm run dev
```

### 2. Menjalankan Aplikasi Frontend (`http://localhost:5173`)

Buka terminal kedua:

```powershell
cd campussphere/client
npm install
npm run dev
```

Buka **`http://localhost:5173`** di browser Anda.

### 3. Menjalankan Pengujian Otomatis Backend (`npm test`)

Untuk menguji seluruh endpoint API dan pemeriksaan keamanan secara otomatis:

```powershell
cd campussphere/server
npm test
```

---

## 🧪 Daftar Akun Sampel (`@iti.ac.id`)

Saat server menyala, `seed.js` menyiapkan 4 akun sampel dengan kata sandi yang sama (**`KampusITI2026!`**):

| Nama Lengkap | Email Kampus | Peran Sistem | Status Verifikasi | Catatan Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **Nadia Putri Pratama** | `nadia.putri@iti.ac.id` | `MEMBER` | `VERIFIED` | Mahasiswa Teknik Informatika (Akses penuh) |
| **Dr. Ir. Hendrawan Saputra** | `hendrawan@iti.ac.id` | `MEMBER` | `VERIFIED` | Dosen Teknik Elektro (Akses penuh) |
| **Tim Moderasi & Kemahasiswaan** | `kemahasiswaan@iti.ac.id` | `ADMIN` | `VERIFIED` | Dapat membuka menu **Moderasi Admin (`⚖️`)** |
| **Rizky Ramadhan** | `rizky.ramadhan@iti.ac.id` | `MEMBER` | `PENDING` | Kode verifikasi awal di `/verify-email`: **`123456`** |

> **Cara Menguji Verifikasi Email Tanpa Mengirim Email Sungguhan:**
> Saat Anda mendaftarkan akun `@iti.ac.id` baru atau menekan tombol **"Kirim Ulang Kode"**, server backend akan mencetak kotak **`[SIMULASI EMAIL INSTITUSI LOKAL]`** beserta 6 digit kode OTP di **Terminal Backend**. Salin kode 6 digit tersebut dan masukkan di halaman `/verify-email`.

---

## 🗄️ Fase 9: Rencana Migrasi Database Permanen & Kesiapan Produksi

Karena seluruh akses data telah diisolasi di dalam `server/src/data/store.js`, aplikasi ini dapat dimigrasikan ke database relasional (**PostgreSQL**) tanpa mengubah komponen React:

1. **Kapan Database Permanen Wajib Digunakan?**
   * Saat aplikasi mulai diuji oleh pengguna kampus sungguhan di mana data akun, postingan, dan riwayat moderasi tidak boleh hilang saat server di-restart atau diperbarui.
2. **Langkah Migrasi Data Access Layer:**
   * Buat tabel PostgreSQL (`users`, `sessions`, `posts`, `likes`, `comments`, `follows`, `reports`) dengan *Foreign Key* dan indeks unik pada `email`, `username`, `(post_id, user_id)` untuk `likes`, dan `(follower_id, following_id)` untuk `follows`.
   * Ganti isi fungsi di `server/src/data/store.js` agar menjalankan query SQL/`pg` atau ORM (seperti Prisma) secara `async/await`.
3. **Syarat Keamanan Wajib Sebelum Peluncuran Produksi (*Deployment Safeguards*):**
   * [ ] Gunakan **HTTPS/TLS** penuh (`NODE_ENV=production` otomatis mengaktifkan cookie `Secure: true`).
   * [ ] Pindahkan penyimpanan sesi & *rate-limiter* dari RAM ke **Redis** atau tabel database.
   * [ ] Hubungkan `emailDevLogger.js` ke server **SMTP resmi `@iti.ac.id`** dan matikan pencetakan kode OTP ke log terminal di mode produksi.
   * [ ] Gunakan *Cloud Object Storage* (S3/Cloudflare R2) dengan validasi tipe file biner untuk unggahan foto.
   * [ ] Aktifkan *automated daily database backup* dan *security headers* (`helmet`).
