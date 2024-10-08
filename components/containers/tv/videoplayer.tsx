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

const TMDB_API_KEY = 'a46c50a0ccb1bafe2b15665df7fad7e1'; // Using your original TMDB API key

const obfuscatedVideoSources = {
  vidlinkpro: atob("aHR0cHM6Ly92aWRsaW5rLnByby90di8="),
  // Add other sources here...
};

type VideoSourceKey =
  | "vidlinkpro"
  | "newApi";

type Stream = {
  file: string;
  title: string;
  key?: string;
};

export default function VideoPlayer({ id }: { id: string }) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(true);
  const [tvTitle, setTvTitle] = useState("");
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("1");
  const [episodes, setEpisodes] = useState([]);
  const [episode, setEpisode] = useState("1");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualityLevels, setQualityLevels] = useState<{ level: number, label: string }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `${obfuscatedVideoSources["vidlinkpro"]}${id}/${season}/${episode}`,
    newApi: "",
  };

  useEffect(() => {
    const fetchTvDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
        );
        const data = await response.json();
        setTvTitle(data.name || "Unknown TV Show");
        setImdbId(data.external_ids.imdb_id);

        if (data.seasons.length > 0) {
          setSeasons(data.seasons);
          setSeason(data.seasons[0].season_number.toString());
        }

        if (data.external_ids.imdb_id) {
          fetchStreamUrl(data.external_ids.imdb_id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching TV details:", error);
        setLoading(false);
      }
    };
    fetchTvDetails();
  }, [id]);

  useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  const fetchEpisodes = async (seasonNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setEpisodes(data.episodes || []);
      if (data.episodes.length > 0) {
        setEpisode(data.episodes[0].episode_number.toString());
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamUrl = async (imdbId: string) => {
    try {
      const response = await fetch(`https://8-stream-api-sable.vercel.app/api/v1/mediaInfo?id=${imdbId}`);
      const data = await response.json();

      if (data.success && data.data.playlist.length > 0) {
        const seasonData = data.data.playlist.find(
          (season: any) => season.id === season
        );

        if (seasonData) {
          const episodeData = seasonData.folder.find(
            (ep: any) => ep.episode === episode
          );

          if (episodeData) {
            const englishStream = episodeData.folder.find(
              (stream: Stream) => stream.title === "English"
            );

            if (englishStream) {
              setSelectedSource("newApi");
              await fetchStream(englishStream.file, data.data.key);
            }
          }
        }
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
      if (!streamData || !streamData.data || !streamData.data.link) {
        throw new Error('Invalid stream data');
      }

      const streamUrl = streamData.data.link;

      if (Hls.isSupported() && videoRef.current) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        hlsRef.current = new Hls({
          autoStartLoad: true,
          startLevel: -1, // Start with the highest quality
        });

        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.attachMedia(videoRef.current);
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          if (hlsRef.current) {
            const levels = hlsRef.current.levels;
            const availableQualities = levels.map((level, index) => ({
              level: index,
              label: `${level.height}p`
            }));

            setQualityLevels(availableQualities);

            // Set default quality to the maximum available
            const maxQualityIndex = levels.reduce((maxIndex, level, index) => 
              level.height > levels[maxIndex].height ? index : maxIndex, 0);
            hlsRef.current.currentLevel = maxQualityIndex;
            setSelectedQuality(maxQualityIndex);

            videoRef.current?.play();
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        videoRef.current?.play();
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setSelectedQuality(level);
    }
  };

  useEffect(() => {
    if (selectedSource === "newApi" && imdbId) {
      fetchStreamUrl(imdbId);
    }
  }, [selectedSource, imdbId]);

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
          <h2 className="text-lg font-semibold">{tvTitle}</h2>
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
              <video
                ref={videoRef}
                controls
                className="w-full h-[450px]"
              />
              {qualityLevels.length > 0 && (
                <div className="mt-4">
                  <Select
                    value={selectedQuality.toString()}
                    onValueChange={(value) => handleQualityChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityLevels.map(({ level, label }) => (
                        <SelectItem key={level} value={level.toString()}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
