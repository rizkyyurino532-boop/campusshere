export default function ErrorMessage({
  title = 'Terjadi Kesalahan',
  message = 'Tidak dapat memproses permintaan Anda saat ini.',
  onRetry,
}) {
  if (!message) return null;

  return (
    <div
      className="card"
      role="alert"
      style={{
        borderColor: 'rgba(239, 68, 68, 0.45)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <strong style={{ color: '#f87171', fontSize: '0.92rem' }}>
            ⚠️ {title}
          </strong>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.86rem',
              marginTop: '0.2rem',
            }}
          >
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRetry}
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
