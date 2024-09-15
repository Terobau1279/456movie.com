"use client";
import { ReactNode, useEffect, useState } from "react";
import { CommandIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Movie_Search, Tv_Search } from "@/config/url";
import { FetchMovieInfo } from "@/fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchedManga, PreFetchMangaInfo } from "@/fetch";
import { fetchDramaSearch, FetchAnimeInfo } from "@/fetch";

type AnimeResult = {
  id: string;
  malId: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string;
    userPreferred: string;
  };
  status: string;
  image: string;
  cover: string;
  popularity: number;
  description: string;
  rating: number | null;
  genres: string[];
  color: string;
  totalEpisodes: number | null;
  currentEpisodeCount: number | null;
  type: string;
  releaseDate: number | null;
};

type DramaResult = {
  id: string;
  title: string;
  url: string;
  image: string;
};

type MangaResult = {
  id: string;
  malId?: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
    userPreferred: string;
  };
  status: string;
  image: string;
  description: string;
  genres: string[];
  totalChapters?: number;
  volumes?: number;
  type: string;
};

type MovieResult = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
};

type TvResult = {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
};

type Result = {
  movies: Array<MovieResult>;
  tvShows: Array<TvResult>;
};

const CommandSearchSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-sm p-2">
    <Skeleton className="h-[2ex] w-[20ch]" />
    <Skeleton className="h-[2ex] w-[4ch]" />
  </div>
);

type CommandSearchGroupProps = {
  heading: string;
  children: ReactNode;
};

const CommandSearchGroup = ({ children, heading }: CommandSearchGroupProps) => {
  return (
    <div className="space-y-2 p-4">
      <h4 className="text-sm font-bold">{heading}</h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

export const CommandSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResults] = useState<Result | null>({
    movies: [],
    tvShows: [],
  });
  const [isLoading, setIsLoading] = useState(false);  
  const [dramaResults, setDramaResults] = useState<DramaResult[] | null>(null);
  const [mangaResults, setMangaResults] = useState<MangaResult[] | null>(null);
  const [animeResults, setSearchResults] = useState<AnimeResult[] | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let debounceTimer: NodeJS.Timeout;
    return function (this: void, ...args: any[]) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchDramaResults = async (title: string) => {
    setIsLoading(true);
    if (title) {
      const data = await fetchDramaSearch(title); // Fetch drama search results
      FetchAnimeInfo(data); // Process the fetched info if needed
      setDramaResults(data.results); // Set the drama results
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const debouncedFetch = debounce(fetchDramaResults, 500);
    debouncedFetch(search);
  }, [search]);

  const fetchMangaResults = async (title: string) => {
    setIsLoading(true);
    if (title) {
      const data = await getSearchedManga(title); // Fetch manga results
      PreFetchMangaInfo(data); // Process the fetched manga info
      setMangaResults(data.results); // Set the manga results
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const debouncedFetch = debounce(fetchMangaResults, 500);
    debouncedFetch(search);
  }, [search]);

  const fetchAnimeResults = async (text: string) => {
    setIsLoading(true);
    if (text) {
      const res = await fetch(
        `https://api-consumet-org-jet.vercel.app/meta/anilist/` + text,
        {
          next: { revalidate: 21600 },
        }
      );
      const data = await res.json()
      setSearchResults(data.results);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const debouncedFetch = debounce(fetchAnimeResults, 500);
    debouncedFetch(search);
  }, [search]);

  const pathName = usePathname();

  const fetch_results = async (title: string) => {
    setIsLoading(true);
    if (title) {
      const [movieData, tvData] = await Promise.all([
        get_movie_results(title),
        get_tv_results(title),
      ]);
      const combinedResults = {
        movies: movieData.results,
        tvShows: tvData.results,
      };
      FetchMovieInfo(combinedResults);
      setResults(combinedResults);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const debouncedFetch = debounce(fetch_results, 500);
    debouncedFetch(search);
  }, [search]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) setOpen(false);
  }, [pathName]);

  const hasMovies = result?.movies && result?.movies?.length > 0;
  const hasTvSeries = result?.tvShows && result.tvShows.length > 0;
  const hasMangaResults = mangaResults?.length ?? 0 > 0;
  const hasDramaResults = dramaResults?.length ?? 0 > 0;
  const hasAnimeResults = animeResults?.length ?? 0 > 0;

  return (
    <>
      <Button
        variant="outline"
        className="flex w-full flex-1 justify-between gap-2 pr-2 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        Search Anything
        <div className="mobile:hidden flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <CommandIcon size={12} />K
        </div>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search"
            onValueChange={setSearch}
            value={search}
          />

          <CommandList>
            {isLoading && (
              <div className="space-y-8">
                <CommandSearchGroup heading="Movies">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup heading="TV Shows">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup heading="Manga">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup heading="Drama">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>

                <CommandSearchGroup heading="Anime">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommandSearchSkeleton key={index} />
                  ))}
                </CommandSearchGroup>
              </div>
            )}

            {!isLoading && result ? (
              <div>
                {hasMovies && (
                  <CommandSearchGroup heading="Movies">
                    {result.movies.map((item) => (
                      <Link
                        key={item.id}
                        href={`/movie/${item.id}`}
                        className="flex items-center gap-4 rounded-sm p-2 hover:bg-muted"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title}
                          className="w-16 rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.release_date.split("-")[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}

                {hasTvSeries && (
                  <CommandSearchGroup heading="TV Shows">
                    {result.tvShows.map((item) => (
                      <Link
                        key={item.id}
                        href={`/tv/${item.id}`}
                        className="flex items-center gap-4 rounded-sm p-2 hover:bg-muted"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.name}
                          className="w-16 rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.first_air_date.split("-")[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}

                {hasMangaResults && (
                  <CommandSearchGroup heading="Manga">
                    {mangaResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/manga/${item.id}`}
                        className="flex items-center gap-4 rounded-sm p-2 hover:bg-muted"
                      >
                        <img
                          src={item.image}
                          alt={item.title.userPreferred}
                          className="w-16 rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title.userPreferred}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.totalChapters ?? "Unknown chapters"} chapters
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}

                {hasDramaResults && (
                  <CommandSearchGroup heading="Drama">
                    {dramaResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/drama/${item.id}`}
                        className="flex items-center gap-4 rounded-sm p-2 hover:bg-muted"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}

                {hasAnimeResults && (
                  <CommandSearchGroup heading="Anime">
                    {animeResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/anime/${item.id}`}
                        className="flex items-center gap-4 rounded-sm p-2 hover:bg-muted"
                      >
                        <img
                          src={item.image}
                          alt={item.title.userPreferred}
                          className="w-16 rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title.userPreferred}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.status}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
