import { format } from "date-fns";
import { Poster } from "@/components/common/poster";
import Link from "next/link";
import { Download, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DetailsContainer = ({ data, id, embed }: any) => {
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

  const quality = data.release_date ? getMediaQuality(data.release_date) : "Unknown";

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

        <div className="mx-auto my-8 max-w-4xl space-y-8 p-4 md:space-y-12 md:p-0">
          <main className="flex flex-col gap-4 md:flex-row">
            <aside className="-mt-24 w-full space-y-2 md:-mt-32 md:w-1/3">
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
                    {data.genres.map((genre: any) => (
                      <Badge
                        key={genre.id}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        {genre.name}
                      </Badge>
                    ))}

                    <Separator orientation="vertical" className="h-6" />
                  </>
                )}

                {/* Quality Indicator */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium rounded-full px-2 py-1",
                    quality === "HD"
                      ? "bg-green-400 text-green-800"
                      : quality === "Cam Quality"
                      ? "bg-red-400 text-red-800"
                      : quality === "Not Released Yet"
                      ? "bg-yellow-400 text-yellow-800"
                      : "bg-gray-400 text-gray-800"
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
                    className="cursor-pointer whitespace-nowrap text-lg flex items-center gap-1 px-4 py-2"
                  >
                    <Play className="mr-1.5" size={20} />
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
