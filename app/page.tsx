import { Pattern } from "@/components/ui/pattern";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HeroSection from "@/components/hero";

export default async function Home() {
  return (
    <>
      <Pattern variant="checkered" />
      <div className="mx-auto max-w-4xl p-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
        <section className="flex h-[75vh] items-center md:h-[50vh]">
          <div className="mx-auto flex w-4/5 flex-col items-center justify-center space-y-6 text-center">
            <h1 className="text-6xl font-bold text-white drop-shadow-md">
              Explore Movies, TV Series, and Animes!
            </h1>
            <p className="text-lg leading-7 text-gray-200 drop-shadow-md">
              456movie is a streaming platform for those who love to relax
              and watch millions of movies, series, and animes for free. 
              <br />
              Dive in to start watching now!
            </p>
            <div className="flex gap-2">
              <Button className="bg-blue-500 text-white shadow-lg transition-transform transform hover:scale-105">
                <Link href={`/movie`}>WATCH NOW</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <HeroSection />
    </>
  );
}
