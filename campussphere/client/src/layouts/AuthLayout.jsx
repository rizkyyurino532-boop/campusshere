import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function AuthLayout({
  currentUser,
  users,
  onSwitchPreviewUser,
  onLogout,
}) {
  return (
    <div>
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchPreviewUser={onSwitchPreviewUser}
        onLogout={onLogout}
      />
      <main className="auth-wrapper">
        <div className="auth-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
