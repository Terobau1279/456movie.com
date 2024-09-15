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

type ReleaseDate = {
  type: number;
  release_date: string;
};

type ReleaseDatesResult = {
  release_dates: ReleaseDate[];
};

type WatchProvidersResult = {
  results?: {
    US?: {
      flatrate?: any[];
    };
  };
};

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
      const releaseDatesData: { results: ReleaseDatesResult[] } = await releaseDatesResponse.json();
      const watchProvidersData: WatchProvidersResult = await watchProvidersResponse.json();

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
          const sixMonthsLater = new Date(releaseDate);
          sixMonthsLater.setMonth(releaseDate.getMonth() + 6);

          if (currentDate >= sixMonthsLater) {
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

export default function MovieDetails({ movieId }: { movieId: number }) {
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
      const movieData: Movie = await res.json();

      const quality = await getReleaseType(movieId, 'movie');
      setMovie({ ...movieData, quality });
      setLoading(false);
    };

    fetchMovie();
  }, [movieId]);

  return (
    <main>
      {loading ? (
        <Skeleton className="w-full h-64" />
      ) : movie ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-lg h-64">
            {movie.backdrop_path ? (
              <Image
                fill
                className="object-cover"
                src={`https://sup-proxy.zephex0-f6c.workers.dev/api-content?url=https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
              />
            ) : (
              <ImageIcon className="text-muted" />
            )}
            <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md border ${movie.quality === "Streaming (HD)" ? "bg-gradient-to-r from-green-500 to-green-700 border-green-800" : movie.quality === "HD" ? "bg-gradient-to-r from-blue-500 to-blue-700 border-blue-800" : movie.quality === "Cam Quality" ? "bg-gradient-to-r from-red-500 to-red-700 border-red-800" : movie.quality === "Not Released Yet" ? "bg-gradient-to-r from-yellow-500 to-yellow-700 border-yellow-800" : "bg-gradient-to-r from-gray-500 to-gray-700 border-gray-800"}`}>
              {movie.quality}
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-4">{movie.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{movie.overview}</p>
        </div>
      ) : (
        <p>Movie not found</p>
      )}
    </main>
  );
}
