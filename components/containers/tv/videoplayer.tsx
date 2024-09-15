"use client";
import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; // Ensure custom styling is supported
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [season, setSeason] = React.useState(() => localStorage.getItem(`video-player-season-${id}`) || "1");
  const [episode, setEpisode] = React.useState(() => localStorage.getItem(`video-player-episode-${id}`) || "1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [server, setServer] = React.useState("vidlinkpro"); // Default server
  const [showTitle, setShowTitle] = React.useState<string>("");

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    // Save state to localStorage
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
      setShowTitle(data.name || ""); // Set show title
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

  const handlePrevEpisode = () => {
    if (Number(episode) > 1) {
      setEpisode((prev) => (Number(prev) - 1).toString());
    }
  };

  const handleNextEpisode = () => {
    if (Number(episode) < episodes.length) {
      setEpisode((prev) => (Number(prev) + 1).toString());
    }
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
      {/* Title, Season and Episode Info */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">{showTitle}</h1>
        <p className="text-lg">
          Currently Watching: Season {season}, Episode {episode}
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
        ></iframe>

        {/* Episode Controls */}
        <div className="flex justify-between py-4">
          <button
            onClick={handlePrevEpisode}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <ChevronLeft />
            Previous Episode
          </button>
          <button
            onClick={handleNextEpisode}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Next Episode
            <ChevronRight />
          </button>
        </div>

        {/* Warning for Mismatch */}
        <p className="text-center text-red-500 text-sm">
          Note: Changing episodes directly inside the player may lead to a
          mismatch with the spotlight effect.
        </p>
      </div>

      {/* Episode Thumbnails */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.episode_number}
              className={`cursor-pointer relative ${
                ep.episode_number.toString() === episode
                  ? "ring-4 ring-glow"
                  : ""
              }`}
              onClick={() => handleEpisodeClick(ep.episode_number.toString())}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                alt={ep.name}
                className="rounded-md"
              />
              <p className="text-center text-sm mt-1">
                {ep.episode_number}. {ep.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .ring-glow {
          box-shadow: 0 0 15px 5px rgba(255, 102, 102, 0.8);
          transition: box-shadow 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
