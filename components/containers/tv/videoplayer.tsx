"use client";
import React, { useState, useEffect } from "react";
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

interface ProgressData {
  episode_number: number;
  progress: number;
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState("vidlinkpro");

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data && event.data.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        try {
          const currentProgress = JSON.parse(localStorage.getItem("vidLinkProgress") || "[]");
          const updatedProgress = currentProgress.filter((item: ProgressData) => item.episode_number !== mediaData.episode_number);
          updatedProgress.push(mediaData);
          localStorage.setItem("vidLinkProgress", JSON.stringify(updatedProgress));
        } catch (e) {
          console.error("Error saving to localStorage", e);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (episodes.length > 0) {
      const episodeExists = episodes.some(ep => ep.episode_number.toString() === episode);
      if (!episodeExists) {
        setEpisode(episodes[0].episode_number.toString());
      }
    }
  }, [episodes]);

  const getWatchProgress = (episodeNumber: number) => {
    try {
      const progressData = JSON.parse(localStorage.getItem("vidLinkProgress") || "[]");
      const episodeProgress = progressData.find((ep: ProgressData) => ep.episode_number === episodeNumber);
      return episodeProgress ? episodeProgress.progress : 0;
    } catch (e) {
      console.error("Error reading from localStorage", e);
    }
    return 0;
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
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  const currentSeason = seasons.find(s => s.season_number.toString() === season);
  const currentEpisode = episodes.find(ep => ep.episode_number.toString() === episode);

  return (
    <div className="py-8">
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

      <div className="flex justify-center pt-4">
        <div className="w-[300px]">
          <Select value={season} onValueChange={(e) => setSeason(e)} disabled={isLoading || seasons.length === 0}>
            <SelectTrigger className="px-4 py-2 rounded-md">
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

      <div className="pt-4 text-center">
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

      <div className="flex justify-center pt-4">
        <div className="w-[300px]">
          <Select value={server} onValueChange={(e) => setServer(e)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">
                Vidlink Pro
                <span className="ml-2 text-sm text-green-500">Minimal Ads, Auto-Play</span>
              </SelectItem>
              <SelectItem value="vidsrc">
                Vidsrc
                <span className="ml-2 text-sm text-green-500">Minimal Ads, Auto-Play, Auto Next</span>
              </SelectItem>
              <SelectItem value="vidbinge4K">
                Vid Binge 4K
                <span className="ml-2 text-sm text-green-500">4K Stream, Download Option, Shared Stream, Auto Play, Auto Next</span>
              </SelectItem>
              <SelectItem value="smashystream">
                SmashyStream
                <span className="ml-2 text-sm text-green-500">No Ads, Shared Stream</span>
              </SelectItem>
              <SelectItem value="vidsrcpro">
                Vidsrc Pro
                <span className="ml-2 text-sm text-green-500">Enter fullscreen to load faster</span>
              </SelectItem>
              <SelectItem value="superembed">
                SuperEmbed
              </SelectItem>
              <SelectItem value="vidsrcicu">
                Vidsrc ICU
                <span className="ml-2 text-sm text-green-500">Casting Options</span>
              </SelectItem>
              <SelectItem value="vidsrcnl">
                Vidsrc NL
                <span className="ml-2 text-sm text-green-500">No Ads</span>
              </SelectItem>
              <SelectItem value="nontongo">
                Nontongo
                <span className="ml-2 text-sm text-green-500">Casting Options</span>
              </SelectItem>
              <SelectItem value="vidsrcxyz">
                Vidsrc XYZ
              </SelectItem>
              <SelectItem value="embedcctv">
                EmbedCC TV
              </SelectItem>
              <SelectItem value="twoembed">
                TwoEmbed
              </SelectItem>
              <SelectItem value="vidsrctop">
                Vidsrc Top <span className="text-green-400 text-sm">Personal Favorite</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.episode_number}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border border-gray-300 shadow-md ${
                episode === ep.episode_number.toString() ? "ring-4 ring-yellow-500" : ""
              }`}
              onClick={() => handleEpisodeClick(ep.episode_number.toString())}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                alt={ep.name}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  episode === ep.episode_number.toString() ? "ring-4 ring-yellow-500" : ""
                }`}
              >
                <div className="text-white text-center p-2">
                  <div className="text-lg font-bold">Episode {ep.episode_number}</div>
                  <div>{ep.name}</div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black text-white text-xs px-1 rounded">
                {ep.episode_number}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${getWatchProgress(ep.episode_number)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 pt-4">
          Changing the episode inside the player may cause the spotlight to mismatch with the current episode. Please select an episode from the list to keep the spotlight in sync.
        </div>
      </div>
    </div>
  );
}

