"use client";
import { useState } from "react";
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
import { Download, Cast } from "lucide-react";

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] =
    useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);

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

  const handleCastClick = () => {
    // Placeholder function for casting functionality
    alert("Casting to available devices...");
  };

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie - {id.charAt(0).toUpperCase() + id.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Watch</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-xl font-bold mb-4">
          Currently Watching: <span className="text-blue-500">{id.charAt(0).toUpperCase() + id.slice(1)}</span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center w-full mb-4">
        <div className="flex flex-col text-center w-full max-w-xs mx-auto">
          <Select onValueChange={handleSelectChange} value={selectedSource}>
            <SelectTrigger className="px-4 py-2 rounded-md w-full bg-gray-800 text-white">
              <SelectValue placeholder="Select Video Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidlinkpro">Vidlink.pro</SelectItem>
              <SelectItem value="vidsrccc">VidSrc.cc</SelectItem>
              <SelectItem value="vidsrcpro">VidSrc.pro</SelectItem>
              <SelectItem value="superembed">SuperEmbed (Contains Ads)</SelectItem>
            </SelectContent>
          </Select>
          <div className="pt-2 flex justify-center items-center space-x-4">
            <Link href={`https://dl.vidsrc.vip/movie/${id}`}>
              <Badge
                variant="outline"
                className="cursor-pointer whitespace-nowrap bg-gray-800 text-white border-gray-600"
              >
                <Download className="mr-1.5" size={16} />
                Download Movie
              </Badge>
            </Link>
            <button onClick={handleCastClick} className="flex items-center px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition">
              <Cast className="mr-2" size={16} />
              Cast to Screen
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <Skeleton className="mx-auto px-4 pt-6 w-full h-[500px]" />
      ) : (
        <div className="relative w-full max-w-3xl mx-auto px-4 pt-6">
          <iframe
            src={videoSources[selectedSource]}
            referrerPolicy="origin"
            allowFullScreen
            width="100%"
            height="450"
            scrolling="no"
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
