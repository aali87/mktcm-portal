"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface WorkbookVideoPlayerProps {
  videoId: string;
  initialProgress?: number;
}

export default function WorkbookVideoPlayer({ videoId, initialProgress = 0 }: WorkbookVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch signed URL
  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        setLoading(true);
        const response = await fetch(`/api/workbook-videos/${videoId}/url`);

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const data = await response.json();
        setVideoUrl(data.url);
      } catch (err) {
        console.error('Error fetching workbook video URL:', err);
        setError('Failed to load video. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchVideoUrl();
  }, [videoId]);

  // Set initial playback position
  useEffect(() => {
    if (videoRef.current && videoUrl && initialProgress > 0) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        if (initialProgress < 90) {
          const startTime = (initialProgress / 100) * video.duration;
          video.currentTime = startTime;
        }
      };

      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoUrl, initialProgress]);

  // Update progress
  const updateProgress = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const progressPercent = (video.currentTime / video.duration) * 100;

    try {
      await fetch(`/api/workbook-videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressPercent: Math.min(progressPercent, 100),
        }),
      });
    } catch (err) {
      console.error('[WorkbookVideoPlayer] Error updating progress:', err);
    }
  }, [videoId]);

  // Track progress every 10 seconds while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handlePlay = () => {
      setHasStarted(true);

      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }

      progressUpdateIntervalRef.current = setInterval(() => {
        updateProgress();
      }, 10000);
    };

    const handlePause = () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      updateProgress();
    };

    const handleEnded = () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      updateProgress();
    };

    const handleBeforeUnload = () => {
      if (hasStarted && video.currentTime > 0) {
        const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
        const data = JSON.stringify({ progressPercent: Math.round(progressPercent) });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`/api/workbook-videos/${videoId}/progress`, blob);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && video.currentTime > 0) {
        const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
        const data = JSON.stringify({ progressPercent: Math.round(progressPercent) });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`/api/workbook-videos/${videoId}/progress`, blob);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (hasStarted && video.currentTime > 0) {
        const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
        const data = JSON.stringify({ progressPercent: Math.round(progressPercent) });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`/api/workbook-videos/${videoId}/progress`, blob);
      }

      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, [videoId, videoUrl, updateProgress, hasStarted]);

  // Disable right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-white text-lg mb-4">{error || 'Video not available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black" onContextMenu={handleContextMenu}>
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        preload="metadata"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
