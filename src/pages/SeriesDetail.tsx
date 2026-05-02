import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Series as SeriesType, type SeriesImage } from '../lib/supabase';
import { ImageGallery } from '../components/ImageGallery';
import { ChevronLeft } from 'lucide-react';

export function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<SeriesType | null>(null);
  const [images, setImages] = useState<SeriesImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeriesDetail = async () => {
      if (!id) return;

      try {
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (seriesError) throw seriesError;
        setSeries(seriesData);

        const { data: imagesData, error: imagesError } = await supabase
          .from('series_images')
          .select('*')
          .eq('series_id', id)
          .order('order', { ascending: true });

        if (imagesError) throw imagesError;
        setImages(imagesData || []);
      } catch (err) {
        console.error('Error fetching series detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-32 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-32 flex items-center justify-center">
        <p className="text-gray-400">Series not found</p>
      </div>
    );
  }

  const galleryImages = images.length > 0
    ? images.map(img => img.image_url)
    : series.image_url ? [series.image_url] : [];

  return (
    <div className="min-h-screen bg-black pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/series"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-12"
        >
          <ChevronLeft size={20} />
          Back
        </Link>

        {/* Gallery */}
        <div className="mb-12">
          <ImageGallery
            images={galleryImages}
            alt={series.title}
          />
        </div>

        {/* Description */}
        {series.quote && (
          <div className="max-w-2xl">
            <p className="text-lg text-gray-300 leading-relaxed">
              {series.quote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
