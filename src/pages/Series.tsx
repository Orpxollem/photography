import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Series as SeriesType } from '../lib/supabase';

export function Series() {
  const [series, setSeries] = useState<SeriesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
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
    <div className="min-h-screen bg-black pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-16">
          {series.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.5fr] gap-8 md:gap-12 items-center border-b border-white/5 pb-12 last:border-0"
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Title - Left Side */}
              <div className="min-w-0">
                <Link to={`/series/${s.id}`}>
                  <h2 className="text-4xl md:text-5xl font-light text-white leading-tight hover:text-gray-300 transition line-clamp-2">
                    {s.title}
                  </h2>
                </Link>
              </div>

              {/* Spacer/Border area that can shift */}
              <div className="hidden md:block w-px h-12 bg-white/10" />

              {/* Description - Right Side - Only visible on hover, strictly 2 lines */}
              <div className="flex items-center justify-start h-full min-w-0">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
