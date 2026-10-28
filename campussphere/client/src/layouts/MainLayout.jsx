import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function MainLayout({
  currentUser,
  users,
  followedIds,
  onSwitchPreviewUser,
  onToggleFollow,
  onLogout,
}) {
  const suggestedUsers = (users || []).filter(
    (u) => u.id !== currentUser?.id && u.verificationStatus === 'VERIFIED'
  );

  return (
    <div>
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchPreviewUser={onSwitchPreviewUser}
        onLogout={onLogout}
      />

      <div className="app-shell">
        <Sidebar position="left" currentUser={currentUser} />

        <main className="feed-column">
          <Outlet />
        </main>

        <Sidebar
          position="right"
          currentUser={currentUser}
          suggestedUsers={suggestedUsers}
          followedIds={followedIds}
          onToggleFollow={onToggleFollow}
        />
      </div>

      {/* Navigasi Bawah Responsif untuk Layar HP (Mobile) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Mobile">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span>🏠</span>
          <span>Beranda</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span>🔍</span>
          <span>Cari</span>
        </NavLink>
        <NavLink
          to={currentUser ? `/profile/${currentUser.username}` : '/login'}
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span>👤</span>
          <span>Profil</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span>⚙️</span>
          <span>Setelan</span>
        </NavLink>
      </nav>
    </div>
  );
}
