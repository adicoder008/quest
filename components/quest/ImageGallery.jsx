import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      {/* Thumbnail view */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Gallery ${index}`}
            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
              index === currentIndex ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Main image */}
      <div className="relative mt-2 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Gallery ${currentIndex}`}
          className="w-full h-64 object-cover cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Fullscreen view */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <FiX size={24} />
          </button>
          <div className="relative max-w-4xl w-full">
            <img
              src={images[currentIndex]}
              alt={`Gallery ${currentIndex}`}
              className="w-full max-h-screen object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;