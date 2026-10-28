import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import { formatAcademicRole } from '../utils/formatters.js';

export default function ProfileHeader({
  profileUser,
  postsCount = 0,
  isOwnProfile = false,
  isFollowing = false,
  onToggleFollow,
}) {
  if (!profileUser) return null;

  return (
    <section className="card" aria-label="Header Profil Anggota">
      <div className="profile-header-top">
        <div className="profile-identity">
          <UserAvatar user={profileUser} size="lg" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {profileUser.fullName}
              </h1>
              {profileUser.verificationStatus === 'VERIFIED' ? (
                <span className="badge badge-verified">✓ Terverifikasi ITI</span>
              ) : (
                <span className="badge badge-pending">⏳ Belum Terverifikasi</span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              @{profileUser.username} • { profileUser.email }
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
              <span className="badge badge-role">
                {formatAcademicRole(profileUser.academicRole)}
              </span>
              <span className="badge badge-role">
                🏛️ {profileUser.department}
              </span>
              {profileUser.batchYear && (
                <span className="badge badge-role">
                  📅 Angkatan {profileUser.batchYear}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          {isOwnProfile ? (
            <Link to="/profile/edit" className="btn btn-secondary">
              ✏️ Edit Profil Saya
            </Link>
          ) : (
            <button
              type="button"
              className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => onToggleFollow(profileUser.id)}
            >
              {isFollowing ? '✓ Mengikuti' : '+ Ikuti Anggota'}
            </button>
          )}
        </div>
      </div>

      {profileUser.bio && (
        <p style={{ marginTop: '1rem', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
          {profileUser.bio}
        </p>
      )}

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{postsCount}</span>
          <span className="stat-label">Postingan</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profileUser.followersCount || 0}</span>
          <span className="stat-label">Pengikut</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profileUser.followingCount || 0}</span>
          <span className="stat-label">Mengikuti</span>
        </div>
      </div>
    </section>
  );
}
