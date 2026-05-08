import { useEffect, useState } from 'react';
import { type Exhibition } from '../lib/supabase';
import * as neonApi from '../lib/neonApi';
import { MapPin, Calendar } from 'lucide-react';

export function Exhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const data = await neonApi.getExhibitions();
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

  const soloExhibitions = exhibitions.filter(e => e.exhibition_type === 'solo');
  const groupExhibitions = exhibitions.filter(e => e.exhibition_type === 'group');

  const renderExhibitionList = (list: Exhibition[], baseDelay = 0) => (
    <div className="space-y-12">
      {list.length > 0 ? (
        list.map((exhibition, idx) => (
          <div
            key={exhibition.id}
            className="group animate-fade-slide-up"
            style={{ animationDelay: `${baseDelay + idx * 0.1}s` }}
          >
            <h3 className="text-xl md:text-2xl font-light text-white mb-2 group-hover:text-gray-300 transition">
              {exhibition.title}
            </h3>
            {exhibition.description && (
              <div
                className="text-gray-400 text-sm leading-relaxed mb-4 [&_strong]:font-semibold [&_strong]:text-gray-300 [&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: exhibition.description }}
              />
            )}
            <div className="space-y-2 text-gray-500 text-sm">
              {exhibition.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-600" />
                  <p>{exhibition.location}</p>
                </div>
              )}
              {exhibition.date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-600" />
                  <p>
                    {new Date(exhibition.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No exhibitions listed.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-32 pb-32 max-sm:pt-24">
      <div className="max-w-7xl mx-auto px-6 max-sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 max-sm:gap-10">
          {/* Solo Exhibitions */}
          <div className="animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-12 max-sm:text-2xl max-sm:mb-8">
              Solo Exhibitions
            </h2>
            {renderExhibitionList(soloExhibitions, 0.15)}
          </div>

          {/* Group Exhibitions */}
          <div className="animate-fade-slide-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-12 max-sm:text-2xl max-sm:mb-8">
              Group Exhibitions
            </h2>
            {renderExhibitionList(groupExhibitions, 0.25)}
          </div>
        </div>
      </div>
    </div>
  );
}
