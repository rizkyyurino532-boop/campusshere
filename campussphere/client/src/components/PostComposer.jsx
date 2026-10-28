import { useState } from 'react';
import UserAvatar from './UserAvatar.jsx';

const PRESET_CAMPUS_IMAGES = [
  {
    label: 'Diskusi Kelompok Kampus',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Laboratorium Riset & Teknologi',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Perpustakaan & Ruang Baca',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
  },
];

export default function PostComposer({ currentUser, onCreatePost }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  if (!currentUser) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onCreatePost({
      content: trimmed,
      imageUrl: imageUrl.trim() || null,
    });
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
  }

  return (
    <section className="card" aria-label="Buat Postingan Kampus Baru">
      <form onSubmit={handleSubmit}>
        <div className="composer-top">
          <UserAvatar user={currentUser} size="md" />
          <div className="composer-body">
            <textarea
              className="form-textarea"
              placeholder={`Bagikan pembaruan riset, kegiatan kampus, atau diskusi kepada sivitas ITI, ${currentUser.fullName.split(' ')[0]}...`}
              value={content}
              maxLength={1000}
              onChange={(e) => setContent(e.target.value)}
            />

            {showImageInput && (
              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <label className="form-label" htmlFor="post-image-url">
                  URL Foto / Gambar Postingan (Opsional)
                </label>
                <input
                  id="post-image-url"
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="form-hint">Atau pilih foto preset kampus:</span>
                  {PRESET_CAMPUS_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setImageUrl(preset.url)}
                    >
                      📷 {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="composer-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowImageInput((prev) => !prev)}
                >
                  🖼️ {showImageInput ? 'Tutup Panel Foto' : 'Lampirkan Foto'}
                </button>
                <span className="form-hint">{content.length}/1000 karakter</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!content.trim()}
              >
                Publikasikan ke Feed ITI
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
