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
  quality: string; // Added for quality indicator
};

type MovieData = {
  results: Movie[];
};

// Function to determine the media quality
const getReleaseType = async (mediaId: number, mediaType: string): Promise<string> => {
  try {
    const [releaseDatesResponse, watchProvidersResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/release_dates?api_key=${API_KEY}`),
      fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/watch/providers?api_key=${API_KEY}`)
    ]);

    if (releaseDatesResponse.ok && watchProvidersResponse.ok) {
      const releaseDatesData = await releaseDatesResponse.json();
      const watchProvidersData = await watchProvidersResponse.json();

      const releases = releaseDatesData.results.flatMap(result => result.release_dates);
      const currentDate = new Date();

      const isDigitalRelease = releases.some(release =>
        (release.type === 4 || release.type === 6) && new Date(release.release_date) <= currentDate
      );

      const isInTheaters = mediaType === 'movie' && releases.some(release =>
        release.type === 3 && new Date(release.release_date) <= currentDate
      );

      const hasFutureRelease = releases.some(release =>
        new Date(release.release_date) > currentDate
      );

      const streamingProviders = watchProvidersData.results?.US?.flatrate || [];
      const isStreamingAvailable = streamingProviders.length > 0;

      if (isStreamingAvailable) {
        return "Streaming (HD)";
      } else if (isDigitalRelease) {
        return "HD";
      } else if (isInTheaters && mediaType === 'movie') {
        const theatricalRelease = releases.find(release => release.type === 3);
        if (theatricalRelease && new Date(theatricalRelease.release_date) <= currentDate) {
          const releaseDate = new Date(theatricalRelease.release_date);
          const oneYearLater = new Date(releaseDate);
          oneYearLater.setFullYear(releaseDate.getFullYear() + 1);

          if (currentDate >= oneYearLater) {
            return "HD";
          } else {
            return "Cam Quality";
          }
        }
      } else if (hasFutureRelease) {
        return "Not Released Yet";
      }

      return "Unknown Quality";
    } else {
      console.error('Failed to fetch release type or watch providers.');
      return "Unknown Quality";
    }
  } catch (error) {
    console.error('An error occurred while fetching release type.', error);
    return "Unknown Quality";
  }
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

      // Fetch and add quality to each movie
      const resultsWithQuality = await Promise.all(data.results.map(async (movie: any) => {
        const quality = await getReleaseType(movie.id, 'movie');
        return { ...movie, quality };
      }));
      
      const updatedData = { ...data, results: resultsWithQuality };
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
                    <div className={`absolute top-0 left-0 p-2 text-white text-xs font-bold bg-black ${item.quality === "Streaming (HD)" ? "bg-green-500" : item.quality === "HD" ? "bg-blue-500" : item.quality === "Cam Quality" ? "bg-red-500" : item.quality === "Not Released Yet" ? "bg-yellow-500" : "bg-gray-500"}`}>
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
