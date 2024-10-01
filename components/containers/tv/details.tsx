import { format } from "date-fns";
import { Poster } from "@/components/common/poster";
import Link from "next/link";
import { Play } from "lucide-react";
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

const DetailsContainer = ({ data, id, embed }) => {
  return (
    <div className="bg-gray-900 text-white">
      <div className={cn("mx-auto max-w-6xl", embed ? "p-0" : "md:pt-4")}>
        {/* Banner Section */}
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

        {/* Details Section */}
        <div className="mx-auto my-8 max-w-4xl space-y-8 p-4 md:space-y-12 md:p-0">
          <main className="flex flex-col gap-4 md:flex-row">
            {/* Poster Section */}
            <aside className="-mt-24 w-full space-y-2 md:-mt-32 md:w-1/3">
              <Poster url={data.poster_path} alt={data.title} />
            </aside>

            {/* Info Section */}
            <article className="flex w-full flex-col gap-2 md:w-2/3">
              {data.release_date && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(data.release_date), "PPP", {})}
                </span>
              )}

              <h1 className="text-lg font-bold md:text-4xl">{data.name}</h1>

              <div className="flex flex-wrap items-center gap-2">
                {data.genres.length > 0 && (
                  <>
                    {data.genres.map((genre) => (
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

              {/* Media Quality Indicator */}
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="whitespace-nowrap">
                  Media Quality: <span className="font-semibold">{data.media_quality || 'Unknown'}</span>
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <Link href={`/tv/watch/${id}`}>
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

          {/* Comments Section */}
          <div className="border-t border-muted pt-4">
            <h2 className="text-lg font-bold">Comments</h2>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 text-black rounded-lg"
              />
              <button className="mt-2 p-2 bg-blue-600 rounded-lg text-white">Submit</button>
            </div>
            <div className="mt-4 space-y-2">
              {data.comments.map((comment, index) => (
                <div key={index} className="p-2 bg-gray-800 rounded-lg">
                  <p className="font-semibold">{comment.username}</p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsContainer;
