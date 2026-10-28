export default function SearchBar({
  value,
  onChange,
  placeholder = 'Cari nama, username, atau jurusan di ITI...',
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.45rem 0.85rem',
      }}
    >
      <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
        }}
      />
      {value && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onChange('')}
          aria-label="Bersihkan kata kunci pencarian"
        >
          Bersihkan
        </button>
      )}
    </div>
  );
}
