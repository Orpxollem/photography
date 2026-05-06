import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Series as SeriesType } from '../lib/supabase';
import * as neonApi from '../lib/neonApi';

export function Series() {
  const [series, setSeries] = useState<SeriesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await neonApi.getSeries();
        setSeries(data || []);
      } catch (err) {
        console.error('Error fetching series:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-32 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-32 max-sm:pt-24">
      <div className="max-w-7xl mx-auto px-6 max-sm:px-4">
        <div className="space-y-16 max-sm:space-y-10">
          {series.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.5fr] gap-8 md:gap-12 items-center border-b border-white/5 pb-12 last:border-0 max-sm:gap-4 max-sm:pb-8"
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Title - Left Side */}
              <div className="min-w-0">
                <Link to={`/series/${s.id}`}>
                  <h2 className="text-4xl md:text-5xl font-light text-white leading-tight hover:text-gray-300 transition line-clamp-2 max-sm:text-3xl">
                    {s.title}
                  </h2>
                </Link>
              </div>

              {/* Spacer/Border area that can shift */}
              <div className="hidden md:block w-px h-12 bg-white/10" />

              {/* Description - Right Side - Only visible on hover, strictly 2 lines */}
              <div className="hidden md:flex items-center justify-start h-full min-w-0">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    hoveredId === s.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                  }`}
                >
                  <Link
                    to={`/series/${s.id}`}
                    className="text-lg text-gray-400 leading-relaxed hover:text-white transition line-clamp-2"
                  >
                    {s.quote || s.description}
                  </Link>
                </div>
              </div>

              {/* Mobile: always show description below title */}
              <div className="md:hidden">
                <Link
                  to={`/series/${s.id}`}
                  className="text-base text-gray-400 leading-relaxed hover:text-white transition line-clamp-2"
                >
                  {s.quote || s.description}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
