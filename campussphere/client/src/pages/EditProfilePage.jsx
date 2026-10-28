import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function EditProfilePage({ currentUser, onUpdateProfile }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [batchYear, setBatchYear] = useState(currentUser?.batchYear || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  if (!currentUser) {
    return (
      <EmptyState
        icon="🔒"
        title="Masuk Terlebih Dahulu"
        description="Anda harus masuk untuk memperbarui profil kampus Anda."
        actionLabel="Ke Halaman Login"
        onAction={() => navigate('/login')}
      />
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    setSubmitting(true);

    try {
      await onUpdateProfile({
        fullName: fullName.trim(),
        department: department.trim(),
        batchYear: batchYear ? Number(batchYear) : null,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSavedMessage(
        'Profil Anda berhasil disimpan di server CampusSphere!'
      );
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">✏️ Edit Profil Kampus</h1>
          <p className="page-subtitle">
            Perbarui identitas akademik dan biografi singkat Anda di CampusSphere.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/profile/${currentUser.username}`)}
        >
          Lihat Profil Publik
        </button>
      </div>

      <ErrorMessage message={error} />

      {savedMessage && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.45)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }}
        >
          <strong style={{ color: '#34d399' }}>✅ {savedMessage}</strong>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <UserAvatar
            user={{ ...currentUser, fullName, avatarUrl }}
            size="lg"
          />
          <div>
            <div style={{ fontWeight: 700 }}>{fullName || currentUser.fullName}</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              @{currentUser.username} • {currentUser.email}
            </div>
            <span className="form-hint">
              Email institusi dan status verifikasi dikelola oleh sistem kampus dan tidak dapat diubah sendiri.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-fullname">
              Nama Lengkap & Gelar
            </label>
            <input
              id="edit-fullname"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-dept">
                Program Studi / Departemen
              </label>
              <input
                id="edit-dept"
                type="text"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-batch">
                Tahun Angkatan (Opsional)
              </label>
              <input
                id="edit-batch"
                type="number"
                className="form-input"
                placeholder="Contoh: 2023"
                value={batchYear || ''}
                onChange={(e) => setBatchYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-avatar">
              URL Foto Profil (Opsional)
            </label>
            <input
              id="edit-avatar"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/... (Kosongkan untuk memakai inisial nama)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-bio">
              Biografi Singkat & Minat Riset/Akademik
            </label>
            <textarea
              id="edit-bio"
              className="form-textarea"
              maxLength={250}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="form-hint">{bio.length}/250 karakter</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/profile/${currentUser.username}`)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
