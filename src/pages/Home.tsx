import { useEffect, useState } from 'react';
import * as neonApi from '../lib/neonApi';

export function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quote, setQuote] = useState('');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await neonApi.getSettings();
        data.forEach((row: any) => {
          if (row.key === 'home_quote') setQuote(row.value);
          if (row.key === 'home_image') setHeroImage(row.value);
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const imageTranslate = scrollY * 0.35;
  const blurAmount = Math.min(scrollY / 10, 24);
  

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-[220vh] max-sm:h-[180vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {heroImage && (
            <img
              src={heroImage}
              alt="Featured work"
              className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transform: `translateY(${imageTranslate}px) scale(1.15)`,
                filter: `blur(${blurAmount}px)`,
              }}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${0.35 + Math.min(scrollY / 500, 0.55)})`,
            }}
          />
        </div>

        {quote && (
          <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none">
            <div
              className="max-w-[94%] px-4 text-center"
            >
              <p className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight max-sm:text-2xl">
                "{quote}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
