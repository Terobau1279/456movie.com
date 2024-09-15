import Image from "next/image";
import { Image as LucideImage } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type PosterProps = {
  url?: string;
  alt: string;
  releaseDate?: string;
  availableOnStreaming?: boolean;
  digitalRelease?: boolean;
} & ComponentProps<"div">;

export const Poster = ({
  url,
  alt,
  className,
  releaseDate,
  availableOnStreaming,
  digitalRelease,
  ...props
}: PosterProps) => {
  // Determine the media quality based on provided information
  const getQualityLabel = () => {
    if (availableOnStreaming) return "Streaming (HD)";
    if (digitalRelease) return "HD";
    if (releaseDate) {
      const releaseDateObj = new Date(releaseDate);
      const currentDate = new Date();
      const differenceInYears = (currentDate.getFullYear() - releaseDateObj.getFullYear()) + (currentDate.getMonth() - releaseDateObj.getMonth()) / 12;
      if (differenceInYears < 1) return "Cam Quality";
      return "HD";
    }
    if (new Date(releaseDate) > new Date()) return "Not Released Yet";
    return "Unknown Quality";
  };

  const quality = getQualityLabel();
  let labelColor;
  switch (quality) {
    case "Streaming (HD)":
      labelColor = "text-green-500";
      break;
    case "HD":
      labelColor = "text-blue-500";
      break;
    case "Cam Quality":
      labelColor = "text-yellow-500";
      break;
    case "Not Released Yet":
      labelColor = "text-gray-500";
      break;
    case "Unknown Quality":
      labelColor = "text-red-500";
      break;
    default:
      labelColor = "text-gray-500";
  }

  return (
    <div
      className={cn(
        "relative flex aspect-poster w-full items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted shadow",
        className
      )}
      {...props}
    >
      {url ? (
        <Image
          fill
          className="object-fill"
          loading="lazy"
          sizes="100%"
          alt={alt}
          src={`https://image.tmdb.org/t/p/original${url}`}
        />
      ) : (
        <LucideImage size={24} />
      )}
      <span className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold ${labelColor} bg-white rounded`}>
        {quality}
      </span>
    </div>
  );
};
