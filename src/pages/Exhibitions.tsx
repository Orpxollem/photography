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

  const renderExhibitionList = (list: Exhibition[]) => (
    <div className="space-y-12">
      {list.length > 0 ? (
        list.map((exhibition) => (
          <div key={exhibition.id} className="group">
            <h3 className="text-xl md:text-2xl font-light text-white mb-2 group-hover:text-gray-300 transition">
              {exhibition.title}
            </h3>
            {exhibition.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {exhibition.description}
              </p>
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
    <div className="min-h-screen bg-black pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Solo Exhibitions */}
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-12">
              Solo Exhibitions
            </h2>
            {renderExhibitionList(soloExhibitions)}
          </div>

          {/* Group Exhibitions */}
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-12">
              Group Exhibitions
            </h2>
            {renderExhibitionList(groupExhibitions)}
          </div>
        </div>
      </div>
    </div>
  );
}
