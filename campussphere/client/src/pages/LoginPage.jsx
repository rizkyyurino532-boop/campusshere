import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';

const DEMO_ACCOUNTS = [
  { label: 'nadia_putri (Mahasiswa • VERIFIED)', email: 'nadia.putri@iti.ac.id' },
  { label: 'dr_hendrawan (Dosen • VERIFIED)', email: 'hendrawan@iti.ac.id' },
  { label: 'admin_kampus (ADMIN • VERIFIED)', email: 'kemahasiswaan@iti.ac.id' },
  { label: 'rizky_ramadhan (Mahasiswa • PENDING)', email: 'rizky.ramadhan@iti.ac.id' },
];

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nadia.putri@iti.ac.id');
  const [password, setPassword] = useState('KampusITI2026!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await onLogin({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loggedInUser.verificationStatus === 'VERIFIED') {
        navigate('/');
      } else {
        navigate('/verify-email');
      }
    } catch (err) {
      setError(err.message || 'Gagal masuk ke CampusSphere.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="campus-pill">🎓 Institut Teknologi Indonesia</span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: '0.6rem' }}>
          Masuk ke CampusSphere
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Gunakan akun email institusi <strong>@iti.ac.id</strong> Anda.
        </p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Email Institusi Kampus
          </label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            placeholder="nama.mahasiswa@iti.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            Kata Sandi (Password)
          </label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.25rem' }}
          disabled={submitting}
        >
          {submitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Komunitas Kampus'}
        </button>
      </form>

      {/* Pintasan Akun Sampel Pengembangan */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p className="form-hint" style={{ marginBottom: '0.5rem' }}>
          🧪 <strong>Akun Sampel In-Memory (Password: KampusITI2026!):</strong> Klik untuk mengisi otomatis:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setEmail(acc.email);
                setPassword('KampusITI2026!');
              }}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <p
        style={{
          marginTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
        }}
      >
        Belum punya akun kampus?{' '}
        <Link to="/register" style={{ color: '#a5b4fc', fontWeight: 600 }}>
          Daftar dengan Email @iti.ac.id
        </Link>
      </p>
    </div>
  );
}
