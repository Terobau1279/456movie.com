"use client";
import * as React from "react";
import Hls from "hls.js"; // Import Hls.js
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
  const [server, setServer] = React.useState("hls");
  const [streamUrl, setStreamUrl] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  React.useEffect(() => {
    if (season) {
      fetchEpisodes(Number(season));
    }
  }, [season]);

  React.useEffect(() => {
    const savedState = localStorage.getItem(`lastWatched-${id}`);
    if (savedState) {
      const { savedSeason, savedEpisode } = JSON.parse(savedState);
      setSeason(savedSeason);
      setEpisode(savedEpisode);
    }
  }, [id]);

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
    localStorage.setItem(
      `lastWatched-${id}`,
      JSON.stringify({ savedSeason: season, savedEpisode: episode })
    );
  }, [season, episode, id]);

  React.useEffect(() => {
    fetchStreamUrl();
  }, [server, episode, season]);

  React.useEffect(() => {
    let hls: Hls | null = null;

    if (streamUrl && videoRef.current) {
      if (server === "hls" && Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 12000000000000000000000000000000000000000000000,
          maxBufferSize: 10000000000000000000000000000000000000000000000 * 1000 * 1000,
          maxMaxBufferLength: 180000000000000000000000000000000000000000000,
          capLevelToPlayerSize: true,
          startLevel: -1,
          autoStartLoad: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else if (server !== "hls" && videoRef.current) {
        videoRef.current.src = getIframeSrc();
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [streamUrl, server]);

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

  async function fetchStreamUrl() {
    try {
      if (server === "hls") {
        const res = await fetch(
          `https://hehebwaiiiijqsdfioaf.vercel.app/vidlink/watch?isMovie=false&id=${id}&episode=${episode}&season=${season}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch stream.");
        }
        const data = await res.json();
        setStreamUrl(data.stream.playlist);
      } else {
        setStreamUrl(null);
      }
    } catch (error: unknown) {
      setStreamUrl(null);
      setError(error instanceof Error ? error.message : "Unknown error occurred.");
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
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
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
    <div className="py-8">
      {/* Currently Watching Section */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Currently Watching:</h2>
        {currentSeason && currentEpisode ? (
          <div>
            <div className="text-lg font-semibold">{currentSeason.name}</div>
            <div>
              Episode {currentEpisode.episode_number}: {currentEpisode.name}
            </div>
          </div>
        ) : (
          <div>No episode selected</div>
        )}
      </div>

      {/* Video Player */}
      <div className="relative max-w-3xl mx-auto px-4 pt-10">
        {server === "hls" ? (
          <video
            ref={videoRef}
            controls
            width="100%"
            height="450"
            className="rounded-lg shadow-lg border border-gray-300"
          />
        ) : (
          <iframe
            src={getIframeSrc()}
            referrerPolicy="origin"
            allowFullScreen
            width="100%"
            height="450"
            scrolling="no"
            className="rounded-lg shadow-lg border border-gray-300"
          ></iframe>
        )}
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
      <div className="flex justify-center pt-4">
        <div className="w-[300px]">
          <Select
            value={season}
            onValueChange={(e) => setSeason(e)}
            disabled={isLoading || seasons.length === 0}
          >
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

      {/* Download Button */}
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

      {/* Server Selector */}
      <div className="flex justify-center pt-4">
        <div className="w-[300px]">
          <div className="text-center text-sm text-red-500 mb-2">
            If the current server is not working, please change the server using the dropdown below.
          </div>
          <Select value={server} onValueChange={(e) => setServer(e)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">
                Vidlink Pro
                <span className="ml-2 text-sm text-green-500">
                  Minimal Ads, Auto-Play
                </span>
              </SelectItem>
              <SelectItem value="vidsrc">
                Vidsrc
                <span className="ml-2 text-sm text-green-500">
                  Minimal Ads, Auto-Play, Auto Next
                </span>
              </SelectItem>
              <SelectItem value="vidbinge4K">
                Vid Binge 4K
                <span className="ml-2 text-sm text-green-500">
                  4K Stream, Download Option, Shared Stream, Auto Play, AutoNext
                </span>
              </SelectItem>
              <SelectItem value="smashystream">
                SmashyStream
                <span className="ml-2 text-sm text-green-500">
                  No Ads, Shared Stream
                </span>
              </SelectItem>
              <SelectItem value="vidsrcpro">
                Vidsrc Pro
                <span className="ml-2 text-sm text-green-500">
                  Enter fullscreen to load faster
                </span>
              </SelectItem>
              <SelectItem value="superembed">SuperEmbed</SelectItem>
              <SelectItem value="vidsrcicu">
                Vidsrc ICU
                <span className="ml-2 text-sm text-green-500">
                  Casting Options
                </span>
              </SelectItem>
              <SelectItem value="vidsrcnl">
                Vidsrc NL
                <span className="ml-2 text-sm text-green-500">No Ads</span>
              </SelectItem>
              <SelectItem value="nontongo">
                Nontongo
                <span className="ml-2 text-sm text-green-500">
                  Casting Options
                </span>
              </SelectItem>
              <SelectItem value="vidsrcxyz">Vidsrc XYZ</SelectItem>
              <SelectItem value="embedcctv">EmbedCC TV</SelectItem>
              <SelectItem value="twoembed">TwoEmbed</SelectItem>
              <SelectItem value="vidsrctop">
                Vidsrc Top{" "}
                <span className="text-green-400 text-sm">Personal Favorite</span>
              </SelectItem>
              <SelectItem value="hls">
                Premium
                <span className="ml-2 text-sm text-green-500">
                  Adaptive Streaming
                </span>
              </SelectItem>
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
              className={`relative group cursor-pointer rounded-lg overflow-hidden border border-gray-300 shadow-md ${
                episode === ep.episode_number.toString()
                  ? "ring-4 ring-yellow-500"
                  : ""
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
                  episode === ep.episode_number.toString()
                    ? "ring-4 ring-yellow-500"
                    : ""
                }`}
              >
                <div className="text-white text-center p-2">
                  <div className="text-lg font-bold">
                    Episode {ep.episode_number}
                  </div>
                  <div>{ep.name}</div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black text-white text-xs px-1 rounded">
                {ep.episode_number}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 pt-4">
          Changing the episode inside the player may cause the spotlight to
          mismatch with the current episode. Please select an episode from the
          list to keep the spotlight in sync.
        </div>
      </div>
    </div>
  );
}
