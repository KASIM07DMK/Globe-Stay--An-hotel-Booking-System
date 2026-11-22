import React, { useState } from 'react';
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HotelGalleryProps {
  images: string[];
  hotelName: string;
}

export const HotelGallery: React.FC<HotelGalleryProps> = ({ images, hotelName }) => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  ];

  const heroImage = displayImages[0];
  const sideImages = displayImages.slice(1, 5);

  const openLightbox = (index: number) => {
    setActiveModalIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActiveModalIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (activeModalIndex !== null) {
      setActiveModalIndex((activeModalIndex + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
    if (activeModalIndex !== null) {
      setActiveModalIndex(
        (activeModalIndex - 1 + displayImages.length) % displayImages.length
      );
    }
  };

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200 bg-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[16/9] md:aspect-[21/9]">
          
          {/* Main Hero Image */}
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-2 relative h-full cursor-pointer overflow-hidden group"
          >
            <img
              src={heroImage}
              alt={`${hotelName} showcase`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Right Thumbnails Grid */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {sideImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                className="relative h-full cursor-pointer overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`${hotelName} view ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
            
            {/* If there are fewer than 4 side images, repeat or fill */}
            {sideImages.length < 4 &&
              [...Array(4 - sideImages.length)].map((_, i) => (
                <div
                  key={`fill-${i}`}
                  onClick={() => openLightbox(0)}
                  className="relative h-full cursor-pointer overflow-hidden group"
                >
                  <img
                    src={heroImage}
                    alt={`${hotelName} view placeholder`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
          </div>

        </div>

        {/* View all photos button */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-brand-900 text-xs font-bold flex items-center space-x-2 shadow-dropdown hover:bg-white transition"
        >
          <Images className="w-4 h-4 text-accent-600" />
          <span>View All Photos ({displayImages.length})</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {activeModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={displayImages[activeModalIndex]}
              alt={`${hotelName} photo ${activeModalIndex + 1}`}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-xs font-semibold text-slate-300">
              {activeModalIndex + 1} of {displayImages.length} &bull; {hotelName}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
