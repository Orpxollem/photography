import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/adminAuth';
import { LogOut, Home, User, Image, LayoutGrid } from 'lucide-react';

const navItems = [
  { to: '', label: 'Home Page', icon: Home },
  { to: 'about', label: 'About Page', icon: User },
  { to: 'exhibitions', label: 'Exhibitions', icon: LayoutGrid },
  { to: 'series', label: 'Series', icon: Image },
];

export function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/securez-admin-logzinz');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-lg font-light text-white tracking-wide">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Joel Gyamera Portfolio</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to || 'home'}
              to={to || '.'}
              end={to === ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-neutral-900 transition w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
