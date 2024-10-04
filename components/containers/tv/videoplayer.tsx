"use client";
import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [season, setSeason] = React.useState("1");
  const [episode, setEpisode] = React.useState("1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [server, setServer] = React.useState("vidlinkpro");

  React.useEffect(() => {
    fetchSeasons();

    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://vidlink.pro') {
        return;
      }

      if (event.data && event.data.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
      }
    });
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    if (episodes.length > 0) {
      const episodeExists = episodes.some(ep => ep.episode_number.toString() === episode);
      if (!episodeExists) {
        setEpisode(episodes[0].episode_number.toString());
      }
    }
  }, [episodes]);

  async function fetchSeasons() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

  const handleEpisodeClick = (episodeNumber: string) => {
    setEpisode(episodeNumber);
  };

  const handlePreviousEpisode = () => {
    const currentEpisodeNumber = Number(episode);
    if (currentEpisodeNumber > 1) {
      setEpisode((currentEpisodeNumber - 1).toString());
    }
  };

  const handleNextEpisode = () => {
    const currentEpisodeNumber = Number(episode);
    const nextEpisode = episodes.find(ep => ep.episode_number === currentEpisodeNumber + 1);
    if (nextEpisode) {
      setEpisode((currentEpisodeNumber + 1).toString());
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

  const currentSeason = seasons.find(s => s.season_number.toString() === season);
  const currentEpisode = episodes.find(ep => ep.episode_number.toString() === episode);

  return (
    <div className="py-8">
      {/* Currently Watching Section */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Currently Watching:</h2>
        {currentSeason && currentEpisode ? (
          <div>
            <div className="text-lg font-semibold">{currentSeason.name}</div>
            <div>Episode {currentEpisode.episode_number}: {currentEpisode.name}</div>
          </div>
        ) : (
          <div>No episode selected</div>
        )}
      </div>

      {/* Video Player */}
      <div className="relative max-w-3xl mx-auto px-4 pt-10">
        <iframe
          src={getIframeSrc()}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          className="rounded-lg shadow-lg border border-gray-300"
        ></iframe>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handlePreviousEpisode}
          className="px-4 py-2 rounded-md bg-gray-800 text-white shadow-md hover:bg-gray-700 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous Episode
        </button>
        <button
          onClick={handleNextEpisode}
          className="px-4 py-2 rounded-md bg-gray-800 text-white shadow-md hover:bg-gray-700 transition-colors duration-300 flex items-center ml-4"
        >
          Next Episode
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>

      {/* Season Selector */}
      <div className="mt-6 w-[200px]">
        <Select onValueChange={setSeason} defaultValue={season}>
          <SelectTrigger>
            <SelectValue placeholder="Select a season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem
                key={season.season_number}
                value={season.season_number.toString()}
              >
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episode Selector */}
      <div className="mt-6 w-[200px]">
        <Select onValueChange={handleEpisodeClick} defaultValue={episode}>
          <SelectTrigger>
            <SelectValue placeholder="Select an episode" />
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
  );
}

