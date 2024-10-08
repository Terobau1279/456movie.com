"use client";
import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const TMDB_API_KEY = 'a46c50a0ccb1bafe2b15665df7fad7e1';
const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZjNTBhMGNjYjFiYWZlMmIxNTY2NWRmN2ZhZDdlMSIsIm5iZiI6MTcyODMyNzA3Ni43OTE0NTUsInN1YiI6IjY2YTBhNTNmYmNhZGE0NjNhNmJmNjljZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BNhRdFagBrpQaazN_AWUNr_SRani4pHlYYuffuf2-Os';

const obfuscatedVideoSources = {
  vidlinkpro: atob("aHR0cHM6Ly92aWRsaW5rLnByby9tb3ZpZS8="),
  vidsrccc: atob("aHR0cHM6Ly92aWRzcmMuY2MvdjMvZW1iZWQvbW92aWUv"),
  vidsrcpro: atob("aHR0cHM6Ly92aWRzcmMucHJvL2VtYmVkL21vdmllLw=="),
  superembed: atob("aHR0cHM6Ly9tdWx0aWVtYmVkLm1vdi8/dmlkZW9faWQ9"),
  vidbinge4K: atob("aHR0cHM6Ly92aWRiaW5nZS5kZXYvZW1iZWQvbW92aWUv"),
  smashystream: atob("aHR0cHM6Ly9wbGF5ZXIuc21hc2h5LnN0cmVhbS9tb3ZpZS8="),
  vidsrcicu: atob("aHR0cHM6Ly92aWRzcmMuaWN1L2VtYmVkL21vdmllLw=="),
  vidsrcnl: atob("aHR0cHM6Ly9wbGF5ZXIudmlkc3JjLm5sL2VtYmVkL21vdmllLw=="),
  nontongo: atob("aHR0cHM6Ly93d3cubm9udG9uZ28ud2luL2VtYmVkL21vdmllLw=="),
  vidsrcxyz: atob("aHR0cHM6Ly92aWRzcmMueHl6L2VtYmVkL21vdmllP3RtZGI9"),
  embedccMovie: atob("aHR0cHM6Ly93d3cuMmVtYmVkLmNjL2VtYmVkLw=="),
  twoembed: atob("aHR0cHM6Ly8yZW1iZWQub3JnL2VtYmVkL21vdmllLw=="),
  vidsrctop: atob("aHR0cHM6Ly9lbWJlZC5zdS9lbWJlZC9tb3ZpZS8="),
};

type VideoSourceKey =
  | "vidlinkpro"
  | "vidsrccc"
  | "vidsrcpro"
  | "superembed"
  | "vidbinge4K"
  | "smashystream"
  | "vidsrcicu"
  | "vidsrcnl"
  | "nontongo"
  | "vidsrcxyz"
  | "embedccMovie"
  | "twoembed"
  | "vidsrctop"
  | "newApi";

type Stream = {
  file: string;
  title: string;
  key?: string;
};

export default function VideoPlayer({ id }: { id: string }) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidsrctop");
  const [loading, setLoading] = useState(true);
  const [movieTitle, setMovieTitle] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string>("");
  const hlsRef = useRef<Hls | null>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `${obfuscatedVideoSources["vidlinkpro"]}${id}`,
    vidsrccc: `${obfuscatedVideoSources["vidsrccc"]}${id}`,
    vidsrcpro: `${obfuscatedVideoSources["vidsrcpro"]}${id}`,
    superembed: `${obfuscatedVideoSources["superembed"]}${id}&tmdb=1`,
    vidbinge4K: `${obfuscatedVideoSources["vidbinge4K"]}${id}`,
    smashystream: `${obfuscatedVideoSources["smashystream"]}${id}`,
    vidsrcicu: `${obfuscatedVideoSources["vidsrcicu"]}${id}`,
    vidsrcnl: `${obfuscatedVideoSources["vidsrcnl"]}${id}?server=hindi`,
    nontongo: `${obfuscatedVideoSources["nontongo"]}${id}`,
    vidsrcxyz: `${obfuscatedVideoSources["vidsrcxyz"]}${id}`,
    embedccMovie: `${obfuscatedVideoSources["embedccMovie"]}${id}`,
    twoembed: `${obfuscatedVideoSources["twoembed"]}${id}`,
    vidsrctop: `${obfuscatedVideoSources["vidsrctop"]}${id}`,
    newApi: "",
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        setMovieTitle(data.title || "Unknown Movie");
        setImdbId(data.imdb_id);

        if (data.imdb_id && selectedSource === "newApi") {
          fetchStreamUrl(data.imdb_id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id, selectedSource]);

  const fetchStreamUrl = async (imdbId: string) => {
    try {
      const response = await fetch(`https://8-stream-api-sable.vercel.app/api/v1/mediaInfo?id=${imdbId}`);
      const data = await response.json();

      if (data.success && data.data.playlist.length > 0) {
        setStreams(data.data.playlist);

        // Default to English stream
        const englishStream = data.data.playlist.find((stream: Stream) => stream.title === "English");
        const defaultStream = englishStream || data.data.playlist[0];
        setSelectedStream(defaultStream.file);
        await fetchStream(defaultStream.file, data.data.key);
      }
    } catch (error) {
      console.error('Error fetching stream URL:', error);
    }
  };

  const fetchStream = async (file: string, key?: string) => {
    try {
      const streamResponse = await fetch('https://8-stream-api-sable.vercel.app/api/v1/getStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, key }),
      });

      const streamData = await streamResponse.json();
      const streamUrl = streamData.data.link;

      if (Hls.isSupported() && videoRef.current) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        hlsRef.current = new Hls();
        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.attachMedia(videoRef.current);
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play();
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        videoRef.current?.play();
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  };

  const handleStreamChange = async (file: string, key?: string) => {
    setSelectedStream(file);
    await fetchStream(file, key || "");
  };

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="video-player max-w-3xl mx-auto px-4 pt-6">
      {loading ? (
        <Skeleton className="h-[450px] w-full" />
      ) : (
        <>
          <h2 className="text-lg font-semibold">{movieTitle}</h2>
          <div className="w-full mb-4">
            <Select
              value={selectedSource}
              onValueChange={(value) => setSelectedSource(value as VideoSourceKey)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(videoSources).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSource === "newApi" ? (
            <div>
              {streams.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2">Available Streams:</h3>
                  <Select
                    value={selectedStream}
                    onValueChange={(value) => {
                      const stream = streams.find((s) => s.file === value);
                      if (stream) handleStreamChange(stream.file, stream.key);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.map((stream) => (
                        <SelectItem key={stream.title} value={stream.file}>
                          {stream.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                className="w-full h-[450px]"
              />
            </div>
          ) : (
            <iframe
              src={videoSources[selectedSource]}
              allowFullScreen
              width="100%"
              height="450"
              scrolling="no"
              className="w-full"
            />
          )}
        </>
      )}
    </div>
  );
}
