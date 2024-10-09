"use client";
import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import Link from "next/link";
import { API_KEY } from "@/config/url";
import Hls from "hls.js";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}
interface Episode {
  episode_number: number;
  name: string;
}

export default function VideoPlayer({ id }: { id: number }) {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [season, setSeason] = React.useState("1");
  const [episode, setEpisode] = React.useState("1");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [flixhqSources, setFlixhqSources] = React.useState<string[]>([]);
  const [isFlixhqLoading, setIsFlixhqLoading] = React.useState(false);
  const [flixhqError, setFlixhqError] = React.useState<string | null>(null);
  const [premiumStreamUrl, setPremiumStreamUrl] = React.useState<string | null>(null);
  const [isPremiumLoading, setIsPremiumLoading] = React.useState(false);
  const [premiumError, setPremiumError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
      fetchFlixHQSources();
      fetchPremiumStream();
    }
  }, [episode]);

  React.useEffect(() => {
    if (premiumStreamUrl && videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(premiumStreamUrl);
      hls.attachMedia(videoRef.current);

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current) {
      videoRef.current.src = premiumStreamUrl || "";
    }
  }, [premiumStreamUrl]);

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

  async function fetchFlixHQSources() {
    setIsFlixhqLoading(true);
    setFlixhqError(null);
    try {
      const mediaId = `tv/watch-${id}`;
      const res = await fetch(
        `/api/flixhq/sources?mediaId=${encodeURIComponent(
          mediaId
        )}&episodeId=${encodeURIComponent(episode)}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch FlixHQ sources.");
      }
      const data = await res.json();
      setFlixhqSources(data.sources || []);
    } catch (error: unknown) {
      console.error("Error fetching FlixHQ sources:", error);
      setFlixhqSources([]);
      setFlixhqError(
        error instanceof Error ? error.message : "Unknown error occurred."
      );
    } finally {
      setIsFlixhqLoading(false);
    }
  }

  async function fetchPremiumStream() {
    setIsPremiumLoading(true);
    setPremiumError(null);
    try {
      const res = await fetch(
        `https://hehebwaiiiijqsdfioaf.vercel.app/vidlink/watch?isMovie=false&id=${id}&season=${season}&episode=${episode}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch premium stream.");
      }
      const data = await res.json();
      setPremiumStreamUrl(data.stream.playlist);
    } catch (error: unknown) {
      console.error("Error fetching premium stream:", error);
      setPremiumStreamUrl(null);
      setPremiumError(
        error instanceof Error ? error.message : "Unknown error occurred."
      );
    } finally {
      setIsPremiumLoading(false);
    }
  }

  return (
    <div className="py-8">
      {/* Season and Episode Select */}
      <div className="pb-4">
        <div className="flex flex-col text-center items-center justify-center">
          <div className="rounded-md pl-4 flex w-full max-w-sm items-center space-x-2">
            {/* Season Selector */}
            <Select
              value={season}
              onValueChange={(e) => setSeason(e)}
              disabled={isLoading || seasons.length === 0}
            >
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
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

            {/* Episode Selector */}
            <Select
              value={episode}
              onValueChange={(e) => setEpisode(e)}
              disabled={isLoading || episodes.length === 0}
            >
              <SelectTrigger className="px-4 py-2 rounded-md w-[180px]">
                <SelectValue placeholder="Select Episode" />
              </SelectTrigger>
              <SelectContent>
                {episodes.map((e) => (
                  <SelectItem key={e.episode_number} value={e.episode_number.toString()}>
                    Episode {e.episode_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
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
        </div>
      </div>

      {/* Tabs for different sources */}
      <Tabs defaultValue="flixhq">
        <TabsList className="mb-4">
          <TabsTrigger value="flixhq">FlixHQ</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        {/* FlixHQ Source */}
        <TabsContent value="flixhq">
          {isFlixhqLoading ? (
            <Skeleton className="w-full max-w-3xl h-[450px] mx-auto" />
          ) : flixhqError ? (
            <div className="text-center text-red-500">{flixhqError}</div>
          ) : flixhqSources.length > 0 ? (
            // Assuming you already have code for handling flixhq sources
            <div className="flixhq-player">FlixHQ player goes here</div>
          ) : (
            <div>No sources available</div>
          )}
        </TabsContent>

        {/* Premium API Source */}
        <TabsContent value="premium">
          {isPremiumLoading ? (
            <Skeleton className="w-full max-w-3xl h-[450px] mx-auto" />
          ) : premiumError ? (
            <div className="text-center text-red-500">{premiumError}</div>
          ) : premiumStreamUrl ? (
            <video ref={videoRef} controls className="w-full h-auto max-w-3xl mx-auto" />
          ) : (
            <div>No premium stream available</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
