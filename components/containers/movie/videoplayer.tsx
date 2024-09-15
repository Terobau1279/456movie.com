"use client";
import { useState, useEffect } from "react";
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
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] =
    useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [movieCast, setMovieCast] = useState<any[]>([]);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/movie/${id}`,
    vidsrcpro: `https://vidsrc.pro/embed/movie/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1&append_to_response=credits`);
        const data = await response.json();
        setMovieDetails(data);
        setMovieCast(data.credits.cast);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
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

  return (
    <div className="py-8 mx-auto max-w-6xl px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="flex flex-col items-center mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {movieDetails?.title || id.charAt(0).toUpperCase() + id.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Watch</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="text-3xl font-bold mb-4 text-center text-white">
            Currently Watching: <span className="text-blue-500">{movieDetails?.title || id.charAt(0).toUpperCase() + id.slice(1)}</span>
          </div>
          <div className="relative w-full max-w-3xl mx-auto mb-6">
            {movieDetails && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`}
                  alt={movieDetails.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="relative z-10 bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg">
                  <div className="flex flex-col md:flex-row mb-4">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                      alt={movieDetails.title}
                      className="w-40 h-60 object-cover rounded-lg shadow-lg mb-4 md:mb-0 md:mr-4"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{movieDetails.title}</h2>
                      <p className="text-gray-300 mb-2">{movieDetails.release_date} • {movieDetails.runtime} mins</p>
                      <p className="text-gray-400 mb-4">{movieDetails.genres.map((genre: any) => genre.name).join(', ')}</p>
                      <p className="text-gray-300 mb-4">{movieDetails.overview}</p>
                      <div className="flex items-center">
                        <Link href={`https://dl.vidsrc.vip/movie/${id}`}>
                          <Badge variant="outline" className="cursor-pointer whitespace-nowrap bg-gray-800 text-white border-gray-600">
                            <Download className="mr-1.5" size={16} />
                            Download Movie
                          </Badge>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center mb-6">
        <Select onValueChange={handleSelectChange} value={selectedSource} className="w-full max-w-xs">
          <SelectTrigger className="px-4 py-2 rounded-md w-full bg-gray-800 text-white">
            <SelectValue placeholder="Select Video Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
            <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
            <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
            <SelectItem value="superembed">SuperEmbed (Contains Ads)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <div className="relative w-full max-w-3xl mx-auto px-4 pt-6 mb-6">
          <iframe
            src={videoSources[selectedSource]}
            referrerPolicy="origin"
            allowFullScreen
            width="100%"
            height="450"
            scrolling="no"
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
      {movieDetails && (
        <div className="pt-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {movieCast.map((castMember: any) => (
              <div key={castMember.id} className="flex flex-col items-center text-center">
                <img
                  src={`https://image.tmdb.org/t/p/w200${castMember.profile_path}`}
                  alt={castMember.name}
                  className="rounded-full mb-2 w-24 h-24 object-cover border-2 border-gray-800"
                />
                <span className="text-sm font-medium text-white">{castMember.name}</span>
                <span className="text-xs text-gray-400">{castMember.character}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
