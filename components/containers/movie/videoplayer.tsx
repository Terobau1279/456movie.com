"use client";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

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
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v3/embed/movie/${id}`,
    vidsrcpro: `https://vidsrc.pro/embed/movie/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    vidbinge4K: `https://vidbinge.dev/embed/movie/${id}`,
    smashystream: `https://player.smashy.stream/movie/${id}`,
    vidsrcicu: `https://vidsrc.icu/embed/movie/${id}`,
    vidsrcnl: `https://player.vidsrc.nl/embed/movie/${id}?server=hindi`,
    nontongo: `https://www.nontongo.win/embed/movie/${id}`,
    vidsrcxyz: `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    embedccMovie: `https://www.2embed.cc/embed/${id}`,
    twoembed: `https://2embed.org/embed/movie/${id}`,
    vidsrctop: `https://embed.su/embed/movie/${id}`,
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
    setShowRelatedMovies(prev => !prev);
  };

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {movieTitle}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Watch</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Currently Watching Section */}
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
              <SelectItem value="vidlinkpro">
                Vidlink.pro <span className="text-green-400 text-sm">No Ads, Auto-Play</span>
              </SelectItem>
              <SelectItem value="vidsrccc">
                VidSrc.cc <span className="text-green-400 text-sm">No Ads, Auto-Play, Auto-Next</span>
              </SelectItem>
              <SelectItem value="vidsrcpro">
                VidSrc.pro <span className="text-green-400 text-sm">Casting Options</span>
              </SelectItem>
              <SelectItem value="superembed">
                SuperEmbed <span className="text-red-400 text-sm">Contains Ads</span>
              </SelectItem>
              <SelectItem value="vidbinge4K">
                VidBinge 4K <span className="text-green-400 text-sm">4K Stream, Auto-Play, Shared Stream</span>
              </SelectItem>
              <SelectItem value="smashystream">
                Smashy Stream <span className="text-green-400 text-sm">No Ads, Shared Stream</span>
              </SelectItem>
              <SelectItem value="vidsrcicu">
                VidSrc ICU <span className="text-green-400 text-sm">Casting Options</span>
              </SelectItem>
              <SelectItem value="vidsrcnl">
                VidSrc NL
              </SelectItem>
              <SelectItem value="nontongo">
                Nontongo <span className="text-green-400 text-sm">Casting Options</span>
              </SelectItem>
              <SelectItem value="vidsrcxyz">
                VidSrc XYZ
              </SelectItem>
              <SelectItem value="embedccMovie">
                Embed CC Movie
              </SelectItem>
              <SelectItem value="twoembed">
                TwoEmbed
              </SelectItem>
              <SelectItem value="vidsrctop">
                Premium
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <iframe
          src={videoSources[selectedSource]}
          ref={iframeRef}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          className="max-w-3xl mx-auto px-4 pt-6"
        />
      )}

      {/* Related Movies Section */}
      <div className="pt-10">
        <button
          onClick={toggleRelatedMovies}
          className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 transition-colors"
        >
          {showRelatedMovies ? "Hide Related Movies" : "Show Related Movies"}
        </button>
        {showRelatedMovies && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-4">
            {relatedMovies.map((movie) => (
              <Link href={`/movie/${movie.id}`} key={movie.id}>
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-2 text-white bg-gradient-to-t from-black to-transparent">
                    {movie.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
