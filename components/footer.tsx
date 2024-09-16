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

            <span className="text-xs text-muted-foreground">
              Data provided by Consumet and Tmdb API. Just so you know—456movie.com doesn’t actually host any movies. We just share links. What you do with them is up to you!
            </span>
          </div>
        </div>
      </div>

      {/* Inject the popunder script 
      <script
        type="text/javascript"
        data-cfasync="false"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){var g=window,a="b7ffb08f2cb7773c126efee62159548a",x=[["siteId",35*112*989+1188767],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default","https://upodaitie.net/4/8000341"],["defaultPerDay",0],["topmostLayer","auto"]],p=["d3d3LmludGVsbGlwb3B1cC5jb20vc2ltbXV0YWJsZS5taW4uY3Nz","ZDNtcjd5MTU0ZDJxZzUuY2xvdWRmcm9udC5uZXQvd0xBL2x0aXBweS5taW4uanM="],w=-1,e,c,u=function(){clearTimeout(c);w++;if(p[w]&&!(1752156726000<(new Date).getTime()&&1<w)){e=g.document.createElement("script");e.type="text/javascript";e.async=!0;var l=g.document.getElementsByTagName("script")[0];e.src="https://"+atob(p[w]);e.crossOrigin="anonymous";e.onerror=u;e.onload=function(){clearTimeout(c);g[a.slice(0,16)+a.slice(0,16)]||u()};c=setTimeout(u,5E3);l.parentNode.insertBefore(e,l)}};if(!g[a]){try{Object.freeze(g[a]=x)}catch(e){}u()}})();
          `,
        */}
        }
      />
    </div>
  );
};
