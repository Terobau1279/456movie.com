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
  const [quality, setQuality] = React.useState("auto"); // Default quality to auto
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
  }, [episode, quality]); // Fetch stream URL again when quality changes

  React.useEffect(() => {
    if (streamUrl && videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 1200, // Larger buffer to avoid rebuffering
          maxBufferSize: 1000 * 1000 * 1000, // Increase buffer size to 100MB
          maxMaxBufferLength: 1800, // Set maximum allowed buffer length to 180 seconds
          capLevelToPlayerSize: true, // Ensure adaptive quality based on player size
          startLevel: quality === "auto" ? -1 : parseInt(quality) - 1, // Set quality based on selection
          autoStartLoad: true, // Automatically load and play the stream
          liveSyncDurationCount: 3, // How many segments to sync to live
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.fatal) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("A network error occurred.");
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("A media error occurred.");
                break;
              case Hls.ErrorTypes.OTHER_ERROR:
                console.error("An unknown error occurred.");
                break;
              default:
                break;
            }
            setStreamError("Error loading stream. Retrying...");
            setTimeout(() => {
              fetchStreamUrl(); // Retry fetching the stream after an error
            }, 5000); // Retry after 5 seconds
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

            {/* Quality Selector */}
            <Select value={quality} onValueChange={(e) => setQuality(e)} disabled={isLoading}>
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="1">360p</SelectItem>
                <SelectItem value="2">480p</SelectItem>
                <SelectItem value="3">720p</SelectItem>
                <SelectItem value="4">1080p</SelectItem>
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

      {/* Video Player */}
      <div>
        {isStreamLoading ? (
          <div>Loading stream...</div>
        ) : streamError ? (
          <div>{streamError}</div>
        ) : streamUrl ? (
          <video ref={videoRef} controls className="w-full aspect-video">
            Your browser does not support the video tag.
          </video>
        ) : (
          <div>No stream available</div>
        )}
      </div>
    </div>
  );
}
