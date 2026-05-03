import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastWheelTime = useRef(0);

  const goToSlide = useCallback((index: number) => {
    const nextIndex = (index % images.length + images.length) % images.length;
    setCurrentIndex(nextIndex);
    setDragOffset(0);
  }, [images.length]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const handlePrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

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
      className="w-full h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-black cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const offset = isActive ? dragOffset : 0;

          // Calculate opacity based on position
          let opacity = 0;
          if (isActive) {
            opacity = 1 - Math.abs(offset) / 500;
          }

          return (
            <div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
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
                className="max-h-[85vh] w-auto object-contain"
                draggable={false}
                style={{
                  maxWidth: '420px',
                  aspectRatio: '3/4',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm pointer-events-none">
          {currentIndex + 1} of {images.length}
        </div>
      )}
    </div>
  );
}
