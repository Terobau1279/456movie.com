import { format } from "date-fns";
import { Poster } from "@/components/common/poster";
import Link from "next/link";
import { Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_KEY } from "@/config/url";

// Define types
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

type MovieData = {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  overview: string;
};

// Function to fetch the media quality
const getReleaseType = async (mediaId: number, mediaType: string): Promise<string> => {
  try {
    const [releaseDatesResponse, watchProvidersResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/release_dates?api_key=${API_KEY}`),
      fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/watch/providers?api_key=${API_KEY}`)
    ]);

    if (releaseDatesResponse.ok && watchProvidersResponse.ok) {
      const releaseDatesData: { results: ReleaseDatesResult[] } = await releaseDatesResponse.json();
      const watchProvidersData: WatchProvidersResult = await watchProvidersResponse.json();

      const releases = releaseDatesData.results.flatMap((result: ReleaseDatesResult) => result.release_dates);
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

const DetailsContainer = ({ data, id, embed }: { data: MovieData; id: number; embed?: boolean }) => {
  // Fetch media quality asynchronously
  const [quality, setQuality] = React.useState<string>("Unknown Quality");
  
  React.useEffect(() => {
    const fetchQuality = async () => {
      const mediaQuality = await getReleaseType(id, 'movie'); // Assuming the type is 'movie'; adjust if needed
      setQuality(mediaQuality);
    };
    
    fetchQuality();
  }, [id]);

  return (
    <div className="">
      <div className={cn("mx-auto max-w-6xl", embed ? "p-0" : "md:pt-4")}>
        <div
          className={cn(
            "h-[30dvh] w-full overflow-hidden border bg-muted shadow md:rounded-lg lg:h-[55dvh]",
            embed ? "max-h-[20vh] md:max-h-[50vh]" : undefined
          )}
        >
          <div
            style={{
              backgroundImage: `url('https://sup-proxy.zephex0-f6c.workers.dev/api-content?url=https://image.tmdb.org/t/p/original${data.backdrop_path}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="h-full w-full brightness-50"
            data-testid="banner"
          />
        </div>

        <div className="mx-auto my-8 max-w-4xl space-y-8 p-4 md:space-y-12 md:p-0 ">
          <main className="flex flex-col gap-4 md:flex-row">
            <aside className="-mt-24 w-full space-y-2  md:-mt-32 md:w-1/3">
              <Poster url={data.poster_path} alt={data.title} />
            </aside>

            <article className="flex w-full flex-col gap-2 md:w-2/3">
              {data.release_date && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(data.release_date), "PPP", {})}
                </span>
              )}
              <h1 className="text-lg font-bold md:text-4xl">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {data.genres.length > 0 && (
                  <>
                    {data.genres.map((genre) => {
                      return (
                        <Badge
                          key={genre.id}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          {genre.name}
                        </Badge>
                      );
                    })}

                    <Separator orientation="vertical" className="h-6" />
                  </>
                )}

                {/* Quality Indicator */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium rounded-full px-2 py-1",
                    quality === "Streaming (HD)"
                      ? "bg-gradient-to-r from-green-500 to-green-700 text-green-800"
                      : quality === "HD"
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-blue-800"
                      : quality === "Cam Quality"
                      ? "bg-gradient-to-r from-red-500 to-red-700 text-red-800"
                      : quality === "Not Released Yet"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-700 text-yellow-800"
                      : "bg-gradient-to-r from-gray-500 to-gray-700 text-gray-800"
                  )}
                >
                  {quality}
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge>{data.vote_average.toFixed(1)}</Badge>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>{data.vote_count} votes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">
                {data.overview}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <Link href={`/movie/watch/${id}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer whitespace-nowrap"
                  >
                    <Play className="mr-1.5" size={12} />
                    Watch
                  </Badge>
                </Link>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DetailsContainer;
