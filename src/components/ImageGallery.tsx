import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  captions?: (string | null)[];
}

export function ImageGallery({ images, alt, captions }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastWheelTime = useRef(0);

  const goToSlide = useCallback((index: number) => {
    const nextIndex = (index % images.length + images.length) % images.length;
    setCurrentIndex(nextIndex);
    setDragOffset(0);
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    // Show arrows briefly on mount to indicate interactivity
    if (images.length > 1) {
      setShowArrows(true);
      const timer = setTimeout(() => setShowArrows(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [images.length]);

  const handleWheel = (e: React.WheelEvent) => {
    // Detect horizontal scroll/swipe
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const now = Date.now();
      // Cooldown to prevent multiple triggers from a single swipe gesture
      if (now - lastWheelTime.current < 700) return;

      if (Math.abs(e.deltaX) > 20) {
        if (e.deltaX > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
        lastWheelTime.current = now;
      }
    }
  };

  // Pure swipe tracking - no click simulation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentDragOffset = e.clientX - startX;
    setDragOffset(currentDragOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Swipe threshold - only register if moved more than 50px
    const threshold = 50;
    if (Math.abs(dragOffset) < threshold) {
      setDragOffset(0);
      return;
    }

    if (dragOffset > 0) {
      // Swiped right - go to previous
      handlePrevious();
    } else {
      // Swiped left - go to next
      handleNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentDragOffset = e.touches[0].clientX - startX;
    setDragOffset(currentDragOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    const threshold = 50;
    if (Math.abs(dragOffset) < threshold) {
      setDragOffset(0);
      return;
    }

    if (dragOffset > 0) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-120px)] max-sm:h-[calc(100vh-100px)] flex flex-col bg-black cursor-grab active:cursor-grabbing select-none group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => { handleMouseUp(); setShowArrows(false); }}
    >
      {/* Image area — flex-1 so it fills all space above the caption bar */}
      <div className="relative flex-1 overflow-hidden">
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const offset = isActive ? dragOffset : 0;

          let opacity = 0;
          if (isActive) {
            opacity = 1 - Math.abs(offset) / 500;
          }

          return (
            <div
              key={index}
              className="absolute inset-0 flex items-center justify-center p-6 max-sm:p-3"
              style={{
                opacity: Math.max(opacity, 0),
                transform: isActive ? `translateX(${offset}px)` : 'translateX(100%)',
                transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <img
                src={image}
                alt={`${alt} - Image ${index + 1}`}
                className="max-h-full w-auto object-contain shadow-2xl max-w-[70vw] max-sm:max-w-[90vw]"
                draggable={false}
              />
            </div>
          );
        })}

        {/* Animated Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              onMouseDown={(e) => e.stopPropagation()}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white/50 hover:text-white hover:bg-black/40 transition-all duration-300 pointer-events-auto z-10 max-sm:left-2 max-sm:p-2 ${showArrows ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 max-sm:w-6 max-sm:h-6 animate-pulse-horizontal-left" />
            </button>
            <button
              onClick={handleNext}
              onMouseDown={(e) => e.stopPropagation()}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white/50 hover:text-white hover:bg-black/40 transition-all duration-300 pointer-events-auto z-10 max-sm:right-2 max-sm:p-2 ${showArrows ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 max-sm:w-6 max-sm:h-6 animate-pulse-horizontal-right" />
            </button>
          </>
        )}
      </div>

      {/* Caption + Counter — genuinely below the image, never overlapping */}
      <div className="flex flex-col items-center gap-1.5 py-4 px-6 max-sm:py-3 max-sm:px-4 min-h-[56px] max-sm:min-h-[44px] pointer-events-none">
        {captions && captions[currentIndex] && (
          <p className="text-gray-300 text-lg font-medium text-center leading-relaxed max-w-2xl max-sm:text-base">
            {captions[currentIndex]}
          </p>
        )}
        {images.length > 1 && (
          <p className="text-gray-600 text-xs">
            {currentIndex + 1} of {images.length}
          </p>
        )}
      </div>
    </div>
  );
}

