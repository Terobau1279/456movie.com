"use client";
import { useState, useEffect } from "react";
import axios from "axios";
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
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

export default function VideoPlayer({ id }: { id: string }) {
  const [selectedSource, setSelectedSource] =
    useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);

  const videoSources: Record<VideoSourceKey, string> = {
    vidlinkpro: `https://vidlink.pro/movie/${id}`,
    vidsrccc: `https://vidsrc.cc/v2/embed/movie/${id}`,
    vidsrcpro: `https://vidsrc.pro/embed/movie/${id}`,
    superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  };

  const handleSelectChange = (value: VideoSourceKey) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedSource(value);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    async function loadMovieDetails() {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=a46c50a0ccb1bafe2b15665df7fad7e1`);
        setMovieDetails(response.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setMovieDetails(null);
      }
    }
    loadMovieDetails();
  }, [id]);

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {movieDetails ? movieDetails.title : id.charAt(0).toUpperCase() + id.slice(1)}
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
              <SelectItem value="superembed">SuperEmbed(CONTAINS ADS)</SelectItem>
            </SelectContent>
          </Select>
          <div className="pt-2">
            <Link href={`https://dl.vidsrc.vip/movie/${id}`}>
              <Badge
                variant="outline"
                className="cursor-pointer whitespace-nowrap"
              >
                <Download className="mr-1.5" size={12} />
                Download Movie
              </Badge>
            </Link>
          </div>
        </div>
      </div>
      <div className="pt-4 text-center">
        <h2 className="text-xl font-bold">Currently Watching: {movieDetails ? movieDetails.title : "Loading..."}</h2>
      </div>
      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <iframe
          src={videoSources[selectedSource]}
          referrerPolicy="origin"
          allowFullScreen
          width="100%"
          height="450"
          scrolling="no"
          className="max-w-3xl mx-auto px-4 pt-6"
        />
      )}
    </div>
  );
}
