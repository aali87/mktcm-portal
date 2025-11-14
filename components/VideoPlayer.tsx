"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  initialProgress?: number;
}

export default function VideoPlayer({ videoId, initialProgress = 0 }: VideoPlayerProps) {
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

      // Wait for metadata to load before setting current time
      const handleLoadedMetadata = () => {
        if (initialProgress < 90) {
          const startTime = (initialProgress / 100) * video.duration;
          video.currentTime = startTime;
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoUrl, initialProgress]);

  // Update progress
  const updateProgress = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const progressPercent = (video.currentTime / video.duration) * 100;

    try {
      await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressPercent: Math.min(progressPercent, 100),
        }),
      });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  // Track progress every 10 seconds while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setHasStarted(true);

      // Clear any existing interval
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }

      // Update progress every 10 seconds
      progressUpdateIntervalRef.current = setInterval(() => {
        updateProgress();
      }, 10000);
    };

    const handlePause = () => {
      // Clear interval when paused
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      // Update progress when user pauses
      updateProgress();
    };

    const handleEnded = () => {
      // Clear interval when video ends
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
        progressUpdateIntervalRef.current = null;
      }

      // Mark as 100% complete
      updateProgress();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);

      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, [videoId]);

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
