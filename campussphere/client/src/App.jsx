import { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import HomeFeedPage from './pages/HomeFeedPage.jsx';
import MemberSearchPage from './pages/MemberSearchPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ModerationDashboardPage from './pages/ModerationDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import {
  addCommentApi,
  createPostApi,
  createReportApi,
  deleteCommentApi,
  deletePostApi,
  fetchAdminModerationApi,
  fetchCurrentSessionApi,
  fetchPosts,
  fetchUsersSearch,
  followUserApi,
  likePostApi,
  loginUserApi,
  logoutUserApi,
  registerUserApi,
  requestManualReviewApi,
  resendVerificationCodeApi,
  resolveAdminReportApi,
  unfollowUserApi,
  unlikePostApi,
  updateMyProfileApi,
  updatePostApi,
  updateUserVerificationAdminApi,
  verifyEmailCodeApi,
} from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  function showSuccess(msg) {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner((prev) => (prev === msg ? '' : prev));
    }, 4000);
  }

  // Memuat feed, direktori anggota, dan data moderasi (jika ADMIN) dari Express API
  const loadProtectedCampusData = useCallback(async (userObj) => {
    if (!userObj || userObj.verificationStatus !== 'VERIFIED') {
      setPosts([]);
      setUsers(userObj ? [userObj] : []);
      setReports([]);
      setPendingUsers([]);
      return;
    }

    const [fetchedUsers, fetchedPosts] = await Promise.all([
      fetchUsersSearch(),
      fetchPosts(),
    ]);
    setUsers(fetchedUsers);
    setPosts(fetchedPosts);

    if (userObj.role === 'ADMIN') {
      const adminData = await fetchAdminModerationApi();
      setReports(adminData.reports || []);
      setPendingUsers(adminData.pendingUsers || []);
    } else {
      setReports([]);
      setPendingUsers([]);
    }
  }, []);

  // Inisialisasi sesi saat aplikasi dibuka: cek GET /api/auth/me
  const initializeSession = useCallback(async () => {
    setIsLoadingInitial(true);
    setApiError('');
    try {
      let activeUser = null;
      try {
        const sessionData = await fetchCurrentSessionApi();
        activeUser = sessionData.user;
        setCurrentUser(activeUser);
        setFollowedIds(sessionData.followedIds || []);
      } catch (sessionErr) {
        if (sessionErr.status === 401) {
          const demoLogin = await loginUserApi({
            email: 'nadia.putri@iti.ac.id',
            password: 'KampusITI2026!',
          });
          activeUser = demoLogin.user;
          setCurrentUser(activeUser);
          setFollowedIds(demoLogin.followedIds || []);
        } else {
          throw sessionErr;
        }
      }

      await loadProtectedCampusData(activeUser);
    } catch (err) {
      setApiError(
        err.message ||
          'Gagal terhubung ke server Express di http://localhost:4000.'
      );
    } finally {
      setIsLoadingInitial(false);
    }
  }, [loadProtectedCampusData]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Peta cepat user berdasarkan ID
  const usersMap = useMemo(() => {
    const map = {};
    for (const u of users) {
      map[u.id] = u;
    }
    if (currentUser) {
      map[currentUser.id] = currentUser;
    }
    return map;
  }, [users, currentUser]);

  // 1. Pintasan Ganti Sesi di Dev Banner
  async function handleSwitchPreviewUser(targetEmailOrGuest) {
    try {
      if (targetEmailOrGuest === 'guest') {
        if (currentUser) {
          await logoutUserApi();
        }
        setCurrentUser(null);
        setFollowedIds([]);
        setPosts([]);
        setReports([]);
        setPendingUsers([]);
        showSuccess('Beralih ke mode Pengunjung (Guest — Sesi dihapus).');
        return;
      }

      const loginData = await loginUserApi({
        email: targetEmailOrGuest,
        password: 'KampusITI2026!',
      });
      setCurrentUser(loginData.user);
      setFollowedIds(loginData.followedIds || []);
      await loadProtectedCampusData(loginData.user);
      showSuccess(`Sesi aktif beralih ke ${loginData.user.fullName}.`);
    } catch (err) {
      showSuccess(`Gagal beralih akun: ${err.message}`);
    }
  }

  // 2. Login & Logout Nyata
  async function handleLogin({ email, password }) {
    const data = await loginUserApi({ email, password });
    setCurrentUser(data.user);
    setFollowedIds(data.followedIds || []);
    await loadProtectedCampusData(data.user);
    showSuccess(`Selamat datang kembali, ${data.user.fullName}!`);
    return data.user;
  }

  async function handleLogout() {
    try {
      await logoutUserApi();
    } catch (_err) {
      // Abaikan jika sesi sudah kedaluwarsa
    }
    setCurrentUser(null);
    setFollowedIds([]);
    setPosts([]);
    setReports([]);
    setPendingUsers([]);
    showSuccess('Sesi Anda telah diakhiri dengan aman.');
  }

  // 3. Registrasi & Verifikasi Email Kampus (@iti.ac.id)
  async function handleRegister(newUserData) {
    const data = await registerUserApi(newUserData);
    setCurrentUser(data.user);
    setFollowedIds(data.followedIds || []);
    setPosts([]);
    setUsers([data.user]);
    showSuccess(
      'Pendaftaran berhasil! Lihat kode verifikasi 6 digit di Terminal Server Backend.'
    );
    return data.user;
  }

  async function handleVerifyCurrentUser(code) {
    const data = await verifyEmailCodeApi(code);
    setCurrentUser(data.user);
    await loadProtectedCampusData(data.user);
    showSuccess('Email @iti.ac.id berhasil diverifikasi oleh server!');
    return data.user;
  }

  async function handleResendVerification() {
    return resendVerificationCodeApi();
  }

  async function handleRequestManualReview(reason) {
    const data = await requestManualReviewApi(reason);
    setCurrentUser(data.user);
    return data.user;
  }

  // 4. Fungsionalitas Sosial End-to-End (Fase 6)
  async function handleUpdateProfile(updates) {
    const updatedUser = await updateMyProfileApi(updates);
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    showSuccess('Profil berhasil diperbarui di server.');
    return updatedUser;
  }

  async function handleToggleFollow(targetUserId) {
    if (!currentUser || currentUser.id === targetUserId) return;
    try {
      const isAlreadyFollowing = followedIds.includes(targetUserId);
      const result = isAlreadyFollowing
        ? await unfollowUserApi(targetUserId)
        : await followUserApi(targetUserId);

      setFollowedIds(result.followedIds || []);
      const refreshedUsers = await fetchUsersSearch();
      setUsers(refreshedUsers);
      const meUpdated = refreshedUsers.find((u) => u.id === currentUser.id);
      if (meUpdated) setCurrentUser(meUpdated);
    } catch (err) {
      showSuccess(`Gagal memproses follow: ${err.message}`);
    }
  }

  async function handleCreatePost({ content, imageUrl }) {
    try {
      const createdPost = await createPostApi({ content, imageUrl });
      setPosts((prev) => [createdPost, ...prev]);
      showSuccess('Postingan baru berhasil dipublikasikan ke Feed ITI!');
    } catch (err) {
      showSuccess(`Gagal membuat postingan: ${err.message}`);
    }
  }

  async function handleEditPost(postId, newContent) {
    try {
      const updatedPost = await updatePostApi(postId, { content: newContent });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p))
      );
      showSuccess('Postingan berhasil diperbarui di server.');
    } catch (err) {
      showSuccess(`Gagal mengedit postingan: ${err.message}`);
    }
  }

  async function handleDeletePost(postId) {
    try {
      await deletePostApi(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showSuccess('Postingan telah dihapus dari server.');
    } catch (err) {
      showSuccess(`Gagal menghapus postingan: ${err.message}`);
    }
  }

  async function handleToggleLike(postId) {
    if (!currentUser) return;
    try {
      const targetPost = posts.find((p) => p.id === postId);
      const isLiked = (targetPost?.likesUserIds || []).includes(currentUser.id);
      const updatedPost = isLiked
        ? await unlikePostApi(postId)
        : await likePostApi(postId);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p))
      );
    } catch (err) {
      showSuccess(`Gagal memperbarui suka: ${err.message}`);
    }
  }

  async function handleAddComment(postId, content) {
    try {
      const updatedPost = await addCommentApi(postId, content);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p))
      );
    } catch (err) {
      showSuccess(`Gagal mengirim komentar: ${err.message}`);
    }
  }

  async function handleDeleteComment(postId, commentId) {
    try {
      const result = await deleteCommentApi(commentId);
      if (result?.post) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? result.post : p))
        );
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: (p.comments || []).filter(
                    (c) => c.id !== commentId
                  ),
                }
              : p
          )
        );
      }
      showSuccess('Komentar berhasil dihapus.');
    } catch (err) {
      showSuccess(`Gagal menghapus komentar: ${err.message}`);
    }
  }

  // 5. Pelaporan & Moderasi Admin End-to-End (Fase 7)
  async function handleReportPost(reportPayload) {
    try {
      await createReportApi(reportPayload);
      if (currentUser?.role === 'ADMIN') {
        const adminData = await fetchAdminModerationApi();
        setReports(adminData.reports || []);
      }
      showSuccess(
        'Laporan pelanggaran berhasil dikirim ke server Tim Moderasi ITI.'
      );
    } catch (err) {
      showSuccess(`Gagal mengirim laporan: ${err.message}`);
    }
  }

  async function handleResolveReport(reportId, newStatus, removeTarget) {
    try {
      await resolveAdminReportApi(reportId, {
        status: newStatus,
        removeTarget,
      });
      await loadProtectedCampusData(currentUser);
      showSuccess(`Laporan berhasil diperbarui menjadi ${newStatus}.`);
    } catch (err) {
      showSuccess(`Gagal menindaklanjuti laporan: ${err.message}`);
    }
  }

  async function handleApproveUserVerification(userId, newStatus) {
    try {
      await updateUserVerificationAdminApi(userId, newStatus);
      await loadProtectedCampusData(currentUser);
      showSuccess(`Status verifikasi anggota diperbarui menjadi ${newStatus}.`);
    } catch (err) {
      showSuccess(`Gagal mengubah status verifikasi: ${err.message}`);
    }
  }

  if (isLoadingInitial) {
    return (
      <div className="setup-container">
        <LoadingState message="Memeriksa sesi keamanan & memuat komunitas @iti.ac.id..." />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="setup-container">
        <ErrorMessage
          title="Gagal Memuat Data dari Backend Express"
          message={apiError}
          onRetry={initializeSession}
        />
      </div>
    );
  }

  return (
    <>
      {successBanner && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 80,
            backgroundColor: '#065f46',
            color: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 1rem',
            fontSize: '0.86rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-modal)',
          }}
        >
          ✅ {successBanner}
        </div>
      )}

      <Routes>
        {/* Rute Autentikasi (AuthLayout) */}
        <Route
          element={
            <AuthLayout
              currentUser={currentUser}
              users={users}
              onSwitchPreviewUser={handleSwitchPreviewUser}
              onLogout={handleLogout}
            />
          }
        >
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={<RegisterPage onRegister={handleRegister} />}
          />
        </Route>

        {/* Rute Aplikasi Utama 3 Kolom (MainLayout) */}
        <Route
          element={
            <MainLayout
              currentUser={currentUser}
              users={users}
              followedIds={followedIds}
              onSwitchPreviewUser={handleSwitchPreviewUser}
              onToggleFollow={handleToggleFollow}
              onLogout={handleLogout}
            />
          }
        >
          <Route
            path="/"
            element={
              <HomeFeedPage
                currentUser={currentUser}
                posts={posts}
                usersMap={usersMap}
                onCreatePost={handleCreatePost}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onReportPost={handleReportPost}
              />
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmailPage
                currentUser={currentUser}
                onVerifyCurrentUser={handleVerifyCurrentUser}
                onResendVerification={handleResendVerification}
                onRequestManualReview={handleRequestManualReview}
              />
            }
          />
          <Route
            path="/search"
            element={
              <MemberSearchPage
                currentUser={currentUser}
                users={users}
                followedIds={followedIds}
                onToggleFollow={handleToggleFollow}
              />
            }
          />
          <Route
            path="/profile/edit"
            element={
              <EditProfilePage
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            }
          />
          <Route
            path="/profile/:username"
            element={
              <UserProfilePage
                currentUser={currentUser}
                users={users}
                usersMap={usersMap}
                posts={posts}
                followedIds={followedIds}
                onToggleFollow={handleToggleFollow}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onReportPost={handleReportPost}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage currentUser={currentUser} onLogout={handleLogout} />
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ModerationDashboardPage
                currentUser={currentUser}
                reports={reports}
                pendingUsers={pendingUsers}
                usersMap={usersMap}
                posts={posts}
                onResolveReport={handleResolveReport}
                onApproveUserVerification={handleApproveUserVerification}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
