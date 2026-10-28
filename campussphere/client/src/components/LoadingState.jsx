export default function LoadingState({ message = 'Sedang memuat data kampus...' }) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {message}
      </p>
    </div>
  );
}
