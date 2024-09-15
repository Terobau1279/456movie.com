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
  const [server, setServer] = React.useState("vidlinkpro"); // Default server set to Vidlink Pro

  React.useEffect(() => {
    fetchSeasons();
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
        return `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=ff0044&secondaryColor=f788a6&iconColor=ff0044&title=true&poster=true&autoplay=true&nextbutton=true`;
      case "vidsrc":
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true&autoNext=true&poster=true`;
      case "vidbinge4K":
        return `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`; // 4K Available, Auto Play & Auto Next
      case "smashystream":
        return `https://player.smashy.stream/tv/${id}/${season}/${episode}`; // Smashy Stream server
      case "vidsrcpro":
        return `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`;
      case "superembed":
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      case "vidsrcIcu":
        return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
      case "vidsrcNl":
        return `https://player.vidsrc.nl/embed/tv/${id}/${season}/${episode}?server=hindi`;
      case "nontongo":
        return `https://www.nontongo.win/embed/tv/${id}/${season}/${episode}`;
      case "vidsrcxyz":
        return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`; // Vidsrc.xyz TV API
      case "embedccTV":
        return `https://www.2embed.cc/embed/tv/${id}/${season}/${episode}`; // 2Embed.cc TV Embed
      case "twoembed":
        return `https://2embed.org/embed/tv/${id}/${season}/${episode}`; // 2Embed.org TV Embed
      case "vidsrcTop":
        return `https://vidsrc.top/embed/tv/tmdb/${id}/${season}`;
      default:
        return `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=ff0044&secondaryColor=f788a6&iconColor=ff0044&title=true&poster=true&autoplay=true&nextbutton=true`; // Default to Vidlink Pro
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

      {/* Episode Selector */}
      <div className="mt-4 mx-auto max-w-md">
        <Select
          value={episode}
          onValueChange={setEpisode}
        >
          <SelectTrigger>
            <SelectValue>{`Episode ${episode}`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {episodes.map((ep) => (
              <SelectItem key={ep.episode_number} value={ep.episode_number.toString()}>
                {`Episode ${ep.episode_number}: ${ep.name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Server Selector */}
      <div className="mt-4 mx-auto max-w-md">
        <Select
          value={server}
          onValueChange={setServer}
        >
          <SelectTrigger>
            <SelectValue>{server}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vidlinkpro">Vidlink Pro</SelectItem>
            <SelectItem value="vidsrc">Vidsrc</SelectItem>
            <SelectItem value="vidbinge4K">VidBinge 4K</SelectItem>
            <SelectItem value="smashystream">Smashy Stream</SelectItem>
            <SelectItem value="vidsrcpro">Vidsrc Pro</SelectItem>
            <SelectItem value="superembed">SuperEmbed</SelectItem>
            <SelectItem value="vidsrcIcu">Vidsrc ICU</SelectItem>
            <SelectItem value="vidsrcNl">Vidsrc NL</SelectItem>
            <SelectItem value="nontongo">Nontongo</SelectItem>
            <SelectItem value="vidsrcxyz">Vidsrc XYZ</SelectItem>
            <SelectItem value="embedccTV">EmbedCC TV</SelectItem>
            <SelectItem value="twoembed">TwoEmbed</SelectItem>
            <SelectItem value="vidsrcTop">Vidsrc Top</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
