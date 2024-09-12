import Link from "next/link";
import Image from 'next/image'
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Clapperboard } from "lucide-react";

const INTERESTELAR_ID = "157336";

export const Footer = () => {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-lg shadow-sm lg:mb-4 lg:border">
      <div className="border-t p-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-2">
            <Clapperboard size={20} />
            <h2 className="text-md font-normal">456movie</h2>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">© 2024 456movie.com</p>

            <div className="h-3 border-r" />

            <span className=" text-xs text-muted-foreground">
              Data provided by Consumet and Tmdb API. Just so you know—456movie.com doesn’t actually host any movies. We just share links. What you do with them is up to you!
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
