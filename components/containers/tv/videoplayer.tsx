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
          maxBufferLength: 1200000000000000000, // Larger buffer to avoid rebuffering
          maxBufferSize: 100000000000000000 * 1000 * 1000, // Increase buffer size to 100MB
          maxMaxBufferLength: 180000000000000000000000, // Set maximum allowed buffer length to 180 seconds
          capLevelToPlayerSize: true, // Ensure adaptive quality based on player size
          startLevel: -1, // Automatically start at the highest quality
          autoStartLoad: true, // Automatically load and play the stream
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else {
        // Destroy HLS if it exists when not using HLS server
        if (hls) {
          hls.destroy();
          hls = null; // Reset HLS instance
        }
        // For iframe sources
        videoRef.current.src = getIframeSrc();
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
    <div className="flex flex-col items-center">
      {isLoading && <p>Loading seasons...</p>}
      {error && <p>Error: {error}</p>}
      <Select onValueChange={setServer} defaultValue={server} className="mb-4">
        <SelectTrigger>
          <SelectValue placeholder="Select a server" />
        </SelectTrigger>
        <SelectContent>
          {servers.map((srv) => (
            <SelectItem key={srv.value} value={srv.value}>
              {srv.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="video-player">
        {server === "hls" ? (
          <video ref={videoRef} controls autoPlay style={{ width: "100%", height: "auto" }} />
        ) : (
          <iframe
            title="Video Player"
            src={getIframeSrc()}
            frameBorder="0"
            allowFullScreen
            style={{ width: "100%", height: "auto" }}
          />
        )}
      </div>

      {isStreamLoading && <p>Loading stream...</p>}
      {streamError && <p>Error: {streamError}</p>}

      <div>
        <h2>Select Season:</h2>
        {seasons.map((season) => (
          <button key={season.season_number} onClick={() => setSeason(season.season_number.toString())}>
            {season.name}
          </button>
        ))}
      </div>

      <div>
        <h2>Select Episode:</h2>
        {episodes.map((episode) => (
          <button key={episode.episode_number} onClick={() => setEpisode(episode.episode_number.toString())}>
            {episode.name}
          </button>
        ))}
      </div>
    </div>
  );
}
