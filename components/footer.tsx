import { useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Clapperboard } from "lucide-react";

const INTERESTELAR_ID = "157336";

export const Footer = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.dataset.cfasync = "false";
    script.innerHTML = `
      (function(){
        var y = window, b = "b7ffb08f2cb7773c126efee62159548a", 
        e = [["siteId", 473*935*569*731 - 183946036798], ["minBid", 0], ["popundersPerIP", "0"], ["delayBetween", 0], ["default", false], ["defaultPerDay", 0], ["topmostLayer", "auto"]],
        u = ["d3d3LmludGVsbGlwb3B1cC5jb20vYXF1aWNrc291bmQubWluLmNzcw==", "ZDNtcjd5MTU0ZDJxZzUuY2xvdWRmcm9udC5uZXQvTHlsL3Jqcy1kYXRhLWh0dHAubWluLmpz"], 
        t = -1, w, r, h = function(){ clearTimeout(r); t++; if(u[t] && !(1752642626000 < (new Date).getTime() && 1 < t)){
        w = y.document.createElement("script"); w.type = "text/javascript"; w.async = !0; 
        var j = y.document.getElementsByTagName("script")[0]; w.src = "https://" + atob(u[t]); 
        w.crossOrigin = "anonymous"; w.onerror = h; w.onload = function(){ clearTimeout(r); y[b.slice(0, 16) + b.slice(0, 16)] || h() }; 
        r = setTimeout(h, 5E3); j.parentNode.insertBefore(w, j) }}; 
        if (!y[b]){ try { Object.freeze(y[b] = e) } catch (e) {} h() }
      })();
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);  // Clean up the script on component unmount
    };
  }, []);

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
    </div>
  );
};
