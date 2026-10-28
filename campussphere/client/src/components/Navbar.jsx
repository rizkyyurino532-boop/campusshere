import { Link, NavLink } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';

const DEV_QUICK_ACCOUNTS = [
  { email: 'nadia.putri@iti.ac.id', label: 'Nadia Putri (MEMBER • VERIFIED)' },
  { email: 'hendrawan@iti.ac.id', label: 'Dr. Hendrawan (MEMBER • VERIFIED)' },
  { email: 'kemahasiswaan@iti.ac.id', label: 'Admin Kemahasiswaan (ADMIN • VERIFIED)' },
  { email: 'rizky.ramadhan@iti.ac.id', label: 'Rizky Ramadhan (MEMBER • PENDING)' },
];

export default function Navbar({
  currentUser,
  onSwitchPreviewUser,
  onLogout,
}) {
  return (
    <>
      {/* Banner Penanda Mode Pengembangan & Pintasan Sesi Server */}
      <div className="dev-banner">
        <span>
          🔒 <strong>Keamanan Sesi Aktif (HttpOnly Cookie + CSRF):</strong> Penyimpanan In-Memory di-reset saat server restart.
        </span>
        {onSwitchPreviewUser && (
          <div className="dev-role-switcher">
            <label htmlFor="preview-user-select">Pintasan Sesi Dev:</label>
            <select
              id="preview-user-select"
              value={currentUser?.email || 'guest'}
              onChange={(e) => onSwitchPreviewUser(e.target.value)}
            >
              {DEV_QUICK_ACCOUNTS.map((acc) => (
                <option key={acc.email} value={acc.email}>
                  {acc.label}
                </option>
              ))}
              {currentUser &&
                !DEV_QUICK_ACCOUNTS.some(
                  (a) => a.email === currentUser.email
                ) && (
                  <option value={currentUser.email}>
                    {currentUser.fullName} ({currentUser.role} •{' '}
                    {currentUser.verificationStatus})
                  </option>
                )}
              <option value="guest">Pengunjung Belum Login (Guest)</option>
            </select>
          </div>
        )}
      </div>

      {/* Bilah Navigasi Utama */}
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" className="brand-link">
            <span className="brand-mark">CS</span>
            <span>CampusSphere</span>
          </Link>
          <span className="campus-pill" title="Komunitas Resmi Institut Teknologi Indonesia">
            🎓 @iti.ac.id
          </span>
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <>
              {currentUser.verificationStatus !== 'VERIFIED' && (
                <NavLink to="/verify-email" className="badge badge-pending">
                  ⏳ Belum Terverifikasi
                </NavLink>
              )}

              <Link
                to={`/profile/${currentUser.username}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                }}
              >
                <UserAvatar user={currentUser} size="sm" />
                <span className="hide-on-mobile">{currentUser.fullName}</span>
              </Link>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Daftar Kampus
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
