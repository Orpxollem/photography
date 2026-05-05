import { Link, useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/securez-admin-logzinz');

  if (isAdmin) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-lg">
        <Link
          to="/about"
          className={`transition ${
            location.pathname === '/about'
              ? 'text-white font-light'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          About
        </Link>
        <Link
          to="/series"
          className={`transition ${
            location.pathname === '/series'
              ? 'text-white font-light'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Series
        </Link>
        <Link
          to="/exhibitions"
          className={`transition ${
            location.pathname === '/exhibitions'
              ? 'text-white font-light'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Exhibitions
        </Link>
      </div>
    </footer>
  );
}
