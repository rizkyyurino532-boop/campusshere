/**
 * Mengubah timestamp ISO menjadi format waktu relatif bahasa Indonesia
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return 'Baru saja';
  const date = new Date(isoString);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Baru saja';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Menerjemahkan kode peran akademik ke label Bahasa Indonesia
 */
export function formatAcademicRole(academicRole) {
  switch (academicRole) {
    case 'LECTURER':
      return 'Dosen';
    case 'STAFF':
      return 'Staf Kampus';
    case 'STUDENT':
    default:
      return 'Mahasiswa';
  }
}

/**
 * Mengambil inisial nama (maksimal 2 huruf) untuk avatar fallback
 */
export function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
