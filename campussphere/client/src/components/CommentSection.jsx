import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import { formatRelativeTime } from '../utils/formatters.js';

export default function CommentSection({
  postId,
  comments = [],
  usersMap = {},
  currentUser,
  onAddComment,
  onDeleteComment,
  onReportComment,
}) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(postId, trimmed);
    setText('');
  }

  return (
    <div className="comment-section">
      {comments.length === 0 ? (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Belum ada komentar. Jadilah yang pertama berdiskusi!
        </p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => {
            const author =
              comment.author ||
              usersMap[comment.authorId] || {
                fullName: 'Anggota Kampus',
                username: 'anggota',
                verificationStatus: 'VERIFIED',
              };
            const isCommentOwner =
              currentUser && currentUser.id === comment.authorId;
            const canDelete =
              currentUser &&
              (isCommentOwner || currentUser.role === 'ADMIN');

            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-main">
                  <UserAvatar user={author} size="sm" />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Link
                        to={`/profile/${author.username}`}
                        style={{ fontWeight: 600, fontSize: '0.84rem' }}
                      >
                        {author.fullName}
                      </Link>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.86rem', marginTop: '0.15rem' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {currentUser && !isCommentOwner && onReportComment && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        onReportComment({
                          targetType: 'COMMENT',
                          targetId: comment.id,
                          reason: 'INAPPROPRIATE',
                          notes: `Laporan cepat pada komentar: "${comment.content.slice(
                            0,
                            80
                          )}"`,
                        })
                      }
                      title="Laporkan komentar ini ke moderator"
                      aria-label={`Laporkan komentar dari ${author.fullName}`}
                    >
                      🚩
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDeleteComment(postId, comment.id)}
                      title="Hapus komentar"
                      aria-label={`Hapus komentar dari ${author.fullName}`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentUser?.verificationStatus === 'VERIFIED' ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Tulis komentar yang sopan dan konstruktif..."
            aria-label="Tulis komentar pada postingan ini"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!text.trim()}
          >
            Kirim
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '0.78rem', color: 'var(--status-warning)' }}>
          Hanya anggota dengan email @iti.ac.id terverifikasi yang dapat mengirim komentar.
        </p>
      )}
    </div>
  );
}
