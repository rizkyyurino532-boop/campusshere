import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function VerifyEmailPage({
  currentUser,
  onVerifyCurrentUser,
  onResendVerification,
  onRequestManualReview,
}) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    return (
      <div className="card">
        <h1 className="page-title">Status Verifikasi Email Kampus</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Silakan masuk terlebih dahulu untuk melihat status verifikasi akun Anda.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  const isVerified = currentUser.verificationStatus === 'VERIFIED';

  async function handleVerifySubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await onVerifyCurrentUser(code.trim());
      setMessage(
        'Selamat! Akun email @iti.ac.id Anda telah diverifikasi oleh server. Sekarang Anda memiliki akses penuh ke CampusSphere.'
      );
      setCode('');
    } catch (err) {
      setError(err.message || 'Gagal memverifikasi kode.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await onResendVerification();
      setMessage(
        `Kode verifikasi 6 digit baru untuk ${currentUser.email} telah dicetak di Terminal Server Backend!`
      );
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang kode verifikasi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualReview(e) {
    e.preventDefault();
    if (!manualNote.trim()) return;
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await onRequestManualReview(manualNote.trim());
      setMessage(
        'Permohonan peninjauan manual telah disimpan di server untuk ditinjau oleh Admin Kemahasiswaan ITI.'
      );
      setManualNote('');
    } catch (err) {
      setError(err.message || 'Gagal mengirim permohonan verifikasi manual.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">🛡️ Status Verifikasi Keanggotaan ITI</h1>
          <p className="page-subtitle">
            Memastikan hanya sivitas akademika <strong>@iti.ac.id</strong> yang memiliki akses penuh.
          </p>
        </div>
        <span
          className={`badge ${
            isVerified ? 'badge-verified' : 'badge-pending'
          }`}
        >
          {isVerified ? '✓ TERVERIFIKASI' : `⏳ ${currentUser.verificationStatus}`}
        </span>
      </div>

      <ErrorMessage message={error} />

      {message && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.4)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }}
        >
          <strong style={{ color: '#34d399' }}>✅ Informasi Status Server</strong>
          <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>{message}</p>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Detail Akun Anda</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Nama: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.fullName}</strong>
          <br />
          Email Kampus: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email}</strong>
          <br />
          Program Studi / Unit: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.department}</strong>
        </p>

        {isVerified ? (
          <div style={{ marginTop: '1.25rem' }}>
            <p style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '0.85rem' }}>
              ✓ Akun Anda telah terverifikasi penuh di server. Anda memiliki akses ke Feed, Pencarian, dan Interaksi Kampus.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Buka Beranda Feed Kampus
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="verify-code">
                Masukkan Kode Verifikasi 6 Digit
              </label>
              <input
                id="verify-code"
                type="text"
                maxLength={6}
                className="form-input"
                placeholder="Salin 6 digit kode dari Terminal Backend (Akun sampel Rizky: 123456)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <span className="form-hint">
                📨 Cara Pengujian Lokal: Lihat kotak <code>[SIMULASI EMAIL INSTITUSI LOKAL]</code> di Terminal Backend Anda untuk melihat 6 digit kode OTP. (Untuk akun sampel <code>rizky.ramadhan@iti.ac.id</code>, kode awal adalah <code>123456</code>).
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Memverifikasi...' : 'Verifikasi Kode Sekarang'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={handleResend}
              >
                Kirim Ulang Kode ke Terminal
              </button>
            </div>
          </form>
        )}
      </div>

      {!isVerified && (
        <div className="card">
          <h2 className="card-title">Kasus Khusus: Ajukan Verifikasi Manual Admin</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Mengalami kendala menerima kode di kotak masuk <strong>@iti.ac.id</strong> Anda? Kirimkan catatan beserta NIM/NIDN untuk ditinjau oleh Admin Kemahasiswaan.
          </p>
          <form onSubmit={handleManualReview}>
            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="Tuliskan NIM/NIDN dan keterangan singkat (minimal 5 karakter)..."
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              disabled={submitting || manualNote.trim().length < 5}
            >
              Kirim Permohonan ke Admin
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
