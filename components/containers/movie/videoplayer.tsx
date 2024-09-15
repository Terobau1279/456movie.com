"use client";
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { API_KEY } from "@/config/url";

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

const getReleaseType = async (mediaId: number): Promise<string> => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}/release_dates?api_key=${API_KEY}`);
    if (response.ok) {
      const data = await response.json();
      const releases = data.results.flatMap(result => result.release_dates);
      const currentDate = new Date();

      const isDigitalRelease = releases.some(release =>
        (release.type === 4 || release.type === 6) && new Date(release.release_date) <= currentDate
      );

      const isInTheaters = releases.some(release =>
        release.type === 3 && new Date(release.release_date) <= currentDate
      );

      const hasFutureRelease = releases.some(release =>
        new Date(release.release_date) > currentDate
      );

      if (isInTheaters) {
        return "Cam Quality";
      } else if (isDigitalRelease) {
        return "HD";
      } else if (hasFutureRelease) {
        return "Not Released Yet";
      }

      return "Unknown Quality";
    } else {
      console.error('Failed to fetch release type.');
      return "Unknown Quality";
    }
  } catch (error) {
    console.error('An error occurred while fetching release type.', error);
    return "Unknown Quality";
  }
};

export default function VideoPlayer({ id }: { id: number }) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<string | null>(null);

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
    const fetchQuality = async () => {
      const quality = await getReleaseType(id);
      setQuality(quality);
    };

    fetchQuality();
  }, [id]);

  const getQualityBadgeStyle = (quality: string) => {
    switch (quality) {
      case "Streaming (HD)":
        return "bg-gradient-to-r from-green-500 to-green-700 border-green-800";
      case "HD":
        return "bg-gradient-to-r from-blue-500 to-blue-700 border-blue-800";
      case "Cam Quality":
        return "bg-gradient-to-r from-red-500 to-red-700 border-red-800";
      case "Not Released Yet":
        return "bg-gradient-to-r from-yellow-500 to-yellow-700 border-yellow-800";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-700 border-gray-800";
    }
  };

  return (
    <div className="py-8 mx-auto max-w-5xl">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="flex flex-col flex-wrap pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/movie/${id}`}>
                  Movie -  {id}
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
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md border ${quality ? getQualityBadgeStyle(quality) : "bg-gray-500 border-gray-800"}`}>
            {quality || "Fetching Quality..."}
          </div>
        </div>
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
