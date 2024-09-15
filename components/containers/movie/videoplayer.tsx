"use client";
import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize2 } from "lucide-react"; // Fullscreen icon

type VideoSourceKey = "vidlinkpro" | "vidsrccc" | "vidsrcpro" | "superembed";

export default function VideoPlayer({ id }: any) {
  const [selectedSource, setSelectedSource] = useState<VideoSourceKey>("vidlinkpro");
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  const handleFullScreen = () => {
    const iframe = iframeRef.current;

    if (iframe) {
      // Standard fullscreen API and fallbacks for webkit and ms browsers
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as HTMLIFrameElement).webkitRequestFullscreen) {
        // Safari
        (iframe as HTMLIFrameElement).webkitRequestFullscreen();
      } else if ((iframe as HTMLIFrameElement).msRequestFullscreen) {
        // Internet Explorer/Edge
        (iframe as HTMLIFrameElement).msRequestFullscreen();
      } else {
        console.warn("Fullscreen API is not supported by this browser.");
      }

      // Unmute the video if supported
      iframe.contentWindow?.postMessage(
        '{"method":"setVolume","value":1}',
        "*"
      );
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
              <SelectItem value="superembed">SuperEmbed (CONTAINS ADS)</SelectItem>
            </SelectContent>
          </Select>

          <div className="pt-2">
            <Badge
              variant="outline"
              onClick={handleFullScreen}
              className="cursor-pointer whitespace-nowrap flex items-center"
            >
              <Maximize2 className="mr-1.5" size={12} />
              Enter Fullscreen
            </Badge>
          </div>
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
    </div>
  );
}
