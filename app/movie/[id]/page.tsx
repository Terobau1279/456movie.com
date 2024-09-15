"use client";
import { getInfoURL } from "@/config/url";
import DetailsContainer from "@/components/containers/movie/details";
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_KEY } from "@/config/url";

type Genre = {
  id: number;
  name: string;
};

type Movie = {
  id: number;
  title: string;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
  poster_path: string | null; // Existing property
  release_date: string | null; // Existing property
  genres: Genre[]; // Added property
};

type MovieData = {
  results: Movie[];
};

type Params = {
  id: string;
};

const Info: React.FC<{ params: Params }> = ({ params }) => {
  const { id } = params;
  const [data, setData] = React.useState<Movie | null>(null); // Updated to Movie | null
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async (id: string) => {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching

        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`,
          {
            next: { revalidate: 21620 },
          }
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data: Movie = await res.json(); // Fetches Movie type
        setData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(id);
  }, [id]);

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {loading ? (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="space-y-8 pb-16">
            <div className="space-y-8 p-2">
              <Skeleton className="h-96 w-full" />
              <div className="flex flex-col md:flex-row gap-4">
                <div className="mx-auto my-8 max-w-4xl space-y-8 p-4 md:space-y-12 md:p-0 ">
                  <main className="flex flex-col gap-4 md:flex-row">
                    <aside className="-mt-24 w-full space-y-2  md:-mt-32 md:w-1/3">
                      <Skeleton className="h-96 w-[300px] rounded-lg" />
                    </aside>
                  </main>
                </div>
                <div className="w-full md:w-2/3 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-2/3" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <Skeleton className="h-96 w-full " />
            </div>
          </div>
        </div>
      ) : (
        data && ( // Check if data is not null
          <DetailsContainer data={data} id={id} embed={false} /> // Adjusted embed prop type to boolean
        )
      )}
    </>
  );
};

export default Info;
