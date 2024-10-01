"use client";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import Hide from "./hide"; // Import Hide component

// Obfuscate some video source URLs
const obfuscatedVideoSources = {
  vidlinkpro: atob("aHR0cHM6Ly92aWRsaW5rLnByby9tb3ZpZS8="),
  vidsrccc: atob("aHR0cHM6Ly92aWRzcmMuY2MvdjMvZW1iZWQvbW92aWUv"),
  vidsrcpro: atob("aHR0cHM6Ly92aWRzcmMucHJvL2VtYmVkL21vdmllLw=="),
  superembed: atob("aHR0cHM6Ly9tdWx0aWVtYmVkLm1vdi8/dmlkZW9faWQ9"),
  vidbinge4K: atob("aHR0cHM6Ly92aWRiaW5nZS5kZXYvZW1iZWQvbW92aWUv"),
  smashystream: atob("aHR0cHM6Ly9wbGF5ZXIuc21hc2h5LnN0cmVhbS9tb3ZpZS8="),
  vidsrcicu: atob("aHR0cHM6Ly92aWRzcmMuaWN1L2VtYmVkL21vdmllLw=="),
  vidsrcnl: atob("aHR0cHM6Ly9wbGF5ZXIudmlkc3JjLm5sL2VtYmVkL21vdmllLw=="),
  nontongo: atob("aHR0cHM6Ly93d3cubm9udG9uZ28ud2luL2VtYmVkL21vdmllLw=="),
  vidsrcxyz: atob("aHR0cHM6Ly92aWRzcmMueHl6L2VtYmVkL21vdmllP3RtZGI9"),
  embedccMovie: atob("aHR0cHM6Ly93d3cuMmVtYmVkLmNjL2VtYmVkLw=="),
  twoembed: atob("aHR0cHM6Ly8yZW1iZWQub3JnL2VtYmVkL21vdmllLw=="),
  vidsrctop: atob("aHR0cHM6Ly9lbWJlZC5zdS9lbWJlZC9tb3ZpZS8="),
};

type VideoSourceKey =
  | "vidlinkpro"
  | "vidsrccc"
  | "vidsrcpro"
  | "superembed"
  | "vidbinge4K"
  | "smashystream"
  | "vidsrcicu"
  | "vidsrcnl"
  | "nontongo"
  | "vidsrcxyz"
  | "embedccMovie"
  | "twoembed"
  | "vidsrctop";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidsrctop");
  const [loading, setLoading] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [showRelatedMovies, setShowRelatedMovies] = useState(false); // Hide by default
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `${obfuscatedVideoSources["vidlinkpro"]}${id}`,
    vidsrccc: `${obfuscatedVideoSources["vidsrccc"]}${id}`,
    vidsrcpro: `${obfuscatedVideoSources["vidsrcpro"]}${id}`,
    superembed: `${obfuscatedVideoSources["superembed"]}${id}&tmdb=1`,
    vidbinge4K: `${obfuscatedVideoSources["vidbinge4K"]}${id}`,
    smashystream: `${obfuscatedVideoSources["smashystream"]}${id}`,
    vidsrcicu: `${obfuscatedVideoSources["vidsrcicu"]}${id}`,
    vidsrcnl: `${obfuscatedVideoSources["vidsrcnl"]}${id}?server=hindi`,
    nontongo: `${obfuscatedVideoSources["nontongo"]}${id}`,
    vidsrcxyz: `${obfuscatedVideoSources["vidsrcxyz"]}${id}`,
    embedccMovie: `${obfuscatedVideoSources["embedccMovie"]}${id}`,
    twoembed: `${obfuscatedVideoSources["twoembed"]}${id}`,
    vidsrctop: `${obfuscatedVideoSources["vidsrctop"]}${id}`,
  };

  // Fetch movie details from TMDb API
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const data = await response.json();
        setMovieTitle(data.title || "Unknown Movie");

        // Fetch related movies
        const relatedResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const relatedData = await relatedResponse.json();
        setRelatedMovies(relatedData.results.slice(0, 8)); // Fetch 8 related movies
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  const handleSelectChange = (value: VideoSourceKey) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedSource(value);
      setLoading(false);
    }, 1000);
  };

  const toggleRelatedMovies = () => {
    setShowRelatedMovies((prev) => !prev);
  };

  // Prevent right-clicking
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div className="py-8 mx-auto max-w-5xl" onContextMenu={handleContextMenu}>
      <div className="flex flex-col text-center items-center justify-center">
        <h2 className="text-lg font-bold mb-4 text-center text-white">
          Currently Watching: {movieTitle}
        </h2>

        <div className="flex flex-row items-center justify-center w-full">
          <div className="flex flex-col text-center">
            <Select onValueChange={handleSelectChange} value={selectedSource}>
              <SelectTrigger className="px-4 py-2 rounded-md w-[280px] bg-gray-800 text-white border border-gray-700">
                <SelectValue placeholder="Select Video Source" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border border-gray-700">
                <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
                <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
                <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
                <SelectItem value="superembed">SuperEmbed</SelectItem>
                <SelectItem value="vidbinge4K">VidBinge</SelectItem>
                <SelectItem value="smashystream">SmashyStream</SelectItem>
                <SelectItem value="vidsrcicu">VidSrc.icu</SelectItem>
                <SelectItem value="vidsrcnl">VidSrc.nl</SelectItem>
                <SelectItem value="nontongo">Nontongo</SelectItem>
                <SelectItem value="vidsrcxyz">VidSrc.xyz</SelectItem>
                <SelectItem value="embedccMovie">Embed.cc</SelectItem>
                <SelectItem value="twoembed">TwoEmbed</SelectItem>
                <SelectItem value="vidsrctop">VidSrc.top</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center w-full mt-6">
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-md" />
          ) : (
            <>
              <iframe
                ref={iframeRef}
                src={videoSources[selectedSource]}
                className="w-full h-[400px] rounded-md"
                allowFullScreen
              />
              <Hide show={showRelatedMovies}>
                <div className="absolute bottom-0 left-0 w-full bg-gray-800 p-4 rounded-md">
                  <h3 className="text-md font-bold text-white mb-2">Related Movies</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {relatedMovies.map((movie) => (
                      <Link key={movie.id} href={`/movies/${movie.id}`}>
                        <div className="flex flex-col items-center">
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            width={200}
                            height={300}
                            className="rounded-md"
                          />
                          <p className="text-sm text-white text-center mt-2">{movie.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Hide>
              <button
                onClick={toggleRelatedMovies}
                className="mt-2 text-blue-500"
              >
                {showRelatedMovies ? "Hide Related Movies" : "Show Related Movies"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
