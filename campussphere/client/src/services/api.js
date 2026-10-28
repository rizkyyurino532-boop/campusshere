// Lapisan Layanan API (Service Layer) menggunakan Fetch API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

let csrfTokenMemory = null;

export function setCsrfToken(token) {
  csrfTokenMemory = token || null;
}

export function getCsrfToken() {
  return csrfTokenMemory;
}

/**
 * Fungsi pembungkus (wrapper) utama untuk semua panggilan HTTP Fetch ke Backend Express.
 * Otomatis menyertakan:
 * - credentials: 'include' (untuk mengirim/menerima cookie sesi HttpOnly)
 * - Header X-CSRF-Token untuk metode pengubah data (POST, PUT, PATCH, DELETE)
 * - Penanganan error JSON terpusat
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (
    csrfTokenMemory &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
  ) {
    requestHeaders['X-CSRF-Token'] = csrfTokenMemory;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: 'include',
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (_networkErr) {
    throw new Error(
      'Tidak dapat menghubungi server backend di http://localhost:4000. Pastikan server Express sedang berjalan.'
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_parseErr) {
    throw new Error(`Respons server tidak valid (HTTP ${response.status}).`);
  }

  if (!response.ok || !payload?.success) {
    const err = new Error(
      payload?.error?.message || `Permintaan gagal (HTTP ${response.status}).`
    );
    err.status = response.status;
    err.code = payload?.error?.code || 'API_ERROR';
    err.details = payload?.error?.details || null;
    throw err;
  }

  return payload.data;
}

// ============================================================================
// 1. HEALTH CHECK
// ============================================================================
export async function checkServerHealth() {
  return apiRequest('/health');
}

// ============================================================================
// 2. AUTENTIKASI & VERIFIKASI KAMPUS (@iti.ac.id)
// ============================================================================
export async function registerUserApi(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  });
  if (data?.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
  return data;
}

export async function loginUserApi({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (data?.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
  return data;
}

export async function logoutUserApi() {
  await apiRequest('/auth/logout', {
    method: 'POST',
  });
  setCsrfToken(null);
}

export async function fetchCurrentSessionApi() {
  const data = await apiRequest('/auth/me');
  if (data?.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
  return data;
}

export async function verifyEmailCodeApi(code) {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: { code },
  });
}

export async function resendVerificationCodeApi() {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
  });
}

export async function requestManualReviewApi(reason) {
  return apiRequest('/auth/request-manual-review', {
    method: 'POST',
    body: { reason },
  });
}

// ============================================================================
// 3. PENGGUNA, PROFIL & FOLLOW (FASE 6)
// ============================================================================
export async function fetchUsersSearch(query = '', role = 'ALL') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (role && role !== 'ALL') params.set('role', role);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const data = await apiRequest(`/users/search${qs}`);
  return data.users || [];
}

export async function fetchUserProfile(username) {
  return apiRequest(`/users/${encodeURIComponent(username)}`);
}

export async function updateMyProfileApi(updates) {
  const data = await apiRequest('/users/me', {
    method: 'PATCH',
    body: updates,
  });
  return data.user;
}

export async function updateMyPasswordApi({ currentPassword, newPassword }) {
  return apiRequest('/users/me/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  });
}

export async function followUserApi(userId) {
  return apiRequest(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'PUT',
  });
}

export async function unfollowUserApi(userId) {
  return apiRequest(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'DELETE',
  });
}

// ============================================================================
// 4. POSTINGAN, LIKE & KOMENTAR (FASE 6)
// ============================================================================
export async function fetchPosts() {
  const data = await apiRequest('/posts');
  return data.posts || [];
}

export async function createPostApi({ content, imageUrl }) {
  const data = await apiRequest('/posts', {
    method: 'POST',
    body: { content, imageUrl },
  });
  return data.post;
}

export async function updatePostApi(postId, { content }) {
  const data = await apiRequest(`/posts/${encodeURIComponent(postId)}`, {
    method: 'PATCH',
    body: { content },
  });
  return data.post;
}

export async function deletePostApi(postId) {
  return apiRequest(`/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
}

export async function likePostApi(postId) {
  const data = await apiRequest(`/posts/${encodeURIComponent(postId)}/like`, {
    method: 'PUT',
  });
  return data.post;
}

export async function unlikePostApi(postId) {
  const data = await apiRequest(`/posts/${encodeURIComponent(postId)}/like`, {
    method: 'DELETE',
  });
  return data.post;
}

export async function addCommentApi(postId, content) {
  const data = await apiRequest(
    `/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: 'POST',
      body: { content },
    }
  );
  return data.post;
}

export async function deleteCommentApi(commentId) {
  return apiRequest(`/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// 5. PELAPORAN & MODERASI ADMIN (FASE 7)
// ============================================================================
export async function createReportApi({ targetType, targetId, reason, notes }) {
  const data = await apiRequest('/reports', {
    method: 'POST',
    body: { targetType, targetId, reason, notes },
  });
  return data.report;
}

export async function fetchAdminModerationApi() {
  return apiRequest('/admin/reports');
}

export async function resolveAdminReportApi(
  reportId,
  { status, removeTarget }
) {
  const data = await apiRequest(
    `/admin/reports/${encodeURIComponent(reportId)}`,
    {
      method: 'PATCH',
      body: { status, removeTarget },
    }
  );
  return data.report;
}

export async function updateUserVerificationAdminApi(userId, status) {
  const data = await apiRequest(
    `/admin/verifications/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      body: { status },
    }
  );
  return data.user;
}
