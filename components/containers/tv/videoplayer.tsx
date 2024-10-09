"use client";
import * as React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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
  const [server, setServer] = React.useState("hls"); // Default to HLS stream
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

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
        return null; // Or a default URL if needed
    }
  };

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

  return (
    <div className="flex flex-col items-center">
      {isLoading && <p>Loading seasons...</p>}
      {error && <p>Error: {error}</p>}
      
      <div className="mb-4"> {/* Wrapper div for styling */}
        <Select onValueChange={setServer} defaultValue={server}>
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
      </div>

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
