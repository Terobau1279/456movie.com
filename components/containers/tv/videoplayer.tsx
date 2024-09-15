"use client";
import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; // Ensure this component allows passing custom styles if needed
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import Link from "next/link";
import { API_KEY } from "@/config/url";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  still_path: string;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path: string;
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [season, setSeason] = React.useState<string>(() => {
    // Retrieve the saved season from localStorage
    const savedSeason = localStorage.getItem(`video-player-season-${id}`);
    return savedSeason || "1";
  });
  const [episode, setEpisode] = React.useState<string>(() => {
    // Retrieve the saved episode from localStorage
    const savedEpisode = localStorage.getItem(`video-player-episode-${id}`);
    return savedEpisode || "1";
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [server, setServer] = React.useState("vidlinkpro"); // Default server

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    // Save the current season and episode in localStorage
    localStorage.setItem(`video-player-season-${id}`, season);
    localStorage.setItem(`video-player-episode-${id}`, episode);
  }, [season, episode]);

  async function fetchSeasons() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`
      );
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.status_message || "Failed to fetch seasons");
      }
      const relevantSeasons = data.seasons.filter(
        (s: any) => s.season_number > 0
      );
      setSeasons(relevantSeasons || []);
      if (relevantSeasons.length > 0) {
        setSeason(relevantSeasons[0].season_number.toString());
      }
    } catch (error: unknown) {
      console.error("Error fetching seasons:", error);
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
      console.error("Error fetching episodes:", error);
      setError(error instanceof Error ? error.message : String(error));
      setEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  }

  const getIframeSrc = () => {
    switch (server) {
      case "vidlinkpro":
        return `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=ff0044&secondaryColor=f788a6&iconColor=ff0044&title=true&poster=true&autoplay=true&nextbutton=true`;
      case "autoembed":
        return `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
      case "superembed":
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      default:
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true&autoNext=true&poster=true`;
    }
  };

  const handleEpisodeClick = (episodeNumber: string) => {
    setEpisode(episodeNumber);
  };

  if (isLoading) {
    return (
      <div className="py-8 mx-auto max-w-5xl">
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 mx-auto max-w-5xl">
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />{" "}
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Current Episode Info */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold">Currently Watching</h2>
        <p className="text-xl text-gray-600">
          Episode {episode}: {episodes.find(ep => ep.episode_number.toString() === episode)?.name}
        </p>
      </div>

      {/* Video Player */}
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <iframe
          src={getIframeSrc()}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          frameBorder="0"
          title="Video Player"
          // Ensure the player is not automatically muted
        ></iframe>
      </div>

      {/* Season Selector */}
      <div className="pt-4 text-center">
        <div className="w-[200px] mx-auto">
          <Select value={season} onValueChange={(e) => setSeason(e)}>
            <SelectTrigger>
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
        </div>
      </div>

      {/* Download Button */}
      <div className="pt-2 text-center">
        <Link href={`https://dl.vidsrc.vip/tv/${id}/${season}/${episode}`}>
          <Badge
            variant="outline"
            className="cursor-pointer whitespace-nowrap"
          >
            <Download className="mr-1.5" size={12} />
            Download {season}-{episode}
          </Badge>
        </Link>
      </div>

      {/* Server Selector */}
      <div className="pt-4 text-center">
        <div className="w-[200px] mx-auto">
          <Select value={server} onValueChange={(e) => setServer(e)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">VidLink.pro</SelectItem>
              <SelectItem value="autoembed">Autoembed</SelectItem>
              <SelectItem value="superembed">SuperEmbed</SelectItem>
              <SelectItem value="vidsrc">VidSrc.cc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Episode Thumbnails */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.episode_number}
              className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                episode === ep.episode_number.toString() ? "ring-4 ring-blue-500" : "shadow-md"
              }`}
              onClick={() => handleEpisodeClick(ep.episode_number.toString())}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                alt={ep.name}
                className="w-full h-[200px] object-cover"
              />
              {episode === ep.episode_number.toString() && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-bold">
                  <div className="text-center">
                    <div>Episode {ep.episode_number}</div>
                    <div>{ep.name}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 pt-4">
          Note: Changing the episode inside the player may lead to a mismatch with the spotlight effect.
        </div>
      </div>
    </div>
  );
}
