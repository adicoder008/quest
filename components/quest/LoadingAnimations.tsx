// src/components/quest/LoadingAnimations.tsx
import React from 'react';
import { Loader2, Image, MapPin, CheckCircle2, X } from 'lucide-react';

export const UploadingAnimation = ({ count, total }: { count: number; total: number }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Image className="w-10 h-10 text-orange-500 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Uploading Photos
        </h3>
        <p className="text-gray-400 mb-6">
          {count} of {total} photos uploaded
        </p>
        
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">
          Please don't close this page
        </p>
      </div>
    </div>
  </div>
);

export const CreatingQuestAnimation = () => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-green-500 animate-bounce" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Creating Your Quest
        </h3>
        <p className="text-gray-400 mb-6">
          Mapping out your adventure...
        </p>
        
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  </div>
);

export const ProgressSteps = ({ 
  steps, 
  currentStep 
}: { 
  steps: string[]; 
  currentStep: number;
}) => (
  <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-700">
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;
        
        return (
          <div key={index} className="flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
              ${isCompleted ? 'bg-green-500' : ''}
              ${isCurrent ? 'bg-orange-500 animate-pulse' : ''}
              ${isPending ? 'bg-gray-700' : ''}
            `}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <span className="text-white font-semibold">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <p className={`
                font-medium transition-colors
                ${isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}
              `}>
                {step}
              </p>
            </div>
            
            {isCurrent && (
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export const PhotoUploadCard = ({ 
  photo, 
  onRemove 
}: { 
  photo: {
    preview: string;
    uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
    uploadProgress?: number;
  };
  onRemove: () => void;
}) => (
  <div className="relative group">
    <img
      src={photo.preview}
      alt="Upload preview"
      className="w-full h-48 object-cover rounded-lg"
    />
    
    {/* Overlay */}
    <div className={`
      absolute inset-0 rounded-lg flex items-center justify-center transition-opacity
      ${photo.uploadStatus === 'pending' ? 'bg-black/40' : ''}
      ${photo.uploadStatus === 'uploading' ? 'bg-black/60' : ''}
      ${photo.uploadStatus === 'success' ? 'bg-green-500/20 opacity-0 group-hover:opacity-100' : ''}
      ${photo.uploadStatus === 'error' ? 'bg-red-500/60' : ''}
    `}>
      {photo.uploadStatus === 'pending' && (
        <div className="text-white text-sm font-medium px-3 py-1 bg-black/60 rounded-full">
          Ready
        </div>
      )}
      
      {photo.uploadStatus === 'uploading' && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
          <div className="text-white text-sm font-medium">
            {photo.uploadProgress || 0}%
          </div>
        </div>
      )}
      
      {photo.uploadStatus === 'success' && (
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      )}
      
      {photo.uploadStatus === 'error' && (
        <div className="text-center text-white">
          <div className="text-lg font-semibold mb-1">Failed</div>
          <div className="text-xs">Click to retry</div>
        </div>
      )}
    </div>
    
    {/* Remove button */}
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
    >
      <X className="w-4 h-4 text-white" />
    </button>
    
    {/* Upload progress bar */}
    {photo.uploadStatus === 'uploading' && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${photo.uploadProgress || 0}%` }}
        />
      </div>
    )}
  </div>
);

export default {
  UploadingAnimation,
  CreatingQuestAnimation,
  ProgressSteps,
  PhotoUploadCard
};