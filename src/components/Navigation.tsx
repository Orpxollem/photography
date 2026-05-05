import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as neonApi from '../lib/neonApi';

export function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/securez-admin-logzinz');
  const [seriesTitle, setSeriesTitle] = useState<string | null>(null);

  if (isAdmin) return null;

  useEffect(() => {
    const fetchSeriesTitle = async () => {
      if (location.pathname.startsWith('/series/')) {
        const seriesId = location.pathname.split('/series/')[1];
        if (seriesId) {
          try {
            const data = await neonApi.getSeriesById(seriesId);
            setSeriesTitle(data && data.length > 0 ? data[0].title : null);
          } catch (err) {
            console.error('Error fetching series title:', err);
            setSeriesTitle(null);
          }
        }
      } else {
        setSeriesTitle(null);
      }
    };
    fetchSeriesTitle();
  }, [location.pathname]);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/series/') && seriesTitle) {
      return seriesTitle;
    }
    switch (location.pathname) {
      case '/about':
        return 'About';
      case '/series':
        return 'Series';
      case '/exhibitions':
        return 'Exhibitions';
      default:
        return '';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isHome ? (
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-light tracking-wide text-white">
              Joel Gyamera
            </h1>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-xl font-light tracking-wide text-white hover:text-gray-300 transition"
            >
              Joel Gyamera
            </Link>
            <h2 className="text-xl font-light tracking-wide text-white">
              {getPageTitle()}
            </h2>
          </div>
        )}
      </div>
    </nav>
  );
}
