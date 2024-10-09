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

const servers = [
  { label: "HLS Stream", value: "hls" },
  { label: "VidLink Pro", value: "vidlinkpro" },
  { label: "Vidsrc", value: "vidsrc" },
  { label: "VidBinge 4K", value: "vidbinge4K" },
  { label: "Smashy Stream", value: "smashystream" },
  { label: "Vidsrc Pro", value: "vidsrcpro" },
  { label: "Super Embed", value: "superembed" },
  { label: "Vidsrc ICU", value: "vidsrcicu" },
  { label: "Vidsrc NL", value: "vidsrcnl" },
  { label: "Nontongo", value: "nontongo" },
  { label: "Vidsrc XYZ", value: "vidsrcxyz" },
  { label: "2Embed CC TV", value: "embedcctv" },
  { label: "Two Embed", value: "twoembed" },
  { label: "Vidsrc Top", value: "vidsrctop" },
];

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
  const [server, setServer] = React.useState("hls"); // Default to HLS stream
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
  }, [episode, server]); // Fetch stream URL on server change

  React.useEffect(() => {
    if (streamUrl && videoRef.current) {
      if (server === "hls" && Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 1200000000000000000,
          maxBufferSize: 100000000000000000 * 1000 * 1000,
          maxMaxBufferLength: 180000000000000000000000,
          capLevelToPlayerSize: true,
          startLevel: -1,
          autoStartLoad: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current) {
        // For non-HLS servers, set the iframe source
        videoRef.current.src = "";
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [streamUrl, server]);

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
      if (server === "hls") {
        const res = await fetch(
          `https://hehebwaiiiijqsdfioaf.vercel.app/vidlink/watch?isMovie=false&id=${id}&episode=${episode}&season=${season}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch stream.");
        }
        const data = await res.json();
        setStreamUrl(data.stream.playlist);
      } else {
        // For iframe sources, no need to fetch here
        setStreamUrl(null);
      }
    } catch (error: unknown) {
      setStreamUrl(null);
      setStreamError(error instanceof Error ? error.message : "Unknown error occurred.");
    } finally {
      setIsStreamLoading(false);
    }
  }

  const getIframeSrc = () => {
    switch (server) {
      case "vidlinkpro":
        return `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=true&nextbutton=true`;
      case "vidsrc":
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true&autoNext=true&poster=true`;
      case "vidbinge4K":
        return `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`;
      case "smashystream":
        return `https://player.smashy.stream/tv/${id}?s=${season}&e=${episode}`;
      case "vidsrcpro":
        return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
      case "superembed":
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      case "vidsrcicu":
        return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
      case "vidsrcnl":
        return `https://player.vidsrc.nl/embed/tv/${id}/${season}/${episode}?server=hindi`;
      case "nontongo":
        return `https://www.nontongo.win/embed/tv/${id}/${season}/${episode}`;
      case "vidsrcxyz":
        return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      case "embedcctv":
        return `https://www.2embed.cc/embed/tv/${id}/${season}/${episode}`;
      case "twoembed":
        return `https://2embed.org/embed/tv/${id}/${season}/${episode}`;
      case "vidsrctop":
        return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
      default:
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true&autoNext=true&poster=true`;
    }
  };

  return (
    <div className="py-8">
      {/* Season and Episode Select */}
      <div className="pb-4">
        <div className="flex flex-col text-center items-center justify-center">
          <div className="rounded-md pl-4 flex w-full max-w-sm items-center space-x-2">
            <Select onValueChange={setSeason} defaultValue={season}>
              <SelectTrigger>
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.season_number} value={season.season_number.toString()}>
                    Season {season.season_number} ({season.episode_count} Episodes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setEpisode} defaultValue={episode}>
              <SelectTrigger>
                <SelectValue placeholder="Select Episode" />
              </SelectTrigger>
              <SelectContent>
                {episodes.map((ep) => (
                  <SelectItem key={ep.episode_number} value={ep.episode_number.toString()}>
                    {ep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="flex justify-center">
        {server === "hls" ? (
          <video
            ref={videoRef}
            controls
            style={{ width: "100%", height: "100%" }}
            className="aspect-video"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={getIframeSrc()}
            title={`Video Player for Episode ${episode}`}
            width="100%"
            height="500"
            frameBorder="0"
            allowFullScreen
          />
        )}
      </div>

      {/* Error and Loading States */}
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {isStreamLoading && <p>Loading stream...</p>}
      {streamError && <p>Stream Error: {streamError}</p>}
    </div>
  );
}
