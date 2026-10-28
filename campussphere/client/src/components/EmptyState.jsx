export default function EmptyState({
  icon = '📭',
  title = 'Belum ada data',
  description = 'Konten yang Anda cari belum tersedia saat ini.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-box">
      <div style={{ fontSize: '2rem' }} aria-hidden="true">
        {icon}
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          maxWidth: '420px',
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ marginTop: '0.4rem' }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
