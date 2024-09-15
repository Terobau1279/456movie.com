import Link from "next/link";
import { useState, useEffect } from "react";

import { MainNav } from "@/components/navbar/main-nav";
import { MobileNav } from "@/components/navbar/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandSearch } from "../command-search";

export function SiteHeader() {
  const [bookmarkedMovies, setBookmarkedMovies] = useState<any[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedMovies");
    if (savedBookmarks) {
      setBookmarkedMovies(JSON.parse(savedBookmarks));
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <nav className="flex items-center space-x-4">
            <CommandSearch />
            <ThemeToggle />
            {/* Styled Link to Discord */}
            <a
              href="https://discord.gg/e5BEVDnp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors duration-300"
            >
              Join Discord
            </a>
            {/* Bookmark Dropdown */}
            <div className="relative">
              <button className="text-white hover:text-gray-300 transition-colors duration-300">
                Bookmarks
              </button>
              {bookmarkedMovies.length > 0 && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-700 font-semibold">Bookmarked Movies</div>
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {bookmarkedMovies.map((movie) => (
                      <Link href={`/movie/${movie.id}`} key={movie.id}>
                        <a className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded">
                          <img
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            className="w-16 h-24 object-cover"
                          />
                          <span>{movie.title}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
