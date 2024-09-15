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

export default function VideoPlayer({ id }: { id: string }) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [showRelatedMovies, setShowRelatedMovies] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/movie/${id}`,
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
    vidsrctop: `https://vidsrc.top/embed/movie/tmdb/${id}`,
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const data = await response.json();
        setMovieTitle(data.title || "Unknown Movie");

        const relatedResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const relatedData = await relatedResponse.json();
        setRelatedMovies(relatedData.results.slice(0, 8));
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

  const handleBookmark = () => {
    const savedBookmarks = localStorage.getItem("bookmarkedMovies");
    const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];

    if (!bookmarks.some((movie: any) => movie.id === id)) {
      const newBookmark = { id, title: movieTitle, poster_path: "" };
      bookmarks.push(newBookmark);
      localStorage.setItem("bookmarkedMovies", JSON.stringify(bookmarks));
    }
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
              <SelectItem value="vidlinkpro">VidLinkPro</SelectItem>
              <SelectItem value="vidsrccc">VidSrc CCC</SelectItem>
              <SelectItem value="vidsrcpro">VidSrc Pro</SelectItem>
              <SelectItem value="superembed">SuperEmbed</SelectItem>
              <SelectItem value="vidbinge4K">VidBinge 4K</SelectItem>
              <SelectItem value="smashystream">SmashyStream</SelectItem>
              <SelectItem value="vidsrcicu">VidSrc ICU</SelectItem>
              <SelectItem value="vidsrcnl">VidSrc NL</SelectItem>
              <SelectItem value="nontongo">Nontongo</SelectItem>
              <SelectItem value="vidsrcxyz">VidSrc XYZ</SelectItem>
              <SelectItem value="embedccMovie">EmbedCC Movie</SelectItem>
              <SelectItem value="twoembed">TwoEmbed</SelectItem>
              <SelectItem value="vidsrctop">VidSrc Top</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative mt-4">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 opacity-75">
                <Skeleton className="h-24 w-32" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-[500px] border-none rounded-md"
              src={videoSources[selectedSource]}
              allowFullScreen
              title="Video Player"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleBookmark}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Bookmark This Movie
        </button>
      </div>

      {relatedMovies.length > 0 && (
        <div className="mt-8">
          <button
            onClick={toggleRelatedMovies}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-300"
          >
            {showRelatedMovies ? "Hide Related Movies" : "Show Related Movies"}
          </button>
          {showRelatedMovies && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {relatedMovies.map((movie) => (
                <Link href={`/movie/${movie.id}`} key={movie.id}>
                  <a className="group relative block">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white">{movie.title}</span>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
