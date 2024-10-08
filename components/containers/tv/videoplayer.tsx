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
import { MOVIES } from 'flixhq-core';

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
  const [streamUrl, setStreamUrl] = React.useState<string | null>(null); // New state for the stream URL
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const flixhq = new MOVIES.FlixHQ();  // Initialize the flixhq-core API

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    if (season && episode) {
      fetchStreamUrl(id, season, episode);  // Fetch stream URL when season or episode changes
    }
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

  // Fetch stream URL from FlixHQ
  async function fetchStreamUrl(mediaId: number, season: string, episode: string) {
    try {
      const sources = await flixhq.fetchEpisodeSources(`tv/${mediaId}`, `${season}-${episode}`);
      if (sources && sources.sources.length > 0) {
        setStreamUrl(sources.sources[0].url);  // Set the first available source URL
      } else {
        setStreamUrl(null);
      }
    } catch (error) {
      console.error("Error fetching stream URL:", error);
      setStreamUrl(null);
    }
  }

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
      <div className="pb-4">
        <div className="flex flex-col text-center items-center justify-center">
          <div className="rounded-md pl-4 flex w-full max-w-sm items-center space-x-2">
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-2">
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
                        Episode {s.episode_number}
                      </SelectItem>
                    ))
                  ) : (
                    <></>
                  )}
                </SelectContent>
              </Select>
            </div>
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
      <Tabs defaultValue="autoembed">
        <div className="flex flex-col items-center">
          <TabsList>
            <TabsTrigger value="autoembed">AutoEmbed</TabsTrigger>
            <TabsTrigger value="flixhq">FlixHQ</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="autoembed">
          <iframe
            src={`https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`}
            referrerPolicy="origin"
            allowFullScreen
            width="100%"
            height="450"
            scrolling="no"
            className="max-w-3xl mx-auto px-4 pt-10"
          ></iframe>
        </TabsContent>
        <TabsContent value="flixhq">
          {streamUrl ? (
            <iframe
              src={streamUrl}
              referrerPolicy="origin"
              allowFullScreen
              width="100%"
              height="450"
              scrolling="no"
              className="max-w-3xl mx-auto px-4 pt-10"
            ></iframe>
          ) : (
            <div>No streaming source available.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
