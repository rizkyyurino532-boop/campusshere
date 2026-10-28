import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatAcademicRole } from '../utils/formatters.js';

export default function MemberSearchPage({
  currentUser,
  users = [],
  followedIds = [],
  onToggleFollow,
}) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.academicRole === roleFilter;
    const q = query.trim().toLowerCase();
    if (!q) return matchesRole;
    return (
      matchesRole &&
      (u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">🔍 Direktori & Pencarian Sivitas ITI</h1>
          <p className="page-subtitle">
            Temukan mahasiswa, dosen, dan staf lintas program studi di Institut Teknologi Indonesia.
          </p>
        </div>
        <span className="badge badge-role">{filteredUsers.length} Anggota</span>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Cari nama lengkap, @username, atau program studi (misal: Informatika, Elektro)..."
        />

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'Semua Peran' },
            { key: 'STUDENT', label: 'Mahasiswa' },
            { key: 'LECTURER', label: 'Dosen' },
            { key: 'STAFF', label: 'Staf Kampus' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${
                roleFilter === tab.key ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setRoleFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="Anggota tidak ditemukan"
          description={`Tidak ada anggota kampus yang cocok dengan kata kunci "${query}".`}
          actionLabel="Reset Pencarian"
          onAction={() => {
            setQuery('');
            setRoleFilter('ALL');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredUsers.map((member) => {
            const isFollowing = followedIds.includes(member.id);
            const isMe = currentUser?.id === member.id;

            return (
              <div
                key={member.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Link to={`/profile/${member.username}`}>
                    <UserAvatar user={member} size="md" />
                  </Link>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/profile/${member.username}`}
                        style={{ fontWeight: 700, fontSize: '0.96rem' }}
                      >
                        {member.fullName}
                      </Link>
                      <span className="badge badge-role">
                        {formatAcademicRole(member.academicRole)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      @{member.username} • {member.department}
                    </p>
                    {member.bio && (
                      <p style={{ fontSize: '0.84rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/profile/${member.username}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Lihat Profil
                  </Link>
                  {!isMe && currentUser && (
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        isFollowing ? 'btn-secondary' : 'btn-primary'
                      }`}
                      onClick={() => onToggleFollow(member.id)}
                    >
                      {isFollowing ? '✓ Mengikuti' : '+ Ikuti'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
