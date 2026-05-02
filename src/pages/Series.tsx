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
        <div className="space-y-20">
          {series.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start py-8"
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Title - Left Side */}
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                  {s.title}
                </h2>
              </div>

              {/* Description - Right Side - Revealed on Hover */}
              <div className="flex items-start justify-end">
                {hoveredId === s.id && (
                  <Link
                    to={`/series/${s.id}`}
                    className="text-lg text-gray-300 leading-relaxed max-w-xs text-right hover:text-white transition animate-in fade-in duration-300"
                  >
                    {s.quote || s.description}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
