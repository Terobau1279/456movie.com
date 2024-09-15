import Image from "next/image";

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

  const fetch_results = async (title: string) => {
    setIsLoading(true);
    if (title) {
      const [movieData, tvData] = await Promise.all([get_movie_results(title), get_tv_results(title)]);
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

  const hasMovies = result?.movies && result?.movies?.length > 0;
  const hasTvSeries = result?.tvShows && result.tvShows.length > 0;

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
                        <Image
                          src={`https://image.tmdb.org/t/p/w92/${item.poster_path}`}
                          alt={item.title}
                          width={40}
                          height={60}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <span className="truncate whitespace-nowrap text-sm">{item.title}</span>
                          <span className="block whitespace-nowrap text-xs text-muted-foreground">
                            {item.release_date && new Date(item.release_date).getFullYear()}
                          </span>
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
                        <Image
                          src={`https://image.tmdb.org/t/p/w92/${item.poster_path}`}
                          alt={item.name}
                          width={40}
                          height={60}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <span className="truncate whitespace-nowrap text-sm">{item.name}</span>
                          <span className="block whitespace-nowrap text-xs text-muted-foreground">
                            {item.first_air_date && new Date(item.first_air_date).getFullYear()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </CommandSearchGroup>
                )}
              </div>
            ) : (
              !isLoading && <p className="p-8 text-center">No Results</p>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
