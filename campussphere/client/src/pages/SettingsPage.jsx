import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { checkServerHealth, updateMyPasswordApi } from '../services/api.js';

export default function SettingsPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [error, setError] = useState('');
  const [apiHealth, setApiHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  if (!currentUser) {
    return (
      <EmptyState
        icon="⚙️"
        title="Pengaturan Akun"
        description="Silakan masuk terlebih dahulu untuk mengelola pengaturan keamanan akun Anda."
        actionLabel="Masuk"
        onAction={() => navigate('/login')}
      />
    );
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setPasswordMsg('');
    setSubmittingPassword(true);

    try {
      await updateMyPasswordApi({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg(
        'Kata sandi Anda berhasil diperbarui di server menggunakan hashing bcrypt!'
      );
    } catch (err) {
      setError(err.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setSubmittingPassword(false);
    }
  }

  async function handleTestBackend() {
    setCheckingHealth(true);
    setError('');
    try {
      const data = await checkServerHealth();
      setApiHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingHealth(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">⚙️ Pengaturan & Keamanan Akun</h1>
          <p className="page-subtitle">
            Kelola kata sandi, informasi sesi, dan periksa koneksi server CampusSphere.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {passwordMsg && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.45)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }}
        >
          <strong style={{ color: '#34d399' }}>✅ {passwordMsg}</strong>
        </div>
      )}

      {/* Ringkasan Keamanan Akun */}
      <div className="card">
        <h2 className="card-title">🔐 Informasi Keamanan & Keanggotaan</h2>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.45rem' }}>
          <div>
            Email Kampus Terdaftar:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email}</strong>
          </div>
          <div>
            Peran Sistem:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{currentUser.role}</strong>
          </div>
          <div>
            Status Verifikasi:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {currentUser.verificationStatus}
            </strong>
          </div>
          <div>
            Mode Penyimpanan Prototipe:{' '}
            <strong style={{ color: 'var(--status-warning)' }}>
              In-Memory (Data kembali ke kondisi awal saat server restart)
            </strong>
          </div>
        </div>
      </div>

      {/* Form Ganti Password */}
      <div className="card">
        <h2 className="card-title">🔑 Ubah Kata Sandi (PATCH /api/users/me/password)</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="curr-pass">
              Kata Sandi Saat Ini
            </label>
            <input
              id="curr-pass"
              type="password"
              className="form-input"
              placeholder="Password akun sampel: KampusITI2026!"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-pass">
              Kata Sandi Baru (Minimal 8 Karakter)
            </label>
            <input
              id="new-pass"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submittingPassword}
          >
            {submittingPassword ? 'Memproses...' : 'Perbarui Kata Sandi'}
          </button>
        </form>
      </div>

      {/* Panel Diagnostik Koneksi API Backend */}
      <div className="card">
        <h2 className="card-title">🌐 Diagnostik Koneksi Server Backend (/api/health)</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
          Uji apakah server Express di <code>http://localhost:4000</code> sedang aktif dan merespons.
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleTestBackend}
          disabled={checkingHealth}
        >
          {checkingHealth ? 'Memeriksa Server...' : 'Cek Status Server Express'}
        </button>

        {apiHealth && (
          <pre
            style={{
              marginTop: '0.85rem',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              overflowX: 'auto',
              color: '#34d399',
            }}
          >
            {JSON.stringify(apiHealth, null, 2)}
          </pre>
        )}
      </div>

      {/* Sesi Keluar */}
      <div className="card">
        <h2 className="card-title">🚪 Sesi Aktif</h2>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
        >
          Keluar dari Akun (Logout)
        </button>
      </div>
    </div>
  );
}
