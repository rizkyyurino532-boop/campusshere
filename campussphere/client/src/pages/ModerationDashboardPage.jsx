import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import { formatRelativeTime } from '../utils/formatters.js';

export default function ModerationDashboardPage({
  currentUser,
  reports = [],
  pendingUsers = [],
  usersMap = {},
  posts = [],
  onResolveReport,
  onApproveUserVerification,
}) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="card">
        <span className="badge badge-danger">⛔ Akses Ditolak (403 Forbidden)</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>
          Halaman Khusus Moderator & Admin Kampus
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
          Akun Anda saat ini memiliki peran <strong>{currentUser?.role || 'GUEST'}</strong>. Hanya akun dengan otorisasi <strong>ADMIN</strong> di server yang dapat mengakses dasbor moderasi.
        </p>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>
          💡 Tips Pengujian: Pilih <strong>Admin Kemahasiswaan (ADMIN • VERIFIED)</strong> pada pemilih sesi di pojok kanan atas layar untuk masuk sebagai Admin.
        </p>
        <Link to="/" className="btn btn-primary btn-sm">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">⚖️ Dasbor Moderasi & Keamanan Kampus ITI</h1>
          <p className="page-subtitle">
            Kelola laporan pelanggaran konten dan antrean verifikasi anggota @iti.ac.id secara langsung di server.
          </p>
        </div>
        <span className="badge badge-verified">Otorisasi Server: ADMIN</span>
      </div>

      {/* Antrean Verifikasi Akun Kampus */}
      <section className="card">
        <h2 className="card-title">
          <span>🎓 Antrean Verifikasi Anggota (@iti.ac.id)</span>
          <span className="badge badge-pending">{pendingUsers.length} Menunggu</span>
        </h2>

        {pendingUsers.length === 0 ? (
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Semua anggota terdaftar saat ini sudah terverifikasi.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    {u.fullName} (@{u.username}){' '}
                    <span className="badge badge-pending">
                      {u.verificationStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {u.email} • {u.department}
                  </div>
                  {u.manualReviewReason && (
                    <div
                      style={{
                        marginTop: '0.35rem',
                        fontSize: '0.8rem',
                        color: '#a5b4fc',
                      }}
                    >
                      📝 <strong>Catatan Permohonan Manual:</strong>{' '}
                      {u.manualReviewReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onApproveUserVerification(u.id, 'VERIFIED')}
                  >
                    ✓ Setujui Verifikasi
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onApproveUserVerification(u.id, 'REJECTED')}
                  >
                    ✕ Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daftar Laporan Konten */}
      <section className="card">
        <h2 className="card-title">
          <span>🚩 Laporan Konten Masuk (GET /api/admin/reports)</span>
          <span className="badge badge-role">{reports.length} Total Laporan</span>
        </h2>

        {reports.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="Tidak ada laporan pelanggaran"
            description="Komunitas kampus dalam keadaan kondusif."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reports.map((report) => {
              const reporter =
                report.reporter || usersMap[report.reporterId];
              const targetPreview =
                report.targetPreview ||
                posts.find((p) => p.id === report.targetId);

              return (
                <div
                  key={report.id}
                  style={{
                    padding: '0.9rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span className="badge badge-danger">{report.reason}</span>
                      <span className="badge badge-role">{report.targetType}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Dilaporkan oleh @{reporter?.username || 'anggota'} •{' '}
                        {formatRelativeTime(report.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        report.status === 'OPEN'
                          ? 'badge-pending'
                          : 'badge-verified'
                      }`}
                    >
                      Status: {report.status}
                    </span>
                  </div>

                  {report.notes && (
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      <strong>Catatan Pelapor:</strong> {report.notes}
                    </p>
                  )}

                  {targetPreview ? (
                    <div
                      style={{
                        fontSize: '0.83rem',
                        color: 'var(--text-secondary)',
                        padding: '0.55rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <strong>Cuplikan Konten Terlapor:</strong> &ldquo;
                      {targetPreview.content}&rdquo;
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      (Konten terkait telah dihapus dari server)
                    </div>
                  )}

                  {report.status === 'OPEN' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          onResolveReport(report.id, 'RESOLVED', true)
                        }
                      >
                        🗑️ Hapus Konten & Selesaikan
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          onResolveReport(report.id, 'DISMISSED', false)
                        }
                      >
                        Abaikan Laporan
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
