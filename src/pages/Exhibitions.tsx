import { useEffect, useState } from 'react';
import { supabase, type Exhibition } from '../lib/supabase';
import { Calendar, MapPin } from 'lucide-react';

export function Exhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const { data, error } = await supabase
          .from('exhibitions')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setExhibitions(data || []);
      } catch (err) {
        console.error('Error fetching exhibitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
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
          {exhibitions.length > 0 ? (
            exhibitions.map((exhibition) => (
              <div key={exhibition.id} className="group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Image */}
                  {exhibition.image_url && (
                    <div className="order-2 md:order-1">
                      <img
                        src={exhibition.image_url}
                        alt={exhibition.title}
                        className="w-full aspect-square object-cover opacity-90 group-hover:opacity-100 transition duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className={exhibition.image_url ? "order-1 md:order-2" : ""}>
                    <h2 className="text-3xl md:text-4xl font-light text-white mb-4 group-hover:text-gray-300 transition">
                      {exhibition.title}
                    </h2>

                    {exhibition.description && (
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        {exhibition.description}
                      </p>
                    )}

                    <div className="space-y-3 text-gray-400">
                      {exhibition.location && (
                        <div className="flex items-center gap-3">
                          <MapPin size={18} />
                          <span>{exhibition.location}</span>
                        </div>
                      )}
                      {exhibition.date && (
                        <div className="flex items-center gap-3">
                          <Calendar size={18} />
                          <span>
                            {new Date(exhibition.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-lg">No exhibitions available at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
