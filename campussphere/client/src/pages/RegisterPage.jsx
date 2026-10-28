import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [academicRole, setAcademicRole] = useState('STUDENT');
  const [department, setDepartment] = useState('Teknik Informatika');
  const [batchYear, setBatchYear] = useState('2024');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onRegister({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        academicRole,
        department: department.trim(),
        batchYear: academicRole === 'STUDENT' ? Number(batchYear) || 2024 : null,
      });

      navigate('/verify-email');
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan akun.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="campus-pill">🎓 Pendaftaran Sivitas ITI</span>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: '0.6rem' }}>
          Buat Akun CampusSphere
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Eksklusif untuk mahasiswa, dosen, dan staf dengan email resmi{' '}
          <strong>@iti.ac.id</strong>.
        </p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-fullname">
            Nama Lengkap & Gelar (Jika Ada)
          </label>
          <input
            id="reg-fullname"
            type="text"
            className="form-input"
            placeholder="Contoh: Budi Santoso"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-username">
            Username Unik
          </label>
          <input
            id="reg-username"
            type="text"
            className="form-input"
            placeholder="budi_santoso"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
          />
          <span className="form-hint">
            Huruf kecil, angka, atau underscore (3–24 karakter).
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">
            Email Institusi (@iti.ac.id)
          </label>
          <input
            id="reg-email"
            type="email"
            className="form-input"
            placeholder="budi.santoso@iti.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">
              Peran di Kampus
            </label>
            <select
              id="reg-role"
              className="form-select"
              value={academicRole}
              onChange={(e) => setAcademicRole(e.target.value)}
            >
              <option value="STUDENT">Mahasiswa</option>
              <option value="LECTURER">Dosen</option>
              <option value="STAFF">Staf Kampus</option>
            </select>
          </div>

          {academicRole === 'STUDENT' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-batch">
                Tahun Angkatan
              </label>
              <input
                id="reg-batch"
                type="number"
                min="1984"
                max="2030"
                className="form-input"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-dept">
            Program Studi / Unit Kerja
          </label>
          <input
            id="reg-dept"
            type="text"
            className="form-input"
            placeholder="Teknik Informatika / Teknik Elektro / dll."
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">
            Kata Sandi (Minimal 8 Karakter)
          </label>
          <input
            id="reg-password"
            type="password"
            className="form-input"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting}
        >
          {submitting
            ? 'Mendaftarkan Akun...'
            : 'Daftar & Lanjut ke Verifikasi Email'}
        </button>
      </form>

      <p
        style={{
          marginTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
        }}
      >
        Sudah memiliki akun?{' '}
        <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600 }}>
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
