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
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
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
        </div>
        <div className="text-xl font-bold mb-4">
          Currently Watching: <span className="text-blue-500">{movieDetails?.title || id.charAt(0).toUpperCase() + id.slice(1)}</span>
        </div>
        {movieDetails && (
          <div className="text-lg mb-6">
            <p>{movieDetails?.overview}</p>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center justify-center w-full mb-4">
        <div className="flex flex-col text-center w-full max-w-xs mx-auto">
          <Select onValueChange={handleSelectChange} value={selectedSource}>
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
          <div className="pt-2 flex justify-center items-center space-x-4">
            <Link href={`https://dl.vidsrc.vip/movie/${id}`}>
              <Badge
                variant="outline"
                className="cursor-pointer whitespace-nowrap bg-gray-800 text-white border-gray-600"
              >
                <Download className="mr-1.5" size={16} />
                Download Movie
              </Badge>
            </Link>
          </div>
        </div>
      </div>
      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <div className="relative w-full max-w-3xl mx-auto px-4 pt-6">
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
          <h2 className="text-2xl font-bold mb-4">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {movieCast.map((castMember: any) => (
              <div key={castMember.id} className="flex flex-col items-center">
                <img
                  src={`https://image.tmdb.org/t/p/w200${castMember.profile_path}`}
                  alt={castMember.name}
                  className="rounded-full mb-2 w-24 h-24 object-cover"
                />
                <span className="text-center text-sm font-medium">{castMember.name}</span>
                <span className="text-center text-xs text-gray-500">{castMember.character}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
