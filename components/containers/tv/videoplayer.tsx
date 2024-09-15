"use client";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
  | "vidsrcpro"
  | "vidbinge4K"
  | "smashystream"
  | "vidsrcIcu"
  | "vidsrcNl"
  | "nontongo"
  | "vidsrcxyz"
  | "embedccMovie"
  | "twoembed"
  | "vidsrcTop";

type MediaType = "movie" | "tv";

export default function VideoPlayer({ id, mediaType }: { id: string; mediaType: MediaType }) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/${mediaType}/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/${mediaType}/${id}`,
    vidbinge4K: `https://vidbinge.dev/embed/${mediaType}/${id}`,
    smashystream: `https://player.smashy.stream/${mediaType}/${id}`,
    vidsrcpro: `https://vidsrc.pro/embed/${mediaType}/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    vidsrcIcu: `https://vidsrc.icu/embed/${mediaType}/${id}`,
    vidsrcNl: `https://player.vidsrc.nl/embed/${mediaType}/${id}?server=hindi`,
    nontongo: `https://www.nontongo.win/embed/${mediaType}/${id}`,
    vidsrcxyz: `https://vidsrc.xyz/embed/${mediaType}?tmdb=${id}`,
    embedccMovie: `https://www.2embed.cc/embed/${id}`,
    twoembed: `https://2embed.org/embed/${mediaType}/${id}`,
    vidsrcTop: `https://vidsrc.top/embed/${mediaType}/tmdb/${id}`,
  };

  const handleSelectChange = (value: VideoSourceKey) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedSource(value);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const data = await response.json();
        setMovieTitle(data.title || data.name || "Unknown Title");

        // Fetch related content
        const relatedResponse = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/similar?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`
        );
        const relatedData = await relatedResponse.json();
        setRelatedMovies(relatedData.results.slice(0, 8)); // Fetch 8 related items
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovieDetails();
  }, [id, mediaType]);

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${mediaType}/${id}`}>
                  {mediaType === "movie" ? "Movie" : "TV Show"} - {movieTitle}
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
          <Select onValueChange={handleSelectChange} value={selectedSource}>
            <SelectTrigger className="px-4 py-2 rounded-md w-[280px]">
              <SelectValue placeholder="Select Video Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
              <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
              <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
              <SelectItem value="vidbinge4K">VidBinge (4K)</SelectItem>
              <SelectItem value="smashystream">SmashyStream</SelectItem>
              <SelectItem value="vidsrcIcu">VidSrc.icu</SelectItem>
              <SelectItem value="vidsrcNl">VidSrc.nl (Hindi)</SelectItem>
              <SelectItem value="nontongo">Nontongo</SelectItem>
              <SelectItem value="vidsrcxyz">VidSrc.xyz</SelectItem>
              <SelectItem value="embedccMovie">2Embed.cc</SelectItem>
              <SelectItem value="twoembed">2Embed.org</SelectItem>
              <SelectItem value="vidsrcTop">VidSrc.top</SelectItem>
              <SelectItem value="superembed">SuperEmbed (CONTAINS ADS)</SelectItem>
            </SelectContent>
          </Select>
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
          {relatedMovies.map((item) => (
            <Link href={`/${mediaType}/${item.id}`} key={item.id}>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  width={200}
                  height={300}
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-white text-center px-2 text-lg font-bold">{item.title || item.name}</h4>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
