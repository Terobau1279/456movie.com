"use client";
import { FetchMovieInfo } from "@/fetch";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { API_KEY } from "@/config/url";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Movie = {
  id: number;
  title: string;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
  release_date: string; // Added for release date
  quality: string; // Added for quality indicator
};

type MovieData = {
  results: Movie[];
};

// Function to determine the media quality
const getMediaQuality = (releaseDate: string): string => {
  const now = new Date();
  const release = new Date(releaseDate);
  const diff = now.getFullYear() - release.getFullYear();

  if (now < release) return "Not Released Yet";
  if (diff > 1) return "HD";
  if (now.getFullYear() === release.getFullYear() && now.getMonth() - release.getMonth() < 12) return "Cam Quality";
  return "HD";
};

export default function TopRated() {
  const [data, setData] = React.useState<MovieData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`,
        { next: { revalidate: 21600 } }
      );
      const data = await res.json();
      
      // Adding quality to each movie
      const updatedData = {
        ...data,
        results: data.results.map((movie: any) => ({
          ...movie,
          quality: getMediaQuality(movie.release_date),
        })),
      };
      
      FetchMovieInfo(updatedData);
      setData(updatedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main>
      <div className="flex items-center justify-between">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          {loading
            ? // Skeleton component while loading
              Array.from({ length: 18 }).map((_, index) => (
                <div key={index} className="w-full space-y-2">
                  <Skeleton className="aspect-video w-full rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            : data &&
              data.results.slice(0, 18).map((item: Movie) => (
                <Link
                  href={`/movie/${encodeURIComponent(item.id)}`}
                  key={item.id}
                  className="w-full cursor-pointer space-y-2"
                  data-testid="movie-card"
                >
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow">
                    {item.backdrop_path ? (
                      <Image
                        fill
                        className="object-cover"
                        src={`https://sup-proxy.zephex0-f6c.workers.dev/api-content?url=https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                        alt={item.title}
                        sizes="100%"
                      />
                    ) : (
                      <ImageIcon className="text-muted" />
                    )}
                    <div className={`absolute top-0 left-0 p-2 text-white text-xs font-bold bg-black ${item.quality === "HD" ? "bg-green-500" : item.quality === "Cam Quality" ? "bg-red-500" : item.quality === "Not Released Yet" ? "bg-yellow-500" : "bg-gray-500"}`}>
                      {item.quality}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="">{item.title}</span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline">
                              {item.vote_average
                                ? item.vote_average.toFixed(1)
                                : "?"}
                            </Badge>
                          </TooltipTrigger>

                          <TooltipContent>
                            <p>{item.vote_count} votes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {item.overview}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </main>
  );
}
