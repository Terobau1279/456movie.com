// components/containers/movie/hide.tsx
import React from "react";

const Hide = ({ toggleRelatedMovies, showRelatedMovies }: any) => {
  return (
    <div className="mt-4">
      <button
        onClick={toggleRelatedMovies}
        className="px-4 py-2 text-white bg-blue-600 rounded"
      >
        {showRelatedMovies ? "Hide Related Movies" : "Show Related Movies"}
      </button>
    </div>
  );
};

export const restrictedSources = ["vidsrctop"]; // List restricted sources

export default Hide;
