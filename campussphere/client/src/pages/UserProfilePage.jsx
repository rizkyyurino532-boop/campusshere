import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader.jsx';
import PostCard from '../components/PostCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function UserProfilePage({
  currentUser,
  users,
  usersMap,
  posts,
  followedIds,
  onToggleFollow,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onEditPost,
  onDeletePost,
  onReportPost,
}) {
  const { username } = useParams();
  const navigate = useNavigate();

  const profileUser = users.find(
    (u) => u.username.toLowerCase() === (username || '').toLowerCase()
  );

  if (!profileUser) {
    return (
      <EmptyState
        icon="👤"
        title="Profil Anggota Tidak Ditemukan"
        description={`Tidak ada anggota CampusSphere dengan username @${username}.`}
        actionLabel="Cari Anggota Lain"
        onAction={() => navigate('/search')}
      />
    );
  }

  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = followedIds.includes(profileUser.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ProfileHeader
        profileUser={profileUser}
        postsCount={userPosts.length}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onToggleFollow={onToggleFollow}
      />

      <div className="page-header-card">
        <h2 className="page-title" style={{ fontSize: '1.05rem' }}>
          📝 Riwayat Postingan ({userPosts.length})
        </h2>
      </div>

      {userPosts.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Belum ada postingan"
          description={`${profileUser.fullName} belum mempublikasikan postingan di CampusSphere.`}
        />
      ) : (
        userPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={profileUser}
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
