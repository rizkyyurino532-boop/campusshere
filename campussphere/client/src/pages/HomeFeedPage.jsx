import { Link } from 'react-router-dom';
import PostComposer from '../components/PostComposer.jsx';
import PostCard from '../components/PostCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function HomeFeedPage({
  currentUser,
  posts,
  usersMap,
  onCreatePost,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onEditPost,
  onDeletePost,
  onReportPost,
}) {
  // Pembatasan Akses: Hanya anggota terverifikasi yang boleh melihat feed kampus
  if (!currentUser) {
    return (
      <EmptyState
        icon="🔒"
        title="Konten Eksklusif Sivitas Kampus ITI"
        description="Silakan masuk menggunakan akun email @iti.ac.id yang telah terverifikasi untuk melihat dan berdiskusi di Feed CampusSphere."
      />
    );
  }

  if (currentUser.verificationStatus !== 'VERIFIED') {
    return (
      <div className="card">
        <span className="badge badge-pending">⏳ Akses Terbatas</span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.5rem' }}>
          Verifikasi Email @iti.ac.id Anda Terlebih Dahulu
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
          Demi menjaga keamanan komunitas internal Institut Teknologi Indonesia, akun dengan status <strong>{currentUser.verificationStatus}</strong> belum dapat mengakses Feed Kampus.
        </p>
        <Link to="/verify-email" className="btn btn-primary">
          Selesaikan Verifikasi Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header-card">
        <div>
          <h1 className="page-title">🏠 Feed Sosial Kampus ITI</h1>
          <p className="page-subtitle">
            Diskusi, kegiatan akademik, dan kabar terbaru dari rekan-rekan terverifikasi.
          </p>
        </div>
        <span className="badge badge-verified">
          {posts.length} Postingan Aktif
        </span>
      </div>

      <PostComposer currentUser={currentUser} onCreatePost={onCreatePost} />

      {posts.length === 0 ? (
        <EmptyState
          icon="✨"
          title="Belum ada postingan di feed"
          description="Mulai percakapan pertama dengan membagikan informasi atau kegiatan kampus di atas!"
        />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={usersMap[post.authorId]}
            usersMap={usersMap}
            currentUser={currentUser}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onReportPost={onReportPost}
          />
        ))
      )}
    </div>
  );
}
