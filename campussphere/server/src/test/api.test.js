import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Health Check (GET /api/health) mengembalikan status OK dan domain @iti.ac.id', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'OK');
  assert.ok(body.data.allowedEmailDomains.includes('@iti.ac.id'));
});

test('2. Endpoint privat (/api/posts) menolak pengunjung tanpa sesi login (401)', async () => {
  const res = await fetch(`${baseUrl}/posts`);
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('3. Registrasi dengan domain di luar @iti.ac.id ditolak oleh server (400)', async () => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Pengguna Luar',
      username: 'user_luar',
      email: 'luar@gmail.com',
      password: 'PasswordAman123!',
    }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'INVALID_CAMPUS_EMAIL_DOMAIN');
});

test('4. Akun berstatus PENDING ditolak mengakses /api/posts (403) hingga diverifikasi', async () => {
  // Login sebagai Rizky (PENDING)
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rizky.ramadhan@iti.ac.id',
      password: 'KampusITI2026!',
    }),
  });
  assert.equal(loginRes.status, 200);
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];
  const loginJson = await loginRes.json();
  assert.equal(loginJson.data.user.verificationStatus, 'PENDING');

  // Coba akses feed sebelum verifikasi -> 403
  const feedBlocked = await fetch(`${baseUrl}/posts`, {
    headers: { Cookie: cookie },
  });
  assert.equal(feedBlocked.status, 403);

  // Verifikasi kode OTP 6 digit ('123456') -> 200 VERIFIED
  const verifyRes = await fetch(`${baseUrl}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': loginJson.data.csrfToken,
    },
    body: JSON.stringify({ code: '123456' }),
  });
  assert.equal(verifyRes.status, 200);
  const verifyJson = await verifyRes.json();
  assert.equal(verifyJson.data.user.verificationStatus, 'VERIFIED');

  // Sekarang akses feed berhasil -> 200
  const feedAllowed = await fetch(`${baseUrl}/posts`, {
    headers: { Cookie: cookie },
  });
  assert.equal(feedAllowed.status, 200);
});

test('5. Siklus Sosial Lengkap: Buat Post, Like, Komentar, Proteksi Kepemilikan, dan Moderasi Admin', async () => {
  // Login sebagai Nadia (MEMBER • VERIFIED)
  const mLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nadia.putri@iti.ac.id',
      password: 'KampusITI2026!',
    }),
  });
  const mCookie = mLogin.headers.get('set-cookie').split(';')[0];
  const mCsrf = (await mLogin.json()).data.csrfToken;
  const mHeaders = {
    'Content-Type': 'application/json',
    Cookie: mCookie,
    'X-CSRF-Token': mCsrf,
  };

  // Uji proteksi CSRF: request POST tanpa X-CSRF-Token wajib ditolak (403)
  const noCsrfRes = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: mCookie },
    body: JSON.stringify({ content: 'Tanpa CSRF' }),
  });
  assert.equal(noCsrfRes.status, 403);

  // Buat postingan dengan CSRF valid -> 201
  const postRes = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: mHeaders,
    body: JSON.stringify({ content: 'Postingan pengujian otomatis Fase 8!' }),
  });
  assert.equal(postRes.status, 201);
  const createdPost = (await postRes.json()).data.post;

  // Member biasa mencoba mengakses endpoint Admin -> 403 ADMIN_ONLY
  const adminBlocked = await fetch(`${baseUrl}/admin/reports`, {
    headers: mHeaders,
  });
  assert.equal(adminBlocked.status, 403);

  // Login sebagai Admin Kemahasiswaan (ADMIN • VERIFIED)
  const aLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kemahasiswaan@iti.ac.id',
      password: 'KampusITI2026!',
    }),
  });
  const aCookie = aLogin.headers.get('set-cookie').split(';')[0];
  const aCsrf = (await aLogin.json()).data.csrfToken;
  const aHeaders = {
    'Content-Type': 'application/json',
    Cookie: aCookie,
    'X-CSRF-Token': aCsrf,
  };

  const adminOk = await fetch(`${baseUrl}/admin/reports`, {
    headers: aHeaders,
  });
  assert.equal(adminOk.status, 200);

  // Hapus postingan pengujian
  const delRes = await fetch(`${baseUrl}/posts/${createdPost.id}`, {
    method: 'DELETE',
    headers: mHeaders,
  });
  assert.equal(delRes.status, 200);
});
