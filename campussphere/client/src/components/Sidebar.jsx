import { NavLink, Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import { formatAcademicRole } from '../utils/formatters.js';

export default function Sidebar({
  position = 'left',
  currentUser,
  suggestedUsers = [],
  followedIds = [],
  onToggleFollow,
}) {
  if (position === 'right') {
    return (
      <aside className="sidebar-right" aria-label="Informasi Kampus & Saran Anggota">
        {/* Kartu Informasi Eksklusif Kampus */}
        <div className="card">
          <div className="card-title">
            <span>🏫 Lingkungan Kampus</span>
            <span className="badge badge-verified">Aktif</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Ruang diskusi resmi sivitas akademika <strong>Institut Teknologi Indonesia</strong>.
          </p>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.6rem',
            }}
          >
            Domain wajib: <strong style={{ color: 'var(--text-primary)' }}>@iti.ac.id</strong>
          </div>
        </div>

        {/* Kartu Saran Anggota Kampus */}
        <div className="card">
          <div className="card-title">
            <span>🤝 Rekan Kampus ITI</span>
            <Link
              to="/search"
              style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}
            >
              Lihat Semua
            </Link>
          </div>

          <div className="suggested-list">
            {suggestedUsers.map((member) => {
              const isFollowing = followedIds.includes(member.id);
              return (
                <div key={member.id} className="suggested-item">
                  <Link
                    to={`/profile/${member.username}`}
                    className="suggested-user-info"
                  >
                    <UserAvatar user={member} size="sm" />
                    <div className="suggested-user-text">
                      <span className="suggested-name">{member.fullName}</span>
                      <span className="suggested-dept">
                        {formatAcademicRole(member.academicRole)} • {member.department}
                      </span>
                    </div>
                  </Link>

                  {currentUser && currentUser.id !== member.id && (
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        isFollowing ? 'btn-secondary' : 'btn-primary'
                      }`}
                      onClick={() => onToggleFollow(member.id)}
                    >
                      {isFollowing ? 'Mengikuti' : 'Ikuti'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }

  // Sidebar Kiri (Navigasi Utama Desktop)
  const navItems = [
    { to: '/', label: 'Beranda Kampus', icon: '🏠', end: true },
    { to: '/search', label: 'Cari Anggota', icon: '🔍' },
    {
      to: currentUser ? `/profile/${currentUser.username}` : '/login',
      label: 'Profil Saya',
      icon: '👤',
    },
    { to: '/profile/edit', label: 'Edit Profil', icon: '✏️' },
    { to: '/settings', label: 'Pengaturan', icon: '⚙️' },
    { to: '/verify-email', label: 'Status Verifikasi', icon: '🛡️' },
  ];

  if (currentUser?.role === 'ADMIN') {
    navItems.push({
      to: '/admin/moderation',
      label: 'Moderasi Admin',
      icon: '⚖️',
    });
  }

  return (
    <aside className="sidebar-left" aria-label="Menu Navigasi Utama">
      <div className="card">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item-link ${isActive ? 'active' : ''}`
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {currentUser && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserAvatar user={currentUser} size="md" />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser.fullName}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                @{currentUser.username}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              className={`badge ${
                currentUser.verificationStatus === 'VERIFIED'
                  ? 'badge-verified'
                  : 'badge-pending'
              }`}
            >
              {currentUser.verificationStatus === 'VERIFIED'
                ? '✓ Terverifikasi ITI'
                : '⏳ Menunggu Verifikasi'}
            </span>
            <span className="badge badge-role">
              {formatAcademicRole(currentUser.academicRole)}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
