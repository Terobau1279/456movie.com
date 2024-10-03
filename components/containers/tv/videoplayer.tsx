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

interface MediaProgress {
  season: number;
  episode: number;
  progress: number; // Progress as a percentage
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [season, setSeason] = React.useState("1");
  const [episode, setEpisode] = React.useState("1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [server, setServer] = React.useState("vidlinkpro"); // Default server set to Vidlink Pro
  const [progressData, setProgressData] = React.useState<MediaProgress[]>([]);

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
      const episodeExists = episodes.some(
        (ep) => ep.episode_number.toString() === episode
      );
      if (!episodeExists) {
        setEpisode(episodes[0].episode_number.toString());
      }
    }
  }, [episodes]);

  React.useEffect(() => {
    // Add the message listener for watch progress
    const handleProgressMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") {
        return;
      }

      if (event.data && event.data.type === "MEDIA_DATA") {
        const mediaData = event.data.data;

        // Store progress in localStorage
        const storedProgress = JSON.parse(
          localStorage.getItem("vidLinkProgress") || "[]"
        );

        const updatedProgress = [...storedProgress];

        // Find if progress for this episode exists
        const existingIndex = updatedProgress.findIndex(
          (item: MediaProgress) =>
            item.season === mediaData.season &&
            item.episode === mediaData.episode
        );

        if (existingIndex > -1) {
          // Update existing progress
          updatedProgress[existingIndex].progress = mediaData.progress;
        } else {
          // Add new progress
          updatedProgress.push(mediaData);
        }

        localStorage.setItem("vidLinkProgress", JSON.stringify(updatedProgress));
        setProgressData(updatedProgress); // Update state to reflect progress
      }
    };

    window.addEventListener("message", handleProgressMessage);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("message", handleProgressMessage);
    };
  }, []);

  const getStoredProgress = (seasonNumber: number, episodeNumber: number) => {
    const storedProgress: MediaProgress[] = JSON.parse(
      localStorage.getItem("vidLinkProgress") || "[]"
    );
    const episodeProgress = storedProgress.find(
      (item) => item.season === seasonNumber && item.episode === episodeNumber
    );
    return episodeProgress ? episodeProgress.progress : 0; // Return progress if exists, otherwise 0
  };

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
    const nextEpisode = episodes.find(
      (ep) => ep.episode_number === currentEpisodeNumber + 1
    );
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

  const currentSeason = seasons.find(
    (s) => s.season_number.toString() === season
  );
  const currentEpisode = episodes.find(
    (ep) => ep.episode_number.toString() === episode
  );

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex items-center justify-between px-4">
        <Select
          onValueChange={setSeason}
          defaultValue={season}
          className="w-[200px]"
        >
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

        <div className="flex items-center gap-2">
          <Badge className="bg-primary">
            {currentSeason ? currentSeason.episode_count : 0} Episodes
          </Badge>

          <Badge className="bg-primary">{`S${season}E${episode}`}</Badge>

          <Link href={`/`}>
            <a>
              <Download className="text-primary" />
            </a>
          </Link>
        </div>
      </div>

      <div className="flex justify-center my-8">
        <iframe
          className="w-full max-w-[800px] h-[450px]"
          src={getIframeSrc()}
          allowFullScreen
          frameBorder="0"
        ></iframe>
      </div>

      <div className="flex items-center justify-between px-4">
        <button onClick={handlePreviousEpisode} disabled={Number(episode) === 1}>
          <ArrowLeft className="text-primary" />
        </button>

        <button
          onClick={handleNextEpisode}
          disabled={Number(episode) === episodes.length}
        >
          <ArrowRight className="text-primary" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mt-8">
        {episodes.map((ep) => (
          <div
            key={ep.episode_number}
            className="relative cursor-pointer"
            onClick={() => handleEpisodeClick(ep.episode_number.toString())}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500/${ep.still_path}`}
              alt={ep.name}
              className="w-full h-[150px] object-cover"
            />

            <div
              className="absolute bottom-0 left-0 w-full bg-primary h-[5px]"
              style={{
                width: `${getStoredProgress(
                  Number(season),
                  ep.episode_number
                )}%`,
              }}
            ></div>

            <div className="absolute bottom-2 left-2 text-white">
              {ep.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
