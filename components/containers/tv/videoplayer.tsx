"use client";
import * as React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import Link from "next/link";
import Hls from "hls.js";
import { API_KEY } from "@/config/url";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

interface Episode {
  episode_number: number;
  name: string;
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [season, setSeason] = React.useState("1");
  const [episode, setEpisode] = React.useState("1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [streamUrl, setStreamUrl] = React.useState<string | null>(null);
  const [isStreamLoading, setIsStreamLoading] = React.useState(false);
  const [streamError, setStreamError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  let hls: Hls | null = null;

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    if (episode) {
      fetchStreamUrl();
    }
  }, [episode]);

  React.useEffect(() => {
    if (streamUrl && videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls({
          // Optimal HLS.js settings for smooth streaming
          maxBufferLength: 60 * 10, // Buffer for 10 minutes of video
          maxBufferSize: 300 * 1000 * 1000, // Increase buffer size to 300MB
          maxMaxBufferLength: 60 * 20, // Max buffer length set to 20 minutes
          liveSyncDurationCount: 4, // Better live sync duration
          capLevelToPlayerSize: true, // Adjust quality to match player's size
          startLevel: -1, // Automatically start with the best quality
          autoStartLoad: true, // Start loading automatically
          lowLatencyMode: true, // Enable low-latency mode for quick streaming
          maxLoadingDelay: 4, // Reduce delay in loading next segments
          liveMaxLatencyDuration: 2, // Reduce live latency for faster streams
          highBufferWatchdogPeriod: 2, // Flush buffers more aggressively to avoid clogging
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("A network error occurred. Retrying...");
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("A media error occurred. Retrying...");
                break;
              default:
                console.error("An unknown error occurred.");
                break;
            }
            setStreamError("Error loading stream. Retrying...");
            setTimeout(() => fetchStreamUrl(), 5000); // Retry after 5 seconds
          }
        });
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [streamUrl]);

  async function fetchSeasons() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`);
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.status_message || "Failed to fetch seasons");
      }
      const relevantSeasons = data.seasons.filter((s: any) => s.season_number > 0);
      setSeasons(relevantSeasons || []);
      if (relevantSeasons.length > 0) {
        setSeason(relevantSeasons[0].season_number.toString());
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
      setSeasons([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEpisodes(seasonNumber: number) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
      );
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.status_message || "Failed to fetch episodes");
      }
      setEpisodes(data.episodes || []);
      if (data.episodes.length > 0) {
        setEpisode(data.episodes[0].episode_number.toString());
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
      setEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStreamUrl() {
    setIsStreamLoading(true);
    setStreamError(null);
    try {
      const res = await fetch(
        `https://hehebwaiiiijqsdfioaf.vercel.app/vidlink/watch?isMovie=false&id=${id}&episode=${episode}&season=${season}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch stream.");
      }
      const data = await res.json();
      setStreamUrl(data.stream.playlist);
    } catch (error: unknown) {
      setStreamUrl(null);
      setStreamError(error instanceof Error ? error.message : "Unknown error occurred.");
    } finally {
      setIsStreamLoading(false);
    }
  }

  return (
    <div className="py-8">
      {/* Season and Episode Select */}
      <div className="pb-4">
        <div className="flex flex-col text-center items-center justify-center">
          <div className="rounded-md pl-4 flex w-full max-w-sm items-center space-x-2">
            {/* Season Selector */}
            <Select value={season} onValueChange={(e) => setSeason(e)} disabled={isLoading || seasons.length === 0}>
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((s) => (
                  <SelectItem key={s.season_number} value={s.season_number.toString()}>
                    Season {s.season_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Episode Selector */}
            <Select value={episode} onValueChange={(e) => setEpisode(e)} disabled={isLoading || episodes.length === 0}>
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Episode" />
              </SelectTrigger>
              <SelectContent>
                {episodes.map((e) => (
                  <SelectItem key={e.episode_number} value={e.episode_number.toString()}>
                    Episode {e.episode_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Link href={`https://dl.vidsrc.vip/tv/${id}/${season}/${episode}`}>
              <Badge variant="outline" className="cursor-pointer whitespace-nowrap">
                <Download className="mr-1.5" size={12} />
                Download {season}-{episode}
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {/* HLS Player */}
      {isStreamLoading ? (
        <div>Loading stream...</div>
      ) : streamError ? (
        <div className="text-center text-red-500">{streamError}</div>
      ) : streamUrl ? (
        <video ref={videoRef} controls className="w-full h-auto max-w-3xl mx-auto" />
      ) : (
        <div>No stream available</div>
      )}
    </div>
  );
}
