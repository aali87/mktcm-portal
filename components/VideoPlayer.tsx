"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

console.log('[VideoPlayer] MODULE LOADED - This should appear if JavaScript is running at all');

interface VideoPlayerProps {
  videoId: string;
  initialProgress?: number;
}

export default function VideoPlayer({ videoId, initialProgress = 0 }: VideoPlayerProps) {
  console.log('[VideoPlayer] COMPONENT RENDERING - videoId:', videoId, 'initialProgress:', initialProgress);

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
        const response = await fetch(`/api/videos/${videoId}/url`);

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const data = await response.json();
        setVideoUrl(data.url);
      } catch (err) {
        console.error('Error fetching video URL:', err);
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

      console.log('[VideoPlayer] Setting up initial progress:', initialProgress);

      // Wait for metadata to load before setting current time
      const handleLoadedMetadata = () => {
        console.log('[VideoPlayer] Metadata loaded, video duration:', video.duration);
        if (initialProgress < 90) {
          const startTime = (initialProgress / 100) * video.duration;
          console.log('[VideoPlayer] Setting currentTime to:', startTime, 'seconds');
          video.currentTime = startTime;
        } else {
          console.log('[VideoPlayer] Progress >= 90%, starting from beginning');
        }
      };

      // If metadata is already loaded, set currentTime immediately
      if (video.readyState >= 1) {
        console.log('[VideoPlayer] Metadata already loaded');
        handleLoadedMetadata();
      } else {
        console.log('[VideoPlayer] Waiting for metadata to load');
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
      console.log('[VideoPlayer] updateProgress called but no video ref');
      return;
    }

    const video = videoRef.current;
    const progressPercent = (video.currentTime / video.duration) * 100;

    console.log('[VideoPlayer] updateProgress called:', {
      currentTime: video.currentTime,
      duration: video.duration,
      progressPercent: Math.round(progressPercent),
    });

    try {
      const response = await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressPercent: Math.min(progressPercent, 100),
        }),
      });
      console.log('[VideoPlayer] Progress API response:', response.status, response.ok);
    } catch (err) {
      console.error('[VideoPlayer] Error updating progress:', err);
    }
  }, [videoId]);

  // Track progress every 10 seconds while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.log('[VideoPlayer] Event listener useEffect: video ref is null, waiting for video element to render');
      return;
    }

    const handlePlay = () => {
      console.log('[VideoPlayer] Play event fired');
      setHasStarted(true);

      // Clear any existing interval
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }

      // Update progress every 10 seconds
      console.log('[VideoPlayer] Starting progress interval');
      progressUpdateIntervalRef.current = setInterval(() => {
        console.log('[VideoPlayer] Interval tick - calling updateProgress');
        updateProgress();
      }, 10000);
    };

    const handlePause = () => {
      console.log('[VideoPlayer] Pause event fired - saving progress');
      // Clear interval when paused
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      // Update progress when user pauses
      updateProgress();
    };

    const handleEnded = () => {
      console.log('[VideoPlayer] Video ended - saving final progress');
      // Clear interval when video ends
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      // Mark as 100% complete
      updateProgress();
    };

    // Save progress when user navigates away or closes tab
    const handleBeforeUnload = () => {
      console.log('[VideoPlayer] Page unloading - saving progress');
      // Only save if video has started playing
      if (hasStarted && video.currentTime > 0) {
        // Use sendBeacon for reliability during page unload
        const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
        const data = JSON.stringify({ progressPercent: Math.round(progressPercent) });
        // Create a Blob with correct content type
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`/api/videos/${videoId}/progress`, blob);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('beforeunload', handleBeforeUnload);

    console.log('[VideoPlayer] Event listeners attached for videoId:', videoId);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('beforeunload', handleBeforeUnload);

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
