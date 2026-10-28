import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import CommentSection from './CommentSection.jsx';
import Modal from './Modal.jsx';
import { formatAcademicRole, formatRelativeTime } from '../utils/formatters.js';

export default function PostCard({
  post,
  author,
  usersMap,
  currentUser,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onEditPost,
  onDeletePost,
  onReportPost,
}) {
  const [showComments, setShowComments] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportNotes, setReportNotes] = useState('');

  const isLiked =
    currentUser && (post.likesUserIds || []).includes(currentUser.id);
  const isOwner = currentUser && currentUser.id === post.authorId;
  const canDelete =
    currentUser && (isOwner || currentUser.role === 'ADMIN');

  function handleSaveEdit(e) {
    e.preventDefault();
    const trimmed = editContent.trim();
    if (!trimmed) return;
    onEditPost(post.id, trimmed);
    setIsEditing(false);
  }

  function handleSubmitReport(e) {
    e.preventDefault();
    onReportPost({
      targetType: 'POST',
      targetId: post.id,
      reason: reportReason,
      notes: reportNotes.trim(),
    });
    setReportNotes('');
    setIsReporting(false);
  }

  return (
    <article className="card post-card">
      {/* Header Postingan */}
      <div className="post-header">
        <div className="post-author-meta">
          <Link to={`/profile/${author?.username || 'anggota'}`}>
            <UserAvatar user={author} size="md" />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <Link
                to={`/profile/${author?.username || 'anggota'}`}
                className="post-author-name"
              >
                {author?.fullName || 'Anggota Kampus ITI'}
              </Link>
              <span className="badge badge-role">
                {formatAcademicRole(author?.academicRole)}
              </span>
            </div>
            <div className="post-submeta">
              <span>@{author?.username}</span>
              <span>•</span>
              <span>{author?.department}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.isEdited && <span>• (Diedit)</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {isOwner && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setEditContent(post.content);
                setIsEditing(true);
              }}
              title="Edit postingan Anda"
            >
              ✏️ Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onDeletePost(post.id)}
              title="Hapus postingan"
            >
              🗑️ Hapus
            </button>
          )}
          {currentUser && !isOwner && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsReporting(true)}
              title="Laporkan postingan ini ke moderator"
            >
              🚩 Lapor
            </button>
          )}
        </div>
      </div>

      {/* Isi Teks Postingan */}
      <div className="post-content">{post.content}</div>

      {/* Lampiran Gambar Postingan */}
      {post.imageUrl && (
        <div className="post-image-wrap">
          <img
            src={post.imageUrl}
            alt="Lampiran visual postingan kampus"
            className="post-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Baris Aksi (Like & Komentar) */}
      <div className="post-actions">
        <div className="post-action-group">
          <button
            type="button"
            className={`action-pill ${isLiked ? 'liked' : ''}`}
            onClick={() => onToggleLike(post.id)}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{(post.likesUserIds || []).length} Suka</span>
          </button>

          <button
            type="button"
            className="action-pill"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <span>💬</span>
            <span>{(post.comments || []).length} Komentar</span>
          </button>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Komunitas Terverifikasi @iti.ac.id
        </span>
      </div>

      {/* Bagian Komentar */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          usersMap={usersMap}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onReportComment={onReportPost}
        />
      )}

      {/* Modal Edit Postingan */}
      <Modal
        isOpen={isEditing}
        title="Edit Postingan Anda"
        onClose={() => setIsEditing(false)}
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label" htmlFor={`edit-${post.id}`}>
              Isi Postingan
            </label>
            <textarea
              id={`edit-${post.id}`}
              className="form-textarea"
              value={editContent}
              maxLength={1000}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Laporkan Postingan */}
      <Modal
        isOpen={isReporting}
        title="Laporkan Konten ke Moderator Kampus"
        onClose={() => setIsReporting(false)}
      >
        <form onSubmit={handleSubmitReport}>
          <div className="form-group">
            <label className="form-label" htmlFor={`reason-${post.id}`}>
              Kategori Pelanggaran
            </label>
            <select
              id={`reason-${post.id}`}
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="SPAM">Spam atau Promosi Tidak Relevan</option>
              <option value="HARASSMENT">Perundungan / Ujaran Kebencian</option>
              <option value="MISINFORMATION">Informasi Palsu / Hoaks Akademik</option>
              <option value="INAPPROPRIATE">Konten Tidak Pantas di Lingkungan Kampus</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`notes-${post.id}`}>
              Keterangan Tambahan
            </label>
            <textarea
              id={`notes-${post.id}`}
              className="form-textarea"
              placeholder="Jelaskan secara singkat mengapa postingan ini melanggar etika kampus..."
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReporting(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-danger">
              Kirim Laporan Moderasi
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
