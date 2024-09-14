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
import { Download } from "lucide-react";
import Link from "next/link";
import { API_KEY } from "@/config/url";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path: string | null; // For episode thumbnail
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [season, setSeason] = React.useState("1");
  const [episode, setEpisode] = React.useState("1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [server, setServer] = React.useState("vidsrccc"); // Default server

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

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

  const handleEpisodeClick = (epNumber: string) => {
    setEpisode(epNumber);
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
      </div>

      {/* Season Dropdown below the player */}
      <div className="pt-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-md flex w-full max-w-sm items-center space-x-2">
            <Select
              value={season}
              onValueChange={(e) => setSeason(e)}
              disabled={isLoading || seasons.length === 0}
            >
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.length > 0 ? (
                  seasons.map((s) => (
                    <SelectItem
                      key={s.season_number}
                      value={s.season_number.toString()}
                    >
                      Season {s.season_number}
                    </SelectItem>
                  ))
                ) : (
                  <></>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Episode Dropdown */}
      <div className="pt-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-md flex w-full max-w-sm items-center space-x-2">
            <Select
              value={episode}
              onValueChange={(e) => setEpisode(e)}
              disabled={isLoading || episodes.length === 0}
            >
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Episode" />
              </SelectTrigger>
              <SelectContent>
                {episodes.length > 0 ? (
                  episodes.map((s) => (
                    <SelectItem
                      key={s.episode_number}
                      value={s.episode_number.toString()}
                    >
                      {s.episode_number}: {s.name}
                    </SelectItem>
                  ))
                ) : (
                  <></>
                )}
              </SelectContent>
            </Select>
          </div>
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
        <Select
          value={server}
          onValueChange={(e) => setServer(e)}
          className="w-[200px]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
            <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
            <SelectItem value="autoembed">Autoembed</SelectItem>
            <SelectItem value="superembed">SuperEmbed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Thumbnails Section */}
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.episode_number}
              className="cursor-pointer"
              onClick={() => handleEpisodeClick(ep.episode_number.toString())}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                alt={`Episode ${ep.episode_number}`}
                className="w-full h-32 object-cover
