import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"; // Import your Select components
import { ArrowLeft, ArrowRight } from "lucide-react"; // Import the icons

function VideoPlayer({ seasons, episodes }) {
  const videoRef = useRef(null);
  const [season, setSeason] = useState(seasons[0]?.season_number.toString());
  const [episode, setEpisode] = useState(episodes[0]?.episode_number.toString());
  const [server, setServer] = useState("hls"); // Default server
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  
  useEffect(() => {
    // Fetch stream URL when season, episode, or server changes
    const fetchStreamUrl = async () => {
      setIsLoading(true);
      setError(null);
      setStreamError(null);

      try {
        // Implement your logic to fetch the stream URL based on season and episode
        // You can adjust the API URL and method as per your requirements
        const response = await fetch(`/api/streams?season=${season}&episode=${episode}`);
        const data = await response.json();
        
        // Handle the response data here (set stream URL based on the server)
        // If the server is HLS, handle differently
        // For example:
        if (server === "hls") {
          videoRef.current.src = data.hlsUrl; // Assuming the response has a property 'hlsUrl'
        } else {
          // Handle iframe source logic
          videoRef.current.src = getIframeSrc(); // Get the iframe source based on the selected server
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load stream.");
        setIsLoading(false);
      }
    };

    fetchStreamUrl();
  }, [season, episode, server]);

  const getIframeSrc = () => {
    // Return the correct URL based on the selected server
    switch (server) {
      case "vidlinkpro":
        return `https://vidlink.pro/movie/${episode}`;
      case "vidsrccc":
        return `https://vidsrc.cc/v2/embed/movie/${episode}`;
      case "vidbinge4K":
        return `https://vidbinge.dev/embed/movie/${episode}`;
      case "smashystream":
        return `https://player.smashy.stream/movie/${episode}`;
      case "vidsrcpro":
        return `https://vidsrc.pro/embed/movie/${episode}`;
      case "superembed":
        return `https://multiembed.mov/?video_id=${episode}&tmdb=1`;
      case "vidsrcIcu":
        return `https://vidsrc.icu/embed/movie/${episode}`;
      case "vidsrcNl":
        return `https://player.vidsrc.nl/embed/movie/${episode}?server=hindi`;
      case "nontongo":
        return `https://www.nontongo.win/embed/movie/${episode}`;
      case "vidsrcxyz":
        return `https://vidsrc.xyz/embed/movie?tmdb=${episode}`;
      case "embedccMovie":
        return `https://www.2embed.cc/embed/${episode}`;
      case "twoembed":
        return `https://2embed.org/embed/movie/${episode}`;
      case "vidsrcTop":
        return `https://vidsrc.top/embed/movie/tmdb/${episode}`;
      default:
        return "";
    }
  };

  const handlePreviousEpisode = () => {
    const currentEpisodeIndex = episodes.findIndex(ep => ep.episode_number.toString() === episode);
    if (currentEpisodeIndex > 0) {
      setEpisode(episodes[currentEpisodeIndex - 1].episode_number.toString());
    }
  };

  const handleNextEpisode = () => {
    const currentEpisodeIndex = episodes.findIndex(ep => ep.episode_number.toString() === episode);
    if (currentEpisodeIndex < episodes.length - 1) {
      setEpisode(episodes[currentEpisodeIndex + 1].episode_number.toString());
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto px-4 pt-10">
      {/* Stream Selector */}
      <div className="pb-4">
        <div className="flex flex-col text-center items-center justify-center">
          <Select onValueChange={setSeason} defaultValue={season}>
            <SelectTrigger>
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.season_number} value={season.season_number.toString()}>
                  {season.name || `Season ${season.season_number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setEpisode} defaultValue={episode}>
            <SelectTrigger>
              <SelectValue placeholder="Select Episode" />
            </SelectTrigger>
            <SelectContent>
              {episodes.map((episode) => (
                <SelectItem key={episode.episode_number} value={episode.episode_number.toString()}>
                  {episode.name || `Episode ${episode.episode_number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Video Player */}
      <iframe
        src={getIframeSrc()}
        referrerPolicy="origin"
        allowFullScreen
        width="100%"
        height="450"
        scrolling="no"
        className="rounded-lg shadow-lg border border-gray-300"
      ></iframe>

      {/* Navigation Buttons */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handlePreviousEpisode}
          className="px-4 py-2 rounded-md bg-gray-800 text-white shadow-md hover:bg-gray-700 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous Episode
        </button>
        <button
          onClick={handleNextEpisode}
          className="px-4 py-2 rounded-md bg-gray-800 text-white shadow-md hover:bg-gray-700 transition-colors duration-300 flex items-center ml-4"
        >
          Next Episode
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>

      {/* Loading/Error States */}
      <div className="text-center pt-4">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
      </div>
    </div>
  );
}

export default VideoPlayer;
