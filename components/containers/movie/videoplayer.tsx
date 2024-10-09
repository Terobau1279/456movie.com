'use client';
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface EmbedPlayerProps {
  id: string; // TMDb ID for the episode or movie
  isMovie: boolean; // Is it a movie or a TV show?
  episode?: number; // For TV shows: episode number
  season?: number;  // For TV shows: season number
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ id = '94997', isMovie = false, episode = 1, season = 1 }) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const apiBaseURL = "https://hehebwaiiiijqsdfioaf.vercel.app"; // Base URL for your Vidlink API

  // Fetch the HLS stream URL from the Vidlink API
  const fetchStreamUrl = async (isMovie: boolean, id: string, episode: number, season: number) => {
    try {
      const response = await fetch(`${apiBaseURL}/vidlink/watch?isMovie=${isMovie}&id=${id}&episode=${episode}&season=${season}`);
      const data = await response.json(); // Parse JSON response

      console.log('Vidlink API response:', data);

      if (data.stream && data.stream.playlist) {
        setStreamUrl(data.stream.playlist);
      } else {
        console.error('Playlist not found in response. Check the structure of the response data.');
        throw new Error('Playlist not found in response');
      }
    } catch (error) {
      console.error('Error fetching stream URL:', error);
    }
  };

  useEffect(() => {
    fetchStreamUrl(isMovie, id, episode, season); // Fetch stream URL for the specified episode or movie
  }, [id, episode, season]);

  // Initialize HLS.js player when stream URL is available
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      let hls: Hls | null = null;

      if (Hls.isSupported()) {
        hls = new Hls({
          lowLatencyMode: true, // Enable low-latency mode for faster seek time
          maxBufferLength: 120, // Aggressive buffer length for smooth seeking
          maxBufferSize: 200 * 1000 * 1000, // Larger buffer size for smoother streaming (200MB)
          maxMaxBufferLength: 240, // Max buffer length for large videos
          startLevel: -1, // Automatically start at the best available quality
          liveSyncDurationCount: 1, // Ensure minimal latency for live streams (if any)
          enableWorker: true, // Enable HLS.js worker for performance optimization
          appendErrorMaxRetry: 10, // More retries for buffer append failures
          capLevelOnFPSDrop: true, // Avoid dropping frames under high quality
          maxFragLookUpTolerance: 0.3, // Fine-tune the seeking tolerance
        });

        hls.loadSource(streamUrl); // Load the HLS stream into HLS.js
        hls.attachMedia(videoRef.current);

        // Play the video when metadata is loaded
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play();
        });

        // Handle seeking to reduce buffering when jumping around
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        });

        hls.on(Hls.Events.BUFFER_APPENDING, () => {
          console.log("Buffer is being appended to reduce buffering issues.");
        });

        // Clean up HLS instance on component unmount
        return () => {
          if (hls) hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl; // For Safari (supports HLS natively)
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play();
        });
      }
    }
  }, [streamUrl]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999 }}>
      <video ref={videoRef} controls style={{ width: '100%', height: '100%' }} preload="auto" />
    </div>
  );
};

export default EmbedPlayer;
