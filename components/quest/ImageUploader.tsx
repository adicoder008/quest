// file: components/quest/ImageUploader.tsx
'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  label: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, label }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div
        className="relative w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 p-1.5 rounded-full text-white hover:bg-opacity-75"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <Camera size={32} className="mx-auto" />
            <p className="mt-2 text-sm">Tap to select an image</p>
          </div>
        )}
      </div>
    </div>
  );
};