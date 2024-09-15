"use client";
import { useState, useEffect, useRef } from "react";
import StyledSelect from "@/components/ui/styled-select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

type VideoSourceKey =
  | "vidlinkpro"
  | "vidsrccc"
  | "vidbinge4K"
  | "smashystream"
  | "vidsrcpro"
  | "superembed"
  | "vidsrcIcu"
  | "vidsrcNl"
  | "nontongo"
  | "vidsrcxyz"
  | "embedccMovie"
  | "twoembed"
  | "vidsrcTop";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/movie/${id}`,
    vidbinge4K: `https://vidbinge.dev/embed/movie/${id}`, // 4K Available, Auto Play & Auto Next
    smashystream: `https://player.smashy.stream/movie/${id}`, // Smashy Stream server
    vidsrcpro: `https://vidsrc.pro/embed/movie/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    vidsrcIcu: `https://vidsrc.icu/embed/movie/${id}`,
    vidsrcNl: `https://player.vidsrc.nl/embed/movie/${id}?server=hindi`,
    nontongo: `https://www.nontongo.win/embed/movie/${id}`,
    vidsrcxyz: `https://vidsrc.xyz/embed/movie?tmdb=${id}`, // Vidsrc.xyz movie API
    embedccMovie: `https://www.2embed.cc/embed/${id}`, // 2Embed.cc Movie Embed
    twoembed: `https://2embed.org/embed/movie/${id}`, // 2Embed.org Movie Embed
    vidsrcTop: `https://vidsrc.top/embed/movie/tmdb/${id}`, // Vidsrc.top Movie API
  };

  // Fetch movie details from TMDb API
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const data = await response.json();
        setMovieTitle(data.title || "Unknown Movie");

        // Fetch related movies
        const relatedResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const relatedData = await relatedResponse.json();
        setRelatedMovies(relatedData.results.slice(0, 8)); // Fetch 8 related movies
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  const handleSelectChange = (value: VideoSourceKey) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedSource(value);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {movieTitle}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Watch</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Currently Watching Section */}
      <h2 className="text-lg font-bold mb-4 text-center">
        Currently Watching: {movieTitle}
      </h2>

      <div className="flex flex-row items-center justify-center w-full">
        <div className="flex flex-col text-center">
          <StyledSelect
            onValueChange={handleSelectChange}
            value={selectedSource}
            className="my-custom-class" // Apply custom class here
          >
            <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
            <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
            <SelectItem value="vidbinge4K">VidBinge (4K)</SelectItem>
            <SelectItem value="smashystream">Smashy Stream</SelectItem>
            <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
            <SelectItem value="superembed">SuperEmbed (CONTAINS ADS)</SelectItem>
            <SelectItem value="vidsrcIcu">VidSrc.icu</SelectItem>
            <SelectItem value="vidsrcNl">VidSrc.nl (Hindi)</SelectItem>
            <SelectItem value="nontongo">Nontongo</SelectItem>
            <SelectItem value="vidsrcxyz">VidSrc.xyz</SelectItem>
            <SelectItem value="embedccMovie">2Embed.cc</SelectItem>
            <SelectItem value="twoembed">2Embed.org</SelectItem>
            <SelectItem value="vidsrcTop">VidSrc.top</SelectItem>
          </StyledSelect>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <iframe
          src={videoSources[selectedSource]}
          ref={iframeRef}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          className="max-w-3xl mx-auto px-4 pt-6"
        />
      )}

      {/* Related Movies Section */}
      <div className="pt-10">
        <h3 className="text-lg font-semibold text-center mb-4">Related Movies</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedMovies.map((movie) => (
            <Link href={`/movie/${movie.id}`} key={movie.id}>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={200}
                  height={300}
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-white text-center px-2 text-lg font-bold">{movie.title}</h4>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
