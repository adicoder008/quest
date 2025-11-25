// components/quest/VideoGenerationModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Video, Download, Share2, AlertCircle, Clock, Sparkles, Instagram, MessageCircle } from 'lucide-react';
import videoService from '@/lib/videoService';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questId: string;
  questData: any;
  uid: string;
}

export const VideoGenerationModal: React.FC<VideoGenerationModalProps> = ({
  isOpen,
  onClose,
  questId,
  questData,
  uid
}) => {
  const [step, setStep] = useState<'check' | 'generating' | 'completed' | 'error'>('check');
  const [credits, setCredits] = useState({ remaining: 0, resetAt: new Date() });
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkCredits();
      checkExistingVideo();
    }
  }, [isOpen, questId]);

  const checkCredits = async () => {
    try {
      const creditsData = await videoService.checkVideoCredits(uid);
      setCredits(creditsData);
    } catch (error: any) {
      console.error('Error checking credits:', error);
      setError(error.message);
      setStep('error');
    }
  };

  const checkExistingVideo = async () => {
    try {
      const existingVideo = await videoService.getQuestVideo(questId);
      if (existingVideo) {
        setVideoUrl(existingVideo);
        setStep('completed');
      }
    } catch (error) {
      console.error('Error checking existing video:', error);
    }
  };

  const startGeneration = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setStep('generating');
      setProgress(5);

      // Create video request
      const newRequestId = await videoService.createVideoRequest(uid, questId, questData);
      setRequestId(newRequestId);

      // Start video generation on backend
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: newRequestId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start video generation');
      }

      // Poll for status updates
      pollVideoStatus(newRequestId);

    } catch (error: any) {
      console.error('Error starting video generation:', error);
      setError(error.message);
      setStep('error');
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (reqId: string) => {
    const maxAttempts = 600; // 10 minutes max (600 * 1 second) - videos can take 3-5 minutes
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await videoService.getVideoStatus(reqId);

        if (!status) {
          throw new Error('Video request not found');
        }

        setProgress(status.progress || 0);

        if (status.status === 'completed' && status.videoUrl) {
          setVideoUrl(status.videoUrl);
          setStep('completed');
          setIsGenerating(false);
          return;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Video generation failed');
        }

        attempts++;
        if (attempts < maxAttempts && status.status !== 'completed') {
          setTimeout(checkStatus, 1000); // Check every second
        } else if (attempts >= maxAttempts) {
          throw new Error('Video generation timed out after 10 minutes. The video may still be processing - please check back in a few minutes.');
        }

      } catch (error: any) {
        console.error('Error polling video status:', error);
        setError(error.message);
        setStep('error');
        setIsGenerating(false);
      }
    };

    checkStatus();
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${questData.destination}-quest.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const shareToInstagram = async () => {
    if (!videoUrl) return;

    // For web, we can only provide download and copy link
    // Native apps can use Instagram's sharing API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Quest to ${questData.destination}`,
          text: `Check out my amazing quest! Created with OnQuest 🗺️`,
          url: videoUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(videoUrl);
      alert('Video link copied! You can now share it on Instagram.');
    }
  };

  const shareToWhatsApp = () => {
    if (!videoUrl) return;
    const text = encodeURIComponent(`Check out my quest to ${questData.destination}! 🗺️ ${videoUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Video size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Quest Video</h3>
              <p className="text-sm text-gray-400">Share your adventure</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* CHECK CREDITS STEP */}
          {step === 'check' && (
            <div className="space-y-6">
              {/* Credits Display */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Daily Videos Remaining</span>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-400" />
                    <span className="text-2xl font-bold text-white">{credits.remaining}</span>
                    <span className="text-gray-400">/2</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>
                    Resets at {credits.resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Video Preview Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>9:16 Instagram Reel format</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{questData.itinerary?.days?.length || 0} days of adventure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Perfect for social media sharing</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={startGeneration}
                disabled={credits.remaining === 0 || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {credits.remaining === 0 ? (
                  <>
                    <AlertCircle size={20} />
                    <span>No Credits Remaining</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Video</span>
                  </>
                )}
              </button>

              {credits.remaining === 0 && (
                <p className="text-xs text-center text-gray-500">
                  Your video credits will reset tomorrow. Come back then to generate more videos!
                </p>
              )}
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Generating your video...</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Animation */}
              <div className="flex justify-center py-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={32} className="text-orange-500" />
                  </div>
                </div>
              </div>

              <p className="text-sm text-center text-gray-400">
                This usually takes 3-5 minutes. Please don't close this window.
              </p>
            </div>
          )}

          {/* COMPLETED STEP */}
          {step === 'completed' && videoUrl && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden border-2 border-orange-500/30">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
              </div>

              {/* Success Message */}
              <div className="text-center space-y-2">
                <div className="text-3xl">🎉</div>
                <h4 className="text-lg font-bold text-white">Video Ready!</h4>
                <p className="text-sm text-gray-400">
                  Your quest video is ready to share with the world
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadVideo}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button
                  onClick={shareToInstagram}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-colors font-medium"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </button>
              </div>

              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
              >
                <MessageCircle size={18} />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          )}

          {/* ERROR STEP */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Generation Failed</h4>
                  <p className="text-sm text-gray-400">{error || 'Something went wrong'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('check');
                  setError(null);
                  checkCredits();
                }}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationModal;