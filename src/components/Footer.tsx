import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SeriesItem {
  id: string;
  title: string;
}

export function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSeriesDetail = location.pathname.startsWith('/series/');
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (isSeriesDetail) {
        const seriesId = location.pathname.split('/series/')[1];
        setCurrentSeriesId(seriesId);

        const { data } = await supabase
          .from('series')
          .select('id, title')
          .order('created_at', { ascending: false });
        setSeries(data || []);
      }
    };
    fetchSeries();
  }, [location.pathname, isSeriesDetail]);

  if (isHome) {
    return null;
  }

  // Show series navigation when on a series detail page
  if (isSeriesDetail && series.length > 0) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-lg">
          {series.map((s) => (
            <Link
              key={s.id}
              to={`/series/${s.id}`}
              className={`transition ${
                currentSeriesId === s.id
                  ? 'text-white font-light'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.title}
            </Link>
          ))}
        </div>
      </footer>
    );
  }

  // Show page navigation for other pages
  const allLinks = [
    { path: '/about', label: 'About' },
    { path: '/series', label: 'Series' },
    { path: '/exhibitions', label: 'Exhibitions' },
  ];

  const navLinks = allLinks.filter(link => location.pathname !== link.path);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-lg">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-gray-400 hover:text-white transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
