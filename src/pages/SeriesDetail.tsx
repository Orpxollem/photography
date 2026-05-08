import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Series as SeriesType, type SeriesImage } from '../lib/supabase';
import { ImageGallery } from '../components/ImageGallery';
import * as neonApi from '../lib/neonApi';

export function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<SeriesType | null>(null);
  const [images, setImages] = useState<SeriesImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeriesDetail = async () => {
      if (!id) return;

      try {
        const seriesData = await neonApi.getSeriesById(id);
        setSeries(seriesData && seriesData.length > 0 ? seriesData[0] : null);

        const imagesData = await neonApi.getSeriesImages(id);
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

  const galleryCaptions = images.length > 0
    ? images.map(img => img.caption)
    : [null];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 max-sm:pt-16 max-sm:pb-8">
      <ImageGallery
        images={galleryImages}
        alt={series.title}
        captions={galleryCaptions}
      />
    </div>
  );
}
