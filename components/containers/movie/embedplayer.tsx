'use client';
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const TMDB_API_KEY = 'a46c50a0ccb1bafe2b15665df7fad7e1'; // Your TMDB API key
const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZjNTBhMGNjYjFiYWZlMmIxNTY2NWRmN2ZhZDdlMSIsIm5iZiI6MTcyODMyNzA3Ni43OTE0NTUsInN1YiI6IjY2YTBhNTNmYmNhZGE0NjNhNmJmNjljZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BNhRdFagBrpQaazN_AWUNr_SRani4pHlYYuffuf2-Os'; // Your read access token

function EmbedPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tmdbId, setTmdbId] = useState<string | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const id = urlParts[urlParts.length - 1];
    setTmdbId(id);

    const fetchImdbId = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.status_code !== 7 && data.status_code !== 6) {
          setImdbId(data.imdb_id);
          fetchStreamUrl(data.imdb_id); // Fetch the stream URL with the IMDb ID
        } else {
          console.error('Error fetching IMDb ID:', data.status_message);
        }
      } catch (error) {
        console.error('Error fetching IMDb ID:', error);
      }
    };

    const fetchStreamUrl = async (imdbId: string) => {
      try {
        const response = await fetch(`https://8-stream-api-sable.vercel.app/api/v1/mediaInfo?id=${imdbId}`);
        const data = await response.json();

        if (data.success && data.data.playlist.length > 0) {
          setStreams(data.data.playlist); // Store the playlist

          // Fetch the first stream by default
          const firstStream = data.data.playlist[0].file;
          const key = data.data.playlist[0].key;
          await fetchStream(firstStream, key);
        }
      } catch (error) {
        console.error('Error fetching stream URL:', error);
      }
    };

    const fetchStream = async (file: string, key: string) => {
      try {
        const streamResponse = await fetch('https://8-stream-api-sable.vercel.app/api/v1/getStream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, key }),
        });

        const streamData = await streamResponse.json();
        const streamUrl = streamData.data.link;

        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play();
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = streamUrl;
          videoRef.current?.play();
        }
      } catch (error) {
        console.error('Error fetching stream URL:', error);
      }
    };

    if (tmdbId) {
      fetchImdbId(); // Fetch IMDb ID using the TMDB ID
    }
  }, [tmdbId]);

  const handleStreamChange = (file: string, key: string) => {
    setSelectedStream(file);
    fetchStream(file, key); // Fetch the selected stream
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
      {streams.length > 0 ? (
        <>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
          ></video>

          <select onChange={(e) => {
            const selected = streams[e.target.selectedIndex];
            setSelectedStream(selected.file);
            handleStreamChange(selected.file, selected.key);
          }}>
            {streams.map((stream, index) => (
              <option key={index} value={stream.file}>{stream.title}</option>
            ))}
          </select>
        </>
      ) : (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
          No streams available
        </div>
      )}

      {tmdbId && (
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '16px' }}>
          TMDB ID: {tmdbId}
        </div>
      )}
      {imdbId && (
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '16px' }}>
          IMDb ID: {imdbId}
        </div>
      )}
    </div>
  );
}

export default EmbedPlayer;
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const TMDB_API_KEY = 'a46c50a0ccb1bafe2b15665df7fad7e1'; // Your TMDB API key
const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZjNTBhMGNjYjFiYWZlMmIxNTY2NWRmN2ZhZDdlMSIsIm5iZiI6MTcyODMyNzA3Ni43OTE0NTUsInN1YiI6IjY2YTBhNTNmYmNhZGE0NjNhNmJmNjljZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BNhRdFagBrpQaazN_AWUNr_SRani4pHlYYuffuf2-Os'; // Your read access token

function EmbedPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tmdbId, setTmdbId] = useState<string | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const id = urlParts[urlParts.length - 1];
    setTmdbId(id);

    const fetchImdbId = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.status_code !== 7 && data.status_code !== 6) {
          setImdbId(data.imdb_id);
          fetchStreamUrl(data.imdb_id); // Fetch the stream URL with the IMDb ID
        } else {
          console.error('Error fetching IMDb ID:', data.status_message);
        }
      } catch (error) {
        console.error('Error fetching IMDb ID:', error);
      }
    };

    const fetchStreamUrl = async (imdbId: string) => {
      try {
        const response = await fetch(`https://8-stream-api-sable.vercel.app/api/v1/mediaInfo?id=${imdbId}`);
        const data = await response.json();

        if (data.success && data.data.playlist.length > 0) {
          setStreams(data.data.playlist); // Store the playlist

          // Fetch the first stream by default
          const firstStream = data.data.playlist[0].file;
          const key = data.data.playlist[0].key;
          await fetchStream(firstStream, key);
        }
      } catch (error) {
        console.error('Error fetching stream URL:', error);
      }
    };

    const fetchStream = async (file: string, key: string) => {
      try {
        const streamResponse = await fetch('https://8-stream-api-sable.vercel.app/api/v1/getStream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, key }),
        });

        const streamData = await streamResponse.json();
        const streamUrl = streamData.data.link;

        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play();
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = streamUrl;
          videoRef.current?.play();
        }
      } catch (error) {
        console.error('Error fetching stream URL:', error);
      }
    };

    if (tmdbId) {
      fetchImdbId(); // Fetch IMDb ID using the TMDB ID
    }
  }, [tmdbId]);

  const handleStreamChange = (file: string, key: string) => {
    setSelectedStream(file);
    fetchStream(file, key); // Fetch the selected stream
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
      {streams.length > 0 ? (
        <>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
          ></video>

          <select onChange={(e) => {
            const selected = streams[e.target.selectedIndex];
            setSelectedStream(selected.file);
            handleStreamChange(selected.file, selected.key);
          }}>
            {streams.map((stream, index) => (
              <option key={index} value={stream.file}>{stream.title}</option>
            ))}
          </select>
        </>
      ) : (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
          No streams available
        </div>
      )}

      {tmdbId && (
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '16px' }}>
          TMDB ID: {tmdbId}
        </div>
      )}
      {imdbId && (
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '16px' }}>
          IMDb ID: {imdbId}
        </div>
      )}
    </div>
  );
}

export default EmbedPlayer;
