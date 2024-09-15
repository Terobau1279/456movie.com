"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Download, Share2 } from "lucide-react";
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
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const apiKey = 'a46c50a0ccb1bafe2b15665df7fad7e1';

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [movieDetails, setMovieDetails] = useState<any>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/movie/${id}`,
    vidsrcpro: `https://vidsrc.pro/embed/movie/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  };

  const handleSelectChange = (value: VideoSourceKey) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedSource(value);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
        setMovieDetails(response.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    async function fetchRelatedMovies() {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}`);
        setRelatedMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching related movies:", error);
      }
    }

    fetchMovieDetails();
    fetchRelatedMovies();
  }, [id]);

  const shareUrl = `https://www.example.com/movie/${id}`;

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {id.charAt(0).toUpperCase() + id.slice(1)}
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

      <div className="text-center mb-6">
        {movieDetails ? (
          <h2 className="text-xl font-semibold">Currently Watching: {movieDetails.title}</h2>
        ) : (
          <Skeleton className="h-6 w-48 mx-auto" />
        )}
      </div>

      <div className="flex flex-row items-center justify-center w-full">
        <div className="flex flex-col text-center">
          <Select onValueChange={handleSelectChange} value={selectedSource}>
            <SelectTrigger className="px-4 py-2 rounded-md w-[280px]">
              <SelectValue placeholder="Select Video Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
              <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
              <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
              <SelectItem value="superembed">SuperEmbed (Contains Ads)</SelectItem>
            </SelectContent>
          </Select>
          <div className="pt-2">
            <Link href={`https://dl.vidsrc.vip/movie/${id}`}>
              <Badge variant="outline" className="cursor-pointer whitespace-nowrap">
                <Download className="mr-1.5" size={12} />
                Download Movie
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <iframe
          src={videoSources[selectedSource]}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          className="max-w-3xl mx-auto px-4 pt-6"
        />
      )}

      <div className="text-center pt-4">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full w-10 h-10 hover:bg-blue-500 transition-colors"
          title="Share on Facebook"
        >
          <Share2 size={16} />
        </a>
      </div>

      <div className="pt-8">
        <h2 className="text-lg font-semibold text-center mb-4">Related Movies</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedMovies.slice(0, 8).map((movie) => (
            <Link href={`/movie/${movie.id}`} key={movie.id}>
              <a className="relative block group">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto rounded-lg transition-transform transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50 group-hover:opacity-75 transition-opacity rounded-lg"></div>
                <p className="absolute bottom-0 left-0 right-0 p-2 text-center text-white font-bold bg-black bg-opacity-50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {movie.title}
                </p>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
