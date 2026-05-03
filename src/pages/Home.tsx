import { useEffect, useState } from 'react';

export function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const imageTranslate = scrollY * 0.35;
  const blurAmount = Math.min(scrollY / 10, 24);
  const quoteOpacity = Math.max(1 - scrollY / 700, 0.4);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - parallax image with blurred quote overlay */}
      <div className="relative h-[220vh]">
        {/* Background Image - scrolls up, blurs as user scrolls */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <img
            src="https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg"
            alt="Featured work"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: `translateY(${imageTranslate}px) scale(1.15)`,
              filter: `blur(${blurAmount}px)`,
            }}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Dark overlay intensifies with scroll */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${0.35 + Math.min(scrollY / 500, 0.55)})`,
            }}
          />
        </div>

        {/* Quote - centered, bold, fixed in viewport */}
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none">
          <div
            className="max-w-4xl px-8 text-center"
            style={{ opacity: quoteOpacity }}
          >
            <p className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              "Aside your two binocular eyes and the camera's monocular lens, you
              need a fourth eye as a photographer".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
