import { getInitials } from '../utils/formatters.js';

export default function UserAvatar({
  user,
  size = 'md',
  showVerified = true,
}) {
  const sizeClass =
    size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : 'avatar-md';
  const isVerified = user?.verificationStatus === 'VERIFIED';

  return (
    <div className="avatar-wrap">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName || user.username || 'Avatar Pengguna'}
          className={`avatar-circle ${sizeClass}`}
        />
      ) : (
        <div className={`avatar-circle ${sizeClass}`} aria-hidden="true">
          {getInitials(user?.fullName || user?.username || 'CS')}
        </div>
      )}

      {showVerified && isVerified && (
        <span
          className="verified-dot"
          title="Anggota Kampus Terverifikasi (@iti.ac.id)"
        >
          ✓
        </span>
      )}
    </div>
  );
}
